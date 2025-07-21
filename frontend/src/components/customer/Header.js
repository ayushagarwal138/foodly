import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";

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
        let url = "";
        if (userRole.toUpperCase() === "CUSTOMER") {
          url = `/api/customers/${userId}`;
        } else if (userRole.toUpperCase() === "RESTAURANT") {
          url = `/api/restaurants/${userId}`;
        }
        if (url) {
          fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.ok ? res.json() : null)
            .then(profile => {
              if (profile && (profile.username || profile.name)) {
                setUsername(profile.username || profile.name);
                localStorage.setItem("username", profile.username || profile.name);
              }
            });
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
    <header className="sticky top-0 z-30 bg-white shadow-lg border-b border-gray-100 px-4 md:px-12 py-3 flex items-center justify-between w-full">
      {/* Logo and Hamburger */}
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenu(v => !v)}>
          <svg className="w-7 h-7 text-[#16213e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <img src="/logo.jpeg" alt="Foodly Logo" className="w-10 h-10 rounded-full shadow border border-gray-200" onClick={() => navigate('/customer')} style={{cursor:'pointer'}} />
      </div>
      {/* Search Bar */}
      <form className="flex-1 max-w-xl mx-4 hidden md:flex" onSubmit={e => { e.preventDefault(); }}>
        <input
          className="w-full px-5 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-lg bg-gray-50 shadow-sm"
          placeholder="Search for food, restaurants, or cuisines..."
        />
        <button type="submit" className="-ml-10 z-10 text-orange-500 hover:text-orange-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>
        </button>
      </form>
      {/* Actions */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Cart Icon */}
        <button
          className="relative w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[#16213e] text-2xl shadow hover:bg-orange-100 transition"
          onClick={() => navigate('/customer/cart')}
          title="Go to Cart"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 00.95-.68L21 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" /></svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{cartCount}</span>
          )}
        </button>
        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="w-12 h-12 rounded-full bg-[#16213e] flex items-center justify-center text-white font-bold text-xl shadow focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                onClick={() => { setOpen(false); navigate('/customer/account'); }}
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
      {/* Mobile Search Bar */}
      {mobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex flex-col">
          <div className="bg-white shadow-lg p-4 flex items-center gap-4">
            <img src="/logo.jpeg" alt="Foodly Logo" className="w-10 h-10 rounded-full shadow border border-gray-200" />
            <form className="flex-1" onSubmit={e => { e.preventDefault(); setMobileMenu(false); }}>
              <input
                className="w-full px-5 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-lg bg-gray-50 shadow-sm"
                placeholder="Search for food, restaurants, or cuisines..."
              />
            </form>
            <button className="ml-2 p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenu(false)}>
              <svg className="w-7 h-7 text-[#16213e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </header>
  );
} 