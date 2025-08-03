import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "./StatCard";
import CustomerSearch from "./CustomerSearch";
import { api, API_ENDPOINTS } from "../../config/api";

export default function DashboardMain() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState({ restaurants: [], dishes: [] });
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        // Fetch orders
        const ordersData = await api.get(API_ENDPOINTS.MY_ORDERS);
        setOrders(ordersData);
        // Fetch favorites
        const favData = await api.get(API_ENDPOINTS.CUSTOMER_FAVORITES(userId));
        setFavorites(favData);
        // Fetch restaurants
        const restData = await api.get(API_ENDPOINTS.RESTAURANTS);
        setRestaurants(restData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (token && userId) fetchData();
  }, [token, userId]);

  // Calculate stats
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.status && o.status.toLowerCase().includes("progress")).length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const favoritesCount = (favorites.restaurants?.length || 0) + (favorites.dishes?.length || 0);

  const stats = [
    {
      icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" /></svg>,
      label: "Orders",
      value: totalOrders,
      sublabel: "Total orders placed"
    },
    {
      icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>,
      label: "Active Orders",
      value: activeOrders,
      sublabel: "Currently in progress"
    },
    {
      icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>,
      label: "Favorites",
      value: favoritesCount,
      sublabel: "Favorite restaurants & dishes"
    },
    {
      icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>,
      label: "Total Spent",
      value: `₹${totalSpent.toFixed(2)}`,
      sublabel: "All time"
    }
  ];

  // Recent orders (show up to 5)
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="flex flex-col gap-10 p-4 md:p-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-100 via-white to-green-100 rounded-3xl shadow-lg p-8 md:p-14 flex flex-col md:flex-row items-center gap-8 mb-6">
        <div className="flex-1 flex flex-col items-center md:items-start">
          <img src="/logo.jpeg" alt="Foodly Logo" className="w-20 h-20 rounded-full shadow border border-gray-200 mb-4" />
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#16213e] mb-2 text-center md:text-left">What are you craving today?</h1>
          <p className="text-lg text-gray-600 mb-6 text-center md:text-left">Order from your favorite restaurants and get it delivered fast!</p>
          <form className="w-full max-w-xl flex" onSubmit={e => { e.preventDefault(); }}>
            <input
              className="flex-1 px-6 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-lg bg-white shadow-sm"
              placeholder="Search for food, restaurants, or cuisines..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="-ml-12 z-10 text-orange-500 hover:text-orange-700">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>
            </button>
          </form>
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mt-6">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold shadow text-lg transition" onClick={() => navigate('/customer/restaurants')}>Order Now</button>
            <button className="bg-white border border-orange-500 text-orange-600 px-6 py-3 rounded-full font-bold shadow text-lg transition hover:bg-orange-50" onClick={() => window.location.href='/customer/orders'}>View Orders</button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow text-lg transition" onClick={() => window.location.href='/customer/offers'}>See Offers</button>
            <button className="bg-white border border-green-500 text-green-600 px-6 py-3 rounded-full font-bold shadow text-lg transition hover:bg-green-50" onClick={() => window.location.href='/customer/restaurants'}>Browse Restaurants</button>
          </div>
        </div>
        {/* Offer Carousel (demo) */}
        <div className="flex-1 flex flex-col items-center md:items-end w-full">
          <div className="w-full max-w-md">
            <div className="flex gap-4 overflow-x-auto pb-2">
              <div className="min-w-[220px] bg-white rounded-2xl shadow p-5 flex flex-col items-center border border-orange-100">
                <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80" alt="Offer" className="w-24 h-24 rounded-xl object-cover mb-3" />
                <div className="font-bold text-orange-600 text-lg mb-1">50% OFF</div>
                <div className="text-gray-600 text-sm text-center">On your first order above ₹299</div>
              </div>
              <div className="min-w-[220px] bg-white rounded-2xl shadow p-5 flex flex-col items-center border border-green-100">
                <img src="https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80" alt="Offer" className="w-24 h-24 rounded-xl object-cover mb-3" />
                <div className="font-bold text-green-600 text-lg mb-1">Free Delivery</div>
                <div className="text-gray-600 text-sm text-center">On all orders above ₹199</div>
              </div>
              <div className="min-w-[220px] bg-white rounded-2xl shadow p-5 flex flex-col items-center border border-orange-100">
                <img src="https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80" alt="Offer" className="w-24 h-24 rounded-xl object-cover mb-3" />
                <div className="font-bold text-orange-600 text-lg mb-1">20% Cashback</div>
                <div className="text-gray-600 text-sm text-center">With Foodly Wallet</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      {/* Search and Browse Restaurants/Dishes */}
      {loading ? (
        <div className="text-center text-gray-500">Loading restaurants...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <CustomerSearch restaurants={restaurants} query={searchQuery} setQuery={setSearchQuery} />
      )}
      {/* Recent Orders & Favorites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <button className="text-blue-600 font-semibold hover:underline text-sm" onClick={() => navigate('/customer/orders')}>View All</button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-gray-500">No orders yet.</div>
          ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 font-semibold">
                <th className="pb-2">Order ID</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} className="border-t last:border-b-0">
                    <td className="py-2 font-semibold text-[#16213e]">{o.id}</td>
                    <td className="py-2">{o.status}</td>
                    <td className="py-2">₹{o.total?.toFixed ? o.total.toFixed(2) : o.total}</td>
                    <td className="py-2">
                      <button className="text-blue-600 hover:underline text-xs font-semibold" onClick={() => navigate(`/customer/track?id=${o.id}`)}>Track</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          )}
        </div>
        {/* Favorites */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Favorite Restaurants</h2>
            <button className="text-blue-600 font-semibold hover:underline text-sm" onClick={() => navigate('/customer/favorites')}>View All</button>
          </div>
          {favorites.restaurants && favorites.restaurants.length === 0 ? (
            <div className="text-gray-500">No favorite restaurants yet.</div>
          ) : (
          <ul className="space-y-5">
              {favorites.restaurants && favorites.restaurants.map((f, idx) => (
                <li key={f.name + idx} className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-orange-100 text-orange-600 font-bold text-lg border border-gray-200">🍽️</span>
                  <span className="font-semibold text-[#16213e]">{f.name}</span>
                </li>
              ))}
          </ul>
          )}
        </div>
      </div>
    </div>
  );
} 