import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, API_ENDPOINTS } from "../../config/api";

export default function Header({ setCurrent }) {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [restaurantName, setRestaurantName] = useState(localStorage.getItem("restaurantName") || "");
  const initial = username ? username.charAt(0).toUpperCase() : null;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-12 py-5 bg-white shadow-lg border-b border-gray-100">
      {/* Brand + Hamburger */}
      <div className="flex items-center gap-4">
        <button className="md:hidden bg-white rounded-full shadow p-2 border border-gray-200 mr-2" onClick={() => window.dispatchEvent(new CustomEvent('openSidebar'))} aria-label="Open sidebar">
          <svg className="w-7 h-7 text-[#16213e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <span className="bg-white rounded-full p-2 shadow-lg">
          <svg className="w-8 h-8 text-[#16213e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
        </span>
        <span className="text-xl md:text-2xl font-extrabold text-[#16213e] tracking-tight">Foodly</span>
      </div>
      {/* Restaurant Name Centered */}
      <div className="hidden md:block flex-1 text-center">
        {restaurantName && (
          <span className="text-lg font-semibold text-blue-700">{restaurantName}</span>
        )}
      </div>
      {/* User Dropdown */}
      <div className="flex items-center gap-6">
        <div className="relative" ref={dropdownRef}>
          <button
            className="w-12 h-12 rounded-full bg-[#16213e] flex items-center justify-center text-white font-bold text-xl shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => setOpen((v) => !v)}
          >
            {initial ? initial : (
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-3 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in">
              <button
                className="block w-full text-left px-5 py-3 hover:bg-gray-100 rounded-t-xl text-[#16213e] font-medium"
                onClick={() => { setOpen(false); setCurrent && setCurrent("Profile"); }}
              >
                My Profile
              </button>
              <button
                className="block w-full text-left px-5 py-3 hover:bg-gray-100 rounded-b-xl text-red-600 font-medium"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 