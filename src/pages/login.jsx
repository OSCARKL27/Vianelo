import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Login() { 
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate(); 

  // Manejo de inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setAuthError('');
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Validar campos básicos
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    return newErrors;
  };

  // ✔ Redirección según el rol en Firestore (colección roles)
  async function redirectByRole(user) {
    try {
      const snap = await getDoc(doc(db, 'roles', user.uid));
      const data = snap.data() || {}; // si no existe, usuario es normal

      console.log("ROLE DATA:", data);

      if (data.role === 'admin') {
        navigate('/admin');
      } 
      else if (data.role === 'branch' && data.branchId) {
        navigate(`/sucursal/${data.branchId}`);
      } 
      else {
        navigate('/'); // usuario normal
      }

    } catch (err) {
      console.error('Error leyendo rol del usuario:', err);
      navigate('/'); 
    }
  }

  // ✔ Login con email y contraseña
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setIsLoading(true);
    setAuthError('');

    try {
      const cred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = cred.user;

      await redirectByRole(user); // 👈 redirige según rol

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

  // ✔ Login con Google (opcional)
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError('');

    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;

      // Crear doc en roles si no existe
      const ref = doc(db, 'roles', user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          role: 'user',
          createdAt: new Date(),
        });
      }

      await redirectByRole(user);

    } catch (error) {
      console.error('Error con Google:', error);
      setAuthError('Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center login-bg">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow-lg border-0 login-card">
            <Card.Body className="p-5">

              <div className="text-center mb-4">
                <h2 className="fw-bold login-title">Iniciar Sesión</h2>
                <p className="login-subtitle">Bienvenido de vuelta</p>
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
                </Form.Group>
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>

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
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button 
                  type="submit" 
                  className="w-100 py-2 mb-3 btn-login" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" /> 
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </Form>

              <div className="text-center mb-3 divider-text">o</div>

              <Button
                className="w-100 py-2 mb-3 btn-google"
                variant="outline-danger"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <i className="bi bi-google me-2"></i> Continuar con Google
              </Button>

              <div className="text-center">
                <p className="mb-0">
                  ¿No tienes cuenta?{' '}
                  <Link to="/register" className="text-decoration-none login-link">
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
