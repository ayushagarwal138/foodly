import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiFacebook, FiHome, FiInstagram, FiPackage, FiTwitter, FiUser } from "react-icons/fi";
import { MdRestaurantMenu } from "react-icons/md";

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <footer className="mt-10 w-full animate-fade-in border-t border-neutral-200 bg-white pb-20 pt-6 text-neutral-700 lg:pb-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6">
        {/* Quick Links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold">
          <a href="/customer" className="transition hover:text-primary-600">Home</a>
          <a href="/customer/orders" className="transition hover:text-primary-600">Orders</a>
          <a href="/customer/offers" className="transition hover:text-primary-600">Offers</a>
          <a href="/customer/restaurants" className="transition hover:text-primary-600">Restaurants</a>
          <a href="/customer/support" className="transition hover:text-primary-600">Support</a>
        </nav>
        {/* Social Icons */}
        <div className="flex gap-2">
          <a href="https://www.instagram.com/" className="rounded-md border border-neutral-200 p-2 text-neutral-500 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600" title="Instagram" aria-label="Instagram"><FiInstagram className="h-4 w-4" /></a>
          <a href="https://x.com/" className="rounded-md border border-neutral-200 p-2 text-neutral-500 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600" title="Twitter" aria-label="Twitter"><FiTwitter className="h-4 w-4" /></a>
          <a href="https://www.facebook.com/" className="rounded-md border border-neutral-200 p-2 text-neutral-500 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600" title="Facebook" aria-label="Facebook"><FiFacebook className="h-4 w-4" /></a>
        </div>
      </div>
      <div className="mt-5 text-center text-sm text-neutral-500">&copy; {new Date().getFullYear()} Foodly. All rights reserved.</div>
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-neutral-200 bg-white/95 px-1 py-2 shadow-lg backdrop-blur lg:hidden">
        <button onClick={() => navigate('/customer')} className={`flex min-w-0 flex-1 flex-col items-center text-xs font-medium ${location.pathname === '/customer' ? 'text-primary-600' : 'text-neutral-500'}`}>
          <FiHome className="mb-1 h-5 w-5" />
          Home
        </button>
        <button onClick={() => navigate('/customer/orders')} className={`flex min-w-0 flex-1 flex-col items-center text-xs font-medium ${location.pathname.startsWith('/customer/orders') ? 'text-primary-600' : 'text-neutral-500'}`}>
          <FiPackage className="mb-1 h-5 w-5" />
          Orders
        </button>
        <button onClick={() => navigate('/customer/restaurants')} className={`flex min-w-0 flex-1 flex-col items-center text-xs font-medium ${location.pathname.startsWith('/customer/restaurants') ? 'text-primary-600' : 'text-neutral-500'}`}>
          <MdRestaurantMenu className="mb-1 h-5 w-5" />
          Restaurants
        </button>
        <button onClick={() => navigate('/customer/account')} className={`flex min-w-0 flex-1 flex-col items-center text-xs font-medium ${location.pathname.startsWith('/customer/account') ? 'text-primary-600' : 'text-neutral-500'}`}>
          <FiUser className="mb-1 h-5 w-5" />
          Account
        </button>
      </nav>
    </footer>
  );
} 
