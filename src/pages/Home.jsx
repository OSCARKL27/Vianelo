import React from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../hooks/useProducts'

export default function Home() {
  const { products, loading } = useProducts()
  const destacados = products.slice(0, 3) // puedes cambiar el criterio

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h4>Cargando productos...</h4>
      </Container>
    )
  }

  return (
    <main>
      {/* 🏠 Hero */}
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
              <Button as="a" href="/menu" className="btn-vianelo btn-lg">
                Ver menú completo
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 🌟 Destacados */}
      <section id="destacados" className="py-5">
        <Container>
          <h2 className="section-title text-center mb-4 text-light">Destacados</h2>
          <Row className="g-3">
            {destacados.map((it) => (
              <Col md={4} key={it.id}>
                <ProductCard item={it} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </main>
  )
}
