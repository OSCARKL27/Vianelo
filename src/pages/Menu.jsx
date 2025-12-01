import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../hooks/useProducts'

export default function MenuPage() {
  const { products, loading } = useProducts()

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h4 className="text-light">Cargando menú...</h4>
      </Container>
    )
  }

  if (!products || !products.length) {
    return (
      <Container className="py-5 text-center">
        <h4 className="text-light">No hay productos en el menú.</h4>
      </Container>
    )
  }

  // 1️⃣ Solo productos activos
  const activos = products.filter((p) => p.isActive !== false)
  // Si quisieras que solo muestre cuando isActive sea true, usa: p.isActive === true

  if (!activos.length) {
    return (
      <Container className="py-5 text-center">
        <h4 className="text-light">No hay productos activos en el menú.</h4>
      </Container>
    )
  }

  // 2️⃣ Normalizamos categoría SOLO con los activos
  const normalizedProducts = activos.map((p) => ({
    ...p,
    category: p.category || 'Otros',
  }))

  // 3️⃣ Obtenemos categorías únicas desde los productos activos
  const categorias = Array.from(
    new Set(normalizedProducts.map((p) => p.category))
  )

  return (
    <main className="py-5">
      <Container>
        <h1 className="text-center mb-5 text-light">Menú completo</h1>

        {/* 🔥 Sección por cada categoría */}
        {categorias.map((cat) => {
          const items = normalizedProducts.filter((p) => p.category === cat)

          return (
            <section key={cat} className="mb-5">
              {/* Título de la categoría */}
              <h2 className="h4 text-light mb-3">{cat}</h2>

              {/* Productos de la categoría */}
              <Row className="g-3">
                {items.map((prod) => (
                  <Col key={prod.id} md={3} sm={6}>
                    <ProductCard item={prod} />
                  </Col>
                ))}
              </Row>
            </section>
          )
        })}
      </Container>
    </main>
  )
}
