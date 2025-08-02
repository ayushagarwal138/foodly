import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

  // Show login message if not authenticated
  if (!userId || !token) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-[#16213e]">My Favorites</h2>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">Please log in to view your favorite restaurants.</div>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">My Favorites</h2>
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <div>Loading favorites...</div>
      </div>
    </div>
  );

  const totalFavorites = favorites.restaurants.length + favorites.dishes.length;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">My Favorites</h2>
      
      {error && (
        <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("restaurants")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "restaurants"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Restaurants ({favorites.restaurants.length})
        </button>
        <button
          onClick={() => setActiveTab("dishes")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "dishes"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Dishes ({favorites.dishes.length})
        </button>
      </div>
      
      {totalFavorites === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">You haven't added any favorites yet.</div>
          <Link
            to="/customer/restaurants"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div>
          {activeTab === "restaurants" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.restaurants.map((restaurant, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl">🍽️</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-[#16213e] mb-2">{restaurant.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">4.0</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/restaurant/${restaurant.restaurantId}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Menu
                        </Link>
                        <button
                          onClick={() => removeFavorite(restaurant, "RESTAURANT")}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
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
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl">🍽️</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-[#16213e] mb-2">{dish.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">from {dish.restaurant}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">4.0</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/restaurant/${dish.restaurantId}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Menu
                        </Link>
                        <button
                          onClick={() => removeFavorite(dish, "DISH")}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
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