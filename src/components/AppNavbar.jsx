import React from 'react'
import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' // ✅ usamos el contexto

export default function AppNavbar() {
  const { user, logout, isAdmin } = useAuth() // ✅ añadimos isAdmin

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Navbar expand="lg" className="shadow-sm bg-white" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src="/logo.png" alt="Vianelo" height="44" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="nav" />
        <Navbar.Collapse id="nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/#destacados">Destacados</Nav.Link>
            <Nav.Link as={Link} to="/#menu">Menú</Nav.Link>
            <Nav.Link href="https://wa.me/5216671234567?text=Hola%20me%20interesa%20tu%20servicio"
              target="_blank">Contacto</Nav.Link>

            {/* ✅ Si el usuario es admin, mostramos el acceso al panel */}
            {isAdmin && (
              <Nav.Link as={Link} to="/admin" className="fw-semibold text-danger">
                Panel Admin
              </Nav.Link>
            )}

            {/* ✅ Si hay usuario logueado */}
            {user ? (
              <>
                <span className="ms-3 me-2 text-secondary small">
                  👋 {user?.displayName || user?.email}
                </span>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              // ✅ Si no hay usuario, mostramos botón de login
              <Button
                as={Link}
                to="/login"
                variant="outline-primary"
                size="sm"
                className="ms-2"
              >
                Iniciar Sesión
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
