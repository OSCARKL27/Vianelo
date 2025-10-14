import React from 'react'
import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' // ✅ importamos el contexto

export default function AppNavbar() {
  const { user, logout } = useAuth() // ✅ obtenemos el usuario y logout del contexto

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
            <Nav.Link as={Link} to="/#contacto">Contacto</Nav.Link>

            {/* ✅ Si hay usuario, mostramos su nombre y botón Cerrar sesión */}
            {user ? (
              <>
                <span className="ms-3 me-2 text-secondary small">
                  👋{user?.displayName || user?.email}
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
              // ✅ Si no hay usuario, mostramos el botón de iniciar sesión
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
