import React, { useState, useEffect } from "react";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchWishlist() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/customers/${userId}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch wishlist");
        const data = await res.json();
        setWishlist(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (userId && token) fetchWishlist();
  }, [userId, token]);

  async function remove(item) {
    try {
      await fetch(`/api/customers/${userId}/wishlist`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      setWishlist(prev => prev.filter(f => f !== item));
    } catch (err) {
      setError("Failed to remove item");
    }
  }

  function orderNow(item) {
    alert(`Order now: ${item.name}`);
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Wishlist / Favorites</h2>
      {wishlist.length === 0 ? (
        <div className="text-gray-500">Your wishlist is empty.</div>
      ) : (
        <ul className="space-y-5">
          {wishlist.map((item, idx) => (
            <li key={idx} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
              {item.type === "restaurant" ? (
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-200 bg-gray-50"
                  onError={e => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.name) + '&background=eee&color=555&size=56'; }}
                />
              ) : (
                <span className="w-14 h-14 flex items-center justify-center rounded-xl bg-orange-100 text-orange-600 font-bold text-xl border border-gray-200">🍽️</span>
              )}
              <div className="flex-1">
                <div className="font-semibold text-[#16213e]">{item.name}</div>
                {item.type === "dish" && <div className="text-xs text-gray-500">from {item.restaurant}</div>}
              </div>
              <button className="bg-orange-500 text-white px-5 py-2 rounded-xl font-bold shadow hover:bg-orange-600 transition text-xs" onClick={() => orderNow(item)}>Order Now</button>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold shadow hover:bg-gray-300 transition text-xs" onClick={() => remove(item)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 