import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPackage, FiCalendar, FiCoffee, FiCheckCircle, FiXCircle, FiClock, FiTruck, FiMessageCircle, FiStar, FiEye, FiDollarSign, FiAlertCircle } from "react-icons/fi";
import ReviewModal from "./ReviewModal";
import Button from "../ui/Button";
import { api, API_ENDPOINTS } from "../../config/api";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewOrder, setReviewOrder] = useState(null);
  const token = localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.MY_ORDERS);
      console.log("Fetched orders:", data);
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    }
  }, []);

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
  }, [token, fetchOrders]);

  // Polling for new orders
  useEffect(() => {
    if (!token) return;

    const pollInterval = setInterval(() => {
      fetchOrders();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [token, fetchOrders]);

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

  const navigate = useNavigate();

  const handleReviewClose = async (orderId) => {
    localStorage.setItem(`reviewed_order_${orderId}`, 'true');
    setReviewOrder(null);
    // Refresh orders to get latest status
    await fetchOrders();
  };

  const getStatusConfig = (status) => {
    const configs = {
      "New": { icon: FiClock, color: "blue", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      "Accepted": { icon: FiCheckCircle, color: "secondary", bg: "bg-secondary-50", text: "text-secondary-700", border: "border-secondary-200" },
      "Preparing": { icon: FiPackage, color: "yellow", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
      "Out for Delivery": { icon: FiTruck, color: "purple", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      "Delivered": { icon: FiCheckCircle, color: "accent", bg: "bg-accent-50", text: "text-accent-700", border: "border-accent-200" },
      "Cancelled": { icon: FiXCircle, color: "red", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    };
    return configs[status] || configs["New"];
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="card text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
            <p className="text-neutral-600 font-medium">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="card border-2 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-700">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="card">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary-50 border-2 border-primary-100">
            <FiPackage className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark-primary">My Orders</h1>
            <p className="text-neutral-600 text-sm mt-1">
              {sortedOrders.length} {sortedOrders.length === 1 ? 'order' : 'orders'} total
            </p>
          </div>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-4">
              <FiPackage className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">No orders yet</h3>
            <p className="text-neutral-500 mb-6">Start ordering from your favorite restaurants!</p>
            <Button variant="primary" onClick={() => navigate('/customer/restaurants')}>
              Browse Restaurants
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((o) => {
              const restId = o.restaurantId || o.restaurant_id;
              const statusConfig = getStatusConfig(o.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={o.id}
                  className="p-5 bg-neutral-50 rounded-xl border-2 border-neutral-200 hover:border-primary-200 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="font-bold text-lg text-dark-primary">Order #{o.id}</div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {o.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <FiCalendar className="w-4 h-4 text-neutral-400" />
                          <span>{new Date(o.date || o.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <FiCoffee className="w-4 h-4 text-neutral-400" />
                          <span>{o.restaurant || 'Restaurant'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <FiDollarSign className="w-4 h-4 text-neutral-400" />
                          <span className="font-semibold text-dark-primary">₹{o.total?.toFixed ? o.total.toFixed(2) : o.total}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/customer/track?id=${o.id}`)}
                        leftIcon={<FiEye className="w-4 h-4" />}
                      >
                        Track
                      </Button>
                      {o.id && restId && o.status !== "Delivered" && o.status !== "Cancelled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/customer/support?orderId=${o.id}&restaurantId=${restId}`)}
                          leftIcon={<FiMessageCircle className="w-4 h-4" />}
                        >
                          Chat
                        </Button>
                      )}
                      {o.status === "Delivered" && !localStorage.getItem(`reviewed_order_${o.id}`) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReviewOrder(o)}
                          leftIcon={<FiStar className="w-4 h-4" />}
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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