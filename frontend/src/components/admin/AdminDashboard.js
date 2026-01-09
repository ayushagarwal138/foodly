import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    restaurants: 0,
    orders: 0,
    reviews: 0,
    offers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStats = async () => {
    setError("");
    try {
      const [users, restaurants, orders, reviews, offers] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN_USERS),
        api.get(API_ENDPOINTS.ADMIN_RESTAURANTS),
        api.get(API_ENDPOINTS.ADMIN_ORDERS),
        api.get(API_ENDPOINTS.ADMIN_REVIEWS),
        api.get(API_ENDPOINTS.ADMIN_OFFERS)
      ]);

      setStats({
        users: Array.isArray(users) ? users.length : 0,
        restaurants: Array.isArray(restaurants) ? restaurants.length : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        reviews: Array.isArray(reviews) ? reviews.length : 0,
        offers: Array.isArray(offers) ? offers.length : 0
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      const errorMessage = err.message || "Failed to fetch admin stats";
      if (errorMessage.includes("403") || errorMessage.includes("Access denied")) {
        setError("Access denied. Please ensure you are logged in as an admin user.");
      } else if (errorMessage.includes("401") || errorMessage.includes("Authentication")) {
        setError("Authentication failed. Please log in again.");
      } else {
        setError(`Failed to fetch admin stats: ${errorMessage}`);
      }
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchDashboardStats();
      setLoading(false);
    }
    initialFetch();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Admin Dashboard</h2>
      <p className="text-gray-600 mb-8">Welcome to the Foodly platform management dashboard</p>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{stats.restaurants}</div>
          <div className="text-sm text-gray-600">Restaurants</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.orders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{stats.reviews}</div>
          <div className="text-sm text-gray-600">Reviews</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{stats.offers}</div>
          <div className="text-sm text-gray-600">Active Offers</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#16213e] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              + Create New Offer
            </button>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              View Analytics
            </button>
            <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Manage Users
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#16213e] mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">New restaurant registered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">5 new orders received</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">System maintenance scheduled</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#16213e] mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API Status:</span>
              <span className="text-sm font-semibold text-green-600">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database:</span>
              <span className="text-sm font-semibold text-green-600">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uptime:</span>
              <span className="text-sm font-semibold text-green-600">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 