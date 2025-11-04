import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() { 
  const [formData, setFormData] = useState({ email: '', password: '' });
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
    if (!formData.email) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    return newErrors;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setIsLoading(true);
    setAuthError('');

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/'); 
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      switch (error.code) {
        case 'auth/invalid-credential':
          setAuthError('Credenciales incorrectas');
          break;
        case 'auth/user-not-found':
          setAuthError('No existe una cuenta con este email');
          break;
        case 'auth/wrong-password':
          setAuthError('Contraseña incorrecta');
          break;
        case 'auth/too-many-requests':
          setAuthError('Demasiados intentos. Intenta más tarde');
          break;
        default:
          setAuthError('Error al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/'); 
    } catch (error) {
      console.error('Error con Google:', error);
      setAuthError('Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Iniciar Sesión</h2>
                <p className="text-muted">Bienvenido de vuelta</p>
              </div>

              {authError && <Alert variant="danger">{authError}</Alert>}

              <Form onSubmit={handleEmailLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    placeholder="Correo electrónico"
                  />
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    isInvalid={!!errors.password}
                    placeholder="Contraseña"
                  />
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-2 mb-3" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" /> Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </Form>

              <div className="text-center mb-3 text-muted">o</div>

              <Button
                variant="outline-danger"
                className="w-100 py-2 mb-3"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <i className="bi bi-google me-2"></i> Continuar con Google
              </Button>

              <div className="text-center">
                <p className="mb-0">
                  ¿No tienes cuenta?{' '}
                  <Link to="/register" className="text-decoration-none fw-semibold text-primary">
                    Regístrate aquí
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
