import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardMain from './DashboardMain';
import CustomerOrders from './CustomerOrders';
import CustomerFavorites from './CustomerFavorites';
import CustomerProfile from './CustomerProfile';
import CustomerSettings from './CustomerSettings';
import RestaurantPage from './RestaurantPage';
import CartPage from './CartPage';
import OrderTrackingPage from './OrderTrackingPage';
import OrderHistoryPage from './OrderHistoryPage';
import RatingsReviewsPage from './RatingsReviewsPage';
import WishlistPage from './WishlistPage';
import SupportChatPage from './SupportChatPage';
import Footer from './Footer';
import AllRestaurants from './AllRestaurants';
import OffersPage from './OffersPage';
import UnreadMessageNotification from '../UnreadMessageNotification';

const pathToLabel = [
  { path: "/customer/restaurants", label: "Restaurants" },
  { path: "/customer/orders", label: "Orders" },
  { path: "/customer/favorites", label: "Favorites" },
  { path: "/customer/offers", label: "Offers" },
  { path: "/customer/account", label: "Account" },
  { path: "/customer/settings", label: "Settings" },
  { path: "/customer/reviews", label: "Ratings & Reviews" },
  { path: "/customer/support", label: "Support" },
  { path: "/customer", label: "Dashboard" }
];

export default function CustomerDashboard() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  
  // Check authentication
  if (!token || userRole !== "CUSTOMER") {
    return <Navigate to="/customer/login" replace />;
  }
  
  // Find the current label based on the path (longest match wins)
  const current =
    pathToLabel.find(({ path }) => location.pathname.startsWith(path))?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex">
        <Sidebar current={current} />
        <div className="flex-1 flex flex-col ml-0 md:ml-72">
          <Header setCurrent={() => {}} />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardMain />} />
              <Route path="/orders" element={<CustomerOrders />} />
              <Route path="/favorites" element={<CustomerFavorites />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/account" element={<CustomerProfile />} />
              <Route path="/settings" element={<CustomerSettings />} />
              <Route path="/restaurant/:slug" element={<RestaurantPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/track" element={<OrderTrackingPage />} />
              <Route path="/history" element={<OrderHistoryPage />} />
              <Route path="/reviews" element={<RatingsReviewsPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/restaurants" element={<AllRestaurants />} />
              <Route path="/support" element={<SupportChatPage />} />
              <Route path="*" element={<Navigate to="/customer" replace />} />
            </Routes>
          </main>
        </div>
      </div>
      <Footer />
      <UnreadMessageNotification userType="customer" />
    </div>
  );
} 