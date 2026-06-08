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

  const statCards = [
    ["Total Users", stats.users, "text-primary-600", "bg-primary-50"],
    ["Restaurants", stats.restaurants, "text-accent-700", "bg-accent-50"],
    ["Total Orders", stats.orders, "text-yellow-700", "bg-yellow-50"],
    ["Reviews", stats.reviews, "text-neutral-950", "bg-neutral-50"],
    ["Active Offers", stats.offers, "text-primary-700", "bg-primary-50"]
  ];

  return (
    <div className="app-page">
      <div className="mb-6">
        <h2 className="section-title">Admin Dashboard</h2>
        <p className="section-subtitle">Welcome to the Foodly platform management dashboard.</p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map(([label, value, textClass, bgClass]) => (
          <div key={label} className={`rounded-lg border border-neutral-200 p-5 shadow-sm ${bgClass}`}>
            <div className={`text-2xl font-bold ${textClass}`}>{value}</div>
            <div className="text-sm text-neutral-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="surface-panel">
          <h3 className="mb-4 text-lg font-semibold text-neutral-950">Quick Actions</h3>
          <div className="space-y-3">
            <button className="btn btn-primary w-full">
              Create New Offer
            </button>
            <button className="btn btn-secondary w-full">
              View Analytics
            </button>
            <button className="btn btn-secondary w-full">
              Manage Users
            </button>
          </div>
        </div>

        <div className="surface-panel">
          <h3 className="mb-4 text-lg font-semibold text-neutral-950">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-neutral-700">New restaurant registered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-neutral-700">5 new orders received</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-neutral-700">System maintenance scheduled</span>
            </div>
          </div>
        </div>

        <div className="surface-panel">
          <h3 className="mb-4 text-lg font-semibold text-neutral-950">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">API Status:</span>
              <span className="text-sm font-semibold text-green-600">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Database:</span>
              <span className="text-sm font-semibold text-green-600">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Uptime:</span>
              <span className="text-sm font-semibold text-green-600">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
