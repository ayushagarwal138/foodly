import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiCoffee, FiStar, FiClock, FiHeart, FiAlertCircle, FiFilter } from "react-icons/fi";
import Button from "../ui/Button";
import { publicApi, API_ENDPOINTS } from "../../config/api";

export default function AllRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("all");

  const fetchRestaurants = async () => {
    setError("");
    try {
      const data = await publicApi.get(API_ENDPOINTS.RESTAURANTS);
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

  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="card text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
            <p className="text-neutral-600 font-medium">Loading restaurants...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="card border-2 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-700">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="card">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary-50 border-2 border-primary-100">
            <FiCoffee className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark-primary">All Restaurants</h1>
            <p className="text-neutral-600 text-sm mt-1">
              {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'} available
            </p>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="w-5 h-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search restaurants by name or cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-12 pr-4"
              aria-label="Search restaurants"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="w-5 h-5 text-neutral-400" />
            </div>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="input appearance-none pl-10 pr-10 cursor-pointer"
              aria-label="Filter by cuisine"
            >
              {cuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>
                  {cuisine === "all" ? "All Cuisines" : cuisine}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-4">
              <FiCoffee className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">No restaurants found</h3>
            <p className="text-neutral-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="card-hover overflow-hidden cursor-pointer"
                onClick={() => navigate(`/customer/restaurant/${restaurant.slug}`)}
              >
                <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center relative overflow-hidden">
                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="flex flex-col items-center justify-center text-primary-600 font-bold text-lg"
                    style={{ display: restaurant.image ? 'none' : 'flex' }}
                  >
                    <FiCoffee className="w-16 h-16 mb-2" />
                    <span className="text-sm text-center px-2">{restaurant.name}</span>
                  </div>
                  {restaurant.cuisine && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary-700 border-2 border-primary-200">
                      {restaurant.cuisine}
                    </div>
                  )}
                  {restaurant.rating && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-yellow-600 border-2 border-yellow-200 flex items-center gap-1">
                      <FiStar className="w-3.5 h-3.5 fill-current" />
                      {restaurant.rating}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-dark-primary mb-2 line-clamp-1">{restaurant.name}</h3>
                  {restaurant.description && (
                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{restaurant.description}</p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                      {restaurant.rating && (
                        <div className="flex items-center gap-1">
                          <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{restaurant.rating}</span>
                        </div>
                      )}
                      {restaurant.reviewCount && (
                        <span className="text-neutral-500">({restaurant.reviewCount} reviews)</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/customer/restaurant/${restaurant.slug}`);
                    }}
                  >
                    View Menu
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 