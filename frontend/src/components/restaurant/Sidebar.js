import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiPackage,
  FiMenu,
  FiStar,
  FiUser,
  FiHelpCircle,
  FiBarChart2,
  FiX,
} from "react-icons/fi";

const sidebarLinks = [
  { label: "Dashboard", icon: FiHome, path: "/restaurant" },
  { label: "Orders", icon: FiPackage, path: "/restaurant/orders" },
  { label: "Menu", icon: FiMenu, path: "/restaurant/menu" },
  { label: "Reviews", icon: FiStar, path: "/restaurant/reviews" },
  { label: "Profile", icon: FiUser, path: "/restaurant/profile" },
  { label: "Support", icon: FiHelpCircle, path: "/restaurant/support" },
  { label: "Analytics", icon: FiBarChart2, path: "/restaurant/analytics" },
];

export default function Sidebar({ current, open, setOpen }) {
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    navigate(path);
    setOpen(false);
  };

  const SidebarContent = ({ isMobile = false }) => (
    <>
      {isMobile && (
        <button
          className="absolute top-4 right-4 rounded-md p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <FiX className="h-5 w-5" />
        </button>
      )}
      <div className="flex items-center gap-3 px-5 pb-6">
        <img src="/logo.jpeg" alt="Foodly Logo" className="h-11 w-11 rounded-md object-cover ring-1 ring-neutral-200" />
        <div>
          <span className="block text-xl font-extrabold tracking-normal text-neutral-950">Foodly</span>
          <span className="text-xs font-medium text-neutral-500">Restaurant</span>
        </div>
      </div>
      <nav className="flex w-full flex-col gap-1 px-3" aria-label="Main navigation">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = current === link.label;
          return (
            <button
              key={link.label}
              className={`group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              }`}
              onClick={() => handleNavClick(link.path)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? "text-primary-700" : "text-neutral-500 group-hover:text-neutral-800"
                }`}
              />
              <span className="flex-1 text-left">{link.label}</span>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-600" />
              )}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto px-5 pt-6">
        <div className="rounded-md border border-accent-100 bg-accent-50 p-4">
          <p className="text-sm font-bold text-accent-900">Service mode</p>
          <p className="mt-1 text-xs leading-5 text-accent-800">Keep orders, menu, and support within reach.</p>
        </div>
      </div>
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
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-neutral-200 bg-white py-5 shadow-xl animate-slide-in-left">
            <SidebarContent isMobile />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-10 hidden h-screen w-72 flex-col border-r border-neutral-200 bg-white py-5 lg:flex">
        <SidebarContent />
      </aside>
    </>
  );
} 
