import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiBarChart2, FiHome, FiPackage, FiSettings, FiStar, FiTag, FiUsers } from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  const sidebarLinks = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: FiHome,
      description: "Overview & Statistics"
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: FiUsers,
      description: "Manage Users & Accounts"
    },
    {
      label: "Restaurants",
      path: "/admin/restaurants",
      icon: FaUtensils,
      description: "Restaurant Management"
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: FiPackage,
      description: "Order Tracking & Management"
    },
    {
      label: "Reviews",
      path: "/admin/reviews",
      icon: FiStar,
      description: "Customer Reviews & Ratings"
    },
    {
      label: "Analytics",
      path: "/admin/analytics",
      icon: FiBarChart2,
      description: "Platform Analytics & Reports"
    },
    {
      label: "Offers",
      path: "/admin/offers",
      icon: FiTag,
      description: "Promotional Offers & Coupons"
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: FiSettings,
      description: "System Settings & Configuration"
    }
  ];

  const current = sidebarLinks.find(l => {
    if (l.path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname === l.path;
  })?.label || "Dashboard";

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-neutral-200 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:absolute lg:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-neutral-200 p-5">
          <img src="/logo.jpeg" alt="Foodly Logo" className="h-10 w-28 rounded-md bg-white object-contain" />
          <div>
            <h2 className="text-sm font-bold text-neutral-950">Admin</h2>
            <p className="text-xs font-medium text-neutral-500">Platform operations</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {sidebarLinks.map(link => {
            const isActive = current === link.label;
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-md px-3 py-3 transition-all duration-200 ${
                  isActive 
                    ? "bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                }`}
              >
                <div className={`flex-shrink-0 ${isActive ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-700"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isActive ? "text-primary-800" : "text-neutral-700 group-hover:text-neutral-950"}`}>
                    {link.label}
                  </p>
                  <p className={`mt-0.5 truncate text-xs ${isActive ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-500"}`}>
                    {link.description}
                  </p>
                </div>
                {isActive && (
                  <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-4">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-950">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900">Admin workspace</p>
                <p className="text-xs text-neutral-500">Moderation and ops</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
} 
