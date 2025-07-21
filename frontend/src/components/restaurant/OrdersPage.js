import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const STATUS_OPTIONS = ["New", "Accepted", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];
const STATUS_COLORS = {
  "New": "bg-blue-100 text-blue-700",
  "Accepted": "bg-green-100 text-green-700",
  "Preparing": "bg-yellow-100 text-yellow-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  "Delivered": "bg-green-100 text-green-700",
  "Cancelled": "bg-gray-200 text-gray-500"
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    setError("");
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      console.log("Fetched orders:", data);
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    }
  };

  // Initial fetch
  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    }
    if (restaurantId && token) {
      initialFetch();
    }
  }, [restaurantId, token]);

  // Polling for new orders
  useEffect(() => {
    if (!restaurantId || !token) return;

    const pollInterval = setInterval(() => {
      fetchOrders();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [restaurantId, token]);

  async function updateStatus(orderId, newStatus) {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      // Instead of updating the state directly, fetch fresh data
      await fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="p-10 text-center"><span className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></span><div>Loading orders...</div></div>;
  if (error) return <div className="p-10 text-center text-red-600 bg-red-50 border border-red-200 rounded-xl max-w-xl mx-auto">{error}</div>;

  // Sort orders by status priority and time
  const sortedOrders = [...orders].sort((a, b) => {
    const statusPriority = {
      "New": 0,
      "Accepted": 1,
      "Preparing": 2,
      "Out for Delivery": 3,
      "Delivered": 4,
      "Cancelled": 5
    };
    return statusPriority[a.status] - statusPriority[b.status];
  });

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Orders</h2>
      {sortedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-5xl mb-4">📦</span>
          <div className="text-gray-500 text-lg font-medium">No orders available.</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm rounded-xl overflow-hidden">
            <thead>
              <tr className="text-left text-gray-500 font-semibold bg-gray-50">
                <th className="pb-2 px-4">Order ID</th>
                <th className="pb-2 px-4">Customer</th>
                <th className="pb-2 px-4">Items</th>
                <th className="pb-2 px-4">Total</th>
                <th className="pb-2 px-4">Time</th>
                <th className="pb-2 px-4">Status</th>
                <th className="pb-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((o, idx) => (
                <tr key={o.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-3 px-4 font-semibold text-[#16213e]">{o.id}</td>
                  <td className="py-3 px-4">{o.customerName || o.customer || "-"}</td>
                  <td className="py-3 px-4">
                    {Array.isArray(o.items) ? (
                      <ul className="list-disc pl-4">
                        {o.items.map((i, idx) => (
                          <li key={i.menuItemId || i.name || idx}>
                            {i.qty || i.quantity} x {i.name} @ ₹{i.price}
                          </li>
                        ))}
                      </ul>
                    ) : o.items}
                  </td>
                  <td className="py-3 px-4">₹{o.total}</td>
                  <td className="py-3 px-4">{o.time || o.createdAt || "-"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold mr-2 ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-700"}`}>{o.status}</span>
                    <select
                      className="ml-2 px-2 py-1 rounded border focus:ring-2 focus:ring-blue-200"
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 flex gap-2 flex-wrap">
                    <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold shadow hover:bg-blue-200 transition-all duration-200 text-xs" style={{minWidth:'90px'}}>Details</button>
                    {/* Chat with Customer Button */}
                    <Link to={`/restaurant/support?orderId=${o.id}&customerId=${o.userId}`}>
                      <button
                        className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold shadow hover:bg-green-200 transition-all duration-200 text-xs"
                        style={{minWidth:'120px'}}
                      >
                        Chat with Customer
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 