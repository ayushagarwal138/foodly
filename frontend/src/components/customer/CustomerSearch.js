import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiHeart, FiShoppingCart, FiStar, FiClock, FiFilter, FiAlertCircle } from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";
import Button from "../ui/Button";
import { api, API_ENDPOINTS } from "../../config/api";

const CUISINES = ["All", "Italian", "Japanese", "American"];
const RATINGS = ["All", 4, 3, 2, 1];
const PRICES = ["All", "₹", "₹₹", "₹₹₹"];
const VEG_OPTIONS = ["All", "Veg", "Non-Veg"];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function CustomerSearch({ restaurants, query: parentQuery, setQuery: setParentQuery }) {
  const [internalQuery, setInternalQuery] = useState("");
  const query = parentQuery !== undefined ? parentQuery : internalQuery;
  const setQuery = setParentQuery || setInternalQuery;
  const [cuisine, setCuisine] = useState("All");
  const [rating, setRating] = useState("All");
  const [price, setPrice] = useState("All");
  const [veg, setVeg] = useState("All");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [favLoading, setFavLoading] = useState(""); // holds id or name
  const [favSuccess, setFavSuccess] = useState("");
  const [favError, setFavError] = useState("");

  // Defensive: ensure restaurants is always an array
  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];

  async function handleFavoriteRestaurant(r) {
    if (!userId) return;
    setFavLoading(r.name);
    setFavError("");
    setFavSuccess("");
    try {
      await api.post(API_ENDPOINTS.CUSTOMER_ADD_TO_WISHLIST(userId), {
          type: "RESTAURANT",
          name: r.name,
          restaurant: r.name,
          restaurantId: r.id
        });
      setFavSuccess(r.name);
      setTimeout(() => setFavSuccess("") , 2000);
    } catch (err) {
      setFavError(err.message || "Could not add to favorites");
    } finally {
      setFavLoading("");
    }
  }

  async function handleFavoriteDish(r, d) {
    if (!userId) return;
    setFavLoading(d.name + r.name);
    setFavError("");
    setFavSuccess("");
    try {
      await api.post(API_ENDPOINTS.CUSTOMER_ADD_TO_WISHLIST(userId), {
          type: "DISH",
          name: d.name,
          restaurant: r.name,
          restaurantId: r.id,
          menuItemId: d.id
        });
      setFavSuccess(d.name + r.name);
      setTimeout(() => setFavSuccess("") , 2000);
    } catch (err) {
      setFavError(err.message || "Could not add to favorites");
    } finally {
      setFavLoading("");
    }
  }

  // Filter logic: match restaurant or dish name, and filters
  const filtered = safeRestaurants
    .map(r => {
      // Defensive: ensure r.dishes is always an array
      const dishes = Array.isArray(r.dishes) ? r.dishes : [];
      // Use real cuisineType if present
      const rCuisine = r.cuisineType || r.cuisine || "Cuisine";
      const rRating = r.rating || (r.name && r.name.includes("Pizza") ? 4.5 : r.name && r.name.includes("Sushi") ? 4.2 : 4.0);
      const rPrice = r.price || (r.name && r.name.includes("Pizza") ? "₹" : r.name && r.name.includes("Sushi") ? "₹₹₹" : "₹₹" );
      const rVeg = r.veg !== undefined ? r.veg : (r.name && r.name.includes("Sushi") ? "Non-Veg" : "Veg");
      const rEta = r.eta || (r.name && r.name.includes("Pizza") ? 30 : r.name && r.name.includes("Sushi") ? 40 : 25);
      // Filter dishes by query and veg
      const filteredDishes = dishes.filter(d =>
        d.name && d.name.toLowerCase().includes(query.toLowerCase()) &&
        (veg === "All" || (veg === "Veg" ? d.veg !== false : d.veg === false))
      );
      // Show restaurant if name matches or any dish matches
      const matchesQuery =
        (r.name && r.name.toLowerCase().includes(query.toLowerCase())) ||
        (filteredDishes.length > 0) ||
        (query.trim() === "");
      const matchesCuisine = cuisine === "All" || rCuisine === cuisine;
      const matchesRating = rating === "All" || rRating >= rating;
      const matchesPrice = price === "All" || rPrice === price;
      const matchesVeg = veg === "All" || rVeg === veg;
      if (matchesQuery && matchesCuisine && matchesRating && matchesPrice && matchesVeg) {
        return {
          ...r,
          cuisine: rCuisine,
          rating: rRating,
          price: rPrice,
          veg: rVeg,
          eta: rEta,
          dishes: filteredDishes.length > 0 || query.trim() ? filteredDishes : dishes
        };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <section className="surface-panel">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        {typeof setParentQuery !== 'function' && (
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <FiSearch className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              className="input pl-12 pr-4"
              placeholder="Search for food or restaurant..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search"
            />
          </div>
        )}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiFilter className="h-4 w-4 text-neutral-400" />
            </div>
            <select
              className="input cursor-pointer appearance-none pl-10 pr-8 text-sm"
              value={cuisine}
              onChange={e => setCuisine(e.target.value)}
              aria-label="Filter by cuisine"
            >
              {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <select
            className="input cursor-pointer appearance-none pr-8 text-sm"
            value={rating}
            onChange={e => setRating(e.target.value)}
            aria-label="Filter by rating"
          >
            {RATINGS.map(r => <option key={r} value={r}>{r === "All" ? "All Ratings" : `${r}★ & up`}</option>)}
          </select>
          <select
            className="input cursor-pointer appearance-none pr-8 text-sm"
            value={price}
            onChange={e => setPrice(e.target.value)}
            aria-label="Filter by price"
          >
            {PRICES.map(p => <option key={p} value={p}>{p === "All" ? "All Prices" : p}</option>)}
          </select>
          <select
            className="input cursor-pointer appearance-none pr-8 text-sm"
            value={veg}
            onChange={e => setVeg(e.target.value)}
            aria-label="Filter by veg/non-veg"
          >
            {VEG_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <FaUtensils className="mx-auto mb-4 h-14 w-14 text-neutral-300" />
            <p className="text-neutral-600 font-medium">No restaurants or dishes available.</p>
          </div>
        ) : (
          filtered.map(r => (
            <div
              key={r.name}
              className="card-hover group relative flex cursor-pointer flex-col overflow-hidden p-0"
              onClick={() => navigate(`/customer/restaurant/${slugify(r.name)}`)}
              title={`View ${r.name}`}
            >
              <div className="relative flex h-44 w-full items-center justify-center overflow-hidden bg-neutral-100">
                {r.img ? (
                  <img
                    src={r.img}
                    alt={r.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="flex flex-col items-center justify-center px-4 text-center text-lg font-bold text-primary-600" style={{ display: r.img ? 'none' : 'flex' }}>
                  <FaUtensils className="mb-2 h-12 w-12" />
                  <span className="text-xs">{r.name}</span>
                </div>
                {r.cuisine && (
                  <span className="absolute left-3 top-3 rounded-md border border-white/40 bg-white/95 px-2.5 py-1 text-xs font-bold text-primary-700 backdrop-blur-sm">
                    {r.cuisine}
                  </span>
                )}
                {r.rating && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md border border-white/40 bg-white/95 px-2.5 py-1 text-xs font-bold text-yellow-600 backdrop-blur-sm">
                    <FiStar className="h-3 w-3 fill-current" />
                    {r.rating}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 text-lg font-extrabold text-neutral-950">{r.name}</div>
                <div className="mb-4 flex flex-wrap gap-2 text-sm text-neutral-600">
                  {r.price && <span>{r.price}</span>}
                  {r.veg && <span>{r.veg}</span>}
                  {r.eta && (
                    <span className="flex items-center gap-1">
                      <FiClock className="h-3.5 w-3.5" />
                      {r.eta} min
                    </span>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={e => {
                    e.stopPropagation();
                    handleFavoriteRestaurant(r);
                  }}
                  disabled={favLoading === r.name}
                  leftIcon={
                    favLoading === r.name ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                    ) : favSuccess === r.name ? (
                      <FiHeart className="h-4 w-4 fill-current" />
                    ) : (
                      <FiHeart className="h-4 w-4" />
                    )
                  }
                  className="mb-3"
                >
                  {favLoading === r.name ? "Adding..." : favSuccess === r.name ? "Added!" : "Favorite"}
                </Button>
                {favError && (
                  <div className="mb-2 flex items-center justify-center gap-1 text-center text-xs text-red-600">
                    <FiAlertCircle className="h-3 w-3" />
                    {favError}
                  </div>
                )}
                {r.dishes && r.dishes.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {r.dishes.slice(0, 3).map(d => (
                      <li
                        key={d.name}
                        className="flex flex-col justify-between gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-3 sm:flex-row sm:items-center"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium text-neutral-700">{d.name}</span>
                          <span className="ml-2 text-sm font-semibold text-primary-600">₹{d.price?.toFixed ? d.price.toFixed(2) : d.price}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              navigate(`/customer/restaurant/${slugify(r.name)}`);
                            }}
                            leftIcon={<FiShoppingCart className="h-3 w-3" />}
                          >
                            Order
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              handleFavoriteDish(r, d);
                            }}
                            disabled={favLoading === d.name + r.name}
                            leftIcon={
                              favLoading === d.name + r.name ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                              ) : favSuccess === d.name + r.name ? (
                                <FiHeart className="h-3 w-3 fill-current" />
                              ) : (
                                <FiHeart className="h-3 w-3" />
                              )
                            }
                          >
                            {favLoading === d.name + r.name ? "" : favSuccess === d.name + r.name ? "Added!" : ""}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
} 
