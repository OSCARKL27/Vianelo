import React from 'react'
import { Container, Table, Button, Card } from 'react-bootstrap'
import { useCart } from '../context/CartContext'

export default function CartPage() {
const {
  items,
  total,
  removeFromCart,
  clearCart,
  increaseQty,
  decreaseQty,
} = useCart();

  if (items.length === 0) {
    return (
      <Container className="cart-page min-vh-100 d-flex flex-column align-items-center justify-content-center text-center">
        <h3 className="cart-empty-title">Tu carrito está vacío 🛒</h3>
        <p className="cart-empty-text">Agrega productos desde el menú o los destacados.</p>
      </Container>
    )
  }

  return (
    <Container className="cart-page min-vh-100">
      <div className="cart-inner">
        <h2 className="cart-title mb-4">Tu carrito</h2>

        <Card className="cart-card shadow-sm">
          <Card.Body>
            <Table responsive hover className="mb-4 cart-table">
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
                      <div className="d-flex align-items-center">
                        <img
                          src={it.imageUrl || '/placeholder.jpg'}
                          alt={it.name}
                          className="cart-img me-3"
                        />
                        {it.name}
                      </div>
                    </td>
                    <td>${it.price.toFixed(2)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => decreaseQty(it.id)}
                        >
                          −
                        </Button>
                        <span>{it.qty}</span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => increaseQty(it.id)}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td>${(it.price * it.qty).toFixed(2)}</td>
                    <td className="text-end">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCart(it.id)}
                      >
                        ✕
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <div className="cart-total mb-3 mb-md-0">
                Total: <span>${total.toFixed(2)}</span>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={clearCart}
                  className="btn-cart-secondary"
                >
                  Vaciar carrito
                </Button>
                <Button className="btn-cart-primary">
                  Proceder al pago
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}
