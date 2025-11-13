import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import AppNavbar from './components/AppNavbar'
import Home from './pages/Home'
import MenuPage from './pages/Menu.jsx'
import LoginPage from './pages/login.jsx'
import RegisterPage from './pages/register.jsx'
import Footer from './components/Footer'
import 'bootstrap-icons/font/bootstrap-icons.css'

import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminDashboard from './pages/AdminDashboard.jsx'
import CartPage from './pages/Cart.jsx'

// 👉 importa el provider del carrito
import { CartProvider } from './context/CartContext'
import FloatingCart from './components/FloatingCart.jsx'

export default function App() {
  return (
    <CartProvider>        {/* 👈 AQUÍ */}
      <Router>
        <div className="app-root">
          <AppNavbar />
          <FloatingCart />
          <Container fluid className="p-0">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />

              {/* Ruta protegida */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              {/* Ruta admin */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
            </Routes>
          </Container>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  )
}
