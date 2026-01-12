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
  Tabs,
  Tab,
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
  pending: 'Enviado',
  enviado: 'Enviado',
  recibido: 'En preparación',
  listo: 'Listo para entregar',
  entregado: 'Entregado',
}

const STATUS_VARIANT = {
  pending: 'secondary',
  enviado: 'secondary',
  recibido: 'info',
  listo: 'success',
  entregado: 'dark',
}

export default function SucursalOrdersPage() {
  const { branchId } = useParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [tab, setTab] = useState('activos')

  // 🔄 Escuchar órdenes de esta sucursal
  useEffect(() => {
    const cleanBranchId = (branchId || '').trim()
    if (!cleanBranchId) return

    const q = query(
      collection(db, 'orders'),
      where('branchId', '==', cleanBranchId),
      orderBy('createdAt', 'asc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setOrders(list)
      setLoading(false)
    })

    return () => unsub()
  }, [branchId])

  // =========================
  // 🔁 CAMBIOS DE ESTADO
  // =========================
  async function updateStatus(order, status, extra = {}) {
    setBusyId(order.id)
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status,
        ...extra,
      })
    } catch (e) {
      console.error(e)
      alert('No se pudo actualizar el pedido.')
    } finally {
      setBusyId(null)
    }
  }

  const activos = orders.filter((o) => o.status !== 'entregado')
  const entregados = orders.filter((o) => o.status === 'entregado')

  // Nombre bonito de la sucursal
  const cleanBranchId = (branchId || '').trim()
  const titleBranch =
      cleanBranchId === 'quintas'
      ? 'Vianelo Quintas'
      : cleanBranchId === 'chapule'
      ? 'Vianelo Chapule'
      : cleanBranchId || 'Sucursal'

  function OrdersGrid(list) {
    if (list.length === 0) {
      return <p className="text-white-50">No hay pedidos.</p>
    }

    return (
      <Row className="g-3">
        {list.map((order) => (
          <Col md={6} lg={4} key={order.id}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between mb-2">
                  <div>
                    <Card.Title className="mb-0">
                      Pedido #{order.id.slice(-6)}
                    </Card.Title>
                    <small className="text-muted">
                      Cliente: {order.userName || '—'}
                    </small>
                  </div>

                  <Badge bg={STATUS_VARIANT[order.status]}>
                    {STATUS_LABELS[order.status]}
                  </Badge>
                </div>

                <div className="mb-2">
                  {order.items?.map((it, i) => (
                    <div key={i} className="small">
                      {it.qty}× {it.name}
                    </div>
                  ))}
                </div>

                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <strong>
                    Total: ${Number(order.total || 0).toFixed(2)}
                  </strong>

                  <div className="d-flex gap-2">
                    {(order.status === 'enviado' ||
                      order.status === 'pending') && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        disabled={busyId === order.id}
                        onClick={() =>
                          updateStatus(order, 'recibido', {
                            receivedAt: serverTimestamp(),
                          })
                        }
                      >
                        Pedido recibido
                      </Button>
                    )}

                    {order.status === 'recibido' && (
                      <Button
                        size="sm"
                        variant="success"
                        disabled={busyId === order.id}
                        onClick={() =>
                          updateStatus(order, 'listo', {
                            readyAt: serverTimestamp(),
                          })
                        }
                      >
                        Pedido listo
                      </Button>
                    )}

                    {order.status === 'listo' && (
                      <Button
                        size="sm"
                        variant="dark"
                        disabled={busyId === order.id}
                        onClick={() =>
                          updateStatus(order, 'entregado', {
                            deliveredAt: serverTimestamp(),
                          })
                        }
                      >
                        Entregado ✅
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  return (
    <Container className="py-4 min-vh-100">
      <h2 className="text-light mb-2">
        Pedidos sucursal: {titleBranch}
      </h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Tabs
            activeKey={tab}
            onSelect={(k) => setTab(k)}
            className="mb-4 vianelo-tabs"
          >
          <Tab eventKey="activos" title={`🟢 Activos (${activos.length})`}>
            {OrdersGrid(activos)}
          </Tab>

          <Tab
            eventKey="entregados"
            title={`⚫ Entregados (${entregados.length})`}
          >
            {OrdersGrid(entregados)}
          </Tab>
        </Tabs>
      )}
    </Container>
  )
}
