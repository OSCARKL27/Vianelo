import React from 'react'
import { Container, Table, Button } from 'react-bootstrap'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { items, total, removeFromCart, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h3>Tu carrito está vacío 🛒</h3>
        <p>Agrega productos desde el menú o los destacados.</p>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Tu carrito</h2>
      <Table striped hover>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>
                <img
                  src={it.imageUrl || '/placeholder.jpg'}
                  alt={it.name}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: 10 }}
                />
                {it.name}
              </td>
              <td>${it.price.toFixed(2)}</td>
              <td>{it.qty}</td>
              <td>${(it.price * it.qty).toFixed(2)}</td>
              <td>
                <Button variant="outline-danger" size="sm" onClick={() => removeFromCart(it.id)}>
                  ✕
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-between align-items-center mt-3">
        <h4>Total: ${total.toFixed(2)}</h4>
        <div>
          <Button variant="secondary" onClick={clearCart} className="me-2">
            Vaciar carrito
          </Button>
          <Button variant="primary">Proceder al pago</Button>
        </div>
      </div>
    </Container>
  )
}
