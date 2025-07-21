import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed by Restaurant" },
  { key: "out", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" }
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function OrderTrackingPage() {
  const query = useQuery();
  const orderId = query.get("id");
  const [order, setOrder] = useState(null);
  const [statusIdx, setStatusIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        setOrder(data);
        // Map status to index
        const idx = STATUS_STEPS.findIndex(s => s.key === data.statusKey);
        setStatusIdx(idx >= 0 ? idx : 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (orderId && token) fetchOrder();
  }, [orderId, token]);

  function advanceStatus() {
    setStatusIdx(idx => Math.min(idx + 1, STATUS_STEPS.length - 1));
  }

  if (loading) return <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center">Loading...</div>;
  if (error || !order) return <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center text-red-600">{error || "Order not found."}</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Order Tracking</h2>
      {/* Order Details */}
      <div className="mb-6">
        <div className="text-gray-600 mb-1">Order ID: <span className="font-semibold text-[#16213e]">{order.id}</span></div>
        <div className="text-gray-600 mb-1">Restaurant: <span className="font-semibold text-[#16213e]">{order.restaurant}</span></div>
        <div className="text-gray-600 mb-1">Placed At: {order.placedAt}</div>
        <div className="text-gray-600 mb-1">Items: {order.items && order.items.map ? order.items.map(i => `${i.qty} x ${i.name}`).join(", ") : order.items}</div>
        <div className="text-gray-600">Total: <span className="font-semibold text-[#16213e]">₹{order.total?.toFixed ? order.total.toFixed(2) : order.total}</span></div>
      </div>
      {/* Status Timeline */}
      <div className="mb-8">
        <ol className="relative border-l-2 border-blue-200">
          {STATUS_STEPS.map((step, idx) => (
            <li key={step.key} className="mb-8 ml-6">
              <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ${idx <= statusIdx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{idx + 1}</span>
              <h3 className={`font-semibold ${idx <= statusIdx ? 'text-blue-700' : 'text-gray-400'}`}>{step.label}</h3>
              {idx === statusIdx && <p className="text-sm text-blue-500 mt-1">Current Status</p>}
            </li>
          ))}
        </ol>
      </div>
      {statusIdx < STATUS_STEPS.length - 1 && (
        <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition" onClick={advanceStatus}>
          Advance Status (Demo)
        </button>
      )}
      {statusIdx === STATUS_STEPS.length - 1 && (
        <div className="text-green-600 font-bold text-lg text-center">Order Delivered!</div>
      )}
      {/* Chat with Restaurant Button */}
      {order && (order.restaurantId || order.restaurant_id) && order.status !== "Delivered" && order.status !== "Cancelled" && (
        (() => { console.log('Order object:', order); return null; })()
      ) && (
        <button
          className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-blue-700 transition"
          onClick={() => {
            const restId = order.restaurantId || order.restaurant_id;
            localStorage.setItem("currentOrderId", order.id);
            localStorage.setItem("currentRestaurantId", restId);
            window.location.href = "/customer/support";
          }}
        >
          Chat with Restaurant
        </button>
      )}
    </div>
  );
} 