// src/pages/CartPage.jsx
import React, { useState } from 'react'
import {
  Container,
  Table,
  Button,
  Card,
  Form,
  Alert,
} from 'react-bootstrap'
import { useCart } from '../context/CartContext'
import { db } from '../services/firebase' // 👈 ajusta si tu archivo tiene otro nombre/ruta
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { getAuth } from 'firebase/auth'

// 🔹 Sucursales disponibles (usar los mismos branchId que usas en roles / sucursal)
const BRANCHES = [
  { id: 'chapule', label: 'Vianelo Chapule' },
  { id: 'quintas', label: 'Vianelo Quintas' },
  { id: 'tres-rios', label: 'Vianelo Tres Ríos' },
  // agrega más si tienes otras sucursales
]

export default function CartPage() {
  const {
    items,
    total,
    removeFromCart,
    clearCart,
    increaseQty,
    decreaseQty,
  } = useCart()

  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [savingOrder, setSavingOrder] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const navigate = useNavigate()
  const auth = getAuth()

  // 👉 Carrito vacío
  if (items.length === 0) {
    return (
      <Container className="cart-page min-vh-100 d-flex flex-column align-items-center justify-content-center text-center">
        <h3 className="cart-empty-title">Tu carrito está vacío 🛒</h3>
        <p className="cart-empty-text">
          Agrega productos desde el menú o los destacados.
        </p>
      </Container>
    )
  }

  // 👉 Proceder al pago / crear pedido
  const handlePay = async () => {
    setErrorMsg('')
    setSuccessMsg('')

    if (!selectedBranchId) {
      setErrorMsg('Selecciona una sucursal para enviar tu pedido.')
      return
    }

    const user = auth.currentUser
    if (!user) {
      setErrorMsg('Debes iniciar sesión para hacer un pedido.')
      return
    }

    setSavingOrder(true)
    try {
      const cleanBranchId = selectedBranchId.trim()

      const orderData = {
        branchId: cleanBranchId, // 👈 se usa en SucursalOrdersPage
        items: items.map((it) => ({
          productId: it.id,
          name: it.name,
          qty: it.qty,
          price: it.price,
          subtotal: it.price * it.qty,
          imageUrl: it.imageUrl || null,
        })),
        total,
        status: 'enviado', // 👈 para que la sucursal pueda marcar "recibido"
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName || '',
        userEmail: user.email || '',
      }

      const docRef = await addDoc(collection(db, 'orders'), orderData)

      clearCart()
      // Opcional: mensaje local
      setSuccessMsg('Tu pedido se registró correctamente 🎉')

      // Redirigir a pantalla de éxito
      navigate(`/pedido-exitoso/${docRef.id}`)
    } catch (err) {
      console.error('Error creando pedido', err)
      setErrorMsg(
        'Ocurrió un problema al registrar tu pedido. Intenta nuevamente.'
      )
    } finally {
      setSavingOrder(false)
    }
  }

  return (
    <Container className="cart-page min-vh-100">
      <div className="cart-inner">
        <h2 className="cart-title mb-4">Tu carrito</h2>

        <Card className="cart-card shadow-sm">
          <Card.Body>
            {errorMsg && (
              <Alert variant="danger" className="mb-3">
                {errorMsg}
              </Alert>
            )}
            {successMsg && (
              <Alert variant="success" className="mb-3">
                {successMsg}
              </Alert>
            )}

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

            {/* 🔹 Selector de sucursal */}
            <Form.Group className="mb-3">
              <Form.Label>¿A qué sucursal quieres enviar tu pedido?</Form.Label>
              <Form.Select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                disabled={savingOrder}
              >
                <option value="">Selecciona una sucursal</option>
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <div className="cart-total mb-3 mb-md-0">
                Total: <span>${total.toFixed(2)}</span>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={clearCart}
                  className="btn-cart-secondary"
                  disabled={savingOrder}
                >
                  Vaciar carrito
                </Button>
                <Button
                  className="btn-cart-primary"
                  onClick={handlePay}
                  disabled={savingOrder}
                >
                  {savingOrder ? 'Registrando pedido...' : 'Proceder al pago'}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}
