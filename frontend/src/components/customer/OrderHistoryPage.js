import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/orders/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchOrders();
  }, [token]);

  if (loading) return <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center">Loading...</div>;
  if (error) return <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Order History</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 font-semibold">
            <th className="pb-2">Order ID</th>
            <th className="pb-2">Date</th>
            <th className="pb-2">Restaurant</th>
            <th className="pb-2">Items</th>
            <th className="pb-2">Total</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => {
            // Debug: log order object to check available fields
            console.log('Order object:', o);
            const restId = o.restaurantId || o.restaurant_id;
            return (
              <tr key={o.id} className="border-t last:border-b-0">
                <td className="py-2 font-semibold text-[#16213e]">{o.id}</td>
                <td className="py-2">{o.date}</td>
                <td className="py-2">{o.restaurant}</td>
                <td className="py-2">{Array.isArray(o.items) ? o.items.join(", ") : o.items}</td>
                <td className="py-2">₹{o.total?.toFixed ? o.total.toFixed(2) : o.total}</td>
                <td className="py-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${o.status === "Delivered" ? "bg-green-100 text-green-700" : o.status === "Canceled" ? "bg-gray-200 text-gray-500" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span>
                </td>
                <td className="py-2">
                  <button className="text-blue-600 hover:underline text-xs font-semibold" onClick={() => navigate(`/customer/track?id=${o.id}`)}>Track</button>
                  {/* Chat with Restaurant Button */}
                  {o.id && restId && o.status !== "Delivered" && o.status !== "Cancelled" && (
                    <button
                      className="ml-2 text-green-600 hover:underline text-xs font-semibold"
                      onClick={() => {
                        localStorage.setItem("currentOrderId", o.id);
                        localStorage.setItem("currentRestaurantId", restId);
                        navigate("/customer/support");
                      }}
                    >
                      Chat with Restaurant
                    </button>
                  )}
                  {/* Review Button for Delivered Orders */}
                  {o.status === "Delivered" && (
                    <button
                      className="ml-2 text-orange-600 hover:underline text-xs font-semibold"
                      onClick={() => {
                        localStorage.setItem("reviewOrderId", o.id);
                        navigate("/customer/reviews");
                      }}
                    >
                      Review
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 