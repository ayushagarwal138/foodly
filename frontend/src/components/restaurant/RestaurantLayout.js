import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import OrdersPage from "./OrdersPage";
import MenuPage from "./MenuPage";
import ReviewsPage from "./ReviewsPage";
import ProfilePage from "./ProfilePage";
import SupportPage from "./SupportPage";
import AnalyticsPage from './AnalyticsPage';
import UnreadMessageNotification from '../UnreadMessageNotification';
import { api, API_ENDPOINTS } from "../../config/api";

const pathToLabel = [
  { path: "/restaurant/orders", label: "Orders" },
  { path: "/restaurant/menu", label: "Menu" },
  { path: "/restaurant/reviews", label: "Reviews" },
  { path: "/restaurant/profile", label: "Profile" },
  { path: "/restaurant/support", label: "Support" },
  { path: "/restaurant/analytics", label: "Analytics" },
  { path: "/restaurant", label: "Dashboard" }
];

// Dashboard component with the improved design
function DashboardContent() {
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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
      const data = await api.get(API_ENDPOINTS.RESTAURANTS + `/${restaurantId}`);
      console.log("Fetched restaurant:", data);
      setRestaurant(data);
    } catch (err) {
      console.error("Error fetching restaurant:", err);
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
    <div className="p-10">
      {/* Hero Welcome */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#16213e] mb-2">
            Welcome back{restaurant?.name ? `, ${restaurant.name}` : ''}!
          </h2>
          <div className="text-gray-500 text-lg">Here's your restaurant's performance today.</div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button 
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-blue-700 transition-all duration-200 text-lg" 
            onClick={() => navigate('/restaurant/orders')}
          >
            View Orders
          </button>
          <button 
            className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-orange-600 transition-all duration-200 text-lg" 
            onClick={() => navigate('/restaurant/menu')}
          >
            Manage Menu
          </button>
          <button 
            className="bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-green-700 transition-all duration-200 text-lg" 
            onClick={() => navigate('/restaurant/reviews')}
          >
            See Reviews
          </button>
          <button 
            className="bg-gray-600 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-gray-700 transition-all duration-200 text-lg" 
            onClick={() => navigate('/restaurant/profile')}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform duration-200">
          <div className="text-3xl mb-2">📦</div>
          <div className="text-2xl font-bold text-[#16213e]">{totalOrders}</div>
          <div className="text-gray-500">Total Orders</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform duration-200">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-[#16213e]">${totalRevenue.toFixed(2)}</div>
          <div className="text-gray-500">Total Revenue</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform duration-200">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-2xl font-bold text-[#16213e]">{pendingOrders}</div>
          <div className="text-gray-500">Pending Orders</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform duration-200">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-[#16213e]">{completedOrders}</div>
          <div className="text-gray-500">Completed Orders</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 mb-8">
        <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <div className="text-gray-500">No orders available.</div>
        ) : (
          <ul className="divide-y">
            {recentOrders.map((o, idx) => (
              <li key={o.id} className="py-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <span className="font-semibold text-[#16213e]">Order #{o.id}</span>
                <span className={
                  o.status === "Delivered" ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold" :
                  o.status === "Preparing" ? "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold" :
                  o.status === "New" ? "bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold" :
                  "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold"
                }>{o.status}</span>
                <span className="text-[#16213e] font-bold">${o.total || 0}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function RestaurantLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");

  // Find the current label based on the path (longest match wins)
  const current = pathToLabel.find(({ path }) => location.pathname.startsWith(path))?.label || "Dashboard";

  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    function handleOpenSidebar() { setSidebarOpen(true); }
    window.addEventListener('openSidebar', handleOpenSidebar);
    return () => window.removeEventListener('openSidebar', handleOpenSidebar);
  }, []);

  // Check authentication
  if (!restaurantId || !token) {
    return <Navigate to="/restaurant/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar current={current} open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col md:ml-72">
        <Header setCurrent={() => {}} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<DashboardContent />} />
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
      <UnreadMessageNotification userType="restaurant" />
    </div>
  );
} 