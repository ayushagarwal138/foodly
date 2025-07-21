import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const sidebarLinks = [
  { label: "Dashboard", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
  ) },
  { label: "Orders", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" /></svg>
  ) },
  { label: "Favorites", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 19.071A7 7 0 0112 21a7 7 0 016.879-1.929M12 3v18" /></svg>
  ) },
  { label: "Offers", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09A1.65 1.65 0 007 3.09V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
  ) },
  { label: "Restaurants", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17v-1a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" /></svg>
  ) },
  { label: "Account", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ) },
  { label: "Settings", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09A1.65 1.65 0 007 3.09V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
  ) },
  { label: "Ratings & Reviews", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.29a1 1 0 00.95.69h6.631c.969 0 1.371 1.24.588 1.81l-5.37 3.905a1 1 0 00-.364 1.118l2.036 6.29c.3.921-.755 1.688-1.54 1.118l-5.37-3.905a1 1 0 00-1.176 0l-5.37 3.905c-.784.57-1.838-.197-1.54-1.118l2.036-6.29a1 1 0 00-.364-1.118L2.342 11.717c-.783-.57-.38-1.81.588-1.81h6.631a1 1 0 00.95-.69l2.036-6.29z" /></svg>
  ) },
  { label: "Support", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636A9 9 0 105.636 18.364 9 9 0 0018.364 5.636z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M15 9h.01M9 15h6" /></svg>
  ) }
];

const labelToPath = {
  "Dashboard": "/customer",
  "Orders": "/customer/orders",
  "Favorites": "/customer/favorites",
  "Offers": "/customer/offers",
  "Restaurants": "/customer/restaurants",
  "Account": "/customer/account",
  "Settings": "/customer/settings",
  "Ratings & Reviews": "/customer/reviews",
  "Support": "/customer/support"
};

export default function Sidebar({ current }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      {/* Hamburger for mobile */}
      <button className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-lg bg-white shadow-lg border border-gray-200" onClick={() => setOpen(true)}>
        <svg className="w-7 h-7 text-[#16213e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      {/* Sidebar overlay for mobile */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex">
          <aside className="w-72 bg-gradient-to-b from-[#16213e] via-[#1e2a4a] to-[#16213e] rounded-r-3xl shadow-2xl flex flex-col items-center py-10 h-full animate-slide-in-left relative transition-transform duration-300 transform translate-x-0">
            <button className="absolute top-4 right-4 p-2 rounded-lg bg-white hover:bg-gray-100" onClick={() => setOpen(false)}>
              <svg className="w-7 h-7 text-[#16213e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center gap-3 mb-8">
              <img src="/logo.jpeg" alt="Foodly Logo" className="w-16 h-16 rounded-full shadow border border-gray-200 animate-fade-in" />
              <span className="text-2xl font-extrabold tracking-tight text-white">Foodly</span>
            </div>
            <nav className="flex flex-col gap-3 w-full mt-4">
              {sidebarLinks.map((link) => (
                <button
                  key={link.label}
                  className={`flex items-center gap-5 w-[90%] mx-auto px-5 py-3 rounded-2xl text-lg font-semibold transition justify-start transform hover:scale-105 duration-200 relative ${current === link.label ? "bg-white text-[#16213e] shadow-md" : "text-white hover:bg-[#1e2a4a]"}`}
                  onClick={() => { navigate(labelToPath[link.label]); setOpen(false); }}
                >
                  <span className="text-2xl">{link.icon}</span>
                  <span className="block">{link.label}</span>
                  {current === link.label && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-orange-500 rounded-full animate-pulse" />}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#16213e] via-[#1e2a4a] to-[#16213e] rounded-r-3xl shadow-2xl flex-col items-center py-10 z-10">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.jpeg" alt="Foodly Logo" className="w-16 h-16 rounded-full shadow border border-gray-200 animate-fade-in" />
          <span className="text-2xl font-extrabold tracking-tight text-white">Foodly</span>
        </div>
        <nav className="flex flex-col gap-3 w-full mt-4">
          {sidebarLinks.map((link) => (
            <button
              key={link.label}
              className={`flex items-center gap-5 w-[90%] mx-auto px-5 py-3 rounded-2xl text-lg font-semibold transition justify-start transform hover:scale-105 duration-200 relative ${current === link.label ? "bg-white text-[#16213e] shadow-md" : "text-white hover:bg-[#1e2a4a]"}`}
              onClick={() => navigate(labelToPath[link.label])}
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="block">{link.label}</span>
              {current === link.label && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-orange-500 rounded-full animate-pulse" />}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
} 