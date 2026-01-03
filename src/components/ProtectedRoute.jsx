// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Este componente protege las rutas que requieren sesión iniciada.
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // Si no hay usuario logueado, redirige al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay sesión activa, renderiza el contenido protegido
  return children;
}
