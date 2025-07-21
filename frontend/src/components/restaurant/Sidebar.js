import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const sidebarLinks = [
  { label: "Dashboard", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
  ) },
  { label: "Orders", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" /></svg>
  ) },
  { label: "Menu", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
  ) },
  { label: "Reviews", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.29a1 1 0 00.95.69h6.631c.969 0 1.371 1.24.588 1.81l-5.37 3.905a1 1 0 00-.364 1.118l2.036 6.29c.3.921-.755 1.688-1.54 1.118l-5.37-3.905a1 1 0 00-1.176 0l-5.37 3.905c-.784.57-1.838-.197-1.54-1.118l2.036-6.29a1 1 0 00-.364-1.118L2.342 11.717c-.783-.57-.38-1.81.588-1.81h6.631a1 1 0 00.95-.69l2.036-6.29z" /></svg>
  ) },
  { label: "Profile", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ) },
  { label: "Support", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636A9 9 0 105.636 18.364 9 9 0 0018.364 5.636z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M15 9h.01M9 15h6" /></svg>
  ) },
  { label: "Analytics", icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 17a1 1 0 001 1h1a1 1 0 001-1v-6a1 1 0 00-1-1h-1a1 1 0 00-1 1v6zm-4 0a1 1 0 001 1h1a1 1 0 001-1v-2a1 1 0 00-1-1h-1a1 1 0 00-1 1v2zm8 0a1 1 0 001 1h1a1 1 0 001-1v-10a1 1 0 00-1-1h-1a1 1 0 00-1 1v10z" /></svg>
  ) }
];

const labelToPath = {
  "Dashboard": "/restaurant",
  "Orders": "/restaurant/orders",
  "Menu": "/restaurant/menu",
  "Reviews": "/restaurant/reviews",
  "Profile": "/restaurant/profile",
  "Support": "/restaurant/support",
  "Analytics": "/restaurant/analytics"
};

export default function Sidebar({ current }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="fixed top-5 left-5 z-40 md:hidden bg-white rounded-full shadow-lg p-2 border border-gray-200"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="w-7 h-7 text-[#16213e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden" onClick={() => setOpen(false)}></div>
      )}
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-[#16213e] to-[#31406e] shadow-2xl flex flex-col items-center py-10 z-40 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:left-8 md:top-8 md:h-[92vh] md:rounded-3xl md:w-64 md:z-10`}
        style={{ minWidth: '16rem' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10 select-none">
          <span className="bg-white rounded-full p-2 shadow-lg">
            <svg className="w-8 h-8 text-[#16213e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
          </span>
          <span className="text-2xl font-extrabold text-white tracking-tight">Foodly</span>
        </div>
        <nav className="flex flex-col gap-3 w-full mt-4">
          {sidebarLinks.map((link) => (
            <button
              key={link.label}
              className={`flex items-center gap-5 w-[90%] mx-auto px-5 py-3 rounded-2xl text-lg font-semibold transition justify-start ${current === link.label ? "bg-white text-[#16213e] shadow-md" : "text-white hover:bg-[#1e2a4a]"}`}
              onClick={() => { navigate(labelToPath[link.label]); setOpen(false); }}
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="block">{link.label}</span>
            </button>
          ))}
        </nav>
        {/* Close button for mobile */}
        <button
          className="absolute top-5 right-5 md:hidden bg-white rounded-full p-1 shadow border border-gray-200"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <svg className="w-6 h-6 text-[#16213e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </aside>
    </>
  );
} 