import { useState } from 'react'
import { Button, Card, Col, Container, Row, Table, Alert, Form } from 'react-bootstrap'
import { useProducts } from '../hooks/useProducts'
import ProductEditor from '../components/ProductEditor'
import InventoryBadge from '../components/InventoryBadge'

// 👇 importa Firestore
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase' // ajusta la ruta si tu archivo se llama diferente

export default function AdminDashboard() {
  const {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    removeProduct
  } = useProducts()

  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)

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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
      setFeedback({ type: 'danger', msg: 'No se pudo eliminar el producto.' })
    } finally {
      setBusy(false)
    }
  }

  // ⭐ Nuevo: marcar / desmarcar como destacado
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
    } catch (e) {
      console.error(e)
      setFeedback({
        type: 'danger',
        msg: 'No se pudo cambiar el estado de destacado.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Container className="py-4 admin-bg min-vh-100">
      <Row className="mb-3 align-items-center">
        <Col>
          <h2 className="admin-title">Panel de administración</h2>
          <p className="m-0 admin-subtitle">
            Gestiona los productos del menú y su inventario.
          </p>
        </Col>
        <Col className="text-end">
          <Button
            onClick={openNew}
            disabled={busy}
            className="btn-admin-primary"
          >
            Nuevo producto
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

      <Card className="shadow-sm admin-card">
        <Card.Body>
          {loading ? (
            <div>Cargando...</div>
          ) : error ? (
            <Alert variant="danger">
              Ocurrió un error cargando productos.
            </Alert>
          ) : (
            <Table responsive hover className="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Inventario</th>
                  <th>Destacado</th> {/* 👈 nueva columna */}
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
                          onError={(e) => {
                            console.warn('Imagen no carga, url:', p.imageUrl)
                            e.currentTarget.src = '/placeholder.jpg'
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

                    {/* ⭐ Toggle de Destacados */}
                    <td>
                      <Form.Check
                        type="switch"
                        id={`featured-${p.id}`}
                        label={p.featured ? 'Sí' : 'No'}
                        checked={!!p.featured}
                        onChange={() => handleToggleFeatured(p)}
                        disabled={busy}
                      />
                    </td>

                    <td className="admin-status">
                      {p.isActive ? 'Activo' : 'Oculto'}
                    </td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2 btn-admin-secondary"
                        onClick={() => openEdit(p)}
                        disabled={busy}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="btn-admin-danger"
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
