import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiStar, FiAlertCircle, FiFilter, FiChevronDown } from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";
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
    const name = restaurant.name || "";
    const cuisine = restaurant.cuisine || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = selectedCuisine === "all" || restaurant.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  const navigate = useNavigate();
  const restaurantPath = (restaurant) => `/customer/restaurant/${restaurant.slug || restaurant.id}`;

  if (loading) {
    return (
      <div className="app-page">
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
      <div className="app-page">
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
    <div className="app-page animate-fade-in">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex items-center gap-3">
            <div className="icon-tile bg-primary-50 text-primary-600">
              <FaUtensils className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-950 md:text-3xl">All Restaurants</h1>
              <p className="mt-1 text-sm text-neutral-600">
                {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'} available
              </p>
            </div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="surface-panel flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <FiSearch className="h-5 w-5 text-neutral-400" />
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
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiFilter className="h-5 w-5 text-neutral-400" />
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <FiChevronDown className="h-5 w-5 text-neutral-400" />
            </div>
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="surface-panel py-16 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-md bg-neutral-100">
              <FaUtensils className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-700">No restaurants found</h3>
            <p className="text-neutral-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="card-hover cursor-pointer overflow-hidden p-0"
                onClick={() => navigate(restaurantPath(restaurant))}
              >
                <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-neutral-100">
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
                    className="flex flex-col items-center justify-center px-4 text-center text-lg font-bold text-primary-600"
                    style={{ display: restaurant.image ? 'none' : 'flex' }}
                  >
                    <FaUtensils className="mb-2 h-14 w-14" />
                    <span className="text-sm">{restaurant.name}</span>
                  </div>
                  {restaurant.cuisine && (
                    <div className="absolute left-3 top-3 rounded-md border border-white/40 bg-white/95 px-2.5 py-1 text-xs font-semibold text-primary-700 backdrop-blur-sm">
                      {restaurant.cuisine}
                    </div>
                  )}
                  {restaurant.rating && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md border border-white/40 bg-white/95 px-2.5 py-1 text-xs font-semibold text-yellow-600 backdrop-blur-sm">
                      <FiStar className="w-3.5 h-3.5 fill-current" />
                      {restaurant.rating}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="mb-2 line-clamp-1 text-lg font-bold text-neutral-950">{restaurant.name}</h3>
                  {restaurant.description && (
                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{restaurant.description}</p>
                  )}
                  <div className="mb-4 flex items-center justify-between">
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
                      navigate(restaurantPath(restaurant));
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
