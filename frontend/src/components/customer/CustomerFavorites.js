import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiStar, FiTrash2, FiEye, FiAlertCircle } from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";
import Button from "../ui/Button";
import { api, API_ENDPOINTS } from "../../config/api";

export default function CustomerFavorites() {
  const [favorites, setFavorites] = useState({ restaurants: [], dishes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("restaurants");
  const userId = localStorage.getItem("userId");

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
      if (userId) {
        await fetchFavorites();
      } else {
        setError("Please log in to view your favorites.");
        setFavorites({ restaurants: [], dishes: [] });
      }
      setLoading(false);
    }
    initialFetch();
  }, [userId]);

  const navigate = useNavigate();

  // Show login message if not authenticated
  if (!userId) {
    return (
      <div className="app-page">
        <div className="surface-panel py-12 text-center">
          <FiHeart className="mx-auto mb-4 h-14 w-14 text-neutral-300" />
          <h2 className="mb-4 text-2xl font-bold text-neutral-950">My Favorites</h2>
          <p className="mb-6 text-neutral-600">Please log in to view your favorite restaurants.</p>
          <Button variant="primary" onClick={() => navigate('/customer/login')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-page">
        <div className="surface-panel py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-500"></div>
            <p className="text-neutral-600 font-medium">Loading favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalFavorites = favorites.restaurants.length + favorites.dishes.length;

  return (
    <div className="app-page animate-fade-in">
        <div className="mb-6 flex items-center gap-3">
          <div className="icon-tile bg-accent-50 text-accent-600">
            <FiHeart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="section-title">My Favorites</h1>
            <p className="section-subtitle">
              {totalFavorites} {totalFavorites === 1 ? 'favorite' : 'favorites'} saved
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="surface-panel mb-6 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("restaurants")}
            className={`rounded-md border px-4 py-2 font-semibold transition-all duration-200 ${
              activeTab === "restaurants"
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaUtensils className="h-4 w-4" />
              Restaurants ({favorites.restaurants.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("dishes")}
            className={`rounded-md border px-4 py-2 font-semibold transition-all duration-200 ${
              activeTab === "dishes"
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaUtensils className="h-4 w-4" />
              Dishes ({favorites.dishes.length})
            </div>
          </button>
        </div>

        {totalFavorites === 0 ? (
          <div className="surface-panel py-16 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-md bg-neutral-100">
              <FiHeart className="h-7 w-7 text-neutral-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-700">No favorites yet</h3>
            <p className="mb-6 text-neutral-500">Start adding your favorite restaurants and dishes.</p>
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
                    className="card-hover overflow-hidden p-0"
                  >
                    <div className="flex h-44 items-center justify-center bg-neutral-100">
                      <FaUtensils className="h-14 w-14 text-primary-400" />
                    </div>
                    <div className="p-5">
                      <h3 className="mb-3 text-lg font-bold text-neutral-950">{restaurant.name}</h3>
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
                    className="card-hover overflow-hidden p-0"
                  >
                    <div className="flex h-44 items-center justify-center bg-neutral-100">
                      <FaUtensils className="h-14 w-14 text-accent-400" />
                    </div>
                    <div className="p-5">
                      <h3 className="mb-1 text-lg font-bold text-neutral-950">{dish.name}</h3>
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
  );
} 
