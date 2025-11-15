import { Container, Row, Col, Card, Accordion, Button, Form, Alert, Spinner } from 'react-bootstrap'
import { useState } from 'react'
import {
  Shield,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Package,
  Wrench,
  Mail,
  Phone,
  AlertCircle,
  Award,
  Calendar
} from 'lucide-react'

const API_URL = 'http://localhost/megacell_backend'

function Garantias() {
  const [numeroFactura, setNumeroFactura] = useState('')
  const [garantiaEncontrada, setGarantiaEncontrada] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleConsultar = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setGarantiaEncontrada(null)
    
    try {
      const response = await fetch(
        `${API_URL}/garantias.php?numero_factura=${numeroFactura}`
      )
      
      const data = await response.json()
      
      if (data.success) {
        setGarantiaEncontrada(data.data)
      } else {
        setError(data.message || 'No se encontró una garantía asociada a este número de factura')
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Por favor, intenta nuevamente.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoColor = () => {
    if (!garantiaEncontrada) return '#5FC88F'
    
    if (garantiaEncontrada.estado === 'Activa') {
      return '#5FC88F'
    } else if (garantiaEncontrada.estado === 'Vencida') {
      return '#ef4444'
    } else {
      return '#94a3b8'
    }
  }

  const getDiasRestantesColor = () => {
    if (!garantiaEncontrada) return '#1a202c'
    
    const dias = garantiaEncontrada.diasRestantes
    
    if (dias > 30) return '#5FC88F'
    if (dias > 7) return '#FFA726'
    if (dias > 0) return '#ef4444'
    return '#94a3b8'
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #5FC88F 0%, #4db87b 100%)',
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
                  <Shield size={48} color="white" />
                </div>
                <div>
                  <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: 'white',
                    marginBottom: '0.5rem'
                  }}>
                    Garantías y Soporte
                  </h1>
                  <p style={{
                    fontSize: '1.25rem',
                    color: 'rgba(255,255,255,0.95)',
                    marginBottom: 0
                  }}>
                    Protegemos tu inversión con garantía de calidad
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Container style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <Row>
          {/* Consultar Garantía */}
          <Col md={6} className="mb-4">
            <Card style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              height: '100%'
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
                    Consultar mi Garantía
                  </h5>
                </div>
              </div>
              <Card.Body style={{ padding: '2rem' }}>
                <Form onSubmit={handleConsultar}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '600', color: '#1a202c' }}>
                      Número de Factura o Código
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: PED-001 o REP-001"
                      value={numeroFactura}
                      onChange={(e) => setNumeroFactura(e.target.value.toUpperCase())}
                      required
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem'
                      }}
                    />
                    <Form.Text style={{ color: '#718096', fontSize: '0.875rem' }}>
                      Ingresa el número de tu factura o ticket de servicio
                    </Form.Text>
                  </Form.Group>

                  {error && (
                    <Alert variant="danger" style={{ borderRadius: '12px', marginBottom: '1rem' }}>
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
                        Consultando...
                      </>
                    ) : (
                      <>
                        <Search size={18} style={{ marginRight: '0.5rem' }} />
                        Consultar Garantía
                      </>
                    )}
                  </Button>
                </Form>

                {garantiaEncontrada && (
                  <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: garantiaEncontrada.estado === 'Activa' ? '#f0fdf4' : '#fef2f2',
                    borderRadius: '12px',
                    border: `2px solid ${getEstadoColor()}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      {garantiaEncontrada.estado === 'Activa' ? (
                        <CheckCircle size={24} color={getEstadoColor()} />
                      ) : (
                        <XCircle size={24} color={getEstadoColor()} />
                      )}
                      <h6 style={{ margin: 0, color: garantiaEncontrada.estado === 'Activa' ? '#166534' : '#991b1b', fontWeight: '700' }}>
                        Garantía {garantiaEncontrada.estado}
                      </h6>
                    </div>
                    <hr style={{ borderColor: getEstadoColor(), opacity: 0.3 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <strong style={{ color: '#1a202c' }}>Producto/Servicio:</strong>
                        <p style={{ margin: 0, color: '#4b5563' }}>{garantiaEncontrada.producto}</p>
                      </div>
                      <div>
                        <strong style={{ color: '#1a202c' }}>Fecha de Servicio:</strong>
                        <p style={{ margin: 0, color: '#4b5563' }}>{garantiaEncontrada.fechaServicio}</p>
                      </div>
                      <div>
                        <strong style={{ color: '#1a202c' }}>Válida hasta:</strong>
                        <p style={{ margin: 0, color: '#4b5563' }}>{garantiaEncontrada.fechaVencimiento}</p>
                      </div>
                      {garantiaEncontrada.estado === 'Activa' && (
                        <div>
                          <strong style={{ color: '#1a202c' }}>Días restantes:</strong>
                          <p style={{ 
                            margin: 0, 
                            color: getDiasRestantesColor(),
                            fontWeight: '600',
                            fontSize: '1.1rem'
                          }}>
                            {garantiaEncontrada.diasRestantes} días
                            {garantiaEncontrada.diasRestantes <= 7 && (
                              <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                                (¡Por vencer!)
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      <div>
                        <strong style={{ color: '#1a202c' }}>Estado:</strong>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.35rem 0.75rem',
                          background: getEstadoColor(),
                          color: 'white',
                          borderRadius: '50px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginLeft: '0.5rem'
                        }}>
                          {garantiaEncontrada.estado}
                        </span>
                      </div>
                      <div>
                        <strong style={{ color: '#1a202c' }}>Tipo de Cobertura:</strong>
                        <p style={{ margin: 0, color: '#4b5563' }}>{garantiaEncontrada.cobertura}</p>
                      </div>
                      {garantiaEncontrada.detalles && (
                        <div>
                          <strong style={{ color: '#1a202c' }}>Detalles:</strong>
                          <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem' }}>
                            {garantiaEncontrada.detalles}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Información de Garantías */}
          <Col md={6} className="mb-4">
            <Card style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              height: '100%'
            }}>
              <div style={{
                background: '#5FC88F',
                padding: '1.5rem',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={24} color="white" />
                  <h5 style={{ margin: 0, color: 'white', fontWeight: '700' }}>
                    Nuestras Garantías
                  </h5>
                </div>
              </div>
              <Card.Body style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: '#4C8BF515',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Wrench size={24} color="#4C8BF5" />
                    </div>
                    <h6 style={{ margin: 0, color: '#1a202c', fontWeight: '700' }}>
                      Servicios de Reparación
                    </h6>
                  </div>
                  <ul style={{ paddingLeft: '1.5rem', color: '#4b5563', lineHeight: '1.8' }}>
                    <li><strong>30 días</strong> de garantía en mano de obra</li>
                    <li><strong>90 días</strong> en repuestos originales</li>
                    <li>Cobertura contra defectos de fabricación</li>
                  </ul>
                </div>
                <hr style={{ borderColor: '#e2e8f0' }} />
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: '#5FC88F15',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package size={24} color="#5FC88F" />
                    </div>
                    <h6 style={{ margin: 0, color: '#1a202c', fontWeight: '700' }}>
                      Productos y Accesorios
                    </h6>
                  </div>
                  <ul style={{ paddingLeft: '1.5rem', color: '#4b5563', lineHeight: '1.8' }}>
                    <li><strong>30 días</strong> de garantía por defectos</li>
                    <li>Cambio o devolución sin preguntas</li>
                    <li>Productos sellados y originales</li>
                  </ul>
                </div>
                <hr style={{ borderColor: '#e2e8f0' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: '#FFA72615',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <AlertCircle size={24} color="#FFA726" />
                    </div>
                    <h6 style={{ margin: 0, color: '#1a202c', fontWeight: '700' }}>
                      Exclusiones
                    </h6>
                  </div>
                  <ul style={{ paddingLeft: '1.5rem', color: '#4b5563', lineHeight: '1.8' }}>
                    <li>Daños por mal uso o accidente</li>
                    <li>Daño por líquidos posteriores al servicio</li>
                    <li>Manipulación por terceros no autorizados</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Proceso de Reclamación */}
        <Row className="mt-4">
          <Col>
            <Card style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
            }}>
              <div style={{
                background: '#0ea5e9',
                padding: '1.5rem',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Award size={24} color="white" />
                  <h5 style={{ margin: 0, color: 'white', fontWeight: '700' }}>
                    Proceso de Reclamación de Garantía
                  </h5>
                </div>
              </div>
              <Card.Body style={{ padding: '2rem' }}>
                <Row>
                  {[
                    { num: 1, icon: Phone, titulo: 'Contactar', desc: 'Comunícate con nosotros por WhatsApp o en tienda', color: '#4C8BF5' },
                    { num: 2, icon: Search, titulo: 'Evaluar', desc: 'Revisamos tu equipo y validamos la garantía', color: '#5FC88F' },
                    { num: 3, icon: Wrench, titulo: 'Reparar', desc: 'Realizamos el servicio sin costo adicional', color: '#FFA726' },
                    { num: 4, icon: CheckCircle, titulo: 'Entregar', desc: 'Recibes tu equipo reparado con garantía renovada', color: '#8b5cf6' }
                  ].map((paso, index) => {
                    const IconComponent = paso.icon
                    return (
                      <Col md={3} key={index} className="text-center mb-3">
                        <div style={{
                          position: 'relative',
                          padding: '1.5rem'
                        }}>
                          <div style={{
                            width: '80px',
                            height: '80px',
                            background: `${paso.color}15`,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            position: 'relative'
                          }}>
                            <IconComponent size={36} color={paso.color} />
                            <div style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              width: '32px',
                              height: '32px',
                              background: paso.color,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '700',
                              fontSize: '0.875rem'
                            }}>
                              {paso.num}
                            </div>
                          </div>
                          <h6 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '0.5rem' }}>
                            {paso.titulo}
                          </h6>
                          <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: 0 }}>
                            {paso.desc}
                          </p>
                        </div>
                      </Col>
                    )
                  })}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Preguntas Frecuentes */}
        <Row className="mt-4">
          <Col>
            <h4 style={{
              marginBottom: '1.5rem',
              fontWeight: '700',
              color: '#1a202c',
              fontSize: '1.875rem'
            }}>
              Preguntas Frecuentes sobre Garantías
            </h4>
            <Accordion>
              {[
                {
                  pregunta: '¿Qué cubre la garantía de reparación?',
                  respuesta: 'La garantía cubre defectos en la mano de obra y repuestos utilizados durante la reparación. Si el problema persiste o aparece un defecto relacionado con nuestro servicio dentro del período de garantía, lo reparamos sin costo adicional.'
                },
                {
                  pregunta: '¿Cuánto dura la garantía?',
                  respuesta: '- Mano de obra: 30 días\n- Repuestos originales: 90 días\n- Accesorios nuevos: 30 días'
                },
                {
                  pregunta: '¿Qué necesito para hacer efectiva la garantía?',
                  respuesta: 'Solo necesitas tu factura o comprobante de servicio. Es importante conservarlo durante todo el período de garantía. Sin factura no podemos validar la cobertura.'
                },
                {
                  pregunta: '¿Puedo hacer efectiva la garantía si compré en línea?',
                  respuesta: '¡Sí! Puedes traer el producto a nuestra tienda física o contactarnos por WhatsApp. Si el producto está defectuoso, gestionamos el cambio o devolución inmediatamente.'
                }
              ].map((item, index) => (
                <Accordion.Item 
                  eventKey={index.toString()} 
                  key={index}
                  style={{
                    border: 'none',
                    marginBottom: '1rem',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <Accordion.Header style={{
                    background: 'white',
                    borderRadius: '12px',
                    fontWeight: '600',
                    color: '#1a202c'
                  }}>
                    {item.pregunta}
                  </Accordion.Header>
                  <Accordion.Body style={{
                    background: '#f8f9fa',
                    color: '#4b5563',
                    lineHeight: '1.7',
                    whiteSpace: 'pre-line'
                  }}>
                    {item.respuesta}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>

        {/* Contacto Soporte */}
        <Row className="mt-5">
          <Col>
            <Card style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
            }}>
              <Card.Body style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  boxShadow: '0 4px 12px rgba(76, 139, 245, 0.2)'
                }}>
                  <Phone size={40} color="#4C8BF5" />
                </div>
                <h5 style={{
                  marginBottom: '1rem',
                  fontWeight: '700',
                  color: '#1a202c',
                  fontSize: '1.5rem'
                }}>
                  ¿Necesitas Ayuda con tu Garantía?
                </h5>
                <p style={{ color: '#718096', marginBottom: '2rem', fontSize: '1.0625rem' }}>
                  Nuestro equipo está listo para atenderte
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    href="https://wa.me/573001234567"
                    target="_blank"
                    style={{
                      padding: '14px 32px',
                      background: '#5FC88F',
                      border: 'none',
                      borderRadius: '50px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#4db87b'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#5FC88F'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <Phone size={20} />
                    WhatsApp: 300 123 4567
                  </Button>
                  <Button 
                    href="mailto:soporte@megacell.com"
                    style={{
                      padding: '14px 32px',
                      background: 'white',
                      border: '2px solid #4C8BF5',
                      color: '#4C8BF5',
                      borderRadius: '50px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#4C8BF5'
                      e.currentTarget.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.color = '#4C8BF5'
                    }}
                  >
                    <Mail size={20} />
                    soporte@megacell.com
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Garantias