import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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

export default function AdminLayout() {
  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    function handleOpenSidebar() { setSidebarOpen(true); }
    window.addEventListener('openSidebar', handleOpenSidebar);
    return () => window.removeEventListener('openSidebar', handleOpenSidebar);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f7f7f5]">
      {/* Header */}
      <AdminHeader setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-72">
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
