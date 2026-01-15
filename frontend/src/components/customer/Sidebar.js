import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiPackage,
  FiHeart,
  FiTag,
  FiCoffee,
  FiUser,
  FiSettings,
  FiStar,
  FiHelpCircle,
  FiX,
} from "react-icons/fi";

const sidebarLinks = [
  { label: "Dashboard", icon: FiHome, path: "/customer" },
  { label: "Orders", icon: FiPackage, path: "/customer/orders" },
  { label: "Favorites", icon: FiHeart, path: "/customer/favorites" },
  { label: "Offers", icon: FiTag, path: "/customer/offers" },
  { label: "Restaurants", icon: FiCoffee, path: "/customer/restaurants" },
  { label: "Account", icon: FiUser, path: "/customer/account" },
  { label: "Settings", icon: FiSettings, path: "/customer/settings" },
  { label: "Ratings & Reviews", icon: FiStar, path: "/customer/reviews" },
  { label: "Support", icon: FiHelpCircle, path: "/customer/support" },
];

export default function Sidebar({ current }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    navigate(path);
    setOpen(false);
  };

  const SidebarContent = ({ isMobile = false }) => (
    <>
      {isMobile && (
        <button
          className="absolute top-4 right-4 p-2 rounded-xl bg-white hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <FiX className="w-6 h-6 text-dark-primary" />
        </button>
      )}
      <div className="flex items-center gap-3 mb-8 px-4">
        <img
          src="/logo.jpeg"
          alt="Foodly Logo"
          className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg border-2 border-white/20"
        />
        <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          Foodly
        </span>
      </div>
      <nav className="flex flex-col gap-2 w-full px-4" aria-label="Main navigation">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = current === link.label;
          return (
            <button
              key={link.label}
              className={`group flex items-center gap-4 w-full px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 relative ${
                isActive
                  ? "bg-white text-dark-primary shadow-lg scale-[1.02]"
                  : "text-white/90 hover:bg-white/10 hover:text-white hover:scale-[1.01]"
              }`}
              onClick={() => handleNavClick(link.path)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isActive ? "text-primary-600" : ""
                }`}
              />
              <span className="flex-1 text-left">{link.label}</span>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary-500 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-dark-primary via-dark-secondary to-dark-primary shadow-2xl flex flex-col py-8 animate-slide-in-left">
            <SidebarContent isMobile />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-dark-primary via-dark-secondary to-dark-primary shadow-2xl flex-col py-8 z-10">
        <SidebarContent />
      </aside>
    </>
  );
} 