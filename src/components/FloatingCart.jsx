import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function FloatingCart() {
  const { items, total, count } = useCart();

  // 👇 El popup solo aparece si hay productos en el carrito
  if (!items || items.length === 0) return null;

  const last = items[items.length - 1]; // último agregado (para la imagen)

  return (
    <div className="floating-cart">
      <div className="floating-cart-left">
        <img
          src={last.imageUrl || "/placeholder.jpg"}
          alt={last.name}
          className="floating-cart-thumb"
        />
      </div>

      <div className="floating-cart-info">
        <span className="floating-cart-label">Carrito</span>
        <span className="floating-cart-items">
          {count} producto{count !== 1 ? "s" : ""} en tu pedido
        </span>
        <span className="floating-cart-total">
          Total: ${total.toFixed(2)} MXN
        </span>
      </div>

      <Link to="/cart" className="btn btn-sm btn-primary floating-cart-btn">
        Ver carrito
      </Link>
    </div>
  );
}
