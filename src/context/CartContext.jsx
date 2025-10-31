import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

const LS_KEY = "cart_vianelo";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      setItems(saved);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  function addToCart(product, qty = 1) {
    setItems(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...prev, { id: product.id, name: product.name, price: Number(product.price), imageUrl: product.imageUrl || "", qty }];
    });
  }

  function removeFromCart(id) {
    setItems(prev => prev.filter(p => p.id !== id));
  }

  function updateQty(id, qty) {
    setItems(prev => prev.map(p => p.id === id ? { ...p, qty } : p));
  }

  function clearCart() { setItems([]); }

  const total = useMemo(() => items.reduce((acc, p) => acc + p.price * p.qty, 0), [items]);

  return (
    <CartCtx.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total }}>
      {children}
    </CartCtx.Provider>
  );
}
