import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminDashboard from "./AdminDashboard";
import UsersPage from "./UsersPage";
import RestaurantsPage from "./RestaurantsPage";
import OrdersPage from "./OrdersPage";
import ReviewsPage from "./ReviewsPage";
import PlatformAnalytics from "./PlatformAnalytics";
import OffersPage from "./OffersPage";
import AdminSettingsPage from "./AdminSettingsPage";

const pathToLabel = [
  { path: "/admin/users", label: "Users" },
  { path: "/admin/restaurants", label: "Restaurants" },
  { path: "/admin/orders", label: "Orders" },
  { path: "/admin/reviews", label: "Reviews" },
  { path: "/admin/analytics", label: "Analytics" },
  { path: "/admin/offers", label: "Offers" },
  { path: "/admin/settings", label: "Settings" },
  { path: "/admin", label: "Dashboard" }
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

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
  if (!token || userRole !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

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
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/analytics" element={<PlatformAnalytics />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/settings" element={<AdminSettingsPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
} 