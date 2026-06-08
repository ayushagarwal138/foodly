import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiCreditCard, FiDollarSign, FiGlobe, FiMapPin, FiShoppingBag, FiSmartphone, FiTrash2 } from "react-icons/fi";
import { useCart } from "./CartContext";
import { api, API_ENDPOINTS } from "../../config/api";

const PAYMENT_METHODS = [
  { value: "Cash on Delivery", label: "Cash on Delivery", icon: FiDollarSign },
  { value: "UPI", label: "UPI", icon: FiSmartphone },
  { value: "Credit/Debit Card", label: "Credit/Debit Card", icon: FiCreditCard },
  { value: "Net Banking", label: "Net Banking", icon: FiGlobe }
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
  const userRole = localStorage.getItem("userRole");

  // Check authentication
  useEffect(() => {
    if (userRole !== "CUSTOMER") {
      navigate("/customer/login");
      return;
    }
  }, [userRole, navigate]);

  // Load cart from backend
  useEffect(() => {
    async function fetchCart() {
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
  }, [setCart, navigate]);

  // Update cart in backend
  async function updateCart(newItems) {
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
    if (!localStorage.getItem("userId")) {
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
      const discount = couponApplied ? Math.min(subtotal * 0.1, 50) : 0; // 10% off, max ₹50

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
          const discount = couponApplied ? Math.min(subtotal * 0.1, 50) : 0; // 10% off, max ₹50
        const deliveryFee = subtotal > 0 ? 5 : 0; // ₹5 delivery fee
  const total = Math.max(0, subtotal - discount + deliveryFee);

  if (loading) {
    return (
      <div className="app-page-narrow surface-panel">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
          <span className="ml-3 text-neutral-600">Loading your cart...</span>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="app-page-narrow surface-panel text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-accent-50 text-accent-700 ring-1 ring-accent-100">
          <FiCheckCircle className="h-7 w-7" />
        </div>
        <h2 className="mb-4 text-3xl font-bold text-neutral-950">Order placed successfully</h2>
        <div className="mb-6 text-lg text-neutral-600">
          Thank you for your order. You can track it in the Orders section.
        </div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button 
            onClick={() => navigate('/customer/orders')}
            className="btn btn-primary"
          >
            View Orders
          </button>
          <button 
            onClick={() => navigate('/customer')}
            className="btn btn-secondary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-page-narrow surface-panel text-center">
        <div className="mb-4 text-lg text-red-600">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="section-title">Your Cart</h2>
          <p className="section-subtitle">Review items, delivery details, and payment before placing your order.</p>
        </div>
        <button 
          onClick={() => navigate('/customer')}
          className="btn btn-ghost w-full md:w-auto"
        >
          <FiArrowLeft className="h-4 w-4" />
          Continue Shopping
        </button>
      </div>

      {(cart.items || []).length === 0 ? (
        <div className="surface-panel py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-neutral-100 text-neutral-500">
            <FiShoppingBag className="h-7 w-7" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-neutral-800">Your cart is empty</h3>
          <p className="mb-6 text-neutral-500">Add items from nearby restaurants to get started.</p>
          <button 
            onClick={() => navigate('/customer/restaurants')}
            className="btn btn-primary"
          >
            Browse Restaurants
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="surface-panel mb-6">
              <h3 className="mb-4 text-lg font-semibold text-neutral-950">Cart Items</h3>
              <div className="space-y-4">
                {cart.items.map((item, idx) => (
                  <div key={item.menu_item_id || item.name + '-' + idx} className="flex flex-col gap-4 rounded-md border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-950">{item.name}</h4>
                      <p className="text-sm text-neutral-600">₹{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-md border border-neutral-200 bg-neutral-50">
                        <button 
                          className="px-3 py-1.5 transition hover:bg-neutral-100"
                          onClick={() => updateQty(item, item.qty - 1)}
                        >
                          -
                        </button>
                        <span className="px-3 py-1.5 font-semibold">{item.qty}</span>
                        <button 
                          className="px-3 py-1.5 transition hover:bg-neutral-100"
                          onClick={() => updateQty(item, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-neutral-950">₹{(item.price * item.qty).toFixed(2)}</div>
                      </div>
                      <button 
                        className="rounded-md p-2 text-red-600 transition hover:bg-red-50 hover:text-red-700"
                        onClick={() => removeFromCart(item)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="btn btn-secondary mt-4 w-full"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>

            {/* Delivery Address */}
            <div className="surface-panel mb-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-950">
                <FiMapPin className="h-5 w-5 text-primary-600" />
                Delivery Address
              </h3>
              <textarea
                className="input resize-none"
                rows="3"
                placeholder="Enter your complete delivery address..."
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <div className="surface-panel">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-950">
                <FiCreditCard className="h-5 w-5 text-primary-600" />
                Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(method => {
                  const Icon = method.icon;
                  return (
                  <button
                    key={method.value}
                    className={`rounded-md border p-4 text-left transition ${
                      payment === method.value
                        ? 'border-primary-500 bg-primary-50 text-primary-800'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                    }`}
                    onClick={() => setPayment(method.value)}
                  >
                    <Icon className="mb-2 h-5 w-5" />
                    <div className="text-sm font-semibold">{method.label}</div>
                  </button>
                )})}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="surface-panel sticky top-24">
              <h3 className="mb-4 text-lg font-semibold text-neutral-950">Order Summary</h3>
              
              {/* Coupon Section */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    className="input flex-1 py-2 text-sm"
                    placeholder="Coupon code"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                  />
                  <button 
                    className="btn btn-secondary min-h-[40px] px-4 py-2 text-sm"
                    onClick={applyCoupon}
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <div className="mt-2 text-sm text-accent-700">Coupon applied</div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-accent-700">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-600">Delivery Fee</span>
                  <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-neutral-950">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button 
                className={`btn w-full py-4 ${
                  !address || (cart.items || []).length === 0 || placingOrder
                    ? 'bg-neutral-200 text-neutral-500'
                    : 'btn-primary'
                }`}
                disabled={!address || (cart.items || []).length === 0 || placingOrder}
                onClick={placeOrder}
              >
                {placingOrder ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Placing Order...
                  </div>
                ) : (
                  `Place Order - ₹${total.toFixed(2)}`
                )}
              </button>

              {!address && (
                <div className="mt-2 text-center text-sm text-red-600">
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
