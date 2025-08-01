import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import OrdersPage from "./OrdersPage";
import MenuPage from "./MenuPage";
import ReviewsPage from "./ReviewsPage";
import ProfilePage from "./ProfilePage";
import SupportPage from "./SupportPage";
import AnalyticsPage from './AnalyticsPage';

const pathToLabel = [
  { path: "/restaurant/orders", label: "Orders" },
  { path: "/restaurant/menu", label: "Menu" },
  { path: "/restaurant/reviews", label: "Reviews" },
  { path: "/restaurant/profile", label: "Profile" },
  { path: "/restaurant/support", label: "Support" },
  { path: "/restaurant", label: "Dashboard" }
];

export default function RestaurantDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");
  // Add this line to get restaurantName
  const restaurantName = localStorage.getItem("restaurantName") || "";

  // State for stats and recent orders
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/restaurants/${restaurantId}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (restaurantId && token) fetchOrders();
  }, [restaurantId, token]);

  // Calculate stats
  const today = new Date().toISOString().slice(0, 10);
  const ordersToday = orders.filter(o => {
    // Handle different date formats - createdAt might be order ID, time might be string
    const orderDate = o.time || "";
    if (typeof orderDate === 'string' && orderDate.length >= 10) {
      return orderDate.slice(0, 10) === today;
    }
    return false; // If no valid date string, don't count as today's order
  });
  const revenueToday = ordersToday.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => ["New", "Accepted", "Preparing"].includes(o.status)).length;
  // Find top dish (most ordered today)
  let topDish = "-";
  if (ordersToday.length > 0) {
    const dishCount = {};
    ordersToday.forEach(o => {
      (o.items || []).forEach(i => {
        const name = i.name || i;
        dishCount[name] = (dishCount[name] || 0) + (i.qty || 1);
      });
    });
    topDish = Object.entries(dishCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  }

  // Find the current label based on the path (longest match wins)
  const current =
    pathToLabel.find(({ path }) => location.pathname.startsWith(path))?.label || "Dashboard";

  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    function handleOpenSidebar() { setSidebarOpen(true); }
    window.addEventListener('openSidebar', handleOpenSidebar);
    return () => window.removeEventListener('openSidebar', handleOpenSidebar);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar current={current} open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col md:ml-72">
        <Header setCurrent={() => {}} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              <div className="p-10">
                {/* Hero Welcome */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-extrabold text-[#16213e] mb-2">Welcome back{restaurantName ? `, ${restaurantName}` : ''}!</h2>
                    <div className="text-gray-500 text-lg">Here's your restaurant's performance today.</div>
                  </div>
                  <div className="flex gap-3 mt-4 md:mt-0">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-blue-700 transition-all duration-200 text-lg" onClick={() => navigate('/restaurant/orders')}>View Orders</button>
                    <button className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-orange-600 transition-all duration-200 text-lg" onClick={() => navigate('/restaurant/menu')}>Manage Menu</button>
                    <button className="bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-green-700 transition-all duration-200 text-lg" onClick={() => navigate('/restaurant/reviews')}>See Reviews</button>
                    <button className="bg-gray-600 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-gray-700 transition-all duration-200 text-lg" onClick={() => navigate('/restaurant/profile')}>Edit Profile</button>
                  </div>
                </div>
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                  <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform duration-200">
                    <div className="text-3xl mb-2">📦</div>
                    <div className="text-2xl font-bold text-[#16213e]">{ordersToday.length}</div>
                    <div className="text-gray-500">Orders Today</div>
                  </div>
                  <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform duration-200">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-2xl font-bold text-[#16213e]">₹{revenueToday}</div>
                    <div className="text-gray-500">Revenue Today</div>
                  </div>
                  <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform duration-200">
                    <div className="text-3xl mb-2">⏳</div>
                    <div className="text-2xl font-bold text-[#16213e]">{pendingOrders}</div>
                    <div className="text-gray-500">Pending Orders</div>
                  </div>
                  <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform duration-200">
                    <div className="text-3xl mb-2">🍕</div>
                    <div className="text-2xl font-bold text-[#16213e]">{topDish}</div>
                    <div className="text-gray-500">Top Dish</div>
                  </div>
                </div>
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 mb-8">
                  <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
                  {orders.length === 0 ? (
                    <div className="text-gray-500">No orders available.</div>
                  ) : (
                    <ul className="divide-y">
                      {orders.slice(0, 3).map((o, idx) => (
                        <li key={o.id} className="py-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                          <span className="font-semibold text-[#16213e]">Order #{o.id}</span>
                          <span className={
                            o.status === "Delivered" ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold" :
                            o.status === "Preparing" ? "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold" :
                            o.status === "New" ? "bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold" :
                            "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold"
                          }>{o.status}</span>
                          <span className="text-[#16213e] font-bold">₹{o.total}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            } />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/restaurant" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
} 