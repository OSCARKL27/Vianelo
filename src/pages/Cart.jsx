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
        <p>Agrega productos desde el menú.</p>
      </Container>
    )
  }

  // 👉 Se ejecuta SOLO cuando PayPal aprueba el pago
  const handlePaySuccess = async (paymentDetails) => {
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
        paypalOrderId: paymentDetails.id,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName || '',
        userEmail: user.email || '',
      }

      const docRef = await addDoc(collection(db, 'orders'), orderData)

      clearCart()
      navigate(`/pedido-exitoso/${docRef.id}`)
    } catch (err) {
      console.error(err)
      setErrorMsg(
        'Ocurrió un problema al registrar tu pedido. Intenta nuevamente.'
      )
    } finally {
      setSavingOrder(false)
    }
  }

  return (
    <Container className="cart-page min-vh-100">
      <h2 className="mb-4">Tu carrito</h2>

      <Card className="shadow-sm">
        <Card.Body>
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

          <Table responsive hover className="mb-4">
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
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => decreaseQty(it.id)}
                    >
                      −
                    </Button>{' '}
                    {it.qty}{' '}
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => increaseQty(it.id)}
                    >
                      +
                    </Button>
                  </td>
                  <td>${(it.price * it.qty).toFixed(2)}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
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
            <Form.Label>Selecciona la sucursal</Form.Label>
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

          <div className="d-flex justify-content-between align-items-center">
            <strong>Total: ${total.toFixed(2)}</strong>
            <Button
              variant="outline-secondary"
              onClick={clearCart}
              disabled={savingOrder}
            >
              Vaciar carrito
            </Button>
          </div>

          {/* 🔥 PAYPAL SANDBOX */}
          <div className="mt-4">
            <PayPalButton
              total={total}
              disabled={savingOrder || !selectedBranchId}
              onSuccess={handlePaySuccess}
            />
          </div>
        </Card.Body>
      </Card>
    </Container>
  )
}
