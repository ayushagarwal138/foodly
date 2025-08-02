import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function PlatformAnalytics() {
  const [analytics, setAnalytics] = useState({
    orders: [],
    restaurants: [],
    users: [],
    reviews: [],
    offers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    setError("");
    try {
      const [orders, restaurants, users, reviews, offers] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN_ORDERS),
        api.get(API_ENDPOINTS.ADMIN_RESTAURANTS),
        api.get(API_ENDPOINTS.ADMIN_USERS),
        api.get(API_ENDPOINTS.ADMIN_REVIEWS),
        api.get(API_ENDPOINTS.ADMIN_OFFERS)
      ]);

      setAnalytics({
        orders: Array.isArray(orders) ? orders : [],
        restaurants: Array.isArray(restaurants) ? restaurants : [],
        users: Array.isArray(users) ? users : [],
        reviews: Array.isArray(reviews) ? reviews : [],
        offers: Array.isArray(offers) ? offers : []
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to fetch analytics data");
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchAnalytics();
      setLoading(false);
    }
    initialFetch();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  // Calculate statistics
  const totalOrders = analytics.orders.length;
  const totalRevenue = analytics.orders
    .filter(o => o.status === "Delivered")
    .reduce((sum, o) => sum + (o.total || 0), 0);
  
  const totalUsers = analytics.users.length;
  const totalRestaurants = analytics.restaurants.length;
  const totalReviews = analytics.reviews.length;
  const averageRating = analytics.reviews.length > 0 
    ? (analytics.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / analytics.reviews.length).toFixed(1)
    : 0;

  // Order status breakdown
  const orderStatuses = analytics.orders.reduce((acc, order) => {
    const status = order.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Recent activity (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const recentOrders = analytics.orders.filter(o => 
    new Date(o.createdAt || o.created_at) > weekAgo
  ).length;
  
  const recentUsers = analytics.users.filter(u => 
    new Date(u.createdAt || u.created_at) > weekAgo
  ).length;
  
  const recentRestaurants = analytics.restaurants.filter(r => 
    new Date(r.createdAt || r.created_at) > weekAgo
  ).length;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Platform Analytics</h2>
      <p className="text-gray-600 mb-8">Comprehensive analytics and insights for the Foodly platform</p>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-xs text-green-600 mt-1">+{recentOrders} this week</div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-xs text-green-600 mt-1">From completed orders</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{totalUsers}</div>
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-xs text-green-600 mt-1">+{recentUsers} this week</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{totalRestaurants}</div>
          <div className="text-sm text-gray-600">Restaurants</div>
          <div className="text-xs text-green-600 mt-1">+{recentRestaurants} this week</div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#16213e] mb-4">Order Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(orderStatuses).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{status}</span>
                <span className="font-semibold text-[#16213e]">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#16213e] mb-4">Review Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Reviews</span>
              <span className="font-semibold text-[#16213e]">{totalReviews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Rating</span>
              <span className="font-semibold text-[#16213e]">{averageRating}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Offers</span>
              <span className="font-semibold text-[#16213e]">{analytics.offers.filter(o => o.isActive).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-[#16213e] mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalOrders > 0 ? ((totalOrders / totalUsers) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600">Order Rate</div>
            <div className="text-xs text-gray-500">Orders per user</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalRestaurants > 0 ? (totalOrders / totalRestaurants).toFixed(1) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Orders/Restaurant</div>
            <div className="text-xs text-gray-500">Orders per restaurant</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Order Value</div>
            <div className="text-xs text-gray-500">Revenue per order</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-[#16213e] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Export Data
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Generate Report
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
} 