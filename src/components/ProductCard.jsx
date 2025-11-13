import React, { useState } from 'react'
import { Card, Button } from 'react-bootstrap'
import { useCart } from '../context/CartContext'
import { getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

export default function ProductCard({ item }) {
  const { addToCart } = useCart()
  const [pressed, setPressed] = useState(false)
  const navigate = useNavigate()

  const agotado = Number(item.stock) <= 0

  function handleAdd() {
    if (agotado) return

    const user = getAuth().currentUser

    // 👇 Si NO está logueado → redirige al login
    if (!user) {
      navigate("/login")
      return
    }

    // 👇 Si está logueado → agrega normal
    addToCart(item, 1)
    setPressed(true)
    setTimeout(() => setPressed(false), 180)
  }

  return (
    <Card className={`h-100 product-card ${pressed ? 'press' : ''}`}>
      <div className="position-relative overflow-hidden rounded-3">
        <Card.Img
          variant="top"
          src={item.imageUrl || '/placeholder.jpg'}
          className="product-img"
        />
        {agotado && (
          <span className="badge bg-danger position-absolute top-0 start-0 m-2">
            Agotado
          </span>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title>{item.name}</Card.Title>
        <Card.Text className="text-muted small">{item.description}</Card.Text>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="price fw-semibold">
            ${Number(item.price).toFixed(2)} MXN
          </span>

          <Button variant="primary" disabled={agotado} onClick={handleAdd}>
            {agotado ? 'No disponible' : 'Agregar'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}
