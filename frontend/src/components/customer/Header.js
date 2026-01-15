import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiSearch, FiShoppingCart, FiUser, FiX, FiLogOut,  } from "react-icons/fi";
import { useCart } from "./CartContext";
import { api, API_ENDPOINTS } from "../../config/api";

export default function Header({ setCurrent }) {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const initial = username ? username.charAt(0).toUpperCase() : null;
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { cartCount } = useCart();

  useEffect(() => {
    if (!username) {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");
      if (userId && token && userRole) {
        try {
          if (userRole.toUpperCase() === "CUSTOMER") {
            api.get(API_ENDPOINTS.CUSTOMER_PROFILE(userId))
              .then(profile => {
                if (profile && (profile.username || profile.name)) {
                  setUsername(profile.username || profile.name);
                  localStorage.setItem("username", profile.username || profile.name);
                }
              })
              .catch(err => {
                console.warn("Failed to fetch customer profile:", err);
                // Don't logout on profile fetch failure, just continue without username
              });
          } else if (userRole.toUpperCase() === "RESTAURANT") {
            api.get(API_ENDPOINTS.RESTAURANT_BY_OWNER(userId))
              .then(profile => {
                if (profile && (profile.name || (profile.owner && profile.owner.username))) {
                  const displayName = profile.name || profile.owner.username;
                  setUsername(displayName);
                  localStorage.setItem("username", displayName);
                }
              })
              .catch(err => {
                console.warn("Failed to fetch restaurant profile:", err);
                // Don't logout on profile fetch failure, just continue without username
              });
          }
        } catch (err) {
          console.warn("Error in profile fetch:", err);
        }
      }
    }
  }, [username]);

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
    window.location.href = "/customer/login";
  };

  return (
    <header className="sticky top-0 z-30 bg-white shadow-soft border-b border-neutral-200 px-4 md:px-8 lg:px-12 py-3 flex items-center justify-between w-full backdrop-blur-sm bg-white/95">
      {/* Logo and Hamburger */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          className="md:hidden p-2 rounded-xl hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={() => setMobileMenu(v => !v)}
          aria-label="Toggle mobile menu"
        >
          <FiMenu className="w-6 h-6 text-dark-primary" />
        </button>
        <button
          onClick={() => navigate('/customer')}
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

      {/* Search Bar */}
      <form
        className="flex-1 max-w-xl mx-4 hidden md:flex"
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="w-5 h-5 text-neutral-400" />
          </div>
          <input
            className="w-full pl-12 pr-4 py-2.5 rounded-full border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base bg-neutral-50 shadow-sm transition-all"
            placeholder="Search for food, restaurants, or cuisines..."
            aria-label="Search"
          />
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Cart Icon */}
        <button
          className="relative p-2.5 rounded-xl bg-neutral-100 hover:bg-primary-100 text-dark-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 group"
          onClick={() => navigate('/customer/cart')}
          title="Go to Cart"
          aria-label={`Cart with ${cartCount} items`}
        >
          <FiShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-bounce-subtle">
              {cartCount}
            </span>
          )}
        </button>

        {/* User Dropdown */}
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
                  navigate('/customer/account');
                }}
              >
                <FiUser className="w-5 h-5 text-neutral-500" />
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

      {/* Mobile Search Bar */}
      {mobileMenu && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex flex-col animate-fade-in">
          <div className="bg-white shadow-large p-4 flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Foodly Logo"
              className="w-10 h-10 rounded-full shadow-md border-2 border-neutral-200"
            />
            <form
              className="flex-1"
              onSubmit={e => {
                e.preventDefault();
                setMobileMenu(false);
              }}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="w-5 h-5 text-neutral-400" />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base bg-neutral-50"
                  placeholder="Search for food, restaurants..."
                  aria-label="Search"
                />
              </div>
            </form>
            <button
              className="ml-2 p-2 rounded-xl hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setMobileMenu(false)}
              aria-label="Close menu"
            >
              <FiX className="w-6 h-6 text-dark-primary" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
} 