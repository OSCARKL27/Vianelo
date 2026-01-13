// src/pages/OrderSuccessPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Container, Card, Spinner, Button, ProgressBar } from 'react-bootstrap'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

export default function OrderSuccessPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  // ⏳ Cuenta regresiva
  const SECONDS_TOTAL = 10
  const [seconds, setSeconds] = useState(SECONDS_TOTAL)

  // 1) Cargar pedido
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const ref = doc(db, 'orders', orderId)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() })
        }
      } catch (e) {
        console.error('Error cargando pedido', e)
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [orderId])

  // 2) Iniciar contador cuando ya cargó y existe order
  useEffect(() => {
    if (loading || !order) return

    const interval = setInterval(() => {
      setSeconds((s) => s - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [loading, order])

  // 3) Redirigir al terminar
  useEffect(() => {
    if (loading || !order) return
    if (seconds <= 0) {
      navigate('/', { replace: true }) // 👈 menú principal (cambia a /menu si tu ruta es otra)
    }
  }, [seconds, navigate, loading, order])

  const progress = useMemo(() => {
    const done = SECONDS_TOTAL - Math.max(seconds, 0)
    return Math.min(100, Math.round((done / SECONDS_TOTAL) * 100))
  }, [seconds])

  if (loading) {
    return (
      <Container className="min-vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" />
      </Container>
    )
  }

  if (!order) {
    return (
      <Container className="min-vh-100 d-flex justify-content-center align-items-center">
        <p className="text-white">No se encontró el pedido.</p>
      </Container>
    )
  }

  return (
    <Container className="min-vh-100 d-flex justify-content-center align-items-center">
      <Card className="p-4 shadow-lg w-100" style={{ maxWidth: 500 }}>
        <h3 className="mb-2">¡Gracias por tu pedido! 🎉</h3>
        <p className="text-muted mb-3">
          Tu pedido fue enviado a la sucursal y está siendo procesado.
        </p>

        {/* ✅ Aviso temporal */}
        <div className="mb-3">
          <div className="text-muted small">
            Redirigiendo al menú principal en <strong>{seconds}</strong> segundos…
          </div>
          <ProgressBar now={progress} animated className="mt-2" />
        </div>

        <div className="mb-3">
          <strong>Número de pedido:</strong> <span>#{order.id.slice(-6)}</span>
        </div>

        <div className="mb-3">
          <strong>Sucursal:</strong> <span>{order.branchId}</span>
        </div>

        <div className="mb-3">
          <strong>Estado actual:</strong> <span>{order.status}</span>
        </div>

        <div className="mb-3">
          <strong>Total:</strong> <span>${Number(order.total || 0).toFixed(2)}</span>
        </div>

        <div className="mb-3">
          <strong>Productos:</strong>
          <ul className="mb-0">
            {order.items?.map((it, idx) => (
              <li key={idx}>
                {(it.qty ?? it.quantity ?? 0)}× {it.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="d-flex flex-column gap-2">
          <Button as={Link} to="/mis-pedidos" variant="primary">
            Ver mis pedidos
          </Button>
          <Button as={Link} to="/" variant="outline-secondary">
            Volver al inicio
          </Button>
        </div>
      </Card>
    </Container>
  )
}
