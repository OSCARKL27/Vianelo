import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import AppNavbar from './components/AppNavbar'
import Home from './pages/Home'
import MenuPage from './pages/Menu.jsx'         // 👈 nueva página del menú
import LoginPage from './pages/login.jsx'
import RegisterPage from './pages/register.jsx'
import Footer from './components/Footer'

// Rutas protegidas
import ProtectedRoute from './components/ProtectedRoute'   // solo requiere estar logueado
import AdminRoute from './components/AdminRoute'           // requiere rol admin
import AdminDashboard from './pages/AdminDashboard.jsx'    // panel admin
import CartPage from './pages/Cart.jsx'                    // 👈 carrito

export default function App() {
  return (
    <Router>
      <div className="app-root">
        <AppNavbar />
        <Container fluid className="p-0">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/menu" element={<MenuPage />} />     {/* 👈 nueva ruta */}
            <Route path="/cart" element={<CartPage />} />     {/* 👈 nueva ruta */}

            {/* Ruta protegida (usuarios logueados) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Ruta SOLO para administradores */}
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
  )
}
