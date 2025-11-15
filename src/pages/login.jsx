import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap'
import { Lock, User, Eye, EyeOff, Smartphone, ShieldCheck, Clock, Award } from 'lucide-react'

// URL del backend PHP - AJUSTAR SEGÚN TU CONFIGURACIÓN
const API_URL = 'http://localhost/megacell_backend'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    identificacion: '',
    contrasena: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para las cookies de sesión
        body: JSON.stringify({
          identificacion: formData.identificacion,
          contrasena: formData.contrasena,
          rememberMe: rememberMe
        })
      })

      const data = await response.json()

      if (data.success) {
        // Guardar información del usuario en localStorage para persistencia
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        
        if (onLogin) {
          onLogin(data.usuario)
        }

        // Redirigir según el rol del usuario
        // admin y trabajador -> dashboard
        // cliente -> home (/)
        if (data.redirectTo) {
          navigate(data.redirectTo)
        } else {
          navigate('/')
        }
      } else {
        setError(data.message || 'Error al iniciar sesión')
      }
    } catch (error) {
      console.error('Error de conexión:', error)
      setError('Error de conexión con el servidor. Por favor, intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '2rem 0'
    }}>
      <Container>
        <Row className="justify-content-center">
          {/* Formulario de Login */}
          <Col lg={5} md={7}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              {/* Header con gradiente */}
              <div style={{
                background: 'linear-gradient(135deg, #4C8BF5 0%, #5FC88F 100%)',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.1,
                  background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                }}></div>
                
                <Link to="/" style={{ textDecoration: 'none', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255,255,255,0.25)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}>
                    <Smartphone size={40} color="white" />
                  </div>
                </Link>
                
                <h2 style={{
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '2rem',
                  marginBottom: '0.5rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  MegaCell
                </h2>
                <p style={{
                  color: 'rgba(255,255,255,0.95)',
                  marginBottom: 0,
                  fontSize: '1rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  Centro de Servicios Tecnológicos
                </p>
              </div>

              {/* Formulario */}
              <div style={{ padding: '2.5rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h3 style={{
                    color: '#1a202c',
                    fontWeight: '700',
                    fontSize: '1.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    Iniciar Sesión
                  </h3>
                  <p style={{ color: '#718096', fontSize: '0.9375rem', marginBottom: 0 }}>
                    Ingresa tus credenciales para continuar
                  </p>
                </div>

                {error && (
                  <Alert 
                    variant="danger" 
                    dismissible 
                    onClose={() => setError('')}
                    style={{ 
                      borderRadius: '12px',
                      border: '2px solid #fecaca',
                      backgroundColor: '#fee2e2',
                      marginBottom: '1.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                      <span style={{ fontSize: '0.9375rem' }}>{error}</span>
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Campo Identificación */}
                  <Form.Group style={{ marginBottom: '1.5rem' }}>
                    <Form.Label style={{ 
                      fontWeight: '600', 
                      color: '#1a202c',
                      marginBottom: '0.5rem',
                      fontSize: '0.9375rem'
                    }}>
                      Identificación
                    </Form.Label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1
                      }}>
                        <User size={20} color="#718096" />
                      </div>
                      <Form.Control
                        type="text"
                        name="identificacion"
                        placeholder="Ingresa tu identificación"
                        value={formData.identificacion}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        style={{
                          paddingLeft: '48px',
                          height: '50px',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4C8BF5'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                  </Form.Group>

                  {/* Campo Contraseña */}
                  <Form.Group style={{ marginBottom: '1rem' }}>
                    <Form.Label style={{ 
                      fontWeight: '600', 
                      color: '#1a202c',
                      marginBottom: '0.5rem',
                      fontSize: '0.9375rem'
                    }}>
                      Contraseña
                    </Form.Label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1
                      }}>
                        <Lock size={20} color="#718096" />
                      </div>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="contrasena"
                        placeholder="Ingresa tu contraseña"
                        value={formData.contrasena}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        style={{
                          paddingLeft: '48px',
                          paddingRight: '48px',
                          height: '50px',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4C8BF5'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          zIndex: 1
                        }}
                      >
                        {showPassword ? <EyeOff size={20} color="#718096" /> : <Eye size={20} color="#718096" />}
                      </button>
                    </div>
                  </Form.Group>

                  {/* Recordarme y Olvidé contraseña */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <Form.Check
                      type="checkbox"
                      id="remember-me"
                      label="Recordarme"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                      style={{ color: '#4b5563', fontSize: '0.9375rem' }}
                    />
                    <Link 
                      to="/recuperar-contrasena" 
                      style={{ 
                        color: '#4C8BF5',
                        textDecoration: 'none',
                        fontSize: '0.9375rem',
                        fontWeight: '600'
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  {/* Botón Login */}
                  <Button 
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: '50px',
                      background: 'linear-gradient(135deg, #4C8BF5 0%, #5FC88F 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '700',
                      marginBottom: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(76, 139, 245, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>

                  {/* Botón Registro */}
                  <Link to="/registro" style={{ textDecoration: 'none', display: 'block' }}>
                    <Button 
                      variant="outline-secondary"
                      disabled={loading}
                      style={{
                        width: '100%',
                        height: '50px',
                        background: 'white',
                        border: '2px solid #e2e8f0',
                        color: '#4b5563',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.borderColor = '#4C8BF5';
                          e.currentTarget.style.color = '#4C8BF5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.color = '#4b5563';
                      }}
                    >
                      Crear Cuenta Nueva
                    </Button>
                  </Link>
                </Form>

                {/* Footer */}
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '2rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#718096',
                    marginBottom: '1rem'
                  }}>
                    ¿No tienes cuenta?{' '}
                    <Link to="/registro" style={{ color: '#4C8BF5', fontWeight: '600', textDecoration: 'none' }}>
                      Regístrate aquí
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </Col>

          {/* Panel Informativo */}
          <Col lg={5} md={5} className="d-none d-md-block">
            <div style={{
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              padding: '2.5rem',
              marginLeft: '1rem',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{
                  color: '#1a202c',
                  fontWeight: '700',
                  fontSize: '1.75rem',
                  marginBottom: '1rem'
                }}>
                  Bienvenido a MegaCell
                </h4>
                <p style={{ color: '#718096', fontSize: '1rem', lineHeight: '1.6' }}>
                  Accede a tu cuenta para gestionar reparaciones, hacer seguimiento de pedidos y disfrutar de beneficios exclusivos.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { icon: ShieldCheck, color: '#5FC88F', titulo: 'Garantía Certificada', desc: 'En todos nuestros servicios' },
                  { icon: Clock, color: '#4C8BF5', titulo: 'Seguimiento en Tiempo Real', desc: 'Rastrea tus pedidos al instante' },
                  { icon: Award, color: '#FFA726', titulo: 'Soporte 24/7', desc: 'Atención especializada siempre' }
                ].map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: `${item.color}15`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <IconComponent size={24} color={item.color} />
                      </div>
                      <div>
                        <h6 style={{ color: '#1a202c', fontWeight: '700', marginBottom: '0.25rem' }}>
                          {item.titulo}
                        </h6>
                        <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: 0 }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: '12px',
                border: '2px solid #bfdbfe'
              }}>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#1e40af',
                  marginBottom: 0,
                  fontWeight: '600'
                }}>
                  <strong>¿Necesitas ayuda?</strong><br />
                  Contacta a nuestro equipo de soporte
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login