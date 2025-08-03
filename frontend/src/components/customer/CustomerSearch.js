import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-10">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:gap-6 gap-3">
        {typeof setParentQuery !== 'function' && (
          <input
            className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 text-lg"
            placeholder="Search for food or restaurant..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        )}
        <select className="px-3 py-2 rounded-xl border" value={cuisine} onChange={e => setCuisine(e.target.value)}>
          {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="px-3 py-2 rounded-xl border" value={rating} onChange={e => setRating(e.target.value)}>
          {RATINGS.map(r => <option key={r} value={r}>{r === "All" ? "All Ratings" : `${r}★ & up`}</option>)}
        </select>
        <select className="px-3 py-2 rounded-xl border" value={price} onChange={e => setPrice(e.target.value)}>
          {PRICES.map(p => <option key={p} value={p}>{p === "All" ? "All Prices" : p}</option>)}
        </select>
        <select className="px-3 py-2 rounded-xl border" value={veg} onChange={e => setVeg(e.target.value)}>
          {VEG_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {filtered.length === 0 ? (
          <div className="col-span-full text-gray-500 text-center">No restaurants or dishes available.</div>
        ) : (
          filtered.map(r => (
            <div
              key={r.name}
              className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition border border-gray-100 flex flex-col cursor-pointer hover:ring-2 hover:ring-orange-400 group relative overflow-hidden"
              onClick={() => navigate(`/customer/restaurant/${slugify(r.name)}`)}
              title={`View ${r.name}`}
            >
              <div className="relative w-full flex justify-center mb-4">
                <div className="w-32 h-32 rounded-2xl border border-gray-200 bg-orange-100 shadow-lg group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
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
                  <div className="flex flex-col items-center justify-center text-orange-600 font-bold text-lg" style={{ display: r.img ? 'none' : 'flex' }}>
                    <span className="text-3xl mb-1">🍽️</span>
                    <span className="text-xs text-center">{r.name}</span>
                  </div>
                </div>
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold rounded-full px-3 py-1 shadow">{r.cuisine}</span>
                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold rounded-full px-3 py-1 shadow">{r.rating}★</span>
              </div>
              <div className="font-extrabold text-[#16213e] text-xl mb-1 text-center">{r.name}</div>
              <div className="flex justify-center gap-2 text-sm text-gray-500 mb-4">
                <span>{r.price}</span>
                <span>·</span>
                <span>{r.veg}</span>
                <span>·</span>
                <span>{r.eta} min</span>
              </div>
              <button className="mb-3 bg-pink-500 text-white px-5 py-2 rounded-full font-bold shadow hover:bg-pink-600 transition text-sm w-full" onClick={e => { e.stopPropagation(); handleFavoriteRestaurant(r); }} disabled={favLoading === r.name}>
                {favLoading === r.name ? "Adding..." : favSuccess === r.name ? "Added!" : "❤ Favorite"}
              </button>
              {favError && <div className="text-xs text-red-600 mb-1 text-center">{favError}</div>}
              <ul className="mb-2 divide-y">
                {r.dishes.map(d => (
                  <li key={d.name} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-gray-700 font-medium">{d.name}</span>
                      <span className="text-gray-500 font-semibold">₹{d.price.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold shadow hover:bg-orange-600 transition text-xs" onClick={e => { e.stopPropagation(); alert('Order ' + d.name); }}>
                        Order
                      </button>
                      <button className="bg-pink-500 text-white px-3 py-2 rounded-full font-bold shadow hover:bg-pink-600 transition text-xs" onClick={e => { e.stopPropagation(); handleFavoriteDish(r, d); }} disabled={favLoading === d.name + r.name}>
                        {favLoading === d.name + r.name ? "Adding..." : favSuccess === d.name + r.name ? "Added!" : "❤"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 