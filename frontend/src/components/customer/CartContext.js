import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], address: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
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