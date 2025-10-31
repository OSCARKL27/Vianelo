import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div className="p-4">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return <div className="p-4 text-center text-danger">
      No tienes permiso para acceder a esta página.
    </div>;
  }
  return children;
}
