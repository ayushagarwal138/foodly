import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiSearch, FiShoppingCart, FiUser, FiX, FiLogOut,  } from "react-icons/fi";
import { useCart } from "./CartContext";
import { api, API_ENDPOINTS, clearAuth } from "../../config/api";

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
      const userRole = localStorage.getItem("userRole");
      if (userId && userRole) {
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

  const handleLogout = async () => {
    try {
      await api.post(API_ENDPOINTS.LOGOUT, {});
    } finally {
      clearAuth();
      window.location.href = "/customer/login";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-neutral-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:px-6 lg:px-8">
      {/* Logo and Hamburger */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          className="rounded-md p-2 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
          onClick={() => window.dispatchEvent(new CustomEvent("openCustomerSidebar"))}
          aria-label="Open navigation"
        >
          <FiMenu className="h-5 w-5 text-neutral-900" />
        </button>
        <button
          onClick={() => navigate('/customer')}
          className="flex items-center gap-2 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Go to dashboard"
        >
          <img
            src="/logo.jpeg"
            alt="Foodly Logo"
            className="h-9 w-28 rounded-md bg-white object-contain md:h-10 md:w-32"
          />
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
            className="w-full rounded-md border border-neutral-300 bg-neutral-50 py-2.5 pl-11 pr-4 text-sm shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search for food, restaurants, or cuisines..."
            aria-label="Search"
          />
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          className="rounded-md p-2.5 text-neutral-700 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 md:hidden"
          onClick={() => setMobileMenu(true)}
          aria-label="Open search"
        >
          <FiSearch className="h-5 w-5" />
        </button>
        {/* Cart Icon */}
        <button
          className="group relative rounded-md bg-neutral-100 p-2.5 text-neutral-900 transition-all duration-200 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={() => navigate('/customer/cart')}
          title="Go to Cart"
          aria-label={`Cart with ${cartCount} items`}
        >
          <FiShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-sm">
              {cartCount}
            </span>
          )}
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-950 text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 md:h-11 md:w-11"
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
            <div className="absolute right-0 z-50 mt-2 w-48 animate-scale-in overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg">
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
          <div className="flex items-center gap-3 bg-white p-4 shadow-lg">
            <img
              src="/logo.jpeg"
              alt="Foodly Logo"
              className="h-10 w-10 rounded-md object-cover ring-1 ring-neutral-200"
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
                  className="w-full rounded-md border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-4 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Search for food, restaurants..."
                  aria-label="Search"
                />
              </div>
            </form>
            <button
              className="ml-2 rounded-md p-2 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
