import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { auth, createUserWithEmailAndPassword, db } from '../services/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // ✅ para guardar en Firestore

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setAuthError('');
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.username.trim()) newErrors.username = 'El nombre de usuario es requerido';
    if (!formData.email) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    else if (formData.password.length < 6) newErrors.password = 'Debe tener al menos 6 caracteres';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirma tu contraseña';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    return newErrors;
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setIsLoading(true);
    setAuthError('');

    try {
      // ✅ 1. Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // ✅ 2. Guardar nombre en el perfil de Auth
      await updateProfile(user, {
        displayName: formData.username // usamos el username como displayName
      });

      // ✅ 3. Guardar información adicional en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        createdAt: new Date()
      });

      Swal.fire({
        icon: 'success',
        title: `¡Bienvenido, ${formData.username}! 🎉`,
        text: 'Tu cuenta ha sido creada con éxito.',
        confirmButtonColor: '#007bff',
        confirmButtonText: 'Ir al inicio',
        background: '#fefefe',
        color: '#333',
        customClass: { popup: 'rounded-4 shadow-lg' }
      }).then(() => {
        navigate('/');
      });
    } catch (error) {
      console.error(error);
      setAuthError('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-5">
             <div className="text-center mb-4">
             <h2 className="fw-bold" style={{ color: "#E65847" }}>Crear Cuenta</h2>
             <p style={{ color: "#333" }}>Únete a nuestra comunidad</p>
             </div>

              
              {authError && <Alert variant="danger">{authError}</Alert>}

              <Form onSubmit={handleEmailRegister}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre completo</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.name}
                    placeholder="Nombre completo"
                  />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nombre de usuario</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    isInvalid={!!errors.username}
                    placeholder="Usuario" />
                  <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    placeholder="tu@email.com"
                  />
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    isInvalid={!!errors.password}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirmar contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    isInvalid={!!errors.confirmPassword}
                    placeholder="Repite tu contraseña"
                  />
                  <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                </Form.Group>

               <Button
                variant="primary"
                type="submit"
                className="w-100 py-2 mb-3 rounded-3"
                style={{ backgroundColor: "#333", borderColor: "#E65847", color: "white" }}
                disabled={isLoading}
                >
                {isLoading ? (
                 <>
                <Spinner as="span" animation="border" size="sm" className="me-2" /> Creando cuenta...
                </>
                 ) : (
                'Crear Cuenta'
                   )}
              </Button>

              </Form>

              <div className="text-center">
                <p className="mb-0">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: "#E65847" }}>
                   Inicia sesión aquí
                  </Link>

                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
