import { useState } from 'react'
import { Button, Card, Col, Container, Row, Table } from 'react-bootstrap'
import { useProducts } from '../hooks/useProducts'
import ProductEditor from '../components/ProductEditor'
import InventoryBadge from '../components/InventoryBadge'

export default function AdminDashboard() {
  const { products, loading, createProduct, updateProduct, removeProduct } = useProducts()
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(null)

  function openNew() { setEditing(null); setShow(true) }
  function openEdit(p) { setEditing(p); setShow(true) }
  function close() { setShow(false) }

  async function handleCreate(data, file) { await createProduct(data, file); close() }
  async function handleUpdate(data, file) { await updateProduct(editing.id, data, file, editing.imagePath); close() }

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h2>Panel de administración</h2>
          <p className="text-muted">Gestiona los productos del menú y su inventario.</p>
        </Col>
        <Col className="text-end">
          <Button onClick={openNew}>Nuevo producto</Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div>Cargando...</div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Inventario</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td style={{ width: 96 }}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} />
                      ) : (<div style={{ width:72, height:72, background:'#eee', borderRadius:8 }} />)}
                    </td>
                    <td>{p.name}</td>
                    <td>{p.category || '-'}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td><InventoryBadge stock={p.stock} /></td>
                    <td>{p.isActive ? 'Activo' : 'Oculto'}</td>
                    <td className="text-end">
                      <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(p)}>Editar</Button>
                      <Button size="sm" variant="outline-danger" onClick={() => removeProduct(p.id, p.imagePath)}>Eliminar</Button>
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
