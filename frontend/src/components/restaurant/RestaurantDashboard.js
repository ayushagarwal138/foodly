import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function RestaurantDashboard() {
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");

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
      if (restaurantId && token) {
        await Promise.all([fetchOrders(), fetchRestaurant()]);
      }
      setLoading(false);
    }
    initialFetch();
  }, [restaurantId, token]);

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

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Restaurant Dashboard</h2>
      
      {restaurant && (
        <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="text-xl font-semibold text-[#16213e] mb-2">{restaurant.name}</h3>
          <p className="text-gray-600">{restaurant.cuisineType || restaurant.cuisine}</p>
          <p className="text-gray-600">{restaurant.address}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
          <div className="text-sm text-gray-600">Pending Orders</div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
          <div className="text-sm text-gray-600">Completed Orders</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">${totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h3 className="text-xl font-semibold text-[#16213e] mb-4">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No orders yet.</div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-[#16213e]">Order #{order.id}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.date || order.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Customer: {order.customerName || "Unknown"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#16213e]">${order.total || 0}</div>
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