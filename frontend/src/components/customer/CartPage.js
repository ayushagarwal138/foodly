import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { api, API_ENDPOINTS } from "../../config/api";

const PAYMENT_METHODS = [
  { value: "Cash on Delivery", label: "Cash on Delivery", icon: "💵" },
  { value: "UPI", label: "UPI", icon: "📱" },
  { value: "Credit/Debit Card", label: "Credit/Debit Card", icon: "💳" },
  { value: "Net Banking", label: "Net Banking", icon: "🏦" }
];

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, setCart } = useCart();
  const [address, setAddress] = useState("");
  const [coupon, setCoupon] = useState("");
  const [payment, setPayment] = useState(PAYMENT_METHODS[0].value);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  // Check authentication
  useEffect(() => {
    if (!token || userRole !== "CUSTOMER") {
      navigate("/customer/login");
      return;
    }
  }, [token, userRole, navigate]);

  // Load cart from backend
  useEffect(() => {
    async function fetchCart() {
      if (!token) return;
      
      setLoading(true);
      setError("");
      try {
        const data = await api.get(API_ENDPOINTS.CART);
        setCart(data);
        setAddress(data.address || "");
      } catch (err) {
        console.error("Error fetching cart:", err);
        if (err.message.includes("unauthorized") || err.message.includes("401")) {
          navigate("/customer/login");
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, [token, setCart, navigate]);

  // Update cart in backend
  async function updateCart(newItems) {
    if (!token) return;
    
    try {
      const sanitized = (newItems || []).map(i => ({
        ...i,
        menu_item_id: i.menu_item_id ?? i.id
      }));
      
      const data = await api.put(API_ENDPOINTS.CART, { 
        items: sanitized, 
        address 
      });
      setCart(data);
    } catch (err) {
      console.error("Error updating cart:", err);
      if (err.message.includes("unauthorized") || err.message.includes("401")) {
        navigate("/customer/login");
      } else {
        setError("Failed to update cart");
      }
    }
  }

  function updateQty(item, qty) {
    if (qty <= 0) {
      removeFromCart(item);
      return;
    }
    const newItems = (cart.items || []).map(i => 
      i.menu_item_id === item.menu_item_id ? { ...i, qty } : i
    );
    updateCart(newItems);
  }

  function removeFromCart(item) {
    const newItems = (cart.items || []).filter(i => 
      i.menu_item_id !== item.menu_item_id
    );
    updateCart(newItems);
  }

  async function clearCart() {
    if (!token) return;
    
    try {
      await api.delete(API_ENDPOINTS.CART);
      setCart({ items: [], address: "" });
    } catch (err) {
      console.error("Error clearing cart:", err);
      if (err.message.includes("unauthorized") || err.message.includes("401")) {
        navigate("/customer/login");
      } else {
        setError("Failed to clear cart");
      }
    }
  }

  function applyCoupon() {
    if (coupon.trim()) {
      setCouponApplied(true);
      setError("");
    } else {
      setError("Please enter a coupon code");
    }
  }

  async function placeOrder() {
    if (!token) {
      navigate("/customer/login");
      return;
    }

    setPlacingOrder(true);
    setError("");
    
    try {
      // Find a valid restaurantId from cart items
      let restaurantId = null;
      for (const item of cart.items || []) {
        if (item.restaurantId) { 
          restaurantId = item.restaurantId; 
          break; 
        }
      }
      
      if (!restaurantId) {
        throw new Error("No restaurant found in cart");
      }

      // Ensure all items have required fields
      const itemsWithIds = (cart.items || []).map(item => ({
        ...item,
        menu_item_id: item.menu_item_id ?? item.id,
        restaurantId: item.restaurantId || restaurantId
      }));

      // Filter out invalid items
      const validItems = itemsWithIds.filter(item => 
        item.menu_item_id != null && item.restaurantId != null
      );

      if (validItems.length === 0) {
        throw new Error("No valid items in cart");
      }

      // Calculate discount
      const discount = couponApplied ? Math.min(subtotal * 0.1, 50) : 0; // 10% off, max $50

      await api.post(API_ENDPOINTS.ORDERS, {
        items: validItems,
        address,
        coupon: couponApplied ? coupon : "",
        payment,
        discount,
        total: total
      });

      setOrderPlaced(true);
      setCart({ items: [], address: "" });
      
      // Clear cart in backend
      await api.delete(API_ENDPOINTS.CART);
      
    } catch (err) {
      console.error("Error placing order:", err);
      if (err.message.includes("unauthorized") || err.message.includes("401")) {
        navigate("/customer/login");
      } else {
        setError(err.message);
      }
    } finally {
      setPlacingOrder(false);
    }
  }

  const subtotal = (cart.items || []).reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = couponApplied ? Math.min(subtotal * 0.1, 50) : 0; // 10% off, max $50
  const deliveryFee = subtotal > 0 ? 5 : 0; // $5 delivery fee
  const total = Math.max(0, subtotal - discount + deliveryFee);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Loading your cart...</span>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-4 text-[#16213e]">Order Placed Successfully!</h2>
        <div className="text-gray-600 mb-6 text-lg">
          Thank you for your order. You can track it in the Orders section.
        </div>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => navigate('/customer/orders')}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-orange-600 transition"
          >
            View Orders
          </button>
          <button 
            onClick={() => navigate('/customer')}
            className="bg-gray-500 text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-gray-600 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-orange-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-[#16213e]">Your Cart</h2>
        <button 
          onClick={() => navigate('/customer')}
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          ← Continue Shopping
        </button>
      </div>

      {(cart.items || []).length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Add some delicious items to get started!</p>
          <button 
            onClick={() => navigate('/customer/restaurants')}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold shadow hover:bg-orange-600 transition"
          >
            Browse Restaurants
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-[#16213e] mb-4">Cart Items</h3>
              <div className="space-y-4">
                {cart.items.map((item, idx) => (
                  <div key={item.menu_item_id || item.name + '-' + idx} className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#16213e]">{item.name}</h4>
                      <p className="text-gray-600 text-sm">₹{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <button 
                          className="px-3 py-1 hover:bg-gray-200 rounded-l-lg transition"
                          onClick={() => updateQty(item, item.qty - 1)}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-semibold">{item.qty}</span>
                        <button 
                          className="px-3 py-1 hover:bg-gray-200 rounded-r-lg transition"
                          onClick={() => updateQty(item, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#16213e]">₹{(item.price * item.qty).toFixed(2)}</div>
                      </div>
                      <button 
                        className="text-red-500 hover:text-red-700 transition"
                        onClick={() => removeFromCart(item)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="w-full mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-[#16213e] mb-4">Delivery Address</h3>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                rows="3"
                placeholder="Enter your complete delivery address..."
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#16213e] mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method.value}
                    className={`p-4 rounded-lg border-2 transition ${
                      payment === method.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPayment(method.value)}
                  >
                    <div className="text-2xl mb-2">{method.icon}</div>
                    <div className="text-sm font-medium">{method.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-[#16213e] mb-4">Order Summary</h3>
              
              {/* Coupon Section */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    placeholder="Coupon code"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                  />
                  <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition text-sm"
                    onClick={applyCoupon}
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <div className="text-green-600 text-sm mt-2">✓ Coupon applied!</div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-[#16213e]">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button 
                className={`w-full py-4 rounded-xl font-bold shadow transition ${
                  !address || (cart.items || []).length === 0 || placingOrder
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
                disabled={!address || (cart.items || []).length === 0 || placingOrder}
                onClick={placeOrder}
              >
                {placingOrder ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Placing Order...
                  </div>
                ) : (
                  `Place Order - ₹${total.toFixed(2)}`
                )}
              </button>

              {!address && (
                <div className="text-red-500 text-sm mt-2 text-center">
                  Please enter your delivery address
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 