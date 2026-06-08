import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";
import { api, API_ENDPOINTS, clearAuth } from "../../config/api";

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
    const userRole = localStorage.getItem("userRole");
    
    if (restaurantId && userRole && userRole.toUpperCase() === "RESTAURANT") {
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

  const handleLogout = async () => {
    try {
      await api.post(API_ENDPOINTS.LOGOUT, {});
    } finally {
      clearAuth();
      localStorage.removeItem("restaurantName");
      window.location.href = "/restaurant/login";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-neutral-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:px-6 lg:px-8">
      {/* Brand + Hamburger */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          className="rounded-md p-2 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
          onClick={handleSidebarToggle}
          aria-label="Open sidebar"
        >
          <FiMenu className="h-5 w-5 text-neutral-800" />
        </button>
        <button
          onClick={() => navigate('/restaurant')}
          className="flex items-center gap-2 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Go to dashboard"
        >
          <img
            src="/logo.jpeg"
            alt="Foodly Logo"
            className="h-9 w-28 rounded-md bg-white object-contain"
          />
        </button>
      </div>

      {/* Restaurant Name Centered */}
      <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
        {restaurantName && (
          <div className="flex max-w-md items-center gap-2 rounded-md border border-accent-200 bg-accent-50 px-3 py-1.5">
            <FaUtensils className="h-4 w-4 flex-shrink-0 text-accent-600" />
            <span className="truncate text-sm font-semibold text-accent-800">{restaurantName}</span>
          </div>
        )}
      </div>

      {/* User Dropdown */}
      <div className="flex items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-950 text-base font-bold text-white transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="User menu"
            aria-expanded={open}
          >
            {initial ? (
              <span className="text-lg">{initial}</span>
            ) : (
              <FiUser className="h-5 w-5" />
            )}
          </button>
          {open && (
            <div className="animate-scale-in absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg">
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
