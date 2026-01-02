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
import { db } from '../services/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { getAuth } from 'firebase/auth'
import PayPalButton from '../components/PayPalButton'

// 🔹 Sucursales disponibles
const BRANCHES = [
  { id: 'chapule', label: 'Vianelo Chapule' },
  { id: 'quintas', label: 'Vianelo Quintas' },
  { id: 'tres-rios', label: 'Vianelo Tres Ríos' },
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

  const navigate = useNavigate()
  const auth = getAuth()

  // 👉 Carrito vacío
  if (items.length === 0) {
    return (
      <Container className="cart-page min-vh-100 d-flex flex-column align-items-center justify-content-center text-center">
        <h3>Tu carrito está vacío 🛒</h3>
        <p>Agrega productos desde el menú o los destacados.</p>
      </Container>
    )
  }

  // 👉 Guardar pedido DESPUÉS del pago
  const handleSaveOrder = async (paypalDetails) => {
    setErrorMsg('')

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
      const orderData = {
        branchId: selectedBranchId.trim(),
        items: items.map((it) => ({
          productId: it.id,
          name: it.name,
          qty: it.qty,
          price: it.price,
          subtotal: it.price * it.qty,
          imageUrl: it.imageUrl || null,
        })),
        total,
        status: 'pagado',
        paypalOrderId: paypalDetails.id,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName || '',
        userEmail: user.email || '',
      }

      const docRef = await addDoc(collection(db, 'orders'), orderData)

      clearCart()
      setSuccessMsg('Pago realizado y pedido registrado 🎉')
      navigate(`/pedido-exitoso/${docRef.id}`)
    } catch (err) {
      console.error('Error guardando pedido', err)
      setErrorMsg('Error al guardar el pedido.')
    } finally {
      setSavingOrder(false)
    }
  }

  return (
    <Container className="cart-page min-vh-100">
      <h2 className="mb-4">Tu carrito</h2>

      <Card>
        <Card.Body>
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
          {successMsg && <Alert variant="success">{successMsg}</Alert>}

          <Table responsive hover>
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
                  <td>{it.name}</td>
                  <td>${it.price.toFixed(2)}</td>
                  <td>
                    <Button size="sm" onClick={() => decreaseQty(it.id)}>−</Button>
                    <span className="mx-2">{it.qty}</span>
                    <Button size="sm" onClick={() => increaseQty(it.id)}>+</Button>
                  </td>
                  <td>${(it.price * it.qty).toFixed(2)}</td>
                  <td>
                    <Button
                      variant="danger"
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
            <Form.Label>Sucursal</Form.Label>
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

          <div className="mb-3">
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>

          {/* 💳 PAYPAL */}
          <PayPalButton
            total={total}
            disabled={savingOrder || !selectedBranchId}
            onSuccess={handleSaveOrder}
          />

          <Button
            variant="outline-secondary"
            className="mt-3"
            onClick={clearCart}
            disabled={savingOrder}
          >
            Vaciar carrito
          </Button>
        </Card.Body>
      </Card>
    </Container>
  )
}
