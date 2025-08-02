import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, API_ENDPOINTS } from "../../config/api";

export default function AllRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("all");

  const fetchRestaurants = async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.RESTAURANTS);
      console.log("Fetched restaurants:", data);
      setRestaurants(data);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchRestaurants();
      setLoading(false);
    }
    initialFetch();
  }, []);

  // Get unique cuisines for filter
  const cuisines = ["all", ...new Set(restaurants.map(r => r.cuisine).filter(Boolean))];

  // Filter restaurants based on search and cuisine
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = selectedCuisine === "all" || restaurant.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">All Restaurants</h2>
      
      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search restaurants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedCuisine}
          onChange={(e) => setSelectedCuisine(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {cuisines.map(cuisine => (
            <option key={cuisine} value={cuisine}>
              {cuisine === "all" ? "All Cuisines" : cuisine}
            </option>
          ))}
        </select>
      </div>

      {filteredRestaurants.length === 0 ? (
        <div className="text-gray-500 text-center">No restaurants found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              <img
                src={restaurant.image || "https://via.placeholder.com/300x200?text=Restaurant"}
                alt={restaurant.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-[#16213e] mb-2">{restaurant.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine}</p>
                <p className="text-gray-500 text-sm mb-3">{restaurant.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600 ml-1">{restaurant.rating}</span>
                    <span className="text-sm text-gray-500 ml-2">({restaurant.reviewCount} reviews)</span>
                  </div>
                  <Link
                    to={`/restaurant/${restaurant.slug}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Menu
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 