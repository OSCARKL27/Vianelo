// src/pages/MyOrdersPage.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Tabs,
  Tab,
  Button,
  Collapse,
} from 'react-bootstrap'
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

const STATUS_BADGE_CLASS = {
  pending: 'status-chip status-pending',
  enviado: 'status-chip status-pending',
  recibido: 'status-chip status-received',
  listo: 'status-chip status-ready',
  entregado: 'status-chip status-delivered',
}

const BRANCH_LABELS = {
  chapule: 'Vianelo Chapule',
  quintas: 'Vianelo Quintas',
}

function formatDate(ts) {
  try {
    if (!ts) return null
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return null
  }
}

export default function MyOrdersPage() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const prevOrdersRef = useRef([])
  const notifiedRef = useRef(new Set()) // evita notificar doble
  const [tab, setTab] = useState('activos')
  const [openId, setOpenId] = useState(null)

  // 🔹 Escuchar sesión
  useEffect(() => {
    const auth = getAuth()
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null)
    })
    return () => unsub()
  }, [])

  // 🔹 Permiso notificaciones
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

          const becameReady =
            before && before.status !== 'listo' && order.status === 'listo'

          if (becameReady && !notifiedRef.current.has(order.id)) {
            notifiedRef.current.add(order.id)

            if (
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification('Tu pedido está listo 🎉', {
                body: `Pedido #${order.id.slice(-6)} • ${BRANCH_LABELS[order.branchId] || order.branchId}`,
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

  const activos = useMemo(
    () => orders.filter((o) => o.status !== 'entregado'),
    [orders]
  )
  const entregados = useMemo(
    () => orders.filter((o) => o.status === 'entregado'),
    [orders]
  )

  if (!user) {
    return (
      <Container className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <h4 className="text-light mb-2">Mis pedidos</h4>
          <p className="text-white-50 m-0">Inicia sesión para ver tus pedidos.</p>
        </div>
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

  const OrdersGrid = (list) => {
    if (list.length === 0) {
      return (
        <Card className="bg-dark border-0 shadow-sm">
          <Card.Body className="text-center py-4">
            <div className="text-white-50">No hay pedidos en esta sección.</div>
          </Card.Body>
        </Card>
      )
    }

    return (
      <Row className="g-3">
        {list.map((order) => {
          const branchName = BRANCH_LABELS[order.branchId] || order.branchId || 'Sucursal'
          const statusText = STATUS_LABELS[order.status] || order.status || '—'
          const dateText = formatDate(order.createdAt)
          const isOpen = openId === order.id

          return (
            <Col md={6} lg={4} key={order.id}>
              <Card className="order-card h-100 border-0 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <h5 className="mb-0 text-dark">
                          Pedido #{order.id.slice(-6)}
                        </h5>
                        <span className={STATUS_BADGE_CLASS[order.status] || 'status-chip'}>
                          {statusText}
                        </span>
                      </div>
                      <div className="text-muted small mt-1">
                        {branchName}
                        {dateText ? <span className="ms-2">• {dateText}</span> : null}
                      </div>
                    </div>
                  </div>

                  {/* Resumen */}
                  <div className="order-summary mt-1 mb-2">
                    <div className="text-muted small">Total</div>
                    <div className="fw-bold fs-5">
                      ${Number(order.total || 0).toFixed(2)}
                    </div>
                  </div>

                  {/* Productos (colapsable) */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="w-100 mt-1"
                    onClick={() => setOpenId(isOpen ? null : order.id)}
                    aria-expanded={isOpen}
                  >
                    {isOpen ? 'Ocultar productos' : `Ver productos (${order.items?.length || 0})`}
                  </Button>

                  <Collapse in={isOpen}>
                    <div className="mt-3">
                      <div className="small text-muted mb-2">Productos</div>
                      <div className="d-flex flex-column gap-1">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="d-flex justify-content-between small">
                            <span className="text-dark">
                              {item.qty}× {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Collapse>

                  {/* Footer */}
                  <div className="mt-auto pt-3">
                    {order.status === 'listo' && (
                      <div className="ready-banner">
                        🎉 Tu pedido está listo para recoger
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )
        })}
      </Row>
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

      {/* Tabs */}
      <Tabs
        activeKey={tab}
        onSelect={(k) => setTab(k)}
        className="mb-4 vianelo-tabs"
      >
        <Tab eventKey="activos" title={`🟢 Activos (${activos.length})`}>
          {OrdersGrid(activos)}
        </Tab>
        <Tab eventKey="historial" title={`⚫ Historial (${entregados.length})`}>
          {OrdersGrid(entregados)}
        </Tab>
      </Tabs>
    </Container>
  )
}
