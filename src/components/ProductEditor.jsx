import { useEffect, useState } from 'react'
import { Button, Form, Modal, Row, Col } from 'react-bootstrap'

export default function ProductEditor({ show, onClose, onSubmit, initial }) {
  const [form, setForm] = useState({
    name: '', description: '', category: '', price: 0, stock: 0, isActive: true
  })
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        description: initial.description || '',
        category: initial.category || '',
        price: initial.price || 0,
        stock: initial.stock || 0,
        isActive: initial.isActive ?? true,
      })
      setFile(null)
    } else {
      setForm({ name: '', description: '', category: '', price: 0, stock: 0, isActive: true })
      setFile(null)
    }
  }, [initial])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form, file)
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{initial ? 'Editar producto' : 'Nuevo producto'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre</Form.Label>
                <Form.Control name="name" value={form.name} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Categoría</Form.Label>
                <Form.Control name="category" value={form.category} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Descripción</Form.Label>
                <Form.Control as="textarea" rows={2} name="description" value={form.description} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Precio (MXN)</Form.Label>
                <Form.Control type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Stock</Form.Label>
                <Form.Control type="number" name="stock" value={form.stock} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Imagen</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Check type="switch" id="isActive" label="Activo / Visible" name="isActive" checked={form.isActive} onChange={handleChange} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
