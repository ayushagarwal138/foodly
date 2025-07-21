import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerFavorites() {
  const [tab, setTab] = useState("restaurants");
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [favoriteDishes, setFavoriteDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/customers/${userId}/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch favorites");
        const data = await res.json();
        setFavoriteRestaurants(data.restaurants || []);
        setFavoriteDishes(data.dishes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (userId && token) fetchFavorites();
  }, [userId, token]);

  async function removeFavorite(item, type) {
    try {
      await fetch(`/api/customers/${userId}/favorites`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type, name: item.name, restaurant: item.restaurant })
      });
      if (type === "restaurant") {
        setFavoriteRestaurants(prev => prev.filter(f => f.name !== item.name));
      } else {
        setFavoriteDishes(prev => prev.filter(f => f.name !== item.name || f.restaurant !== item.restaurant));
      }
    } catch (err) {
      setError("Failed to remove favorite");
    }
  }

  function addToCartAndGo(item) {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    // If item is a restaurant, add a placeholder item
    if (item.img) {
      const exists = cart.find(i => i.name === item.name && i.type === "restaurant");
      if (!exists) {
        cart.push({ name: item.name, type: "restaurant", qty: 1 });
      }
    } else {
      // Dish
      const exists = cart.find(i => i.name === item.name && i.restaurant === item.restaurant);
      if (exists) {
        cart = cart.map(i => i.name === item.name && i.restaurant === item.restaurant ? { ...i, qty: i.qty + 1 } : i);
      } else {
        cart.push({ name: item.name, restaurant: item.restaurant, qty: 1 });
      }
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/customer/cart");
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">My Favorites</h2>
      <div className="mb-8 flex gap-6">
        <button className={`px-4 py-2 rounded-xl font-bold shadow text-xs ${tab === "restaurants" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`} onClick={() => setTab("restaurants")}>Restaurants</button>
        <button className={`px-4 py-2 rounded-xl font-bold shadow text-xs ${tab === "dishes" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`} onClick={() => setTab("dishes")}>Dishes</button>
      </div>
      {tab === "restaurants" && (
        <div>
          {favoriteRestaurants.length === 0 ? (
            <div className="text-gray-500">No favorite restaurants.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {favoriteRestaurants.map((r) => (
                <div key={r.name} className="flex flex-col items-center bg-gray-50 rounded-2xl p-6 shadow hover:shadow-xl transition border border-gray-100">
                  <span className="w-20 h-20 flex items-center justify-center rounded-xl bg-orange-100 text-orange-600 font-bold text-2xl border border-gray-200 mb-4">🍽️</span>
                  <div className="font-semibold text-[#16213e] text-lg mb-1 text-center">{r.name}</div>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-orange-600 transition text-xs" onClick={() => addToCartAndGo(r)}>
                    Order Now
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold shadow hover:bg-gray-300 transition text-xs mt-2" onClick={() => removeFavorite(r, "restaurant")}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {tab === "dishes" && (
        <div>
          {favoriteDishes.length === 0 ? (
            <div className="text-gray-500">No favorite dishes.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {favoriteDishes.map((d) => (
                <div key={d.name + d.restaurant} className="flex flex-col items-center bg-gray-50 rounded-2xl p-6 shadow hover:shadow-xl transition border border-gray-100">
                  <span className="w-20 h-20 flex items-center justify-center rounded-xl bg-orange-100 text-orange-600 font-bold text-2xl border border-gray-200 mb-4">🍽️</span>
                  <div className="font-semibold text-[#16213e] text-lg mb-1 text-center">{d.name}</div>
                  <div className="text-xs text-gray-500 mb-2">from {d.restaurant}</div>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-orange-600 transition text-xs" onClick={() => addToCartAndGo(d)}>
                    Order Now
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold shadow hover:bg-gray-300 transition text-xs mt-2" onClick={() => removeFavorite(d, "dish")}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 