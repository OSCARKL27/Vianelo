import React, { useState } from 'react'
import { Container, Table, Button, Card, Form, Alert } from 'react-bootstrap'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import PayPalButton from '../components/PayPalButton'

// 🔹 Sucursales disponibles
const BRANCHES = [
  { id: 'chapule', label: 'Vianelo Chapule' },
  { id: 'quintas', label: 'Vianelo Quintas' },
]

// 🔹 Estilo miniatura imagen
const thumbStyle = {
  width: 42,
  height: 42,
  borderRadius: 10,
  objectFit: 'cover',
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
}

export default function CartPage() {
  const { items, total, removeFromCart, clearCart, increaseQty, decreaseQty } = useCart()

  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [savingOrder, setSavingOrder] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const navigate = useNavigate()

  // 👉 Carrito vacío
  if (items.length === 0) {
    return (
      <Container className="cart-page min-vh-100 d-flex flex-column align-items-center justify-content-center text-center">
        <h3>Tu carrito está vacío 🛒</h3>
        <p>Agrega productos desde el menú.</p>
      </Container>
    )
  }

  // ✅ PayPal ya crea order/sale/stock. Aquí solo redirigimos.
  const handlePaySuccess = async ({ orderId }) => {
    setErrorMsg('')

    if (!selectedBranchId) {
      setErrorMsg('Selecciona una sucursal para enviar tu pedido.')
      return
    }
    if (!orderId) {
      setErrorMsg('No se recibió el ID del pedido. Intenta de nuevo.')
      return
    }

    // el carrito ya se limpió en PayPalButton, pero no pasa nada si lo vuelves a limpiar
    clearCart()
    navigate(`/pedido-exitoso/${orderId}`)
  }

  return (
    <Container className="cart-page min-vh-100 py-4">
      <div className="mx-auto" style={{ maxWidth: 950 }}>
        <Card className="shadow-sm overflow-hidden">
          <Card.Header className="bg-white py-3">
            <div className="d-flex align-items-center justify-content-between">
              <h4 className="mb-0 fw-bold">Tu carrito</h4>
              <span className="text-muted small">{items.length} producto(s)</span>
            </div>
          </Card.Header>

          <Card.Body>
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

            <Table responsive hover className="align-middle mb-4">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Imagen</th>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th style={{ width: 180 }}>Cantidad</th>
                  <th>Total</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const maxStock = Number(it.maxStock ?? it.stock ?? Infinity)
                  const atMax = Number(it.qty || 0) >= maxStock

                  return (
                    <tr key={it.id}>
                      <td>
                        {it.imageUrl ? (
                          <img src={it.imageUrl} alt={it.name} style={thumbStyle} loading="lazy" />
                        ) : (
                          <div
                            style={{
                              ...thumbStyle,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#f3f3f3',
                              boxShadow: 'none',
                            }}
                          >
                            —
                          </div>
                        )}
                      </td>

                      <td className="fw-semibold">{it.name}</td>
                      <td>${Number(it.price || 0).toFixed(2)}</td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => decreaseQty(it.id)}
                            disabled={savingOrder}
                          >
                            −
                          </Button>

                          <span className="fw-semibold">{it.qty}</span>

                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => increaseQty(it.id)}
                            disabled={savingOrder || atMax}
                            title={atMax ? `Máximo en stock: ${maxStock}` : ''}
                          >
                            +
                          </Button>
                        </div>

                        {Number.isFinite(maxStock) && maxStock !== Infinity && (
                          <div className="text-muted small mt-1">
                            Stock disponible: {maxStock}
                          </div>
                        )}
                      </td>

                      <td>${(Number(it.price || 0) * Number(it.qty || 0)).toFixed(2)}</td>

                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => removeFromCart(it.id)}
                          disabled={savingOrder}
                        >
                          ✕
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>

            {/* SUCURSAL */}
            <Form.Group className="mb-3">
              <Form.Label>Selecciona la sucursal</Form.Label>
              <Form.Select
                required
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value)
                  setErrorMsg('')
                }}
                disabled={savingOrder}
                isInvalid={!!errorMsg && !selectedBranchId}
              >
                <option value="" disabled>
                  Selecciona una sucursal
                </option>
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </Form.Select>

              <Form.Control.Feedback type="invalid">
                Selecciona una sucursal para continuar.
              </Form.Control.Feedback>
            </Form.Group>

            {/* TOTAL */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <strong>Total: ${Number(total || 0).toFixed(2)}</strong>
              <Button variant="outline-secondary" onClick={clearCart} disabled={savingOrder}>
                Vaciar carrito
              </Button>
            </div>

            {/* PAYPAL */}
            <PayPalButton
              total={total}
              branchId={selectedBranchId} // ✅ importante
              disabled={savingOrder || !selectedBranchId}
              onSuccess={handlePaySuccess}
            />
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}
