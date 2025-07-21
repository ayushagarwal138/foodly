import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReviewModal from "./ReviewModal";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewOrder, setReviewOrder] = useState(null);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    setError("");
    try {
      const res = await fetch("/api/orders/my", {
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
    if (token) {
      initialFetch();
    }
  }, [token]);

  // Polling for new orders
  useEffect(() => {
    if (!token) return;

    const pollInterval = setInterval(() => {
      fetchOrders();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [token]);

  // Check for newly delivered orders that need reviews
  useEffect(() => {
    const justDelivered = orders.find(o => 
      o.status === "Delivered" && 
      !localStorage.getItem(`reviewed_order_${o.id}`)
    );
    if (justDelivered) {
      console.log("Found delivered order for review:", justDelivered);
      setReviewOrder(justDelivered);
    }
  }, [orders]);

  const handleReviewClose = async (orderId) => {
    localStorage.setItem(`reviewed_order_${orderId}`, 'true');
    setReviewOrder(null);
    // Refresh orders to get latest status
    await fetchOrders();
  };

  if (loading) return <div className="p-10 text-center"><span className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></span><div>Loading orders...</div></div>;
  if (error) return <div className="p-10 text-center text-red-600 bg-red-50 border border-red-200 rounded-xl max-w-xl mx-auto">{error}</div>;

  // Sort orders by date (newest first) and status
  const sortedOrders = [...orders].sort((a, b) => {
    // First sort by status priority
    const statusPriority = {
      "New": 0,
      "Accepted": 1,
      "Preparing": 2,
      "Out for Delivery": 3,
      "Delivered": 4,
      "Cancelled": 5
    };
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then sort by date (newest first)
    const dateA = new Date(a.date || a.createdAt);
    const dateB = new Date(b.date || b.createdAt);
    return dateB - dateA;
  });

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">My Orders</h2>
      {sortedOrders.length === 0 ? (
        <div className="text-gray-500">No orders yet.</div>
      ) : (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 font-semibold">
            <th className="pb-2">Order ID</th>
            <th className="pb-2">Date</th>
            <th className="pb-2">Restaurant</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Total</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((o) => {
            const restId = o.restaurantId || o.restaurant_id;
            return (
              <tr key={o.id} className="border-t last:border-b-0">
                <td className="py-2 font-semibold text-[#16213e]">{o.id}</td>
                <td className="py-2">{new Date(o.date || o.createdAt).toLocaleDateString()}</td>
                <td className="py-2">{o.restaurant}</td>
                <td className="py-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${o.status === "Delivered" ? "bg-green-100 text-green-700" : o.status === "Canceled" ? "bg-gray-200 text-gray-500" : o.status === "In Progress" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{o.status}</span>
                </td>
                <td className="py-2">₹{o.total}</td>
                <td className="py-2 flex gap-2">
                  <button className="text-blue-600 hover:underline text-xs font-semibold" onClick={() => alert('View order details')}>Details</button>
                  <button className="text-orange-500 hover:underline text-xs font-semibold" onClick={() => alert('Reorder')}>Reorder</button>
                  {o.status === "In Progress" && (
                    <button className="text-red-500 hover:underline text-xs font-semibold" onClick={() => alert('Cancel order')}>Cancel</button>
                  )}
                  {/* Chat with Restaurant Button */}
                  {o.id && restId && o.status !== "Delivered" && o.status !== "Cancelled" && (
                    <Link to={`/customer/support?orderId=${o.id}&restaurantId=${restId}`}>
                      <button className="text-green-600 hover:underline text-xs font-semibold">
                        Chat with Restaurant
                      </button>
                    </Link>
                  )}
                  {/* Review Button for Delivered Orders */}
                  {o.status === "Delivered" && !localStorage.getItem(`reviewed_order_${o.id}`) && (
                    <button
                      className="text-purple-600 hover:underline text-xs font-semibold"
                      onClick={() => setReviewOrder(o)}
                    >
                      Write Review
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      )}
      {reviewOrder && (
        <ReviewModal
          isOpen={true}
          onClose={() => handleReviewClose(reviewOrder.id)}
          orderId={reviewOrder.id}
          restaurantId={reviewOrder.restaurantId || reviewOrder.restaurant_id}
          items={reviewOrder.items || []}
        />
      )}
    </div>
  );
} 