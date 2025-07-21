import React, { useEffect, useState } from "react";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import UsersPage from "./UsersPage";
import RestaurantsPage from "./RestaurantsPage";
import OrdersPage from "./OrdersPage";
import ReviewsPage from "./ReviewsPage";
import PlatformAnalytics from "./PlatformAnalytics";

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
  const [stats, setStats] = useState({ users: 0, restaurants: 0, orders: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "Admin";
  const userRole = localStorage.getItem("userRole") || "ADMIN";
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError("");
      try {
        const [users, restaurants, orders, reviews] = await Promise.all([
          fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch("/api/admin/restaurants", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch("/api/admin/reviews", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]);
        setStats({ users: users.length, restaurants: restaurants.length, orders: orders.length, reviews: reviews.length });
      } catch (err) {
        setError("Failed to fetch admin stats");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchStats();
  }, [token]);

  const sidebarLinks = [
    { label: "Dashboard", path: "/admin" },
    { label: "Users", path: "/admin/users" },
    { label: "Restaurants", path: "/admin/restaurants" },
    { label: "Orders", path: "/admin/orders" },
    { label: "Reviews", path: "/admin/reviews" },
    { label: "Analytics", path: "/admin/analytics" }
  ];

  const current = sidebarLinks.find(l => location.pathname.startsWith(l.path))?.label || "Dashboard";

  function handleLogout() {
    localStorage.clear();
    navigate("/admin/login");
  }

  function handleSwitchDashboard() {
    if (userRole === "CUSTOMER") navigate("/customer");
    else if (userRole === "RESTAURANT") navigate("/restaurant");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Topbar */}
      <header className="w-full flex items-center justify-between bg-white shadow px-6 py-4 border-b border-gray-100 z-30">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-2xl text-[#16213e]" onClick={() => setSidebarOpen(o => !o)} aria-label="Open sidebar">☰</button>
          <img src="/logo.jpeg" alt="Foodly Logo" className="w-10 h-10 rounded-full shadow border border-gray-200" />
          <span className="text-xl font-extrabold tracking-tight text-[#16213e]">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-semibold">{username}</span>
          {(userRole === "CUSTOMER" || userRole === "RESTAURANT") && (
            <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-semibold hover:bg-blue-200 transition" onClick={handleSwitchDashboard}>
              Switch to {userRole.charAt(0) + userRole.slice(1).toLowerCase()} Dashboard
            </button>
          )}
          <button className="bg-red-100 text-red-800 px-3 py-1 rounded font-semibold hover:bg-red-200 transition" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-gradient-to-b from-[#16213e] via-[#1e2a4a] to-[#16213e] rounded-r-3xl shadow-2xl flex flex-col items-center py-10 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.jpeg" alt="Foodly Logo" className="w-16 h-16 rounded-full shadow border border-gray-200 animate-fade-in" />
            <span className="text-2xl font-extrabold tracking-tight text-white">Admin</span>
          </div>
          <nav className="flex flex-col gap-3 w-full mt-4">
            {sidebarLinks.map(link => (
              <Link
                key={link.label}
                to={link.path}
                tabIndex={0}
                className={`flex items-center gap-5 w-[90%] mx-auto px-5 py-3 rounded-2xl text-lg font-semibold transition justify-start transform hover:scale-105 duration-200 relative focus:outline-none focus:ring-2 focus:ring-orange-400 ${current === link.label ? "bg-white text-[#16213e] shadow-md" : "text-white hover:bg-[#1e2a4a]"}`}
                aria-current={current === link.label ? "page" : undefined}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") navigate(link.path); }}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="block">{link.label}</span>
                {current === link.label && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-orange-500 rounded-full animate-pulse" />}
              </Link>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-0 md:ml-72">
          <main className="flex-1 p-10">
            <Routes>
              <Route path="/" element={
                <>
                  <h2 className="text-3xl font-bold mb-8 text-[#16213e]">Admin Dashboard</h2>
                  {loading ? (
                    <div className="p-10 text-center">Loading...</div>
                  ) : error ? (
                    <div className="p-10 text-center text-red-600">{error}</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                      <StatCard icon="👤" label="Users" value={stats.users} color="blue" />
                      <StatCard icon="🍽️" label="Restaurants" value={stats.restaurants} color="green" />
                      <StatCard icon="📦" label="Orders" value={stats.orders} color="yellow" />
                      <StatCard icon="⭐" label="Reviews" value={stats.reviews} color="purple" />
                    </div>
                  )}
                </>
              } />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/analytics" element={<PlatformAnalytics />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
} 