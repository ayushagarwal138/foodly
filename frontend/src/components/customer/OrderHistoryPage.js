import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, API_ENDPOINTS } from "../../config/api";

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.MY_ORDERS);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time updates - refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "delivered": return "bg-green-100 text-green-700";
      case "cancelled":
      case "canceled": return "bg-gray-200 text-gray-500";
      case "out for delivery": return "bg-blue-100 text-blue-700";
      case "preparing": return "bg-orange-100 text-orange-700";
      case "accepted": return "bg-yellow-100 text-yellow-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "new": return "🆕";
      case "accepted": return "✅";
      case "preparing": return "👨‍🍳";
      case "out for delivery": return "🚚";
      case "delivered": return "🎉";
      case "cancelled":
      case "canceled": return "❌";
      default: return "📋";
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center">Loading...</div>;
  if (error) return <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#16213e]">Order History</h2>
        <button 
          onClick={fetchOrders}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          🔄 Refresh
        </button>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📋</div>
          <p>No orders found.</p>
          <p className="text-sm mt-2">Start ordering from your favorite restaurants!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => {
            const restId = o.restaurantId || o.restaurant_id;
            return (
              <div key={o.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getStatusIcon(o.status)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-[#16213e]">Order #{o.id}</h3>
                      <p className="text-gray-600 text-sm">
                        {new Date(o.date || o.createdAt).toLocaleString()}
                      </p>
                      <p className="text-gray-600 text-sm">Restaurant: {o.restaurant || "Unknown"}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(o.status)}`}>
                    {o.status}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-[#16213e] mb-2">Items:</h4>
                  <ul className="space-y-1">
                    {o.items && Array.isArray(o.items) ? o.items.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {item.quantity}x {item.name} - ₹{item.price}
                      </li>
                    )) : (
                      <li className="text-sm text-gray-600">Items not available</li>
                    )}
                  </ul>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold text-[#16213e]">
                    Total: ₹{o.total?.toFixed ? o.total.toFixed(2) : o.total || 0}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="text-blue-600 hover:underline text-xs font-semibold" 
                      onClick={() => navigate(`/customer/track?id=${o.id}`)}
                    >
                      📍 Track
                    </button>
                    
                    {/* Chat with Restaurant Button */}
                    {o.id && restId && o.status !== "Delivered" && o.status !== "Cancelled" && o.status !== "Canceled" && (
                      <button
                        className="text-green-600 hover:underline text-xs font-semibold"
                        onClick={() => {
                          localStorage.setItem("currentOrderId", o.id);
                          localStorage.setItem("currentRestaurantId", restId);
                          navigate("/customer/support");
                        }}
                      >
                        💬 Chat
                      </button>
                    )}
                    
                    {/* Review Button for Delivered Orders */}
                    {o.status === "Delivered" && (
                      <button
                        className="text-orange-600 hover:underline text-xs font-semibold"
                        onClick={() => {
                          localStorage.setItem("reviewOrderId", o.id);
                          navigate("/customer/reviews");
                        }}
                      >
                        ⭐ Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 