import React from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'

export default function AppNavbar(){
  return (
    <Navbar expand="lg" className="shadow-sm" sticky="top">
      <Container>
        <Navbar.Brand href="#home" className="d-flex align-items-center">
          <img src="/public/logo.png" alt="Vianelo" height="44" />
          <span className="ms-2 brand-title"></span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="nav" />
        <Navbar.Collapse id="nav">
          <Nav className="ms-auto">
            <Nav.Link href="#home">Inicio</Nav.Link>
            <Nav.Link href="#destacados">Destacados</Nav.Link>
            <Nav.Link href="#menu">Menú</Nav.Link>
            <Nav.Link href="#contacto">Contacto</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
