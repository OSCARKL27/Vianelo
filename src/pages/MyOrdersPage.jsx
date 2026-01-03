// src/pages/MyOrdersPage.jsx
import { useEffect, useRef, useState } from 'react'
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const STATUS_LABELS = {
  pending: 'Enviado a la sucursal',
  enviado: 'Enviado a la sucursal',
  recibido: 'En preparación',
  listo: 'Listo para recoger',
  entregado: 'Entregado',
}

const STATUS_VARIANT = {
  pending: 'secondary',
  enviado: 'secondary',
  recibido: 'info',
  listo: 'success',
  entregado: 'dark',
}

export default function MyOrdersPage() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const prevOrdersRef = useRef([])

  // 🔹 Escuchar sesión
  useEffect(() => {
    const auth = getAuth()
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null)
    })
    return () => unsub()
  }, [])

  // 🔹 Pedir permiso de notificaciones (una vez)
  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  // 🔹 Escuchar pedidos del usuario
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

        // Detectar pedidos que pasaron a "listo"
        const prev = prevOrdersRef.current
        list.forEach((order) => {
          const before = prev.find((o) => o.id === order.id)
          if (
            before &&
            before.status !== 'listo' &&
            order.status === 'listo'
          ) {
            // Enviar notificación del navegador
            if (
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification('Tu pedido está listo 🎉', {
                body: `Pedido #${order.id.slice(-6)} en sucursal ${order.branchId}`,
              })
            }
          }
        })

        prevOrdersRef.current = list
        setOrders(list)
        setLoading(false)
      },
      (err) => {
        console.error('Error escuchando pedidos', err)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [user])

  if (!user) {
    return (
      <Container className="min-vh-100 d-flex justify-content-center align-items-center">
        <p className="text-white">
          Inicia sesión para ver tus pedidos.
        </p>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container className="min-vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" />
      </Container>
    )
  }

  return (
    <Container className="py-4 min-vh-100">
      <Row className="mb-3">
        <Col>
          <h2 className="text-light">Mis pedidos</h2>
          <p className="text-white-50 m-0">
            Revisa el estado de tus pedidos en tiempo real.
          </p>
        </Col>
      </Row>

      {orders.length === 0 ? (
        <p className="text-white-50">Aún no has realizado pedidos.</p>
      ) : (
        <Row className="g-3">
          {orders.map((order) => (
            <Col md={6} lg={4} key={order.id}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <Card.Title className="mb-0">
                        Pedido #{order.id.slice(-6)}
                      </Card.Title>
                      <small className="text-muted">
                        Sucursal: {order.branchId}
                      </small>
                    </div>
                    <Badge bg={STATUS_VARIANT[order.status] || 'secondary'}>
                      {STATUS_LABELS[order.status] || order.status}
                    </Badge>
                  </div>

                  <div className="mb-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="small">
                        {item.qty}× {item.name}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
                    <strong>
                      Total: ${Number(order.total || 0).toFixed(2)}
                    </strong>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}
