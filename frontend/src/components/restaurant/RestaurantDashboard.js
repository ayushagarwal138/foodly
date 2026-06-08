import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function RestaurantDashboard() {
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const restaurantId = localStorage.getItem("restaurantId");

  async function fetchOrders() {
    try {
      const data = await api.get(API_ENDPOINTS.RESTAURANT_ORDERS(restaurantId));
      console.log("Fetched orders:", data);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    }
  }

  async function fetchRestaurant() {
    try {
      // Use the simpler endpoint that doesn't require authentication
      const data = await api.get(API_ENDPOINTS.RESTAURANTS + `/${restaurantId}`);
      console.log("Fetched restaurant:", data);
      setRestaurant(data);
    } catch (err) {
      console.error("Error fetching restaurant:", err);
      // Don't set error for restaurant fetch, just log it
      console.log("Could not fetch restaurant details, continuing with orders only");
    }
  }

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      if (restaurantId) {
        await Promise.all([fetchOrders(), fetchRestaurant()]);
      }
      setLoading(false);
    }
    initialFetch();
  }, [restaurantId]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ["New", "Accepted", "Preparing"].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === "Delivered").length;
  const totalRevenue = orders
    .filter(o => o.status === "Delivered")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Get recent orders (last 5)
  const recentOrders = orders
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 5);

  const statCards = [
    ["Total Orders", totalOrders, "text-primary-600", "bg-primary-50"],
    ["Pending Orders", pendingOrders, "text-yellow-700", "bg-yellow-50"],
    ["Completed Orders", completedOrders, "text-accent-700", "bg-accent-50"],
    ["Total Revenue", `₹${totalRevenue.toFixed(2)}`, "text-neutral-950", "bg-neutral-50"]
  ];

  return (
    <div className="app-page">
      <div className="mb-6">
        <h2 className="section-title">Restaurant Dashboard</h2>
        <p className="section-subtitle">Monitor order volume, revenue, and recent activity.</p>
      </div>
      
      {restaurant && (
        <div className="surface-panel mb-6 bg-primary-50">
          <h3 className="mb-2 text-xl font-semibold text-neutral-950">{restaurant.name}</h3>
          <p className="text-neutral-600">{restaurant.cuisineType || restaurant.cuisine}</p>
          <p className="text-neutral-600">{restaurant.address}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(([label, value, textClass, bgClass]) => (
          <div key={label} className={`rounded-lg border border-neutral-200 p-5 shadow-sm ${bgClass}`}>
            <div className={`text-2xl font-bold ${textClass}`}>{value}</div>
            <div className="text-sm text-neutral-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <h3 className="mb-4 text-xl font-semibold text-neutral-950">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <div className="surface-panel py-8 text-center text-neutral-500">No orders yet.</div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="surface-panel">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <div className="font-semibold text-neutral-950">Order #{order.id}</div>
                    <div className="text-sm text-neutral-600">
                      {new Date(order.date || order.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm text-neutral-600">
                      Customer: {order.customerName || "Unknown"}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-semibold text-neutral-950">₹{order.total || 0}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "New" ? "bg-blue-100 text-blue-800" :
                      order.status === "Accepted" ? "bg-yellow-100 text-yellow-800" :
                      order.status === "Preparing" ? "bg-orange-100 text-orange-800" :
                      order.status === "Out for Delivery" ? "bg-purple-100 text-purple-800" :
                      order.status === "Delivered" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
