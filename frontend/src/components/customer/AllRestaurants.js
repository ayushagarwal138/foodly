import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AllRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRestaurants() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/restaurants");
        if (!res.ok) throw new Error("Failed to fetch restaurants");
        const data = await res.json();
        setRestaurants(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold text-[#16213e] mb-8 text-center">All Restaurants</h1>
      {loading ? (
        <div className="text-center text-gray-500">Loading restaurants...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : restaurants.length === 0 ? (
        <div className="text-center text-gray-500">No restaurants found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {restaurants.map(r => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition border border-gray-100 flex flex-col cursor-pointer hover:ring-2 hover:ring-orange-400 group relative overflow-hidden"
              onClick={() => navigate(`/customer/restaurant/${slugify(r.name)}`)}
              title={`View ${r.name}`}
            >
              <div className="relative w-full flex justify-center mb-4">
                <img
                  src={r.img || "/logo.jpeg"}
                  alt={r.name}
                  className="w-32 h-32 rounded-2xl object-cover border border-gray-200 bg-gray-100 shadow-lg group-hover:scale-105 transition-transform duration-200"
                  onError={e => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(r.name) + '&background=eee&color=555&size=128'; }}
                />
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold rounded-full px-3 py-1 shadow">{r.cuisineType || r.cuisine || "Cuisine"}</span>
                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold rounded-full px-3 py-1 shadow">{r.rating ? r.rating + "★" : "4.0★"}</span>
              </div>
              <div className="font-extrabold text-[#16213e] text-xl mb-1 text-center">{r.name}</div>
              <div className="flex justify-center gap-2 text-sm text-gray-500 mb-4">
                <span>{r.address}</span>
              </div>
              <button className="mt-auto bg-orange-500 text-white px-5 py-2 rounded-full font-bold shadow hover:bg-orange-600 transition text-sm w-full" onClick={e => { e.stopPropagation(); navigate(`/customer/restaurant/${slugify(r.name)}`); }}>
                View Restaurant
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 