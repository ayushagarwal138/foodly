import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, API_ENDPOINTS } from "../../config/api";

export default function CustomerFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");

  const fetchFavorites = async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.CUSTOMER_FAVORITES(userId));
      console.log("Fetched favorites:", data);
      setFavorites(data);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError(err.message);
    }
  };

  const removeFavorite = async (restaurantId) => {
    try {
      await api.delete(API_ENDPOINTS.CUSTOMER_FAVORITES(userId));
      await fetchFavorites(); // Refresh the list
    } catch (err) {
      console.error("Error removing favorite:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchFavorites();
      setLoading(false);
    }
    if (userId) {
      initialFetch();
    }
  }, [userId]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">My Favorites</h2>
      {favorites.length === 0 ? (
        <div className="text-gray-500 text-center">No favorite restaurants yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((restaurant) => (
            <div key={restaurant.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <img
                src={restaurant.image || "https://via.placeholder.com/300x200?text=Restaurant"}
                alt={restaurant.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-[#16213e] mb-2">{restaurant.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600 ml-1">{restaurant.rating}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/restaurant/${restaurant.slug}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Menu
                    </Link>
                    <button
                      onClick={() => removeFavorite(restaurant.id)}
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
  );
} 