import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiClock, FiMapPin, FiMessageCircle, FiPackage, FiRefreshCw, FiStar, FiTruck, FiXCircle } from "react-icons/fi";
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
      case "new": return FiPackage;
      case "accepted": return FiCheckCircle;
      case "preparing": return FiClock;
      case "out for delivery": return FiTruck;
      case "delivered": return FiCheckCircle;
      case "cancelled":
      case "canceled": return FiXCircle;
      default: return FiPackage;
    }
  };

  if (loading) return <div className="app-page-narrow surface-panel text-center">Loading...</div>;
  if (error) return <div className="app-page-narrow surface-panel text-center text-red-600">{error}</div>;

  return (
    <div className="app-page-narrow">
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="section-title">Order History</h2>
          <p className="section-subtitle">Track recent orders, open support, or review delivered meals.</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="btn btn-secondary w-full md:w-auto"
        >
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
      
      {orders.length === 0 ? (
        <div className="surface-panel py-12 text-center text-neutral-500">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-neutral-100 text-neutral-500">
            <FiPackage className="h-7 w-7" />
          </div>
          <p className="font-semibold text-neutral-800">No orders found.</p>
          <p className="mt-2 text-sm">Start ordering from your favorite restaurants.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => {
            const restId = o.restaurantId || o.restaurant_id;
            const StatusIcon = getStatusIcon(o.status);
            return (
              <div key={o.id} className="surface-panel transition-shadow hover:shadow-md">
                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-950">Order #{o.id}</h3>
                      <p className="text-sm text-neutral-600">
                        {new Date(o.date || o.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-neutral-600">Restaurant: {o.restaurant || "Unknown"}</p>
                    </div>
                  </div>
                  <span className={`status-pill ${getStatusColor(o.status)}`}>
                    {o.status}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="mb-2 font-medium text-neutral-950">Items</h4>
                  <ul className="space-y-1">
                    {o.items && Array.isArray(o.items) ? o.items.map((item, index) => (
                      <li key={index} className="text-sm text-neutral-600">
                        {item.quantity}x {item.name} - ₹{item.price}
                      </li>
                    )) : (
                      <li className="text-sm text-neutral-600">Items not available</li>
                    )}
                  </ul>
                </div>

                <div className="flex flex-col justify-between gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center">
                  <div className="text-lg font-semibold text-neutral-950">
                    Total: ₹{o.total?.toFixed ? o.total.toFixed(2) : o.total || 0}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className="btn btn-secondary min-h-[34px] px-3 py-1.5 text-xs" 
                      onClick={() => navigate(`/customer/track?id=${o.id}`)}
                    >
                      <FiMapPin className="h-3.5 w-3.5" />
                      Track
                    </button>
                    
                    {/* Chat with Restaurant Button */}
                    {o.id && restId && o.status !== "Delivered" && o.status !== "Cancelled" && o.status !== "Canceled" && (
                      <button
                        className="btn btn-secondary min-h-[34px] px-3 py-1.5 text-xs"
                        onClick={() => {
                          localStorage.setItem("currentOrderId", o.id);
                          localStorage.setItem("currentRestaurantId", restId);
                          navigate("/customer/support");
                        }}
                      >
                        <FiMessageCircle className="h-3.5 w-3.5" />
                        Chat
                      </button>
                    )}
                    
                    {/* Review Button for Delivered Orders */}
                    {o.status === "Delivered" && (
                      <button
                        className="btn btn-primary min-h-[34px] px-3 py-1.5 text-xs"
                        onClick={() => {
                          localStorage.setItem("reviewOrderId", o.id);
                          navigate("/customer/reviews");
                        }}
                      >
                        <FiStar className="h-3.5 w-3.5" />
                        Review
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
