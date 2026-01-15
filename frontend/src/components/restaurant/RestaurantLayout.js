import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiPackage, FiDollarSign, FiClock, FiCheckCircle, FiArrowRight, FiCoffee, FiMenu, FiStar, FiSettings, FiAlertCircle } from "react-icons/fi";
import Sidebar from "./Sidebar";
import Header from "./Header";
import OrdersPage from "./OrdersPage";
import MenuPage from "./MenuPage";
import ReviewsPage from "./ReviewsPage";
import ProfilePage from "./ProfilePage";
import SupportPage from "./SupportPage";
import AnalyticsPage from './AnalyticsPage';
import Button from "../ui/Button";
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

  const getStatusConfig = (status) => {
    const configs = {
      "New": { icon: FiClock, color: "blue", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      "Accepted": { icon: FiCheckCircle, color: "secondary", bg: "bg-secondary-50", text: "text-secondary-700", border: "border-secondary-200" },
      "Preparing": { icon: FiPackage, color: "yellow", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
      "Out for Delivery": { icon: FiPackage, color: "purple", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      "Delivered": { icon: FiCheckCircle, color: "accent", bg: "bg-accent-50", text: "text-accent-700", border: "border-accent-200" },
      "Cancelled": { icon: FiAlertCircle, color: "red", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    };
    return configs[status] || configs["New"];
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="card text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
            <p className="text-neutral-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="card border-2 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-700">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

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

  const stats = [
    { icon: FiPackage, label: "Total Orders", value: totalOrders, color: "primary" },
    { icon: FiDollarSign, label: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}`, color: "accent" },
    { icon: FiClock, label: "Pending Orders", value: pendingOrders, color: "secondary" },
    { icon: FiCheckCircle, label: "Completed Orders", value: completedOrders, color: "accent" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      {/* Hero Welcome */}
      <div className="mb-8">
        <div className="card bg-gradient-to-br from-primary-50 via-white to-accent-50 border-2 border-primary-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white border-2 border-primary-200">
                  <FiCoffee className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-dark-primary mb-2">
                    Welcome back{restaurant?.name ? `, ${restaurant.name}` : ''}!
                  </h1>
                  <p className="text-neutral-600 text-base">Here's your restaurant's performance today.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/restaurant/orders')}
                leftIcon={<FiPackage className="w-4 h-4" />}
              >
                View Orders
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/restaurant/menu')}
                leftIcon={<FiMenu className="w-4 h-4" />}
              >
                Manage Menu
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const getColorClasses = (color) => {
            switch(color) {
              case 'primary':
                return {
                  bg: 'bg-primary-50',
                  border: 'border-primary-100',
                  text: 'text-primary-600'
                };
              case 'secondary':
                return {
                  bg: 'bg-secondary-50',
                  border: 'border-secondary-100',
                  text: 'text-secondary-600'
                };
              case 'accent':
                return {
                  bg: 'bg-accent-50',
                  border: 'border-accent-100',
                  text: 'text-accent-600'
                };
              default:
                return {
                  bg: 'bg-primary-50',
                  border: 'border-primary-100',
                  text: 'text-primary-600'
                };
            }
          };
          const colors = getColorClasses(stat.color);
          return (
            <div key={idx} className="card-hover text-center">
              <div className={`mb-4 inline-flex p-3 rounded-xl border-2 ${colors.bg} ${colors.border}`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-dark-primary mb-2">{stat.value}</div>
              <div className={`${colors.text} text-sm font-semibold`}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-dark-primary flex items-center gap-2">
            <FiPackage className="w-5 h-5 text-primary-500" />
            Recent Orders
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/restaurant/orders')}
            rightIcon={<FiArrowRight className="w-4 h-4" />}
          >
            View All
          </Button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <FiPackage className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
            <p className="text-lg font-medium">No orders yet.</p>
            <p className="text-sm mt-2">Orders will appear here once customers start ordering.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((o) => {
              const statusConfig = getStatusConfig(o.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors border-2 border-neutral-200"
                >
                  <div className="flex-1">
                    <div className="font-bold text-lg text-dark-primary mb-1">Order #{o.id}</div>
                    <div className="text-sm text-neutral-600">
                      {new Date(o.date || o.createdAt).toLocaleString()}
                    </div>
                    {o.customerName && (
                      <div className="text-sm text-neutral-600">Customer: {o.customerName}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-lg text-dark-primary mb-2">₹{o.total?.toFixed ? o.total.toFixed(2) : o.total || 0}</div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {o.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
  const userRole = localStorage.getItem("userRole");
  
  // All hooks must be called before any conditional returns
  useEffect(() => {
    function handleOpenSidebar() { setSidebarOpen(true); }
    window.addEventListener('openSidebar', handleOpenSidebar);
    return () => window.removeEventListener('openSidebar', handleOpenSidebar);
  }, []);

  // If restaurantId is not set, try to fetch it from the API
  useEffect(() => {
    if (!restaurantId && token && userRole === "RESTAURANT") {
      const userId = localStorage.getItem("userId");
      if (userId) {
        // Try to get restaurant by owner
        api.get(API_ENDPOINTS.RESTAURANT_BY_OWNER(userId))
          .then(data => {
            if (data && data.id) {
              localStorage.setItem("restaurantId", data.id);
              window.location.reload(); // Reload to update the component
            }
          })
          .catch(err => {
            console.error("Failed to fetch restaurant:", err);
            // Allow access even if restaurant not found - user might need to create one
          });
      }
    }
  }, [restaurantId, token, userRole]);

  // Check authentication - allow restaurant users even if restaurantId is not set yet
  if (!token || userRole !== "RESTAURANT") {
    return <Navigate to="/restaurant/login" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Sidebar current={current} open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col ml-0 md:ml-72">
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