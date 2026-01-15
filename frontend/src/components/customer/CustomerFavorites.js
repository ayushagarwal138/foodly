import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiCoffee, FiStar, FiTrash2, FiEye, FiAlertCircle, FiX } from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";
import Button from "../ui/Button";
import { api, API_ENDPOINTS } from "../../config/api";

export default function CustomerFavorites() {
  const [favorites, setFavorites] = useState({ restaurants: [], dishes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("restaurants");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const fetchFavorites = async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.CUSTOMER_FAVORITES(userId));
      console.log("Fetched favorites:", data);
      setFavorites({
        restaurants: Array.isArray(data.restaurants) ? data.restaurants : [],
        dishes: Array.isArray(data.dishes) ? data.dishes : []
      });
    } catch (err) {
      console.error("Error fetching favorites:", err);
      if (err.message.includes("403") || err.message.includes("401")) {
        setError("Please log in to view your favorites.");
      } else {
        setError(err.message);
      }
      setFavorites({ restaurants: [], dishes: [] });
    }
  };

  const removeFavorite = async (item, type) => {
    try {
      await api.delete(API_ENDPOINTS.CUSTOMER_WISHLIST(userId), {
        type: type,
        name: item.name,
        restaurant: item.restaurant || item.name,
        restaurantId: item.restaurantId,
        menuItemId: item.menuItemId
      });
      await fetchFavorites(); // Refresh the list
    } catch (err) {
      console.error("Error removing favorite:", err);
      setError("Failed to remove favorite. Please try again.");
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      if (userId && token) {
        await fetchFavorites();
      } else {
        setError("Please log in to view your favorites.");
        setFavorites({ restaurants: [], dishes: [] });
      }
      setLoading(false);
    }
    initialFetch();
  }, [userId, token]);

  const navigate = useNavigate();

  // Show login message if not authenticated
  if (!userId || !token) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="card text-center py-12">
          <FiHeart className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
          <h2 className="text-2xl font-bold mb-4 text-dark-primary">My Favorites</h2>
          <p className="text-neutral-600 mb-6">Please log in to view your favorite restaurants.</p>
          <Button variant="primary" onClick={() => navigate('/customer/login')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="card text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
            <p className="text-neutral-600 font-medium">Loading favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalFavorites = favorites.restaurants.length + favorites.dishes.length;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="card">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-accent-50 border-2 border-accent-100">
            <FiHeart className="w-6 h-6 text-accent-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark-primary">My Favorites</h1>
            <p className="text-neutral-600 text-sm mt-1">
              {totalFavorites} {totalFavorites === 1 ? 'favorite' : 'favorites'} saved
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-8 border-b-2 border-neutral-200">
          <button
            onClick={() => setActiveTab("restaurants")}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 -mb-0.5 ${
              activeTab === "restaurants"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiCoffee className="w-4 h-4" />
              Restaurants ({favorites.restaurants.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("dishes")}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 -mb-0.5 ${
              activeTab === "dishes"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaUtensils className="w-4 h-4" />
              Dishes ({favorites.dishes.length})
            </div>
          </button>
        </div>

        {totalFavorites === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-4">
              <FiHeart className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">No favorites yet</h3>
            <p className="text-neutral-500 mb-6">Start adding your favorite restaurants and dishes!</p>
            <Button variant="primary" onClick={() => navigate('/customer/restaurants')}>
              Browse Restaurants
            </Button>
          </div>
        ) : (
          <div>
            {activeTab === "restaurants" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.restaurants.map((restaurant, index) => (
                  <div
                    key={index}
                    className="card-hover overflow-hidden"
                  >
                    <div className="h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                      <FiCoffee className="w-16 h-16 text-primary-400" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-dark-primary mb-3">{restaurant.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <FiStar className="w-4 h-4 fill-current" />
                          <span className="text-sm font-semibold text-neutral-700">4.0</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/customer/restaurant/${restaurant.restaurantId}`)}
                            leftIcon={<FiEye className="w-4 h-4" />}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFavorite(restaurant, "RESTAURANT")}
                            leftIcon={<FiTrash2 className="w-4 h-4" />}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "dishes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.dishes.map((dish, index) => (
                  <div
                    key={index}
                    className="card-hover overflow-hidden"
                  >
                    <div className="h-48 bg-gradient-to-br from-accent-100 to-primary-100 flex items-center justify-center">
                      <FaUtensils className="w-16 h-16 text-accent-400" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-dark-primary mb-1">{dish.name}</h3>
                      <p className="text-neutral-600 text-sm mb-3">from {dish.restaurant}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <FiStar className="w-4 h-4 fill-current" />
                          <span className="text-sm font-semibold text-neutral-700">4.0</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/customer/restaurant/${dish.restaurantId}`)}
                            leftIcon={<FiEye className="w-4 h-4" />}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFavorite(dish, "DISH")}
                            leftIcon={<FiTrash2 className="w-4 h-4" />}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 