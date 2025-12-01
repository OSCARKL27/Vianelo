import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
} from 'react-bootstrap'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../services/firebase'

const STATUS_LABELS = {
  enviado: 'Enviado',
  recibido: 'En preparación',
  listo: 'Listo para entregar',
  entregado: 'Entregado',
}

const STATUS_VARIANT = {
  enviado: 'secondary',
  recibido: 'info',
  listo: 'success',
  entregado: 'dark',
}

export default function SucursalOrdersPage() {
  const { branchId } = useParams() // viene de la URL: /sucursal/:branchId
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  // 🔄 Escuchar órdenes de esta sucursal en tiempo real
  useEffect(() => {
    if (!branchId) return

    const q = query(
      collection(db, 'orders'),
      where('branch', '==', branchId),
      orderBy('createdAt', 'asc')
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setOrders(list)
        setLoading(false)
      },
      (err) => {
        console.error('Error escuchando órdenes', err)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [branchId])

  // 👉 Marcar como "recibido"
  async function markReceived(order) {
    setBusyId(order.id)
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'recibido',
        receivedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('Error al marcar recibido', e)
      alert('No se pudo marcar como recibido.')
    } finally {
      setBusyId(null)
    }
  }

  // 👉 Marcar como "listo"
  async function markReady(order) {
    setBusyId(order.id)
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'listo',
        readyAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('Error al marcar listo', e)
      alert('No se pudo marcar como listo.')
    } finally {
      setBusyId(null)
    }
  }

  const titleBranch =
    branchId === 'quintas'
      ? 'Vianelo Quintas'
      : branchId === 'tres-rios'
      ? 'Vianelo Tres Ríos'
      : branchId

  return (
    <Container className="py-4 min-vh-100">
      <Row className="mb-3">
        <Col>
          <h2 className="text-light">Pedidos sucursal: {titleBranch}</h2>
          <p className="text-white-50 m-0">
            Aquí el personal puede recibir y marcar los pedidos como listos.
          </p>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-white-50">No hay pedidos para esta sucursal.</p>
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
                        Cliente: {order.userName || '—'}
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
                    <strong>Total: ${Number(order.total || 0).toFixed(2)}</strong>

                    <div className="d-flex gap-2">
                      {order.status === 'enviado' && (
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => markReceived(order)}
                          disabled={busyId === order.id}
                        >
                          {busyId === order.id ? 'Guardando...' : 'Pedido recibido'}
                        </Button>
                      )}

                      {order.status === 'recibido' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => markReady(order)}
                          disabled={busyId === order.id}
                        >
                          {busyId === order.id ? 'Guardando...' : 'Pedido listo'}
                        </Button>
                      )}
                    </div>
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
