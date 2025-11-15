import { Container, Row, Col, Card, Form, Button, Badge, Alert, Spinner } from 'react-bootstrap'
import { useState } from 'react'
import { Search, Package, Wrench, Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const API_URL = 'http://localhost/megacell_backend'

function Seguimiento() {
  const [numeroSeguimiento, setNumeroSeguimiento] = useState('')
  const [tipoBusqueda, setTipoBusqueda] = useState('pedido')
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notificacionesActivas, setNotificacionesActivas] = useState({
    whatsapp: true,
    email: true
  })

  const handleBuscar = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResultado(null)
    
    try {
      const response = await fetch(
        `${API_URL}/get_tracking.php?tipo=${tipoBusqueda}&codigo=${numeroSeguimiento}`
      )
      
      const data = await response.json()
      
      if (data.success) {
        setResultado(data.data)
      } else {
        setError(data.message || 'No se encontró información para este número de seguimiento')
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Por favor, intenta nuevamente.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = () => {
    if (!resultado) return null
    
    const progreso = resultado.progreso
    
    if (progreso === 100) {
      return { bg: 'success', text: 'Completado' }
    } else if (progreso >= 75) {
      return { bg: 'info', text: resultado.estado }
    } else if (progreso >= 50) {
      return { bg: 'warning', text: resultado.estado }
    } else if (progreso === 0 && resultado.estado.toLowerCase().includes('cancelado')) {
      return { bg: 'danger', text: 'Cancelado' }
    } else {
      return { bg: 'secondary', text: resultado.estado }
    }
  }

  const getColorProgreso = () => {
    if (!resultado) return '#5FC88F'
    
    const progreso = resultado.progreso
    
    if (progreso === 100) return '#5FC88F'
    if (progreso >= 75) return '#4C8BF5'
    if (progreso >= 50) return '#FFA726'
    return '#94a3b8'
  }

  const handleNotificacionChange = (tipo) => {
    setNotificacionesActivas(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }))
    
    // Aquí podrías hacer una llamada API para guardar las preferencias
    console.log(`Notificaciones ${tipo}: ${!notificacionesActivas[tipo]}`)
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #4C8BF5 0%, #3b7ce0 100%)',
        padding: '4rem 0',
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
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <Row className="align-items-center">
            <Col md={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Search size={48} color="white" />
                </div>
                <div>
                  <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: 'white',
                    marginBottom: '0.5rem'
                  }}>
                    Seguimiento en Tiempo Real
                  </h1>
                  <p style={{
                    fontSize: '1.25rem',
                    color: 'rgba(255,255,255,0.95)',
                    marginBottom: 0
                  }}>
                    Rastrea tus pedidos y reparaciones al instante
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Container style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        {/* Formulario de Búsqueda */}
        <Row className="justify-content-center mb-5">
          <Col md={8}>
            <Card style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
            }}>
              <div style={{
                background: '#4C8BF5',
                padding: '1.5rem',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Search size={24} color="white" />
                  <h5 style={{ margin: 0, color: 'white', fontWeight: '700' }}>
                    Buscar mi Servicio
                  </h5>
                </div>
              </div>
              <Card.Body style={{ padding: '2rem' }}>
                <Form onSubmit={handleBuscar}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '600', color: '#1a202c' }}>
                      ¿Qué deseas rastrear?
                    </Form.Label>
                    <Form.Select 
                      value={tipoBusqueda}
                      onChange={(e) => {
                        setTipoBusqueda(e.target.value)
                        setNumeroSeguimiento('')
                        setResultado(null)
                        setError(null)
                      }}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="pedido">📦 Pedido de Tienda Virtual</option>
                      <option value="reparacion">🔧 Servicio de Reparación</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontWeight: '600', color: '#1a202c' }}>
                      Número de Seguimiento
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={tipoBusqueda === 'pedido' ? 'Ej: PED-001234' : 'Ej: REP-001234'}
                      value={numeroSeguimiento}
                      onChange={(e) => setNumeroSeguimiento(e.target.value.toUpperCase())}
                      required
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem'
                      }}
                    />
                    <Form.Text style={{ color: '#718096', fontSize: '0.875rem' }}>
                      Puedes encontrar este número en tu correo de confirmación
                    </Form.Text>
                  </Form.Group>

                  {error && (
                    <Alert variant="danger" style={{ borderRadius: '12px' }}>
                      <AlertCircle size={18} style={{ marginRight: '0.5rem' }} />
                      {error}
                    </Alert>
                  )}

                  <Button 
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: loading ? '#94a3b8' : '#4C8BF5',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.currentTarget.style.background = '#3b7ce0'
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) e.currentTarget.style.background = '#4C8BF5'
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" style={{ marginRight: '0.5rem' }} />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search size={18} style={{ marginRight: '0.5rem' }} />
                        Rastrear Ahora
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Resultado del Seguimiento */}
        {resultado && (
          <Row className="justify-content-center">
            <Col md={10}>
              <Card style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  background: resultado.tipo === 'pedido' ? '#4C8BF5' : '#5FC88F',
                  padding: '1.5rem',
                  borderTopLeftRadius: '16px',
                  borderTopRightRadius: '16px'
                }}>
                  <Row className="align-items-center">
                    <Col>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {resultado.tipo === 'pedido' ? <Package size={24} color="white" /> : <Wrench size={24} color="white" />}
                        <h5 style={{ margin: 0, color: 'white', fontWeight: '700' }}>
                          {resultado.tipo === 'pedido' ? 'Pedido' : 'Reparación'} #{resultado.numero}
                        </h5>
                      </div>
                    </Col>
                    <Col className="text-end">
                      <Badge 
                        bg={getEstadoBadge().bg} 
                        text={getEstadoBadge().bg === 'warning' ? 'dark' : 'white'}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          borderRadius: '50px'
                        }}
                      >
                        {getEstadoBadge().text}
                      </Badge>
                    </Col>
                  </Row>
                </div>
                <Card.Body style={{ padding: '2rem' }}>
                  {/* Barra de Progreso */}
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: '600', color: '#1a202c' }}>Progreso del servicio</span>
                      <span style={{ fontWeight: '700', color: getColorProgreso() }}>{resultado.progreso}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '12px',
                      background: '#e2e8f0',
                      borderRadius: '50px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${resultado.progreso}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${getColorProgreso()} 0%, ${getColorProgreso()}dd 100%)`,
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>

                  {/* Información del Servicio */}
                  <Row style={{ marginBottom: '2rem' }}>
                    {resultado.tipo === 'pedido' ? (
                      <>
                        <Col md={6}>
                          <h6 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '1rem' }}>
                            📋 Información del Pedido:
                          </h6>
                          <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                            <strong>Total:</strong> ${resultado.total?.toLocaleString('es-CO')}
                          </p>
                          <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                            <strong>Productos:</strong> {resultado.cantidad_productos}
                          </p>
                          <p style={{ marginBottom: 0, color: '#4b5563' }}>
                            <strong>Método de pago:</strong> {resultado.metodo_pago}
                          </p>
                        </Col>
                        <Col md={6}>
                          <h6 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '1rem' }}>
                            📅 Información de Entrega:
                          </h6>
                          <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                            <strong>Fecha de pedido:</strong> {resultado.fecha}
                          </p>
                          <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                            <strong>Dirección:</strong> {resultado.direccion_envio}
                          </p>
                          <p style={{ marginBottom: 0, color: '#4b5563' }}>
                            <strong>Estado actual:</strong> {resultado.estado}
                          </p>
                        </Col>
                      </>
                    ) : (
                      <>
                        <Col md={6}>
                          <h6 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '1rem' }}>
                            📱 Información del Equipo:
                          </h6>
                          <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                            <strong>Equipo:</strong> {resultado.equipo}
                          </p>
                          <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                            <strong>Servicio:</strong> {resultado.servicio}
                          </p>
                          <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                            <strong>Precio:</strong> ${resultado.precio?.toLocaleString('es-CO')}
                          </p>
                          {resultado.descripcion_problema && (
                            <p style={{ marginBottom: 0, color: '#4b5563' }}>
                              <strong>Problema:</strong> {resultado.descripcion_problema}
                            </p>
                          )}
                        </Col>
                        <Col md={6}>
                          <h6 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '1rem' }}>
                            📅 Fechas:
                          </h6>
                          <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                            <strong>Fecha de ingreso:</strong> {resultado.fechaIngreso}
                          </p>
                          <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                            <strong>Entrega estimada:</strong> {resultado.fechaEstimada}
                          </p>
                          <p style={{ marginBottom: 0, color: '#4b5563' }}>
                            <strong>Estado:</strong> {resultado.estado}
                          </p>
                        </Col>
                      </>
                    )}
                  </Row>

                  {/* Timeline */}
                  <h6 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '1.5rem' }}>
                    🔍 Historial de Seguimiento:
                  </h6>
                  <div>
                    {resultado.timeline?.map((evento, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: idx === resultado.timeline.length - 1 ? 0 : '1.5rem',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: evento.completado ? '#5FC88F15' : '#e2e8f015',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {evento.completado ? (
                            <CheckCircle size={24} color="#5FC88F" />
                          ) : (
                            <Clock size={24} color="#94a3b8" />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h6 style={{
                            margin: 0,
                            marginBottom: '0.25rem',
                            fontWeight: '600',
                            color: evento.completado ? '#1a202c' : '#94a3b8'
                          }}>
                            {evento.estado}
                          </h6>
                          <small style={{ color: '#718096' }}>{evento.fecha}</small>
                        </div>
                        {idx !== resultado.timeline.length - 1 && (
                          <div style={{
                            position: 'absolute',
                            left: '23px',
                            top: '48px',
                            width: '2px',
                            height: 'calc(100% + 8px)',
                            background: evento.completado ? '#5FC88F30' : '#e2e8f0'
                          }}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              {/* Notificaciones */}
              <Card style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
              }}>
                <Card.Body style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Bell size={20} color="#4C8BF5" />
                    <h6 style={{ margin: 0, fontWeight: '700', color: '#1a202c' }}>
                      Notificaciones Activas
                    </h6>
                  </div>
                  <Form.Check 
                    type="checkbox"
                    label="Recibir notificaciones por WhatsApp"
                    checked={notificacionesActivas.whatsapp}
                    onChange={() => handleNotificacionChange('whatsapp')}
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <Form.Check 
                    type="checkbox"
                    label="Recibir notificaciones por correo electrónico"
                    checked={notificacionesActivas.email}
                    onChange={() => handleNotificacionChange('email')}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Información Adicional */}
        {!resultado && !loading && (
          <Row className="mt-5">
            {[
              { icon: <Package size={50} color="#4C8BF5" />, titulo: 'Pedidos', desc: 'Rastrea tus compras en línea en tiempo real desde que salen de nuestra bodega', color: '#4C8BF5' },
              { icon: <Wrench size={50} color="#5FC88F" />, titulo: 'Reparaciones', desc: 'Conoce el estado de tu equipo y cuándo estará listo para retirar', color: '#5FC88F' },
              { icon: <Bell size={50} color="#FFA726" />, titulo: 'Notificaciones', desc: 'Recibe alertas automáticas en cada actualización de tu servicio', color: '#FFA726' }
            ].map((item, index) => (
              <Col md={4} key={index} className="mb-3">
                <Card style={{
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)'
                }}>
                  <Card.Body style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: `${item.color}15`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem'
                    }}>
                      {item.icon}
                    </div>
                    <h5 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '0.75rem' }}>
                      {item.titulo}
                    </h5>
                    <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: 0, lineHeight: '1.6' }}>
                      {item.desc}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  )
}

export default Seguimiento