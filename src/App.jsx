import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import AppNavbar from './components/AppNavbar'
import Home from './pages/Home'
import LoginPage from './pages/login.jsx'
import RegisterPage from './pages/register.jsx'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute' // ✅ importa la protección

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

            {/* Ruta protegida */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Container>
        <Footer />
      </div>
    </Router>
  )
}
