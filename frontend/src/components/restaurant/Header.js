import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiUser, FiLogOut, FiCoffee, FiSettings } from "react-icons/fi";
import { api, API_ENDPOINTS } from "../../config/api";

export default function Header({ setCurrent }) {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [restaurantName, setRestaurantName] = useState(localStorage.getItem("restaurantName") || "");
  const initial = username ? username.charAt(0).toUpperCase() : null;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleSidebarToggle = () => {
    window.dispatchEvent(new CustomEvent('openSidebar'));
  };

  useEffect(() => {
    const restaurantId = localStorage.getItem("restaurantId");
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    
    if (restaurantId && token && userRole && userRole.toUpperCase() === "RESTAURANT") {
      // Use the centralized API configuration
      api.get(API_ENDPOINTS.RESTAURANTS + `/${restaurantId}`)
        .then(profile => {
          if (profile && profile.name) {
            setRestaurantName(profile.name);
            localStorage.setItem("restaurantName", profile.name);
          }
          if (profile && profile.owner) {
            if (profile.owner.username) {
              setUsername(profile.owner.username);
              localStorage.setItem("username", profile.owner.username);
            }
            if (profile.owner.email) {
              localStorage.setItem("email", profile.owner.email);
            }
          }
        })
        .catch(err => {
          console.error("Error fetching restaurant profile:", err);
          // Continue without restaurant details
        });
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("restaurantName");
    localStorage.removeItem("restaurantId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    window.location.href = "/restaurant/login";
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 lg:px-12 py-4 bg-white shadow-soft border-b border-neutral-200 backdrop-blur-sm bg-white/95">
      {/* Brand + Hamburger */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          className="md:hidden p-2 rounded-xl hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={handleSidebarToggle}
          aria-label="Open sidebar"
        >
          <FiMenu className="w-6 h-6 text-dark-primary" />
        </button>
        <button
          onClick={() => navigate('/restaurant')}
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-xl p-1"
          aria-label="Go to dashboard"
        >
          <img
            src="/logo.jpeg"
            alt="Foodly Logo"
            className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-md border-2 border-neutral-200 transition-transform hover:scale-105"
          />
          <span className="hidden sm:block text-xl font-bold text-dark-primary">Foodly</span>
        </button>
      </div>

      {/* Restaurant Name Centered */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        {restaurantName && (
          <div className="flex items-center gap-2 px-4 py-2 bg-accent-50 rounded-xl border-2 border-accent-200">
            <FiCoffee className="w-5 h-5 text-accent-600" />
            <span className="text-lg font-semibold text-accent-700">{restaurantName}</span>
          </div>
        )}
      </div>

      {/* User Dropdown */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-dark-primary flex items-center justify-center text-white font-bold text-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 hover:scale-105"
            onClick={() => setOpen((v) => !v)}
            aria-label="User menu"
            aria-expanded={open}
          >
            {initial ? (
              <span className="text-lg">{initial}</span>
            ) : (
              <FiUser className="w-6 h-6" />
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-neutral-200 rounded-xl shadow-large z-50 animate-scale-in overflow-hidden">
              <button
                className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-neutral-50 text-neutral-700 font-medium transition-colors focus:outline-none focus:bg-neutral-50"
                onClick={() => {
                  setOpen(false);
                  navigate('/restaurant/profile');
                }}
              >
                <FiSettings className="w-5 h-5 text-neutral-500" />
                My Profile
              </button>
              <div className="border-t border-neutral-200" />
              <button
                className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-medium transition-colors focus:outline-none focus:bg-red-50"
                onClick={handleLogout}
              >
                <FiLogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 