import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
      const token = localStorage.getItem("token");
      if (userId && token) {
        fetch(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.ok ? res.json() : null)
          .then(profile => {
            if (profile && profile.username) {
              setUsername(profile.username);
              localStorage.setItem("username", profile.username);
            }
          });
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
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
    <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-100 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Foodly Logo" className="w-10 h-10 rounded-full shadow border border-gray-200" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-sm text-gray-500">Platform Management</p>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search users, restaurants, orders..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationDropdownRef}>
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75a6 6 0 006 6h3a6 6 0 006-6V9.75a6 6 0 00-6-6h-3z" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <button
                      onClick={clearNotifications}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div key={notification.id} className="p-4 border-b border-gray-50 hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            <div className="flex gap-2 mt-2">
                              <button 
                                className="text-xs text-blue-600 hover:text-blue-800"
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
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">{username}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <p className="font-semibold text-gray-800">{username}</p>
                  <p className="text-sm text-gray-500">{userRole}</p>
                </div>
                <div className="p-2">
                  {(userRole === "CUSTOMER" || userRole === "RESTAURANT") && (
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      onClick={handleSwitchDashboard}
                    >
                      Switch to {userRole.charAt(0) + userRole.slice(1).toLowerCase()} Dashboard
                    </button>
                  )}
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={handleProfileSettings}
                  >
                    Profile Settings
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
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