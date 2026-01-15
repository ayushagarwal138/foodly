import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiStar, FiClock, FiCoffee, FiAlertCircle, FiCheck } from "react-icons/fi";
import { useCart } from "./CartContext";
import Button from "../ui/Button";
import { api, publicApi, API_ENDPOINTS } from "../../config/api";

export default function RestaurantPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
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
        // Fetch restaurant info by slug (public endpoint)
        const data = await publicApi.get(API_ENDPOINTS.RESTAURANT_BY_SLUG(slug));
        setInfo(data);
        // Fetch menu for this restaurant (public endpoint)
        const menuData = await publicApi.get(API_ENDPOINTS.RESTAURANT_MENU_CUSTOMER(data.id));
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
      // Redirect to login instead of showing alert
      navigate("/customer/login");
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
    
    // Use centralized api utility
    api.put(API_ENDPOINTS.CART, { items: sanitized, address: cart.address || "" })
      .then(data => setCart(data))
      .catch(err => {
        console.error("Error updating cart:", err);
        if (err.message.includes("unauthorized") || err.message.includes("401")) {
          navigate("/customer/login");
        }
      });
  }

  function removeFromCart(item) {
    // Ensure all items have menu_item_id
    const updated = cart.items.filter(i => i.menu_item_id !== item.menu_item_id);
    const sanitized = updated.map(i => ({
      ...i,
      menu_item_id: i.menu_item_id ?? i.id
    }));
    
    // Use centralized api utility
    api.put(API_ENDPOINTS.CART, { items: sanitized, address: cart.address || "" })
      .then(data => setCart(data))
      .catch(err => {
        console.error("Error updating cart:", err);
        if (err.message.includes("unauthorized") || err.message.includes("401")) {
          navigate("/customer/login");
        }
      });
  }

  function updateQty(item, qty) {
    // Ensure all items have menu_item_id
    const updated = cart.items.map(i => i.menu_item_id === item.menu_item_id ? { ...i, qty } : i);
    const sanitized = updated.map(i => ({
      ...i,
      menu_item_id: i.menu_item_id ?? i.id
    }));
    
    // Use centralized api utility
    api.put(API_ENDPOINTS.CART, { items: sanitized, address: cart.address || "" })
      .then(data => setCart(data))
      .catch(err => {
        console.error("Error updating cart:", err);
        if (err.message.includes("unauthorized") || err.message.includes("401")) {
          navigate("/customer/login");
        }
      });
  }

  function clearCart() {
    // Use centralized api utility
    api.delete(API_ENDPOINTS.CART)
      .then(() => setCart({ items: [], address: "" }))
      .catch(err => {
        console.error("Error clearing cart:", err);
        if (err.message.includes("unauthorized") || err.message.includes("401")) {
          navigate("/customer/login");
        }
      });
  }

  const total = (cart.items || []).reduce((sum, i) => sum + i.price * i.qty, 0);

  async function handleFavoriteRestaurant() {
    if (!userId || !token || !info) {
      navigate("/customer/login");
      return;
    }
    setFavLoading(true);
    setFavError("");
    setFavSuccess(false);
    try {
      await api.post(API_ENDPOINTS.CUSTOMER_WISHLIST(userId), {
        type: "RESTAURANT",
        name: info.name,
        restaurant: info.name,
        restaurantId: info.id
      });
      setFavSuccess(true);
      setTimeout(() => setFavSuccess(false), 2000);
    } catch (err) {
      if (err.message.includes("409")) {
        setFavError("Restaurant is already in your favorites");
        setTimeout(() => setFavError(""), 3000);
      } else if (err.message.includes("unauthorized") || err.message.includes("401")) {
        navigate("/customer/login");
      } else {
        setFavError("Could not add to favorites");
      }
    } finally {
      setFavLoading(false);
    }
  }

  async function handleFavoriteDish(item) {
    if (!userId || !token || !info) {
      navigate("/customer/login");
      return;
    }
    setFavDishLoading(item.id);
    setFavDishError("");
    setFavDishSuccess("");
    try {
      await api.post(API_ENDPOINTS.CUSTOMER_WISHLIST(userId), {
        type: "DISH",
        name: item.name,
        restaurant: info.name,
        restaurantId: info.id,
        menuItemId: item.id
      });
      setFavDishSuccess(item.id);
      setTimeout(() => setFavDishSuccess("") , 2000);
    } catch (err) {
      if (err.message.includes("409")) {
        setFavDishError("Dish is already in your favorites");
        setTimeout(() => setFavDishError(""), 3000);
      } else if (err.message.includes("unauthorized") || err.message.includes("401")) {
        navigate("/customer/login");
      } else {
        setFavDishError("Could not add to favorites");
      }
    } finally {
      setFavDishLoading("");
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="card text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
            <p className="text-neutral-600 font-medium">Loading restaurant...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="card border-2 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-700">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error || "Restaurant not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      {/* Restaurant Info */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary-50 border-2 border-primary-100">
                <FiCoffee className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-dark-primary mb-2">{info.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-neutral-600 mb-3">
                  {info.cuisine && (
                    <>
                      <span className="font-medium">{info.cuisine}</span>
                      <span>·</span>
                    </>
                  )}
                  {info.rating && (
                    <div className="flex items-center gap-1">
                      <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{info.rating}</span>
                    </div>
                  )}
                  {info.eta && (
                    <>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        <span>{info.eta} min delivery</span>
                      </div>
                    </>
                  )}
                </div>
                {info.desc && (
                  <p className="text-neutral-600 mb-4">{info.desc}</p>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleFavoriteRestaurant}
            disabled={favLoading}
            leftIcon={<FiHeart className={`w-4 h-4 ${favSuccess ? 'fill-current' : ''}`} />}
          >
            {favLoading ? "Adding..." : favSuccess ? "Added!" : "Favorite"}
          </Button>
        </div>
        {favError && (
          <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4" />
            {favError}
          </div>
        )}
      </div>
      {/* Menu */}
      <div className="mb-8">
        {Object.entries(menu).map(([cat, items]) => (
          <div key={cat} className="card mb-6">
            <h2 className="text-xl font-bold mb-6 text-dark-primary flex items-center gap-2">
              <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
              {cat}
            </h2>
            <div className="space-y-4">
              {(Array.isArray(items) ? items : []).map((item, idx) => {
                const isAvailable = item.isAvailable && (!item.showQuantity || item.quantityAvailable > 0);
                return (
                  <div
                    key={item.id ? `menu-${item.id}` : `menu-${cat}-${item.name}-${idx}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-neutral-50 rounded-xl border-2 border-neutral-200 hover:border-primary-200 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-dark-primary text-lg">{item.name}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border-2 ${
                          item.veg
                            ? 'bg-accent-50 text-accent-700 border-accent-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {item.veg ? 'Veg' : 'Non-Veg'}
                        </span>
                        {!isAvailable && (
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border-2 border-red-200">
                            Out of Stock
                          </span>
                        )}
                        {item.isAvailable && item.showQuantity && item.quantityAvailable !== null && item.quantityAvailable > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-secondary-50 text-secondary-700 border-2 border-secondary-200">
                            {item.quantityAvailable} left
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary-600">₹{item.price?.toFixed ? item.price.toFixed(2) : item.price}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => addToCart(item)}
                        disabled={!isAvailable}
                        leftIcon={<FiShoppingCart className="w-4 h-4" />}
                      >
                        {isAvailable ? 'Add to Cart' : 'Unavailable'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFavoriteDish(item)}
                        disabled={favDishLoading === item.id}
                        className={favDishSuccess === item.id ? 'text-accent-600' : ''}
                        leftIcon={
                          favDishLoading === item.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : favDishSuccess === item.id ? (
                            <FiCheck className="w-4 h-4" />
                          ) : (
                            <FiHeart className="w-4 h-4" />
                          )
                        }
                      >
                        {favDishLoading === item.id ? "Adding..." : favDishSuccess === item.id ? "Added!" : ""}
                      </Button>
                    </div>
                    {favDishError && favDishLoading === item.id && (
                      <div className="col-span-full text-xs text-red-600 flex items-center gap-1">
                        <FiAlertCircle className="w-3 h-3" />
                        {favDishError}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* Cart Summary */}
      <div className="card sticky top-4">
        <div className="flex items-center gap-2 mb-6">
          <FiShoppingCart className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-bold text-dark-primary">Cart</h3>
          {(cart.items || []).length > 0 && (
            <span className="ml-auto bg-primary-500 text-white text-xs font-bold rounded-full px-2.5 py-1">
              {(cart.items || []).length}
            </span>
          )}
        </div>
        {(cart.items || []).length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <FiShoppingCart className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <>
            <ul className="space-y-3 mb-4">
              {(cart.items || []).map((item, idx) => (
                <li
                  key={item.menu_item_id ? `cart-${item.menu_item_id}` : `cart-${item.name}-${idx}`}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-dark-primary mb-1">{item.name}</div>
                    <div className="text-sm text-neutral-600">₹{item.price?.toFixed ? item.price.toFixed(2) : item.price} each</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white rounded-lg border-2 border-neutral-200">
                      <button
                        className="p-1.5 hover:bg-neutral-100 rounded-l-lg transition-colors"
                        onClick={() => updateQty(item, Math.max(1, item.qty - 1))}
                        aria-label="Decrease quantity"
                      >
                        <FiMinus className="w-4 h-4 text-neutral-600" />
                      </button>
                      <span className="px-3 py-1 font-semibold text-dark-primary min-w-[2rem] text-center">{item.qty}</span>
                      <button
                        className="p-1.5 hover:bg-neutral-100 rounded-r-lg transition-colors"
                        onClick={() => updateQty(item, item.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        <FiPlus className="w-4 h-4 text-neutral-600" />
                      </button>
                    </div>
                    <button
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => removeFromCart(item)}
                      aria-label="Remove item"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              variant="tertiary"
              size="sm"
              fullWidth
              onClick={clearCart}
              leftIcon={<FiTrash2 className="w-4 h-4" />}
              className="mb-4"
            >
              Empty Cart
            </Button>
          </>
        )}
        <div className="border-t-2 border-neutral-200 pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-lg text-dark-primary">Total:</span>
            <span className="font-extrabold text-2xl text-primary-600">₹{total?.toFixed ? total.toFixed(2) : total}</span>
          </div>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={(cart.items || []).length === 0}
            onClick={() => navigate('/customer/cart')}
            leftIcon={<FiShoppingCart className="w-5 h-5" />}
          >
            Go to Cart
          </Button>
        </div>
      </div>
    </div>
  );
} 