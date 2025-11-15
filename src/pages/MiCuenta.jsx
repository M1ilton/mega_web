import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Nav, Tab, Button, Form, Badge, ListGroup, ProgressBar, Alert, Spinner } from 'react-bootstrap'
import { 
  User, Package, Wrench, Heart, Gift, Lock, BarChart3,
  Edit, Eye, MapPin, Trash2, ShoppingCart, Plus, Copy,
  CheckCircle, Award, TrendingUp, Mail, Phone, Calendar,
  Star, Zap, Truck, Clock, Smartphone, Battery, Headphones,
  Tag, Shield, Activity
} from 'lucide-react'

// URL del backend PHP
const API_URL = 'http://localhost/megacell_backend'

function MiCuenta() {
  const navigate = useNavigate()
  
  // Estados
  const [loading, setLoading] = useState(true)
  const [usuario, setUsuario] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [reparaciones, setReparaciones] = useState([])
  const [favoritos, setFavoritos] = useState([])
  const [cupones, setCupones] = useState([])
  const [actividades, setActividades] = useState([])
  const [estadisticas, setEstadisticas] = useState({})
  
  // Estados para formularios
  const [formPerfil, setFormPerfil] = useState({})
  const [formContrasena, setFormContrasena] = useState({
    contrasena_actual: '',
    contrasena_nueva: '',
    contrasena_confirmacion: ''
  })
  
  // Estados de mensajes
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [loadingPerfil, setLoadingPerfil] = useState(false)
  const [loadingContrasena, setLoadingContrasena] = useState(false)

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatosUsuario()
    cargarPedidos()
    cargarReparaciones()
    cargarFavoritos()
    cargarCupones()
    cargarActividad()
  }, [])

  const cargarDatosUsuario = async () => {
    try {
      const response = await fetch(`${API_URL}/get_user_info.php`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setUsuario(data.usuario)
        setEstadisticas(data.estadisticas)
        setFormPerfil({
          nombres: data.usuario.nombres,
          apellidos: data.usuario.apellidos,
          email: data.usuario.email,
          telefono: data.usuario.telefono,
          municipio: data.usuario.municipio
        })
      } else {
        // Si no hay sesión, redirigir al login
        navigate('/login')
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const cargarPedidos = async () => {
    try {
      const response = await fetch(`${API_URL}/get_orders.php`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()
      if (data.success) {
        setPedidos(data.pedidos)
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error)
    }
  }

  const cargarReparaciones = async () => {
    try {
      const response = await fetch(`${API_URL}/get_repairs.php`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()
      if (data.success) {
        setReparaciones(data.reparaciones)
      }
    } catch (error) {
      console.error('Error al cargar reparaciones:', error)
    }
  }

  const cargarFavoritos = async () => {
    try {
      const response = await fetch(`${API_URL}/get_favorites.php`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()
      if (data.success) {
        // Mapear iconos
        const favoritosConIconos = data.favoritos.map(fav => ({
          ...fav,
          icon: getIconComponent(fav.icon)
        }))
        setFavoritos(favoritosConIconos)
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error)
    }
  }

  const cargarCupones = async () => {
    try {
      const response = await fetch(`${API_URL}/get_coupons.php`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()
      if (data.success) {
        setCupones(data.cupones)
      }
    } catch (error) {
      console.error('Error al cargar cupones:', error)
    }
  }

  const cargarActividad = async () => {
    try {
      const response = await fetch(`${API_URL}/get_activity.php?limit=10`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()
      if (data.success) {
        setActividades(data.actividades)
      }
    } catch (error) {
      console.error('Error al cargar actividad:', error)
    }
  }

  const getIconComponent = (iconName) => {
    const icons = {
      'Zap': Zap,
      'Headphones': Headphones,
      'Battery': Battery,
      'Wrench': Wrench,
      'Smartphone': Smartphone,
      'Package': Package
    }
    return icons[iconName] || Package
  }

  const handleActualizarPerfil = async (e) => {
    e.preventDefault()
    setLoadingPerfil(true)
    setMensaje({ tipo: '', texto: '' })

    try {
      const response = await fetch(`${API_URL}/update_profile.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formPerfil)
      })

      const data = await response.json()

      if (data.success) {
        setMensaje({ tipo: 'success', texto: 'Perfil actualizado exitosamente' })
        setUsuario(prev => ({
          ...prev,
          ...data.usuario
        }))
        // Actualizar localStorage
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        // Recargar actividad
        cargarActividad()
      } else {
        setMensaje({ tipo: 'danger', texto: data.message })
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      setMensaje({ tipo: 'danger', texto: 'Error de conexión con el servidor' })
    } finally {
      setLoadingPerfil(false)
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000)
    }
  }

  const handleCambiarContrasena = async (e) => {
    e.preventDefault()
    setLoadingContrasena(true)
    setMensaje({ tipo: '', texto: '' })

    try {
      const response = await fetch(`${API_URL}/change_password.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formContrasena)
      })

      const data = await response.json()

      if (data.success) {
        setMensaje({ tipo: 'success', texto: 'Contraseña actualizada exitosamente' })
        setFormContrasena({
          contrasena_actual: '',
          contrasena_nueva: '',
          contrasena_confirmacion: ''
        })
        // Recargar actividad
        cargarActividad()
      } else {
        setMensaje({ tipo: 'danger', texto: data.message })
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      setMensaje({ tipo: 'danger', texto: 'Error de conexión con el servidor' })
    } finally {
      setLoadingContrasena(false)
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000)
    }
  }

  const formatoPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio)
  }

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo)
    setMensaje({ tipo: 'info', texto: `Código ${codigo} copiado al portapapeles` })
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p style={{ marginTop: '1rem', color: '#718096' }}>Cargando tu cuenta...</p>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return null
  }

  const nivelProgreso = (usuario.puntos_fidelidad / 1000) * 100

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Banner de Usuario */}
      <section style={{
        background: 'linear-gradient(135deg, #4C8BF5 0%, #8b5cf6 100%)',
        padding: '3rem 0',
        boxShadow: '0 4px 20px rgba(76, 139, 245, 0.3)'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col md={2} className="text-center">
              <div style={{
                width: '100px',
                height: '100px',
                background: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                border: '4px solid rgba(255,255,255,0.3)'
              }}>
                <User size={50} color="#4C8BF5" />
              </div>
            </Col>
            <Col md={7}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                {usuario.nombres} {usuario.apellidos}
              </h2>
              <p style={{
                fontSize: '0.9375rem',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} /> {usuario.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} /> {usuario.telefono}
                </span>
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Badge style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  borderRadius: '50px',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Calendar size={16} /> Miembro desde: {usuario.fecha_registro}
                </Badge>
                <Badge style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  borderRadius: '50px',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textTransform: 'capitalize'
                }}>
                  <Award size={16} /> Nivel {usuario.nivel_fidelidad}
                </Badge>
              </div>
            </Col>
            <Col md={3}>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600' }}>
                    Puntos de Fidelidad
                  </span>
                  <TrendingUp size={20} color="white" />
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: 'white',
                  marginBottom: '0.5rem'
                }}>
                  {usuario.puntos_fidelidad}
                </div>
                <ProgressBar 
                  now={nivelProgreso} 
                  style={{ 
                    height: '8px', 
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '10px'
                  }}
                  variant="light"
                />
                <small style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8125rem' }}>
                  {1000 - usuario.puntos_fidelidad} puntos para nivel siguiente
                </small>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Estadísticas Rápidas */}
      <Container style={{ marginTop: '-2rem', marginBottom: '2rem' }}>
        <Row>
          {[
            { icon: ShoppingCart, label: 'Pedidos Totales', value: estadisticas.total_pedidos || 0, color: '#4C8BF5' },
            { icon: Wrench, label: 'Reparaciones', value: estadisticas.total_reparaciones || 0, color: '#8b5cf6' },
            { icon: Heart, label: 'Favoritos', value: estadisticas.total_favoritos || 0, color: '#e74c3c' }
          ].map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Col md={4} key={index}>
                <Card style={{
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <Card.Body style={{ padding: '1.5rem' }}>
                    <Row className="align-items-center">
                      <Col xs={3}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          background: `${stat.color}15`,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <IconComponent size={30} color={stat.color} />
                        </div>
                      </Col>
                      <Col xs={9} className="text-end">
                        <div style={{
                          fontSize: '2rem',
                          fontWeight: '800',
                          color: '#1a202c',
                          lineHeight: 1
                        }}>
                          {stat.value}
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#718096',
                          marginTop: '0.25rem',
                          fontWeight: '600'
                        }}>
                          {stat.label}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
        </Row>
      </Container>

      {/* Mensaje de éxito/error */}
      {mensaje.texto && (
        <Container style={{ marginBottom: '1rem' }}>
          <Alert variant={mensaje.tipo} onClose={() => setMensaje({ tipo: '', texto: '' })} dismissible>
            {mensaje.texto}
          </Alert>
        </Container>
      )}

      {/* Contenido con Tabs */}
      <Container style={{ marginTop: '2rem' }}>
        <Tab.Container defaultActiveKey="resumen">
          <Row>
            {/* Sidebar de Navegación */}
            <Col lg={3} md={4}>
              <Card style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                marginBottom: '1.5rem',
                position: 'sticky',
                top: '20px'
              }}>
                <Card.Body style={{ padding: '1rem' }}>
                  <Nav variant="pills" className="flex-column">
                    {[
                      { eventKey: 'resumen', icon: BarChart3, texto: 'Resumen' },
                      { eventKey: 'pedidos', icon: Package, texto: 'Mis Pedidos' },
                      { eventKey: 'reparaciones', icon: Wrench, texto: 'Reparaciones' },
                      { eventKey: 'favoritos', icon: Heart, texto: 'Favoritos' },
                      { eventKey: 'cupones', icon: Gift, texto: 'Cupones' },
                      { eventKey: 'perfil', icon: User, texto: 'Mi Perfil' },
                      { eventKey: 'seguridad', icon: Lock, texto: 'Seguridad' }
                    ].map((item, index) => {
                      const IconComponent = item.icon
                      return (
                        <Nav.Item key={index}>
                          <Nav.Link 
                            eventKey={item.eventKey}
                            className="nav-link-custom"
                            style={{
                              borderRadius: '12px',
                              marginBottom: '0.5rem',
                              padding: '0.875rem 1.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              fontSize: '0.9375rem',
                              fontWeight: '600',
                              color: '#4b5563',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <IconComponent size={20} />
                            {item.texto}
                          </Nav.Link>
                        </Nav.Item>
                      )
                    })}
                  </Nav>
                </Card.Body>
              </Card>
            </Col>

            {/* Contenido de los Tabs */}
            <Col lg={9} md={8}>
              <Tab.Content>
                {/* TAB: Resumen */}
                <Tab.Pane eventKey="resumen">
                  <h4 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '1.5rem'
                  }}>
                    📊 Resumen de Cuenta
                  </h4>

                  {/* Pedidos Recientes */}
                  <Card style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    marginBottom: '1.5rem'
                  }}>
                    <Card.Header style={{
                      background: 'white',
                      borderBottom: '1px solid #e2e8f0',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <h6 style={{ margin: 0, fontWeight: '700', color: '#1a202c', fontSize: '1rem' }}>
                        Pedidos Recientes
                      </h6>
                      <Button 
                        variant="link" 
                        onClick={() => document.querySelector('[eventKey="pedidos"]').click()}
                        style={{ textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600' }}
                      >
                        Ver todos
                      </Button>
                    </Card.Header>
                    <ListGroup variant="flush">
                      {pedidos.slice(0, 3).map((pedido, index) => (
                        <ListGroup.Item 
                          key={index}
                          style={{
                            padding: '1.25rem 1.5rem',
                            transition: 'background 0.2s ease',
                            borderLeft: '4px solid transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8f9fa'
                            e.currentTarget.style.borderLeftColor = '#4C8BF5'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white'
                            e.currentTarget.style.borderLeftColor = 'transparent'
                          }}
                        >
                          <Row className="align-items-center">
                            <Col xs={2}>
                              <Package size={24} color="#4C8BF5" />
                            </Col>
                            <Col xs={7}>
                              <div style={{ fontWeight: '700', color: '#1a202c', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                                {pedido.id}
                              </div>
                              <small style={{ color: '#718096', fontSize: '0.8125rem' }}>
                                {pedido.fecha} • {pedido.productos} producto(s)
                              </small>
                            </Col>
                            <Col xs={3} className="text-end">
                              <Badge bg={pedido.estadoColor} style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                                {pedido.estado}
                              </Badge>
                              <div style={{ marginTop: '0.25rem', fontWeight: '700', fontSize: '0.875rem' }}>
                                {formatoPrecio(pedido.total)}
                              </div>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                      {pedidos.length === 0 && (
                        <ListGroup.Item style={{ padding: '2rem', textAlign: 'center' }}>
                          <Package size={48} color="#cbd5e0" style={{ marginBottom: '1rem' }} />
                          <p style={{ color: '#718096', marginBottom: 0 }}>
                            No tienes pedidos recientes
                          </p>
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Card>

                  {/* Reparaciones en Proceso */}
                  <Card style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <Card.Header style={{
                      background: 'white',
                      borderBottom: '1px solid #e2e8f0',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <h6 style={{ margin: 0, fontWeight: '700', color: '#1a202c', fontSize: '1rem' }}>
                        Reparaciones en Proceso
                      </h6>
                      <Button 
                        variant="link"
                        onClick={() => document.querySelector('[eventKey="reparaciones"]').click()}
                        style={{ textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600' }}
                      >
                        Ver todas
                      </Button>
                    </Card.Header>
                    <ListGroup variant="flush">
                      {reparaciones.filter(r => r.estado !== 'Completado' && r.estado !== 'Entregado').map((reparacion, index) => (
                        <ListGroup.Item 
                          key={index}
                          style={{
                            padding: '1.25rem 1.5rem',
                            transition: 'background 0.2s ease',
                            borderLeft: '4px solid transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8f9fa'
                            e.currentTarget.style.borderLeftColor = '#8b5cf6'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white'
                            e.currentTarget.style.borderLeftColor = 'transparent'
                          }}
                        >
                          <Row className="align-items-center">
                            <Col xs={2}>
                              <Wrench size={24} color="#8b5cf6" />
                            </Col>
                            <Col xs={7}>
                              <div style={{ fontWeight: '700', color: '#1a202c', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                                {reparacion.equipo}
                              </div>
                              <small style={{ color: '#718096', fontSize: '0.8125rem' }}>
                                {reparacion.servicio}
                              </small>
                            </Col>
                            <Col xs={3} className="text-end">
                              <Badge bg={reparacion.estadoColor} style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                                {reparacion.estado}
                              </Badge>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                      {reparaciones.filter(r => r.estado !== 'Completado' && r.estado !== 'Entregado').length === 0 && (
                        <ListGroup.Item style={{ padding: '2rem', textAlign: 'center' }}>
                          <Wrench size={48} color="#cbd5e0" style={{ marginBottom: '1rem' }} />
                          <p style={{ color: '#718096', marginBottom: 0 }}>
                            No tienes reparaciones en proceso
                          </p>
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Card>
                </Tab.Pane>

                {/* TAB: Pedidos */}
                <Tab.Pane eventKey="pedidos">
                  <h4 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '1.5rem'
                  }}>
                    📦 Mis Pedidos
                  </h4>

                  {pedidos.length > 0 ? (
                    <Row>
                      {pedidos.map((pedido, index) => (
                        <Col md={6} key={index} style={{ marginBottom: '1.5rem' }}>
                          <Card style={{
                            border: 'none',
                            borderRadius: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            height: '100%',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                          }}>
                            <Card.Body style={{ padding: '1.5rem' }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '1rem'
                              }}>
                                <div>
                                  <h6 style={{
                                    fontWeight: '700',
                                    color: '#1a202c',
                                    fontSize: '1rem',
                                    marginBottom: '0.5rem'
                                  }}>
                                    {pedido.id}
                                  </h6>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    fontSize: '0.875rem',
                                    color: '#718096'
                                  }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                      <Calendar size={14} /> {pedido.fecha}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                      <Package size={14} /> {pedido.productos} producto(s)
                                    </span>
                                  </div>
                                </div>
                                <Badge bg={pedido.estadoColor} style={{
                                  fontSize: '0.75rem',
                                  padding: '0.5rem 0.875rem',
                                  borderRadius: '50px'
                                }}>
                                  {pedido.estado}
                                </Badge>
                              </div>
                              
                              <div style={{
                                paddingTop: '1rem',
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span style={{ fontSize: '0.875rem', color: '#718096', fontWeight: '600' }}>
                                  Total:
                                </span>
                                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1a202c' }}>
                                  {formatoPrecio(pedido.total)}
                                </span>
                              </div>

                              <Button 
                                variant="outline-primary"
                                style={{
                                  width: '100%',
                                  marginTop: '1rem',
                                  borderRadius: '12px',
                                  fontWeight: '600',
                                  fontSize: '0.9375rem',
                                  padding: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem'
                                }}
                              >
                                <Eye size={18} /> Ver detalles
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Card style={{
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      textAlign: 'center',
                      padding: '3rem 2rem'
                    }}>
                      <Package size={64} color="#cbd5e0" style={{ margin: '0 auto 1rem' }} />
                      <h5 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '0.5rem' }}>
                        No tienes pedidos aún
                      </h5>
                      <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
                        Explora nuestra tienda y realiza tu primer pedido
                      </p>
                      <Button 
                        onClick={() => navigate('/tienda')}
                        style={{
                          background: 'linear-gradient(135deg, #4C8BF5 0%, #8b5cf6 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '0.875rem 2rem',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <ShoppingCart size={20} /> Ir a la tienda
                      </Button>
                    </Card>
                  )}
                </Tab.Pane>

                {/* TAB: Reparaciones */}
                <Tab.Pane eventKey="reparaciones">
                  <h4 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '1.5rem'
                  }}>
                    🔧 Mis Reparaciones
                  </h4>

                  {reparaciones.length > 0 ? (
                    <Row>
                      {reparaciones.map((reparacion, index) => (
                        <Col md={6} key={index} style={{ marginBottom: '1.5rem' }}>
                          <Card style={{
                            border: 'none',
                            borderRadius: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            height: '100%',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                          }}>
                            <Card.Body style={{ padding: '1.5rem' }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '1rem'
                              }}>
                                <div>
                                  <h6 style={{
                                    fontWeight: '700',
                                    color: '#1a202c',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem'
                                  }}>
                                    {reparacion.equipo}
                                  </h6>
                                  <p style={{
                                    fontSize: '0.875rem',
                                    color: '#718096',
                                    marginBottom: '0.5rem'
                                  }}>
                                    {reparacion.servicio}
                                  </p>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.8125rem',
                                    color: '#718096'
                                  }}>
                                    <Clock size={14} /> {reparacion.fecha}
                                  </div>
                                </div>
                                <Badge bg={reparacion.estadoColor} style={{
                                  fontSize: '0.75rem',
                                  padding: '0.5rem 0.875rem',
                                  borderRadius: '50px'
                                }}>
                                  {reparacion.estado}
                                </Badge>
                              </div>
                              
                              <div style={{
                                paddingTop: '1rem',
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span style={{ fontSize: '0.875rem', color: '#718096', fontWeight: '600' }}>
                                  Precio:
                                </span>
                                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1a202c' }}>
                                  {formatoPrecio(reparacion.precio)}
                                </span>
                              </div>

                              <Button 
                                variant="outline-primary"
                                style={{
                                  width: '100%',
                                  marginTop: '1rem',
                                  borderRadius: '12px',
                                  fontWeight: '600',
                                  fontSize: '0.9375rem',
                                  padding: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem'
                                }}
                              >
                                <Eye size={18} /> Ver detalles
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Card style={{
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      textAlign: 'center',
                      padding: '3rem 2rem'
                    }}>
                      <Wrench size={64} color="#cbd5e0" style={{ margin: '0 auto 1rem' }} />
                      <h5 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '0.5rem' }}>
                        No tienes reparaciones registradas
                      </h5>
                      <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
                        Solicita tu primera reparación con nosotros
                      </p>
                      <Button 
                        onClick={() => navigate('/reparacion')}
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #e74c3c 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '0.875rem 2rem',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Wrench size={20} /> Solicitar reparación
                      </Button>
                    </Card>
                  )}
                </Tab.Pane>

                {/* TAB: Favoritos */}
                <Tab.Pane eventKey="favoritos">
                  <h4 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '1.5rem'
                  }}>
                    ❤️ Mis Favoritos
                  </h4>

                  {favoritos.length > 0 ? (
                    <Row>
                      {favoritos.map((favorito, index) => {
                        const IconComponent = favorito.icon
                        return (
                          <Col md={4} key={index} style={{ marginBottom: '1.5rem' }}>
                            <Card style={{
                              border: 'none',
                              borderRadius: '16px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              height: '100%',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)'
                              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                            }}>
                              <Card.Body style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{
                                  width: '80px',
                                  height: '80px',
                                  background: 'linear-gradient(135deg, #e74c3c15 0%, #c0392b15 100%)',
                                  borderRadius: '16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  margin: '0 auto 1rem'
                                }}>
                                  <IconComponent size={40} color="#e74c3c" />
                                </div>
                                
                                <h6 style={{
                                  fontWeight: '700',
                                  color: '#1a202c',
                                  fontSize: '0.9375rem',
                                  marginBottom: '0.5rem'
                                }}>
                                  {favorito.nombre}
                                </h6>
                                
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#4C8BF5', marginBottom: '1rem' }}>
                                  {formatoPrecio(favorito.precio)}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <Button 
                                    variant="primary"
                                    style={{
                                      flex: 1,
                                      borderRadius: '12px',
                                      fontWeight: '600',
                                      fontSize: '0.875rem',
                                      padding: '0.625rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.5rem'
                                    }}
                                  >
                                    <ShoppingCart size={16} /> Comprar
                                  </Button>
                                  <Button 
                                    variant="outline-danger"
                                    style={{
                                      borderRadius: '12px',
                                      padding: '0.625rem 0.875rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        )
                      })}
                    </Row>
                  ) : (
                    <Card style={{
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      textAlign: 'center',
                      padding: '3rem 2rem'
                    }}>
                      <Heart size={64} color="#cbd5e0" style={{ margin: '0 auto 1rem' }} />
                      <h5 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '0.5rem' }}>
                        No tienes favoritos guardados
                      </h5>
                      <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
                        Explora nuestros productos y añade tus favoritos
                      </p>
                      <Button 
                        onClick={() => navigate('/tienda')}
                        style={{
                          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '0.875rem 2rem',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Heart size={20} /> Explorar productos
                      </Button>
                    </Card>
                  )}
                </Tab.Pane>

                {/* TAB: Cupones */}
                <Tab.Pane eventKey="cupones">
                  <h4 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '1.5rem'
                  }}>
                    🎁 Mis Cupones
                  </h4>

                  {cupones.length > 0 ? (
                    <Row>
                      {cupones.map((cupon, index) => (
                        <Col md={6} key={index} style={{ marginBottom: '1.5rem' }}>
                          <Card style={{
                            border: 'none',
                            borderRadius: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            height: '100%',
                            opacity: cupon.usado ? 0.6 : 1,
                            position: 'relative',
                            overflow: 'hidden',
                            background: cupon.usado ? '#f8f9fa' : 'linear-gradient(135deg, #FFA72615 0%, #FF860015 100%)'
                          }}>
                            {cupon.usado && (
                              <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: '#e74c3c',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '50px',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                              }}>
                                USADO
                              </div>
                            )}
                            
                            <Card.Body style={{ padding: '1.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                  width: '60px',
                                  height: '60px',
                                  background: 'linear-gradient(135deg, #FFA726 0%, #FF8600 100%)',
                                  borderRadius: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <Gift size={32} color="white" />
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                  <h6 style={{
                                    fontWeight: '700',
                                    color: '#1a202c',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem'
                                  }}>
                                    {cupon.descuento}
                                  </h6>
                                  <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: 0 }}>
                                    {cupon.descripcion}
                                  </p>
                                </div>
                              </div>

                              <div style={{
                                background: 'white',
                                padding: '0.875rem 1rem',
                                borderRadius: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.75rem',
                                border: '2px dashed #FFA726'
                              }}>
                                <span style={{
                                  fontFamily: 'monospace',
                                  fontSize: '1.125rem',
                                  fontWeight: '700',
                                  color: '#1a202c'
                                }}>
                                  {cupon.codigo}
                                </span>
                                {!cupon.usado && (
                                  <Button 
                                    variant="link"
                                    onClick={() => copiarCodigo(cupon.codigo)}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      color: '#FFA726',
                                      textDecoration: 'none'
                                    }}
                                  >
                                    <Copy size={18} />
                                  </Button>
                                )}
                              </div>

                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.8125rem',
                                color: '#718096'
                              }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Clock size={14} /> Válido hasta: {cupon.valido}
                                </span>
                                {!cupon.usado && (
                                  <span style={{ color: '#5FC88F', fontWeight: '600' }}>
                                    Disponible
                                  </span>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Card style={{
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      textAlign: 'center',
                      padding: '3rem 2rem'
                    }}>
                      <Gift size={64} color="#cbd5e0" style={{ margin: '0 auto 1rem' }} />
                      <h5 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '0.5rem' }}>
                        No tienes cupones disponibles
                      </h5>
                      <p style={{ color: '#718096' }}>
                        Los cupones aparecerán aquí cuando estén disponibles
                      </p>
                    </Card>
                  )}
                </Tab.Pane>

                {/* TAB: Mi Perfil */}
                <Tab.Pane eventKey="perfil">
                  <h4 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '1.5rem'
                  }}>
                    👤 Mi Perfil
                  </h4>
                  
                  <Card style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <Card.Header style={{
                      background: 'white',
                      borderBottom: '1px solid #e2e8f0',
                      padding: '1.25rem 1.5rem'
                    }}>
                      <h6 style={{ margin: 0, fontWeight: '700', color: '#1a202c', fontSize: '1rem' }}>
                        Información Personal
                      </h6>
                    </Card.Header>
                    <Card.Body style={{ padding: '2rem' }}>
                      <Form onSubmit={handleActualizarPerfil}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label style={{ fontWeight: '600', color: '#1a202c', fontSize: '0.9375rem' }}>
                                Nombres
                              </Form.Label>
                              <Form.Control 
                                type="text"
                                value={formPerfil.nombres || ''}
                                onChange={(e) => setFormPerfil({ ...formPerfil, nombres: e.target.value })}
                                required
                                style={{
                                  borderRadius: '12px',
                                  border: '2px solid #e2e8f0',
                                  padding: '0.75rem 1rem',
                                  fontSize: '0.9375rem',
                                  transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#4C8BF5';
                                  e.target.style.boxShadow = '0 0 0 3px rgba(76, 139, 245, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = '#e2e8f0';
                                  e.target.style.boxShadow = 'none';
                                }}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label style={{ fontWeight: '600', color: '#1a202c', fontSize: '0.9375rem' }}>
                                Apellidos
                              </Form.Label>
                              <Form.Control 
                                type="text"
                                value={formPerfil.apellidos || ''}
                                onChange={(e) => setFormPerfil({ ...formPerfil, apellidos: e.target.value })}
                                required
                                style={{
                                  borderRadius: '12px',
                                  border: '2px solid #e2e8f0',
                                  padding: '0.75rem 1rem',
                                  fontSize: '0.9375rem',
                                  transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#4C8BF5';
                                  e.target.style.boxShadow = '0 0 0 3px rgba(76, 139, 245, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = '#e2e8f0';
                                  e.target.style.boxShadow = 'none';
                                }}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label style={{ fontWeight: '600', color: '#1a202c', fontSize: '0.9375rem' }}>
                                Correo Electrónico
                              </Form.Label>
                              <Form.Control 
                                type="email"
                                value={formPerfil.email || ''}
                                onChange={(e) => setFormPerfil({ ...formPerfil, email: e.target.value })}
                                required
                                style={{
                                  borderRadius: '12px',
                                  border: '2px solid #e2e8f0',
                                  padding: '0.75rem 1rem',
                                  fontSize: '0.9375rem',
                                  transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#4C8BF5';
                                  e.target.style.boxShadow = '0 0 0 3px rgba(76, 139, 245, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = '#e2e8f0';
                                  e.target.style.boxShadow = 'none';
                                }}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label style={{ fontWeight: '600', color: '#1a202c', fontSize: '0.9375rem' }}>
                                Teléfono
                              </Form.Label>
                              <Form.Control 
                                type="tel"
                                value={formPerfil.telefono || ''}
                                onChange={(e) => setFormPerfil({ ...formPerfil, telefono: e.target.value })}
                                required
                                style={{
                                  borderRadius: '12px',
                                  border: '2px solid #e2e8f0',
                                  padding: '0.75rem 1rem',
                                  fontSize: '0.9375rem',
                                  transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#4C8BF5';
                                  e.target.style.boxShadow = '0 0 0 3px rgba(76, 139, 245, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = '#e2e8f0';
                                  e.target.style.boxShadow = 'none';
                                }}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-4">
                          <Form.Label style={{ fontWeight: '600', color: '#1a202c', fontSize: '0.9375rem' }}>
                            Municipio
                          </Form.Label>
                          <Form.Select 
                            value={formPerfil.municipio || ''}
                            onChange={(e) => setFormPerfil({ ...formPerfil, municipio: e.target.value })}
                            required
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e2e8f0',
                              padding: '0.75rem 1rem',
                              fontSize: '0.9375rem',
                              transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#4C8BF5';
                              e.target.style.boxShadow = '0 0 0 3px rgba(76, 139, 245, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#e2e8f0';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <option value="">Selecciona tu municipio</option>
                            {[
                              'Quibdó', 'Acandí', 'Alto Baudó', 'Atrato', 'Bagadó',
                              'Bahía Solano', 'Bajo Baudó', 'Bojayá', 'Cantón de San Pablo',
                              'Carmen del Darién', 'Cértegui', 'Condoto', 'El Carmen de Atrato',
                              'Istmina', 'Juradó', 'Lloró', 'Medio Atrato', 'Medio Baudó',
                              'Medio San Juan', 'Nóvita', 'Nuquí', 'Río Iró', 'Río Quito',
                              'Riosucio', 'San José del Palmar', 'Sipí', 'Tadó', 'Unguía',
                              'Unión Panamericana'
                            ].map((municipio, index) => (
                              <option key={index} value={municipio}>{municipio}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        <Button 
                          type="submit"
                          disabled={loadingPerfil}
                          style={{
                            background: '#4C8BF5',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '0.875rem 2rem',
                            fontWeight: '600',
                            fontSize: '1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(76, 139, 245, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#3a7de3';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(76, 139, 245, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#4C8BF5';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 139, 245, 0.3)';
                          }}
                        >
                          {loadingPerfil ? (
                            <>
                              <Spinner animation="border" size="sm" /> Guardando...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={20} /> Guardar Cambios
                            </>
                          )}
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* TAB: Seguridad */}
                <Tab.Pane eventKey="seguridad">
                  <h4 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '1.5rem'
                  }}>
                    🔒 Seguridad
                  </h4>
                  
                  <Card style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    marginBottom: '1.5rem'
                  }}>
                    <Card.Header style={{
                      background: 'white',
                      borderBottom: '1px solid #e2e8f0',
                      padding: '1.25rem 1.5rem'
                    }}>
                      <h6 style={{ margin: 0, fontWeight: '700', color: '#1a202c', fontSize: '1rem' }}>
                        Cambiar Contraseña
                      </h6>
                    </Card.Header>
                    <Card.Body style={{ padding: '2rem' }}>
                      <Form onSubmit={handleCambiarContrasena}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: '600', color: '#1a202c', fontSize: '0.9375rem' }}>
                            Contraseña Actual
                          </Form.Label>
                          <Form.Control 
                            type="password"
                            value={formContrasena.contrasena_actual}
                            onChange={(e) => setFormContrasena({ ...formContrasena, contrasena_actual: e.target.value })}
                            required
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e2e8f0',
                              padding: '0.75rem 1rem',
                              fontSize: '0.9375rem',
                              transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#4C8BF5';
                              e.target.style.boxShadow = '0 0 0 3px rgba(76, 139, 245, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#e2e8f0';
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: '600', color: '#1a202c', fontSize: '0.9375rem' }}>
                            Nueva Contraseña
                          </Form.Label>
                          <Form.Control 
                            type="password"
                            value={formContrasena.contrasena_nueva}
                            onChange={(e) => setFormContrasena({ ...formContrasena, contrasena_nueva: e.target.value })}
                            required
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e2e8f0',
                              padding: '0.75rem 1rem',
                              fontSize: '0.9375rem',
                              transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#4C8BF5';
                              e.target.style.boxShadow = '0 0 0 3px rgba(76, 139, 245, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#e2e8f0';
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                        </Form.Group>
                        <Form.Group className="mb-4">
                          <Form.Label style={{ fontWeight: '600', color: '#1a202c', fontSize: '0.9375rem' }}>
                            Confirmar Nueva Contraseña
                          </Form.Label>
                          <Form.Control 
                            type="password"
                            value={formContrasena.contrasena_confirmacion}
                            onChange={(e) => setFormContrasena({ ...formContrasena, contrasena_confirmacion: e.target.value })}
                            required
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e2e8f0',
                              padding: '0.75rem 1rem',
                              fontSize: '0.9375rem',
                              transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#4C8BF5';
                              e.target.style.boxShadow = '0 0 0 3px rgba(76, 139, 245, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#e2e8f0';
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                        </Form.Group>
                        <Button 
                          type="submit"
                          disabled={loadingContrasena}
                          style={{
                            background: '#4C8BF5',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '0.875rem 2rem',
                            fontWeight: '600',
                            fontSize: '1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(76, 139, 245, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#3a7de3';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(76, 139, 245, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#4C8BF5';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 139, 245, 0.3)';
                          }}
                        >
                          {loadingContrasena ? (
                            <>
                              <Spinner animation="border" size="sm" /> Actualizando...
                            </>
                          ) : (
                            <>
                              <Lock size={20} /> Actualizar Contraseña
                            </>
                          )}
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>

                  <Card style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <Card.Header style={{
                      background: 'white',
                      borderBottom: '1px solid #e2e8f0',
                      padding: '1.25rem 1.5rem'
                    }}>
                      <h6 style={{ margin: 0, fontWeight: '700', color: '#1a202c', fontSize: '1rem' }}>
                        Actividad Reciente
                      </h6>
                    </Card.Header>
                    <ListGroup variant="flush">
                      {actividades.map((actividad, index) => (
                        <ListGroup.Item 
                          key={index}
                          style={{
                            padding: '1.25rem 1.5rem',
                            transition: 'background 0.2s ease',
                            borderLeft: '4px solid transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8f9fa';
                            e.currentTarget.style.borderLeftColor = '#4C8BF5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderLeftColor = 'transparent';
                          }}
                        >
                          <Row className="align-items-center">
                            <Col xs={1}>
                              <span style={{ fontSize: '1.5rem' }}>{actividad.icon}</span>
                            </Col>
                            <Col xs={8}>
                              <span style={{ color: '#1a202c', fontWeight: '600', fontSize: '0.9375rem' }}>
                                {actividad.text}
                              </span>
                            </Col>
                            <Col xs={3} className="text-end">
                              <small style={{ color: '#718096', fontSize: '0.8125rem' }}>
                                {actividad.fecha}
                              </small>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>

      <style>{`
        .nav-link-custom.active {
          background: linear-gradient(135deg, #4C8BF5 0%, #8b5cf6 100%) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(76, 139, 245, 0.3);
        }
        
        .nav-link-custom:hover:not(.active) {
          background: #f8f9fa !important;
          color: #4C8BF5 !important;
        }
      `}</style>
    </div>
  )
}

export default MiCuenta