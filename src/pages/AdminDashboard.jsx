import { useState, useEffect, useMemo } from 'react'
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
} from 'react-bootstrap'
import { useProducts } from '../hooks/useProducts'
import ProductEditor from '../components/ProductEditor'
import InventoryBadge from '../components/InventoryBadge'

// 👇 Firestore
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
  // 📊 REPORTE DE VENTAS (Firestore)
  // ===============================
  const [showReport, setShowReport] = useState(false)
  const [sales, setSales] = useState([])
  const [loadingSales, setLoadingSales] = useState(false)

  // ✅ Filtros por fecha (inputs)
  const [fromDate, setFromDate] = useState('') // yyyy-mm-dd
  const [toDate, setToDate] = useState('') // yyyy-mm-dd
  const [appliedRange, setAppliedRange] = useState({ from: '', to: '' })

  // ===============================
  // Helpers fechas y agrupación
  // ===============================
  function startOfDayLocal(dateStr) {
    // dateStr: 'YYYY-MM-DD'
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

  // ===============================
  // Cargar ventas (con filtro opcional Firestore)
  // ===============================
  useEffect(() => {
    async function loadSales() {
      setLoadingSales(true)
      try {
        const base = collection(db, 'sales')

        // Si hay filtro aplicado, lo metemos al query
        const clauses = []

        if (appliedRange.from) {
          const fromTs = Timestamp.fromDate(startOfDayLocal(appliedRange.from))
          clauses.push(where('date', '>=', fromTs))
        }

        if (appliedRange.to) {
          // usamos " < inicio del día siguiente" para incluir todo el día 'to'
          const toNextTs = Timestamp.fromDate(nextDayStartLocal(appliedRange.to))
          clauses.push(where('date', '<', toNextTs))
        }

        const q = query(base, ...clauses, orderBy('date', 'desc'))

        const snap = await getDocs(q)
        setSales(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingSales(false)
      }
    }

    if (showReport) loadSales()
  }, [showReport, appliedRange.from, appliedRange.to])

  // ✅ Agrupar ventas por día (ya filtradas desde Firestore)
  const salesDaysSorted = useMemo(() => {
    const salesByDay = sales.reduce((acc, sale) => {
      const key = formatDayKey(sale.date)
      if (!acc[key]) acc[key] = { dayKey: key, total: 0, orders: 0, sales: [] }

      acc[key].sales.push(sale)
      acc[key].orders += 1
      acc[key].total += Number(sale.total || 0)

      return acc
    }, {})

    return Object.values(salesByDay).sort((a, b) => b.dayKey.localeCompare(a.dayKey))
  }, [sales])

  const grandTotal = useMemo(() => {
    return sales.reduce((sum, s) => sum + Number(s.total || 0), 0)
  }, [sales])

  const grandOrders = sales.length

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

  // ⭐ Destacados
  async function handleToggleFeatured(p) {
    if (busy) return
    setBusy(true)
    try {
      await updateDoc(doc(db, 'products', p.id), {
        featured: !p.featured,
      })

      setFeedback({
        type: 'success',
        msg: !p.featured
          ? `“${p.name}” ahora está en Destacados.`
          : `“${p.name}” se quitó de Destacados.`,
      })
    } catch {
      setFeedback({
        type: 'danger',
        msg: 'No se pudo cambiar el estado de destacado.',
      })
    } finally {
      setBusy(false)
    }
  }

  // ✅ Acciones del filtro
  function applyDateFilter(e) {
    e?.preventDefault?.()

    // validación simple (si from > to, intercambiamos)
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
    <Container className="py-4 admin-bg min-vh-100">
      {/* 🧭 ENCABEZADO */}
      <Row className="mb-3 align-items-center">
        <Col>
          <h2 className="admin-title">Panel de administración</h2>
          <p className="m-0 admin-subtitle">Gestiona los productos del menú y su inventario.</p>
        </Col>
        <Col className="text-end">
          <Button onClick={openNew} disabled={busy} className="btn-admin-primary me-2">
            Nuevo producto
          </Button>

          <Button variant="outline-secondary" onClick={() => setShowReport(!showReport)}>
            {showReport ? 'Ocultar reporte' : 'Ver reporte de ventas'}
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

      {/* 📊 REPORTE DE VENTAS */}
      {showReport && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="align-items-center mb-3">
              <Col>
                <h4 className="mb-1">Reporte de ventas</h4>
                <div className="text-muted">
                  Rango: <strong>{formatRangeLabel(appliedRange.from, appliedRange.to)}</strong>
                </div>
              </Col>
              <Col md="6">
                {/* ✅ Filtro por fecha */}
                <Form onSubmit={applyDateFilter} className="d-flex gap-2 justify-content-end">
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

                  <div className="d-flex align-items-end gap-2">
                    <Button type="submit" variant="primary" disabled={loadingSales}>
                      Aplicar
                    </Button>
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

            {/* ✅ Resumen general */}
            <Card className="mb-3" style={{ background: '#fafafa' }}>
              <Card.Body className="py-3">
                <Row>
                  <Col>
                    <div className="text-muted">Órdenes</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{grandOrders}</div>
                  </Col>
                  <Col>
                    <div className="text-muted">Total</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>
                      ${Number(grandTotal).toFixed(2)}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {loadingSales ? (
              <p>Cargando ventas...</p>
            ) : sales.length === 0 ? (
              <p>No hay ventas registradas en ese rango.</p>
            ) : (
              <Accordion alwaysOpen>
                {salesDaysSorted.map((day, idx) => (
                  <Accordion.Item eventKey={String(idx)} key={day.dayKey}>
                    {/* ✅ Header por día */}
                    <Accordion.Header>
                      <div className="w-100 d-flex justify-content-between align-items-center pe-3">
                        <div>
                          <strong>📅 {formatDayLabel(day.dayKey)}</strong>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            Órdenes: {day.orders}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12 }} className="text-muted">
                            Total del día
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>
                            ${day.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </Accordion.Header>

                    {/* ✅ Detalle colapsable */}
                    <Accordion.Body>
                      {day.sales.map((sale) => (
                        <div
                          key={sale.id}
                          style={{
                            background: '#fff',
                            border: '1px solid #eee',
                            borderRadius: 12,
                            padding: 12,
                            marginBottom: 12,
                          }}
                        >
                          <Row className="align-items-center">
                            <Col>
                              <div className="text-muted" style={{ fontSize: 12 }}>
                                Hora
                              </div>
                              <div style={{ fontWeight: 600 }}>
                                {sale.date?.toDate
                                  ? sale.date.toDate().toLocaleTimeString()
                                  : ''}
                              </div>
                            </Col>
                            <Col className="text-end">
                              <div className="text-muted" style={{ fontSize: 12 }}>
                                Total
                              </div>
                              <div style={{ fontWeight: 800, fontSize: 16 }}>
                                ${Number(sale.total || 0).toFixed(2)}
                              </div>
                            </Col>
                          </Row>

                          <div className="mt-2">
                            <div className="text-muted" style={{ fontSize: 12 }}>
                              Productos
                            </div>
                            <ul className="mb-0">
                              {(sale.items || []).map((item) => (
                                <li key={item.id}>
                                  {item.name} x {item.quantity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </Card.Body>
        </Card>
      )}

      {/* 📦 TABLA DE PRODUCTOS */}
      <Card className="shadow-sm admin-card">
        <Card.Body>
          {loading ? (
            <div>Cargando...</div>
          ) : error ? (
            <Alert variant="danger">Ocurrió un error cargando productos.</Alert>
          ) : (
            <Table responsive hover className="admin-table">
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
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          style={{
                            width: 72,
                            height: 72,
                            objectFit: 'cover',
                            borderRadius: 8,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 72,
                            height: 72,
                            background: '#eee',
                            borderRadius: 8,
                          }}
                        />
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>{p.category || '-'}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>
                      <InventoryBadge stock={p.stock} />
                    </td>
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
