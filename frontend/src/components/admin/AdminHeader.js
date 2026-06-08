import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api, API_ENDPOINTS, clearAuth } from "../../config/api";

export default function AdminHeader({ setSidebarOpen, sidebarOpen }) {
  const [username, setUsername] = useState(localStorage.getItem("username") || "Admin");
  const [userRole] = useState(localStorage.getItem("userRole") || "ADMIN");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const userDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      const userId = localStorage.getItem("userId");
      if (userId) {
        api.get(API_ENDPOINTS.ADMIN_USER_BY_ID(userId))
          .then(profile => {
            if (profile && profile.username) {
              setUsername(profile.username);
              localStorage.setItem("username", profile.username);
            }
          })
          .catch(() => {});
      }
    }
  }, [username]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    }
    if (userDropdownOpen || notificationDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen, notificationDropdownOpen]);

  // Simulate notifications (in real app, this would come from API)
  useEffect(() => {
    const mockNotifications = [
      { id: 1, message: "New restaurant registration", time: "2 min ago", type: "info" },
      { id: 2, message: "5 new orders received", time: "5 min ago", type: "success" },
      { id: 3, message: "System maintenance scheduled", time: "1 hour ago", type: "warning" }
    ];
    setNotifications(mockNotifications);
    setNotificationCount(mockNotifications.length);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post(API_ENDPOINTS.LOGOUT, {});
    } finally {
      clearAuth();
      navigate("/admin/login");
    }
  };

  const handleProfileSettings = () => {
    setUserDropdownOpen(false);
    navigate("/admin/settings");
  };

  const handleSwitchDashboard = () => {
    if (userRole === "CUSTOMER") navigate("/customer");
    else if (userRole === "RESTAURANT") navigate("/restaurant");
  };

  const clearNotifications = () => {
    setNotifications([]);
    setNotificationCount(0);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button 
            className="rounded-md p-2 transition-colors hover:bg-neutral-100 lg:hidden" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5 text-neutral-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Foodly Logo" className="h-9 w-9 rounded-md border border-neutral-200 object-cover" />
            <div>
              <h1 className="text-lg font-bold text-neutral-950">Admin Panel</h1>
              <p className="hidden text-xs font-medium text-neutral-500 sm:block">Platform management</p>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="mx-8 hidden max-w-md flex-1 lg:flex">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search users, restaurants, orders..."
              className="h-10 w-full rounded-md border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notificationDropdownRef}>
            <button
              className="relative rounded-md p-2 transition-colors hover:bg-neutral-100"
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
            >
              <svg className="h-5 w-5 text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75a6 6 0 006 6h3a6 6 0 006-6V9.75a6 6 0 00-6-6h-3z" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg">
                <div className="border-b border-neutral-100 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-900">Notifications</h3>
                    <button
                      onClick={clearNotifications}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div key={notification.id} className="border-b border-neutral-100 p-4 hover:bg-neutral-50">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' : 'bg-primary-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-neutral-800">{notification.message}</p>
                            <p className="mt-1 text-xs text-neutral-500">{notification.time}</p>
                            <div className="flex gap-2 mt-2">
                              <button 
                                className="text-xs font-medium text-primary-600 hover:text-primary-700"
                                onClick={() => {
                                  // Handle notification action based on type
                                  if (notification.message.includes("restaurant")) {
                                    navigate("/admin/restaurants");
                                  } else if (notification.message.includes("orders")) {
                                    navigate("/admin/orders");
                                  }
                                  setNotificationDropdownOpen(false);
                                }}
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userDropdownRef}>
            <button
              className="flex items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-neutral-100"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-950 font-semibold text-white">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-neutral-900">{username}</p>
                <p className="text-xs text-neutral-500">{userRole}</p>
              </div>
              <svg className="h-4 w-4 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg">
                <div className="border-b border-neutral-100 p-4">
                  <p className="font-semibold text-neutral-900">{username}</p>
                  <p className="text-sm text-neutral-500">{userRole}</p>
                </div>
                <div className="p-2">
                  {(userRole === "CUSTOMER" || userRole === "RESTAURANT") && (
                    <button
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-primary-600 transition-colors hover:bg-primary-50"
                      onClick={handleSwitchDashboard}
                    >
                      Switch to {userRole.charAt(0) + userRole.slice(1).toLowerCase()} Dashboard
                    </button>
                  )}
                  <button
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                    onClick={handleProfileSettings}
                  >
                    Profile Settings
                  </button>
                  <button
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 
