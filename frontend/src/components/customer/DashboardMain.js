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
    if (userId) fetchData();
  }, [userId]);

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
    <div className="app-page animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-950 shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/35" />
        <div className="relative grid gap-8 p-5 md:grid-cols-[1.15fr_0.85fr] md:p-8 lg:p-10">
          <div className="flex min-h-[340px] flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
              <FiClock className="h-4 w-4 text-primary-300" />
              Delivery from trusted kitchens near you
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-5xl">
              Fresh meals, fast delivery, zero confusion.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/78">
              Explore restaurants, compare offers, and place your next order with a cleaner Foodly experience.
            </p>
          
            <form
              className="mt-7 w-full max-w-xl"
              onSubmit={e => {
                e.preventDefault();
              }}
            >
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <FiSearch className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  className="h-12 w-full rounded-md border border-white/20 bg-white pl-12 pr-4 text-base text-neutral-950 shadow-sm outline-none transition-all placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20"
                  placeholder="Search biryani, pizza, thali, restaurants..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Search"
                />
              </div>
            </form>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/customer/restaurants')}
                className="sm:w-auto"
              >
                Order Now
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/customer/orders')}
                className="border-white/30 bg-white/95 text-neutral-950 hover:bg-white sm:w-auto"
              >
                View Orders
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/customer/offers')}
                leftIcon={<FiTag className="h-4 w-4" />}
                className="text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                Offers
              </Button>
            </div>
          </div>

          <div className="flex items-end">
            <div className="grid w-full gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
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
                  className="overflow-hidden rounded-md border border-white/15 bg-white/95 shadow-sm backdrop-blur"
                >
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="h-28 w-full object-cover"
                  />
                  <div className="p-3">
                    <div className={offer.color === "accent" ? "text-lg font-bold text-accent-700" : "text-lg font-bold text-primary-700"}>
                      {offer.title}
                    </div>
                    <div className="mt-1 text-sm text-neutral-600">{offer.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <StatCard
              key={stat.label}
              icon={<Icon className="h-6 w-6" />}
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
