import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Container,
  Row,
  Table,
  Alert,
  Form,
  Accordion,
  Stack,
  Badge,
} from 'react-bootstrap'
import { useProducts } from '../hooks/useProducts'
import ProductEditor from '../components/ProductEditor'
import InventoryBadge from '../components/InventoryBadge'

import {
  doc,
  updateDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../services/firebase'

export default function AdminDashboard() {
  const { products, loading, error, createProduct, updateProduct, removeProduct } =
    useProducts()

  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // ===============================
  // 📊 REPORTE DE VENTAS
  // ===============================
  const [showReport, setShowReport] = useState(false)
  const [sales, setSales] = useState([])
  const [loadingSales, setLoadingSales] = useState(false)
  const [salesError, setSalesError] = useState(null)

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [appliedRange, setAppliedRange] = useState({ from: '', to: '' })

  function startOfDayLocal(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d, 0, 0, 0, 0)
  }

  function nextDayStartLocal(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d + 1, 0, 0, 0, 0)
  }

  function formatDayKey(ts) {
    const d = ts?.toDate ? ts.toDate() : ts instanceof Date ? ts : null
    if (!d) return 'Sin fecha'
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  function formatDayLabel(dayKey) {
    if (dayKey === 'Sin fecha') return dayKey
    const [y, m, d] = dayKey.split('-')
    return `${d}/${m}/${y}`
  }

  function formatRangeLabel(from, to) {
    if (!from && !to) return 'Todas'
    if (from && !to) return `Desde ${formatDayLabel(from)}`
    if (!from && to) return `Hasta ${formatDayLabel(to)}`
    return `${formatDayLabel(from)} - ${formatDayLabel(to)}`
  }

  useEffect(() => {
    async function loadSales() {
      setLoadingSales(true)
      setSalesError(null)

      try {
        const base = collection(db, 'sales')
        const clauses = []

        if (appliedRange.from) {
          const fromTs = Timestamp.fromDate(startOfDayLocal(appliedRange.from))
          clauses.push(where('date', '>=', fromTs))
        }

        if (appliedRange.to) {
          const toNext = Timestamp.fromDate(nextDayStartLocal(appliedRange.to))
          clauses.push(where('date', '<', toNext))
        }

        const q = query(base, ...clauses, orderBy('date', 'desc'))
        const snap = await getDocs(q)
        setSales(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (e) {
        console.error('🔥 Error cargando sales:', e)
        setSalesError(e?.message || 'Error cargando ventas.')
        setSales([])
      } finally {
        setLoadingSales(false)
      }
    }

    if (showReport) loadSales()
  }, [showReport, appliedRange.from, appliedRange.to])

  const salesDaysSorted = useMemo(() => {
    const grouped = sales.reduce((acc, sale) => {
      const key = formatDayKey(sale.date)
      if (!acc[key]) acc[key] = { dayKey: key, total: 0, orders: 0, sales: [] }
      acc[key].sales.push(sale)
      acc[key].orders += 1
      acc[key].total += Number(sale.total || 0)
      return acc
    }, {})
    return Object.values(grouped).sort((a, b) => b.dayKey.localeCompare(a.dayKey))
  }, [sales])

  const grandTotal = useMemo(
    () => sales.reduce((sum, s) => sum + Number(s.total || 0), 0),
    [sales]
  )

  function openNew() {
    setEditing(null)
    setShow(true)
  }

  function openEdit(p) {
    setEditing(p)
    setShow(true)
  }

  function close() {
    setShow(false)
  }

  async function handleCreate(data, file) {
    setBusy(true)
    try {
      await createProduct(data, file)
      setFeedback({ type: 'success', msg: 'Producto creado correctamente.' })
      close()
    } catch {
      setFeedback({ type: 'danger', msg: 'No se pudo crear el producto.' })
    } finally {
      setBusy(false)
    }
  }

  async function handleUpdate(data, file) {
    if (!editing) return
    setBusy(true)
    try {
      await updateProduct(editing.id, data, file, editing.imagePath)
      setFeedback({ type: 'success', msg: 'Producto actualizado.' })
      close()
    } catch {
      setFeedback({ type: 'danger', msg: 'No se pudo actualizar el producto.' })
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(p) {
    if (!window.confirm(`¿Eliminar "${p.name}"? Esta acción es permanente.`)) return
    setBusy(true)
    try {
      await removeProduct(p.id, p.imagePath)
      setFeedback({ type: 'success', msg: 'Producto eliminado.' })
    } catch {
      setFeedback({ type: 'danger', msg: 'No se pudo eliminar el producto.' })
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleFeatured(p) {
    if (busy) return
    setBusy(true)
    try {
      await updateDoc(doc(db, 'products', p.id), { featured: !p.featured })
      setFeedback({
        type: 'success',
        msg: !p.featured
          ? `“${p.name}” ahora está en Destacados.`
          : `“${p.name}” se quitó de Destacados.`,
      })
    } catch {
      setFeedback({ type: 'danger', msg: 'No se pudo cambiar destacado.' })
    } finally {
      setBusy(false)
    }
  }

  function applyDateFilter(e) {
    e?.preventDefault?.()
    if (fromDate && toDate && fromDate > toDate) {
      setAppliedRange({ from: toDate, to: fromDate })
      return
    }
    setAppliedRange({ from: fromDate, to: toDate })
  }

  function clearDateFilter() {
    setFromDate('')
    setToDate('')
    setAppliedRange({ from: '', to: '' })
  }

  return (
    <Container className="py-3 py-md-4 admin-wrap min-vh-100">
      {/* Header */}
      <Row className="g-2 align-items-start align-items-md-center mb-3">
        <Col xs={12} md>
          <h2 className="admin-title mb-1">Panel de administración</h2>
          <p className="m-0 admin-subtitle">
            Gestiona productos, inventario y reporte de ventas.
          </p>
        </Col>

        <Col xs={12} md="auto" className="admin-actions d-grid d-md-flex gap-2">
          <Button
            onClick={openNew}
            disabled={busy}
            className="btn-admin-white"
          >
            + Nuevo producto
          </Button>

          <Button
            onClick={() => setShowReport(!showReport)}
            className="btn-admin-white"
          >
            {showReport ? 'Ocultar reporte' : 'Ver reporte'}
          </Button>
        </Col>
      </Row>

      {feedback && (
        <Alert
          variant={feedback.type}
          dismissible
          onClose={() => setFeedback(null)}
          className="mb-3"
        >
          {feedback.msg}
        </Alert>
      )}

      {/* Reporte */}
      {showReport && (
        <Card className="mb-3 mb-md-4 shadow-sm admin-card">
          <Card.Body>
            <Row className="g-2 align-items-end mb-3">
              <Col xs={12} md>
                <h4 className="mb-1">Reporte de ventas</h4>
                <div className="text-muted">
                  Rango: <strong>{formatRangeLabel(appliedRange.from, appliedRange.to)}</strong>
                </div>
              </Col>

              <Col xs={12} md="auto">
                <Form onSubmit={applyDateFilter} className="admin-filter">
                  <Form.Group>
                    <Form.Label className="mb-1">Desde</Form.Label>
                    <Form.Control
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="mb-1">Hasta</Form.Label>
                    <Form.Control
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </Form.Group>

                  <div className="admin-filter-actions">
                    <Button type="submit" disabled={loadingSales}>Aplicar</Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={clearDateFilter}
                      disabled={loadingSales}
                    >
                      Limpiar
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>

            {salesError && <Alert variant="danger">{salesError}</Alert>}

            <Row className="g-2 mb-3">
              <Col xs={6} md={3}>
                <Card className="admin-metric">
                  <Card.Body>
                    <div className="text-muted small">Órdenes</div>
                    <div className="admin-metric-value">{sales.length}</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={3}>
                <Card className="admin-metric">
                  <Card.Body>
                    <div className="text-muted small">Total</div>
                    <div className="admin-metric-value">
                      ${Number(grandTotal).toFixed(2)}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {loadingSales ? (
              <p className="mb-0">Cargando ventas...</p>
            ) : sales.length === 0 ? (
              <p className="mb-0">No hay ventas registradas en ese rango.</p>
            ) : (
              <Accordion alwaysOpen>
                {salesDaysSorted.map((day, idx) => (
                  <Accordion.Item eventKey={String(idx)} key={day.dayKey}>
                    <Accordion.Header>
                      <div className="w-100 d-flex justify-content-between align-items-center pe-3">
                        <div>
                          <strong>📅 {formatDayLabel(day.dayKey)}</strong>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            Órdenes: {day.orders}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            Total del día
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800 }}>
                            ${day.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </Accordion.Header>

                    <Accordion.Body>
                      <Stack gap={2}>
                        {day.sales.map((sale) => (
                          <Card key={sale.id} className="border-0 shadow-sm">
                            <Card.Body className="py-2">
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="text-muted small">
                                  {sale.date?.toDate ? sale.date.toDate().toLocaleTimeString() : ''}
                                </div>
                                <Badge bg="light" text="dark" className="fw-bold">
                                  ${Number(sale.total || 0).toFixed(2)}
                                </Badge>
                              </div>

                              <div className="mt-2">
                                <div className="text-muted small mb-1">Productos</div>
                                <ul className="mb-0 ps-3 small">
                                  {(sale.items || []).map((item, i) => (
                                    <li key={item.id || i}>
                                      {item.name} x {item.quantity ?? item.qty ?? 0}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                      </Stack>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Productos */}
      <Card className="shadow-sm admin-card">
        <Card.Body>
          {loading ? (
            <div>Cargando...</div>
          ) : error ? (
            <Alert variant="danger">Ocurrió un error cargando productos.</Alert>
          ) : (
            <>
              {/* Tabla (md+) */}
              <div className="d-none d-md-block">
                <Table responsive hover className="admin-table align-middle">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Inventario</th>
                      <th>Destacado</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td style={{ width: 96 }}>
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="admin-thumb" />
                          ) : (
                            <div className="admin-thumb placeholder" />
                          )}
                        </td>
                        <td className="fw-semibold">{p.name}</td>
                        <td>{p.category || '-'}</td>
                        <td>${Number(p.price).toFixed(2)}</td>
                        <td><InventoryBadge stock={p.stock} /></td>
                        <td>
                          <Form.Check
                            type="switch"
                            label={p.featured ? 'Sí' : 'No'}
                            checked={!!p.featured}
                            onChange={() => handleToggleFeatured(p)}
                            disabled={busy}
                          />
                        </td>
                        <td>{p.isActive ? 'Activo' : 'Oculto'}</td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="me-2"
                            onClick={() => openEdit(p)}
                            disabled={busy}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(p)}
                            disabled={busy}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Cards (xs-sm) */}
              <div className="d-md-none">
                <Stack gap={2}>
                  {products.map((p) => (
                    <Card key={p.id} className="border-0 shadow-sm">
                      <Card.Body>
                        <div className="d-flex gap-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="admin-thumb" />
                          ) : (
                            <div className="admin-thumb placeholder" />
                          )}

                          <div className="flex-grow-1">
                            <div className="fw-semibold">{p.name}</div>
                            <div className="text-muted small">
                              {p.category || '-'} • ${Number(p.price).toFixed(2)}
                            </div>

                            <div className="mt-2 d-flex flex-wrap gap-2 align-items-center">
                              <InventoryBadge stock={p.stock} />
                              <Badge bg={p.isActive ? 'success' : 'secondary'}>
                                {p.isActive ? 'Activo' : 'Oculto'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 d-flex justify-content-between align-items-center">
                          <Form.Check
                            type="switch"
                            label={p.featured ? 'Destacado: Sí' : 'Destacado: No'}
                            checked={!!p.featured}
                            onChange={() => handleToggleFeatured(p)}
                            disabled={busy}
                          />

                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => openEdit(p)}
                              disabled={busy}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(p)}
                              disabled={busy}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </Stack>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      <ProductEditor
        show={show}
        onClose={close}
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing}
      />
    </Container>
  )
}
