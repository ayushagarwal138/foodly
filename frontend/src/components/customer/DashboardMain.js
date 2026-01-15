import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPackage, FiClock, FiHeart, FiDollarSign, FiSearch, FiArrowRight, FiTag } from "react-icons/fi";
import StatCard from "./StatCard";
import CustomerSearch from "./CustomerSearch";
import Button from "../ui/Button";
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
      icon: FiPackage,
      label: "Orders",
      value: totalOrders,
      sublabel: "Total orders placed",
      color: "primary"
    },
    {
      icon: FiClock,
      label: "Active Orders",
      value: activeOrders,
      sublabel: "Currently in progress",
      color: "secondary"
    },
    {
      icon: FiHeart,
      label: "Favorites",
      value: favoritesCount,
      sublabel: "Favorite restaurants & dishes",
      color: "accent"
    },
    {
      icon: FiDollarSign,
      label: "Total Spent",
      value: `₹${totalSpent.toFixed(2)}`,
      sublabel: "All time",
      color: "primary"
    }
  ];

  // Recent orders (show up to 5)
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 lg:p-8 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-3xl shadow-large p-6 md:p-10 lg:p-14 flex flex-col md:flex-row items-center gap-8 border border-neutral-100">
        <div className="flex-1 flex flex-col items-center md:items-start w-full">
          <div className="flex items-center gap-4 mb-6">
            <img
              src="/logo.jpeg"
              alt="Foodly Logo"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-md border-2 border-white"
            />
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-dark-primary mb-2 text-center md:text-left">
                What are you craving today?
              </h1>
              <p className="text-base md:text-lg text-neutral-600 text-center md:text-left">
                Order from your favorite restaurants and get it delivered fast!
              </p>
            </div>
          </div>
          
          <form
            className="w-full max-w-xl mb-6"
            onSubmit={e => {
              e.preventDefault();
            }}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <FiSearch className="w-5 h-5 text-neutral-400" />
              </div>
              <input
                className="w-full pl-14 pr-5 py-3.5 rounded-full border-2 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base bg-white shadow-sm transition-all"
                placeholder="Search for food, restaurants, or cuisines..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search"
              />
            </div>
          </form>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 w-full max-w-xl">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/customer/restaurants')}
              className="flex-1 min-w-[140px]"
            >
              Order Now
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/customer/orders')}
              className="flex-1 min-w-[140px]"
            >
              View Orders
            </Button>
            <Button
              variant="success"
              size="lg"
              onClick={() => navigate('/customer/offers')}
              leftIcon={<FiTag className="w-4 h-4" />}
              className="flex-1 min-w-[140px]"
            >
              See Offers
            </Button>
          </div>
        </div>

        {/* Offer Carousel */}
        <div className="flex-1 flex flex-col items-center md:items-end w-full">
          <div className="w-full max-w-md">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
              {[
                {
                  image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
                  title: "50% OFF",
                  description: "On your first order above ₹299",
                  color: "primary"
                },
                {
                  image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
                  title: "Free Delivery",
                  description: "On all orders above ₹199",
                  color: "accent"
                },
                {
                  image: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80",
                  title: "20% Cashback",
                  description: "With Foodly Wallet",
                  color: "primary"
                }
              ].map((offer, idx) => (
                <div
                  key={idx}
                  className="min-w-[240px] card-hover p-6 flex flex-col items-center border-2 border-neutral-100"
                >
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-28 h-28 rounded-xl object-cover mb-4 shadow-md"
                  />
                  <div className={`font-bold text-${offer.color}-600 text-xl mb-2`}>
                    {offer.title}
                  </div>
                  <div className="text-neutral-600 text-sm text-center">{offer.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <StatCard
              key={stat.label}
              icon={<Icon className={`w-6 h-6 text-${stat.color}-600`} />}
              label={stat.label}
              value={stat.value}
              sublabel={stat.sublabel}
              color={stat.color}
            />
          );
        })}
      </div>

      {/* Search and Browse Restaurants/Dishes */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
            <p className="text-neutral-600 font-medium">Loading restaurants...</p>
          </div>
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <div className="text-red-600 font-medium">{error}</div>
        </div>
      ) : (
        <CustomerSearch restaurants={restaurants} query={searchQuery} setQuery={setSearchQuery} />
      )}

      {/* Recent Orders & Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-dark-primary flex items-center gap-2">
              <FiPackage className="w-5 h-5 text-primary-500" />
              Recent Orders
            </h2>
            <button
              className="text-primary-600 font-semibold hover:text-primary-700 text-sm flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              onClick={() => navigate('/customer/orders')}
            >
              View All
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <FiPackage className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p>No orders yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors border border-neutral-200"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-dark-primary mb-1">Order #{o.id}</div>
                    <div className="text-sm text-neutral-600">{o.status}</div>
                  </div>
                  <div className="text-right mr-4">
                    <div className="font-bold text-dark-primary mb-1">
                      ₹{o.total?.toFixed ? o.total.toFixed(2) : o.total}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/customer/track?id=${o.id}`)}
                    rightIcon={<FiArrowRight className="w-4 h-4" />}
                  >
                    Track
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorites */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-dark-primary flex items-center gap-2">
              <FiHeart className="w-5 h-5 text-accent-500" />
              Favorite Restaurants
            </h2>
            <button
              className="text-primary-600 font-semibold hover:text-primary-700 text-sm flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              onClick={() => navigate('/customer/favorites')}
            >
              View All
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
          {favorites.restaurants && favorites.restaurants.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <FiHeart className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p>No favorite restaurants yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {favorites.restaurants && favorites.restaurants.map((f, idx) => (
                <li
                  key={f.name + idx}
                  className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors border border-neutral-200"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-accent-100 text-accent-600 border-2 border-accent-200">
                    <FiHeart className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-dark-primary flex-1">{f.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 