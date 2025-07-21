import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "./CartContext";

export default function RestaurantPage() {
  const { slug } = useParams();
  const [info, setInfo] = useState(null);
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { cart, setCart } = useCart();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState("");
  const [favSuccess, setFavSuccess] = useState(false);
  const [favDishLoading, setFavDishLoading] = useState("");
  const [favDishSuccess, setFavDishSuccess] = useState("");
  const [favDishError, setFavDishError] = useState("");

  useEffect(() => {
    async function fetchRestaurant() {
      setLoading(true);
      setError("");
      try {
        // Fetch restaurant info by slug
        const res = await fetch(`/api/restaurants/slug/${slug}`);
        if (!res.ok) throw new Error("Restaurant not found");
        const data = await res.json();
        setInfo(data);
        // Fetch menu for this restaurant
        const menuRes = await fetch(`/api/restaurants/${data.id}/menu`);
        if (!menuRes.ok) throw new Error("Menu not found");
        const menuData = await menuRes.json();
        // Group menu items by category
        const groupedMenu = {};
        (Array.isArray(menuData) ? menuData : []).forEach(item => {
          const cat = item.category || 'Other';
          if (!groupedMenu[cat]) groupedMenu[cat] = [];
          groupedMenu[cat].push(item);
        });
        setMenu(groupedMenu);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [slug]);

  function addToCart(item) {
    // Debug: log info object to diagnose restaurantId issues
    console.log("info object at addToCart:", info);
    // Defensive: ensure restaurantId is always set
    const menuItemId = item.id;
    const restaurantId = info && info.id ? info.id : null;
    if (!menuItemId) {
      alert("Menu item is missing id!");
      return;
    }
    if (!restaurantId) {
      alert("Restaurant info is missing id!");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in as a customer to add items to the cart.");
      return;
    }
    const existing = cart.items.find(i => i.menu_item_id === menuItemId);
    const updated = existing
      ? cart.items.map(i => i.menu_item_id === menuItemId ? { ...i, qty: i.qty + 1 } : i)
      : [...cart.items, {
          menu_item_id: menuItemId,
          name: item.name,
          price: item.price,
          qty: 1,
          restaurantId: restaurantId // always a valid number
        }];
    // Step 5: Log the updated cart items before sending to backend
    console.log("Cart items to be sent:", updated);
    // Ensure all items have menu_item_id and restaurantId
    const sanitized = updated.map(i => ({
      ...i,
      menu_item_id: i.menu_item_id ?? i.id,
      restaurantId: i.restaurantId ?? restaurantId
    }));
    fetch("/api/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ items: sanitized, address: cart.address || "" })
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setCart(data))
      .catch(() => {});
  }

  function removeFromCart(item) {
    const token = localStorage.getItem("token");
    // Ensure all items have menu_item_id
    const updated = cart.items.filter(i => i.menu_item_id !== item.menu_item_id);
    const sanitized = updated.map(i => ({
      ...i,
      menu_item_id: i.menu_item_id ?? i.id
    }));
    fetch("/api/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ items: sanitized, address: cart.address || "" })
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setCart(data))
      .catch(() => {});
  }

  function updateQty(item, qty) {
    const token = localStorage.getItem("token");
    // Ensure all items have menu_item_id
    const updated = cart.items.map(i => i.menu_item_id === item.menu_item_id ? { ...i, qty } : i);
    const sanitized = updated.map(i => ({
      ...i,
      menu_item_id: i.menu_item_id ?? i.id
    }));
    fetch("/api/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ items: sanitized, address: cart.address || "" })
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setCart(data))
      .catch(() => {});
  }

  function clearCart() {
    const token = localStorage.getItem("token");
    fetch("/api/cart", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setCart({ items: [], address: "" }))
      .catch(() => {});
  }

  const total = (cart.items || []).reduce((sum, i) => sum + i.price * i.qty, 0);

  async function handleFavoriteRestaurant() {
    if (!userId || !token || !info) return;
    setFavLoading(true);
    setFavError("");
    setFavSuccess(false);
    try {
      const res = await fetch(`/api/customers/${userId}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "RESTAURANT",
          name: info.name,
          restaurant: info.name,
          restaurantId: info.id
        })
      });
      if (!res.ok) throw new Error("Failed to add favorite");
      setFavSuccess(true);
      setTimeout(() => setFavSuccess(false), 2000);
    } catch (err) {
      setFavError("Could not add to favorites");
    } finally {
      setFavLoading(false);
    }
  }

  async function handleFavoriteDish(item) {
    if (!userId || !token || !info) return;
    setFavDishLoading(item.id);
    setFavDishError("");
    setFavDishSuccess("");
    try {
      const res = await fetch(`/api/customers/${userId}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "DISH",
          name: item.name,
          restaurant: info.name,
          restaurantId: info.id,
          menuItemId: item.id
        })
      });
      if (!res.ok) throw new Error("Failed to add favorite");
      setFavDishSuccess(item.id);
      setTimeout(() => setFavDishSuccess("") , 2000);
    } catch (err) {
      setFavDishError("Could not add to favorites");
    } finally {
      setFavDishLoading("");
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center">Loading...</div>;
  if (error || !info) return <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center text-red-600">{error || "Restaurant not found."}</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      {/* Restaurant Info */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-[#16213e]">{info.name}</h2>
        <div className="flex gap-4 text-gray-500 mb-1">
          <span>{info.cuisine}</span>
          <span>·</span>
          <span>{info.rating}★</span>
          <span>·</span>
          <span>{info.eta} min delivery</span>
        </div>
        <div className="text-gray-600 mb-2">{info.desc}</div>
        <button className="mt-2 bg-pink-500 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-pink-600 transition text-xs" onClick={handleFavoriteRestaurant} disabled={favLoading}>
          {favLoading ? "Adding..." : favSuccess ? "Added!" : "❤ Favorite"}
        </button>
        {favError && <div className="text-xs text-red-600 mt-1">{favError}</div>}
      </div>
      {/* Menu */}
      <div className="mb-10">
        {Object.entries(menu).map(([cat, items]) => (
          <div key={cat} className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-[#16213e]">{cat}</h3>
            <ul className="divide-y">
              {(Array.isArray(items) ? items : []).map((item, idx) => (
                <li key={item.id ? `menu-${item.id}` : `menu-${cat}-${item.name}-${idx}`} className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="ml-2 text-gray-500">₹{item.price.toFixed(2)}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${item.veg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.veg ? 'Veg' : 'Non-Veg'}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-orange-600 transition text-xs" onClick={() => addToCart(item)}>
                      Add to Cart
                    </button>
                    <button className="bg-pink-500 text-white px-3 py-2 rounded-xl font-bold shadow hover:bg-pink-600 transition text-xs" onClick={() => handleFavoriteDish(item)} disabled={favDishLoading === item.id}>
                      {favDishLoading === item.id ? "Adding..." : favDishSuccess === item.id ? "Added!" : "❤"}
                    </button>
                  </div>
                  {favDishError && favDishLoading === item.id && <div className="text-xs text-red-600 mt-1">{favDishError}</div>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Cart Summary */}
      <div className="bg-gray-50 rounded-xl p-6 shadow border border-gray-100">
        <h3 className="text-lg font-bold mb-3 text-[#16213e]">Cart</h3>
        {(cart.items || []).length === 0 ? (
          <div className="text-gray-500">Your cart is empty.</div>
        ) : (
          <>
          <ul className="mb-3">
            {(cart.items || []).map((item, idx) => (
              <li key={item.menu_item_id ? `cart-${item.menu_item_id}` : `cart-${item.name}-${idx}`} className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="ml-2 text-gray-500">₹{item.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => updateQty(item, Math.max(1, item.qty - 1))}>-</button>
                  <span>{item.qty}</span>
                  <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => updateQty(item, item.qty + 1)}>+</button>
                  <button className="ml-2 text-red-500 hover:underline text-xs" onClick={() => removeFromCart(item)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold shadow hover:bg-gray-300 transition text-xs mb-2" onClick={clearCart}>Empty Cart</button>
          </>
        )}
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-[#16213e]">Total:</span>
          <span className="font-bold text-lg text-[#16213e]">₹{total.toFixed(2)}</span>
        </div>
        <button className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-blue-700 transition disabled:opacity-50" disabled={(cart.items || []).length === 0} onClick={() => window.location.href = '/customer/cart'}>Go to Cart</button>
      </div>
    </div>
  );
} 