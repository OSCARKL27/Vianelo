// src/context/CartContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartCtx = createContext(null);

// Hook para usar el carrito en cualquier componente
export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de un <CartProvider>");
  }
  return ctx;
}

const LS_KEY = "cart_vianelo";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [lastAdded, setLastAdded] = useState(null); // para el carrito flotante

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      setItems(saved);
    } catch (e) {
      console.error("Error leyendo carrito de localStorage", e);
    }
  }, []);

  // Guardar en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  function addToCart(product, qty = 1) {
    if (!product || !product.id) return;

    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          imageUrl: product.imageUrl || "",
          qty,
        },
      ];
    });

    // Para el popup flotante
    setLastAdded({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      imageUrl: product.imageUrl || "",
    });

    // Ocultarlo automáticamente después de 2.5s
    setTimeout(() => setLastAdded(null), 2500);
  }

  function removeFromCart(id) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  // Cambiar cantidad directamente (ej. input numérico)
  function updateQty(id, qty) {
    const n = Number(qty);
    setItems((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, qty: n } : p
        )
        .filter((p) => p.qty > 0) // si llega a 0, lo quitamos
    );
  }

  // 🔼 Aumentar en 1
  function increaseQty(id) {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: p.qty + 1 } : p
      )
    );
  }

  // 🔽 Disminuir en 1 (y si llega a 0, se borra)
  function decreaseQty(id) {
    setItems((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, qty: p.qty - 1 } : p
        )
        .filter((p) => p.qty > 0)
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = useMemo(
    () => items.reduce((acc, p) => acc + p.price * p.qty, 0),
    [items]
  );

  const count = useMemo(
    () => items.reduce((acc, p) => acc + p.qty, 0),
    [items]
  );

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQty,
    increaseQty,   // 👈 ahora disponible
    decreaseQty,   // 👈 ahora disponible
    clearCart,
    total,
    count,
    lastAdded, // para el carrito flotante
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
