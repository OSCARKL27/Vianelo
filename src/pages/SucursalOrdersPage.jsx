import { useEffect, useMemo, useState } from 'react'
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

function normalizeStatus(value) {
  return String(value || 'pending').trim().toLowerCase()
}

export default function SucursalOrdersPage() {
  const { branchId } = useParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [tab, setTab] = useState('activos')

  useEffect(() => {
    const cleanBranchId = (branchId || '').trim()
    if (!cleanBranchId) return

    const q = query(
      collection(db, 'orders'),
      where('branchId', '==', cleanBranchId),
      orderBy('createdAt', 'asc')
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setOrders(list)
        setLoading(false)

        // ✅ DEBUG en consola: aquí verás los statuses reales
        console.log(
          'ORDERS:',
          list.map((o) => ({
            id: o.id.slice(-6),
            branchId: o.branchId,
            status: o.status,
            normalized: normalizeStatus(o.status),
          }))
        )
      },
      (err) => {
        console.error('Error escuchando órdenes', err)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [branchId])

  async function updateStatus(order, status, extra = {}) {
    setBusyId(order.id)
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status,
        updatedAt: serverTimestamp(),
        ...extra,
      })
    } catch (e) {
      console.error(e)
      alert('No se pudo actualizar el pedido.')
    } finally {
      setBusyId(null)
    }
  }

  const activos = useMemo(
    () => orders.filter((o) => normalizeStatus(o.status) !== 'entregado'),
    [orders]
  )
  const entregados = useMemo(
    () => orders.filter((o) => normalizeStatus(o.status) === 'entregado'),
    [orders]
  )

  const cleanBranchId = (branchId || '').trim()
  const titleBranch =
    cleanBranchId === 'quintas'
      ? 'Vianelo Quintas'
      : cleanBranchId === 'chapule'
      ? 'Vianelo Chapule'
      : cleanBranchId || 'Sucursal'

  function OrdersGrid(list) {
    if (list.length === 0) return <p className="text-white-50">No hay pedidos.</p>

    return (
      <Row className="g-3">
        {list.map((order) => {
          const st = normalizeStatus(order.status)
          const label = STATUS_LABELS[st] || st
          const variant = STATUS_VARIANT[st] || 'secondary'

          return (
            <Col md={6} lg={4} key={order.id}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <Card.Title className="mb-0">
                        Pedido #{order.id.slice(-6)}
                      </Card.Title>

                      <small className="text-muted d-block">
                        Cliente: {order.userName || '—'}
                      </small>

                      {/* ✅ DEBUG visual para saber el status REAL */}
                      <small className="text-muted d-block">
                        status real: <b>{String(order.status)}</b> → st: <b>{st}</b>
                      </small>
                    </div>

                    <Badge bg={variant}>{label}</Badge>
                  </div>

                  <div className="mb-2">
                    {order.items?.map((it, i) => (
                      <div key={i} className="small">
                        {it.qty}× {it.name}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <strong>Total: ${Number(order.total || 0).toFixed(2)}</strong>

                    <div className="d-flex gap-2">
                      {(st === 'enviado' || st === 'pending') && (
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
                          {busyId === order.id ? 'Guardando...' : 'Pedido recibido'}
                        </Button>
                      )}

                      {st === 'recibido' && (
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
                          {busyId === order.id ? 'Guardando...' : 'Pedido listo'}
                        </Button>
                      )}

                      {st === 'listo' && (
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
                          {busyId === order.id ? 'Guardando...' : 'Entregado ✅'}
                        </Button>
                      )}

                      {/* ✅ EXTRA: si el status no está en tu flujo, al menos te deja llevarlo a "recibido" */}
                      {!['pending','enviado','recibido','listo','entregado'].includes(st) && (
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          disabled={busyId === order.id}
                          onClick={() => updateStatus(order, 'recibido', { receivedAt: serverTimestamp() })}
                        >
                          Forzar a recibido
                        </Button>
                      )}
                    </div>
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
      <h2 className="text-light mb-2">Pedidos sucursal: {titleBranch}</h2>

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

          <Tab eventKey="entregados" title={`⚫ Entregados (${entregados.length})`}>
            {OrdersGrid(entregados)}
          </Tab>
        </Tabs>
      )}
    </Container>
  )
}
