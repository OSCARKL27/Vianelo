import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../hooks/useProducts'

export default function MenuPage() {
  const { products, loading } = useProducts()

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h4>Cargando menú...</h4>
      </Container>
    )
  }

  return (
    <main className="py-5">
      <Container>
        <h1 className="text-center mb-4">Menú completo</h1>
        <Row className="g-3">
          {products.map((it) => (
            <Col md={4} key={it.id}>
              <ProductCard item={it} />
            </Col>
          ))}
        </Row>
      </Container>
    </main>
  )
}
