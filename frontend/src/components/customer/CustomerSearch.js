import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiHeart, FiShoppingCart, FiStar, FiClock, FiCoffee, FiFilter, FiAlertCircle } from "react-icons/fi";
import Button from "../ui/Button";

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
  const token = localStorage.getItem("token");
  const [favLoading, setFavLoading] = useState(""); // holds id or name
  const [favSuccess, setFavSuccess] = useState("");
  const [favError, setFavError] = useState("");

  // Defensive: ensure restaurants is always an array
  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];

  async function handleFavoriteRestaurant(r) {
    if (!userId || !token) return;
    setFavLoading(r.name);
    setFavError("");
    setFavSuccess("");
    try {
      const res = await fetch(`/api/customers/${userId}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "RESTAURANT",
          name: r.name,
          restaurant: r.name,
          restaurantId: r.id
        })
      });
      if (res.status === 409) {
        setFavError("Restaurant is already in your favorites");
        setTimeout(() => setFavError(""), 3000);
      } else if (!res.ok) {
        throw new Error("Failed to add favorite");
      } else {
        setFavSuccess(r.name);
        setTimeout(() => setFavSuccess("") , 2000);
      }
    } catch (err) {
      setFavError("Could not add to favorites");
    } finally {
      setFavLoading("");
    }
  }

  async function handleFavoriteDish(r, d) {
    if (!userId || !token) return;
    setFavLoading(d.name + r.name);
    setFavError("");
    setFavSuccess("");
    try {
      const res = await fetch(`/api/customers/${userId}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "DISH",
          name: d.name,
          restaurant: r.name,
          restaurantId: r.id,
          menuItemId: d.id
        })
      });
      if (res.status === 409) {
        setFavError("Dish is already in your favorites");
        setTimeout(() => setFavError(""), 3000);
      } else if (!res.ok) {
        throw new Error("Failed to add favorite");
      } else {
        setFavSuccess(d.name + r.name);
        setTimeout(() => setFavSuccess("") , 2000);
      }
    } catch (err) {
      setFavError("Could not add to favorites");
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
    <div className="card mb-10">
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center gap-4">
        {typeof setParentQuery !== 'function' && (
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="w-5 h-5 text-neutral-400" />
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
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="w-4 h-4 text-neutral-400" />
            </div>
            <select
              className="input appearance-none pl-10 pr-8 text-sm cursor-pointer"
              value={cuisine}
              onChange={e => setCuisine(e.target.value)}
              aria-label="Filter by cuisine"
            >
              {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <select
            className="input appearance-none pr-8 text-sm cursor-pointer"
            value={rating}
            onChange={e => setRating(e.target.value)}
            aria-label="Filter by rating"
          >
            {RATINGS.map(r => <option key={r} value={r}>{r === "All" ? "All Ratings" : `${r}★ & up`}</option>)}
          </select>
          <select
            className="input appearance-none pr-8 text-sm cursor-pointer"
            value={price}
            onChange={e => setPrice(e.target.value)}
            aria-label="Filter by price"
          >
            {PRICES.map(p => <option key={p} value={p}>{p === "All" ? "All Prices" : p}</option>)}
          </select>
          <select
            className="input appearance-none pr-8 text-sm cursor-pointer"
            value={veg}
            onChange={e => setVeg(e.target.value)}
            aria-label="Filter by veg/non-veg"
          >
            {VEG_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FiCoffee className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
            <p className="text-neutral-600 font-medium">No restaurants or dishes available.</p>
          </div>
        ) : (
          filtered.map(r => (
            <div
              key={r.name}
              className="card-hover flex flex-col cursor-pointer group relative overflow-hidden"
              onClick={() => navigate(`/customer/restaurant/${slugify(r.name)}`)}
              title={`View ${r.name}`}
            >
              <div className="relative w-full flex justify-center mb-4">
                <div className="w-32 h-32 rounded-2xl border-2 border-neutral-200 bg-gradient-to-br from-primary-100 to-accent-100 shadow-md group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                  {r.img ? (
                    <img
                      src={r.img}
                      alt={r.name}
                      className="w-full h-full rounded-2xl object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="flex flex-col items-center justify-center text-primary-600 font-bold text-lg" style={{ display: r.img ? 'none' : 'flex' }}>
                    <FiCoffee className="w-12 h-12 mb-2" />
                    <span className="text-xs text-center px-2">{r.name}</span>
                  </div>
                </div>
                {r.cuisine && (
                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-bold rounded-full px-3 py-1 shadow border-2 border-primary-200">
                    {r.cuisine}
                  </span>
                )}
                {r.rating && (
                  <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-yellow-600 text-xs font-bold rounded-full px-3 py-1 shadow border-2 border-yellow-200 flex items-center gap-1">
                    <FiStar className="w-3 h-3 fill-current" />
                    {r.rating}
                  </span>
                )}
              </div>
              <div className="font-extrabold text-dark-primary text-xl mb-2 text-center">{r.name}</div>
              <div className="flex justify-center gap-2 text-sm text-neutral-600 mb-4">
                {r.price && <span>{r.price}</span>}
                {r.price && r.veg && <span>·</span>}
                {r.veg && <span>{r.veg}</span>}
                {r.veg && r.eta && <span>·</span>}
                {r.eta && (
                  <div className="flex items-center gap-1">
                    <FiClock className="w-3.5 h-3.5" />
                    <span>{r.eta} min</span>
                  </div>
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : favSuccess === r.name ? (
                    <FiHeart className="w-4 h-4 fill-current" />
                  ) : (
                    <FiHeart className="w-4 h-4" />
                  )
                }
                className="mb-3"
              >
                {favLoading === r.name ? "Adding..." : favSuccess === r.name ? "Added!" : "Favorite"}
              </Button>
              {favError && (
                <div className="text-xs text-red-600 mb-2 text-center flex items-center justify-center gap-1">
                  <FiAlertCircle className="w-3 h-3" />
                  {favError}
                </div>
              )}
              {r.dishes && r.dishes.length > 0 && (
                <ul className="space-y-2 mt-2">
                  {r.dishes.map(d => (
                    <li
                      key={d.name}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200 gap-2"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex-1">
                        <span className="text-neutral-700 font-medium text-sm">{d.name}</span>
                        <span className="ml-2 text-primary-600 font-semibold text-sm">₹{d.price?.toFixed ? d.price.toFixed(2) : d.price}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/customer/restaurant/${slugify(r.name)}`);
                          }}
                          leftIcon={<FiShoppingCart className="w-3 h-3" />}
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
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            ) : favSuccess === d.name + r.name ? (
                              <FiHeart className="w-3 h-3 fill-current" />
                            ) : (
                              <FiHeart className="w-3 h-3" />
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
          ))
        )}
      </div>
    </div>
  );
} 