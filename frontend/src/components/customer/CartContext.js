import React, { createContext, useContext, useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], address: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      api.get(API_ENDPOINTS.CART)
        .then((data) => setCart(data))
        .catch(() => setCart({ items: [], address: "" }))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Helper to get total item count
  const cartCount = cart.items.reduce((sum, item) => sum + (item.qty || 0), 0);

  return (
    <CartContext.Provider value={{ cart, setCart, cartCount, loading }}>
      {children}
    </CartContext.Provider>
  );
}; 
