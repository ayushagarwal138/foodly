import React, { useState, useEffect } from "react";
import { useCart } from "./CartContext";

const PAYMENT_METHODS = ["Cash on Delivery", "UPI", "Credit/Debit Card"];

export default function CartPage() {
  const { cart, setCart } = useCart();
  // Debug: log cart state to diagnose cart issues
  console.log("Cart state in CartPage:", cart);
  const [address, setAddress] = useState("");
  const [coupon, setCoupon] = useState("");
  const [payment, setPayment] = useState(PAYMENT_METHODS[0]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  // Load cart from backend
  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/cart", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCart(data);
        setAddress(data.address || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchCart();
  }, [token, setCart]);

  // Update cart in backend
  async function updateCart(newItems) {
    // Ensure all items have menu_item_id
    const sanitized = (newItems || []).map(i => ({
      ...i,
      menu_item_id: i.menu_item_id ?? i.id
    }));
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items: sanitized, address })
      });
      if (!res.ok) throw new Error("Failed to update cart");
      const data = await res.json();
      setCart(data);
    } catch (err) {
      setError("Failed to update cart");
    }
  }

  function updateQty(item, qty) {
    const newItems = (cart.items || []).map(i => i.menu_item_id === item.menu_item_id ? { ...i, qty } : i);
    updateCart(newItems);
  }
  function removeFromCart(item) {
    const newItems = (cart.items || []).filter(i => i.menu_item_id !== item.menu_item_id);
    updateCart(newItems);
  }
  function clearCart() {
    fetch("/api/cart", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setCart({ items: [], address: "" }))
      .catch(() => {});
  }
  function applyCoupon() {
    alert("Coupon applied (demo only)");
  }
  async function placeOrder() {
    setLoading(true);
    setError("");
    try {
      // Find a valid restaurantId from cart items or localStorage
      let restaurantId = null;
      for (const i of cart.items || []) {
        if (i.restaurantId) { restaurantId = i.restaurantId; break; }
      }
      if (!restaurantId) {
        restaurantId = localStorage.getItem("restaurantId");
      }
      // Ensure all items have menu_item_id and restaurantId
      const itemsWithIds = (cart.items || []).map(i => ({
        ...i,
        menu_item_id: i.menu_item_id ?? i.id, // fallback to id if missing
        restaurantId: i.restaurantId || restaurantId
      }));
      // Debug logs to help diagnose issues
      console.log("Cart items for order:", cart.items);
      console.log("Items after mapping:", itemsWithIds);
      // Defensive: filter out items missing menu_item_id or restaurantId
      const validItems = itemsWithIds.filter(i => i.menu_item_id != null && i.restaurantId != null);
      console.log("Valid items:", validItems);
      if (validItems.length === 0) throw new Error("No valid items in cart (missing menu_item_id or restaurantId)");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: validItems,
          address,
          coupon,
          payment
        })
      });
      if (!res.ok) throw new Error("Failed to place order");
      setOrderPlaced(true);
      setCart({ items: [], address: "" });
      // Optionally clear cart in backend
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const subtotal = (cart.items || []).reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = coupon ? 5 : 0; // Flat $5 off for demo
  const total = Math.max(0, subtotal - discount);

  if (loading) {
    return <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center">Loading...</div>;
  }
  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center">
        <h2 className="text-2xl font-bold mb-4 text-[#16213e]">Order Placed!</h2>
        <div className="text-gray-600 mb-4">Thank you for your order. You can track it in the Orders section.</div>
      </div>
    );
  }
  if (error) {
    return <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Your Cart</h2>
      {(cart.items || []).length === 0 ? (
        <div className="text-gray-500">Your cart is empty.</div>
      ) : (
        <>
          <ul className="mb-6">
            {cart.items.map((item, idx) => (
              <li key={item.menu_item_id ? item.menu_item_id : item.name + '-' + idx} className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="ml-2 text-gray-500">₹{item.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => updateQty(item, Math.max(1, item.qty - 1))}>-</button>
                  <span>{item.qty}</span>
                  <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => updateQty(item, item.qty + 1)}>+</button>
                  <button className="ml-2 text-red-500 hover:underline text-xs" onClick={() => removeFromCart(item)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold shadow hover:bg-gray-300 transition text-xs mb-2" onClick={clearCart}>Empty Cart</button>
          <div className="mb-6">
            <label className="block text-gray-600 font-medium mb-1">Delivery Address</label>
            <input
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 mb-2"
              placeholder="Enter your address"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>
          <div className="mb-6 flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-gray-600 font-medium mb-1">Coupon Code</label>
              <input
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter coupon (demo: any)"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
              />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition text-xs" onClick={applyCoupon}>Apply</button>
          </div>
          <div className="mb-6">
            <label className="block text-gray-600 font-medium mb-1">Payment Method</label>
            <select className="w-full px-4 py-2 border rounded-xl" value={payment} onChange={e => setPayment(e.target.value)}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-[#16213e]">Subtotal:</span>
            <span className="font-bold text-[#16213e]">₹{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center mb-2 text-green-600">
              <span>Discount:</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center mb-4 text-lg">
            <span className="font-bold text-[#16213e]">Total:</span>
            <span className="font-bold text-[#16213e]">₹{total.toFixed(2)}</span>
          </div>
          <button className="w-full bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-orange-600 transition disabled:opacity-50" disabled={!address || (cart.items || []).length === 0} onClick={placeOrder}>
            Place Order
          </button>
        </>
      )}
    </div>
  );
} 