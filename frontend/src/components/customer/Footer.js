import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
          <a href="https://www.instagram.com/" className="rounded-md border border-neutral-200 p-2 text-neutral-500 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600" title="Instagram" aria-label="Instagram"><svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg></a>
          <a href="https://x.com/" className="rounded-md border border-neutral-200 p-2 text-neutral-500 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600" title="Twitter" aria-label="Twitter"><svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.43.36a9.09 9.09 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.7 1.64.9c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.94 3.65A4.48 4.48 0 01.96 6v.06c0 2.13 1.52 3.91 3.54 4.31-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.56 1.74 2.18 3.01 4.1 3.05A9.05 9.05 0 010 19.54a12.8 12.8 0 006.92 2.03c8.3 0 12.85-6.88 12.85-12.85 0-.2 0-.39-.01-.58A9.22 9.22 0 0023 3z" /></svg></a>
          <a href="https://www.facebook.com/" className="rounded-md border border-neutral-200 p-2 text-neutral-500 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600" title="Facebook" aria-label="Facebook"><svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 2h-3a4 4 0 00-4 4v3H7v4h4v8h4v-8h3l1-4h-4V6a1 1 0 011-1h3z" /></svg></a>
        </div>
      </div>
      <div className="mt-5 text-center text-sm text-neutral-500">&copy; {new Date().getFullYear()} Foodly. All rights reserved.</div>
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-neutral-200 bg-white/95 px-1 py-2 shadow-lg backdrop-blur lg:hidden">
        <button onClick={() => navigate('/customer')} className={`flex min-w-0 flex-1 flex-col items-center text-xs font-medium ${location.pathname === '/customer' ? 'text-primary-600' : 'text-neutral-500'}`}>
          <svg className="mb-1 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
          Home
        </button>
        <button onClick={() => navigate('/customer/orders')} className={`flex min-w-0 flex-1 flex-col items-center text-xs font-medium ${location.pathname.startsWith('/customer/orders') ? 'text-primary-600' : 'text-neutral-500'}`}>
          <svg className="mb-1 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" /></svg>
          Orders
        </button>
        <button onClick={() => navigate('/customer/restaurants')} className={`flex min-w-0 flex-1 flex-col items-center text-xs font-medium ${location.pathname.startsWith('/customer/restaurants') ? 'text-primary-600' : 'text-neutral-500'}`}>
          <svg className="mb-1 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17v-1a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" /></svg>
          Restaurants
        </button>
        <button onClick={() => navigate('/customer/account')} className={`flex min-w-0 flex-1 flex-col items-center text-xs font-medium ${location.pathname.startsWith('/customer/account') ? 'text-primary-600' : 'text-neutral-500'}`}>
          <svg className="mb-1 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Account
        </button>
      </nav>
    </footer>
  );
} 
