import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import UsersPage from "./UsersPage";
import RestaurantsPage from "./RestaurantsPage";
import OrdersPage from "./OrdersPage";
import ReviewsPage from "./ReviewsPage";
import PlatformAnalytics from "./PlatformAnalytics";
import OffersPage from "./OffersPage";
import AdminSettingsPage from "./AdminSettingsPage";

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`bg-${color}-50 rounded-2xl shadow p-6 flex flex-col items-center border border-${color}-100`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-[#16213e]">{value}</div>
      <div className="text-gray-500">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, restaurants: 0, orders: 0, reviews: 0, offers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError("");
      try {
        const [users, restaurants, orders, reviews, offers] = await Promise.all([
          fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch("/api/admin/restaurants", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch("/api/admin/reviews", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch("/api/offers/admin/all", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]);
        setStats({ 
          users: users.length, 
          restaurants: restaurants.length, 
          orders: orders.length, 
          reviews: reviews.length,
          offers: offers.length
        });
      } catch (err) {
        setError("Failed to fetch admin stats");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchStats();
  }, [token]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <AdminHeader setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden md:ml-72">
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={
                <div className="p-6">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Welcome to the Foodly platform management dashboard</p>
                  </div>
                  
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                          <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                      <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Dashboard</div>
                      <p className="text-red-500">{error}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                      <StatCard icon="👤" label="Total Users" value={stats.users} color="blue" />
                      <StatCard icon="🍽️" label="Restaurants" value={stats.restaurants} color="green" />
                      <StatCard icon="📦" label="Orders" value={stats.orders} color="yellow" />
                      <StatCard icon="⭐" label="Reviews" value={stats.reviews} color="purple" />
                      <StatCard icon="🎯" label="Active Offers" value={stats.offers} color="orange" />
                    </div>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button 
                          onClick={() => navigate("/admin/offers")}
                          className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Create New Offer</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => navigate("/admin/analytics")}
                          className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">View Analytics</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => navigate("/admin/users")}
                          className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Manage Users</span>
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">New restaurant registered</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">5 new orders received</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">System maintenance scheduled</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">API Status</span>
                          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 rounded-full">Online</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Database</span>
                          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 rounded-full">Connected</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Uptime</span>
                          <span className="text-sm font-medium text-gray-800">99.9%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              } />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/analytics" element={<PlatformAnalytics />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/settings" element={<AdminSettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
} 