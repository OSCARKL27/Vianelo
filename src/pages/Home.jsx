import React from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import ProductCard from '../components/ProductCard'
import menuData from '../data/menu.json'
import { useAuth } from '../context/AuthContext' // ✅ para obtener usuario y logout

export default function Home() {
  const { user, logout } = useAuth() // ✅ obtenemos el usuario actual y función para cerrar sesión

  const handleLogout = async () => {
    await logout()
  }

  return (
    <main>  
      {/* 🏠 Sección principal */}
    <section id="home" className="hero">
  <Container>
    <Row className="justify-content-center">
      <Col lg={8}>
        <h1 className="display-5 fw-bold">
          Antojos dementes, corazón y ensueño
        </h1>
        <p className="lead">
          Disfruta nuestras versiones de clásicos y experimentos repostero-gastronómicos.
        </p>
        <Button href="#menu" className="btn-vianelo btn-lg">
          Ver menú
        </Button>
      </Col>
    </Row>
  </Container>
</section>


      {/* 🌟 Productos destacados */}
      <section id="destacados" className="py-5">
        <Container>
          <h2 className="section-title text-center mb-4">Destacados</h2>
          <Row className="g-3">
            {menuData.items.slice(0, 3).map((it) => (
              <Col md={4} key={it.id}>
                <ProductCard item={it} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* 🍰 Menú completo */}
      <section id="menu" className="py-5 bg-light">
        <Container>
          <h2 className="section-title text-center mb-4">Menú completo</h2>
          <Row className="g-3">
            {menuData.items.map((it) => (
              <Col md={4} key={it.id}>
                <ProductCard item={it} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* 📞 Contacto */}
      <section id="contacto" className="py-5">
        <Container>
          <h2 className="section-title text-center mb-4">Contáctanos</h2>
          <Row>
            <Col md={6}>
              <p>¿Tienes un pedido especial o una duda? Escríbenos.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Demo: mensaje enviado')
                  e.target.reset()
                }}
              >
                <div className="mb-3">
                  <input className="form-control" placeholder="Nombre" required />
                </div>
                <div className="mb-3">
                  <input className="form-control" placeholder="Correo" type="email" required />
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    placeholder="Mensaje"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <button className="btn btn-vianelo">Enviar</button>
              </form>
            </Col>

            <Col md={6}>
              <h5>Visítanos</h5>
              <p>Culiacán · Horario: 9:00 — 20:00</p>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  )
}
