import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap'
import { Search, HelpCircle, MessageCircle, Mail } from 'lucide-react'

function FAQ() {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('todas')

  const categorias = [
    { id: 'todas', nombre: 'Todas', icono: '📋', color: '#4C8BF5' },
    { id: 'compras', nombre: 'Compras Online', icono: '🛒', color: '#5FC88F' },
    { id: 'reparaciones', nombre: 'Reparaciones', icono: '🔧', color: '#FFA726' },
    { id: 'pagos', nombre: 'Pagos', icono: '💳', color: '#0ea5e9' },
    { id: 'envios', nombre: 'Envíos', icono: '📦', color: '#ef4444' },
    { id: 'garantias', nombre: 'Garantías', icono: '✅', color: '#8b5cf6' }
  ]

  const preguntas = [
    {
      categoria: 'compras',
      pregunta: '¿Cómo puedo realizar una compra en línea?',
      respuesta: 'Para comprar en nuestra tienda virtual: 1) Navega por nuestro catálogo y selecciona los productos que deseas. 2) Agrega los productos al carrito. 3) Completa el proceso de checkout ingresando tus datos de envío. 4) Selecciona tu método de pago preferido. 5) Confirma tu pedido y recibirás un correo de confirmación con el número de seguimiento.'
    },
    {
      categoria: 'compras',
      pregunta: '¿Puedo modificar o cancelar mi pedido?',
      respuesta: 'Sí, puedes modificar o cancelar tu pedido siempre y cuando aún no haya sido procesado. Contáctanos inmediatamente por WhatsApp o correo con tu número de pedido. Si el pedido ya fue enviado, podrás rechazarlo en el momento de la entrega.'
    },
    {
      categoria: 'compras',
      pregunta: '¿Los productos son originales?',
      respuesta: 'Absolutamente. Todos nuestros productos son 100% originales y vienen con garantía oficial. Trabajamos directamente con distribuidores autorizados y fabricantes reconocidos. Cada producto incluye su empaque original y certificado de autenticidad cuando aplica.'
    },
    {
      categoria: 'reparaciones',
      pregunta: '¿Cuánto tiempo tarda una reparación?',
      respuesta: 'El tiempo de reparación depende del tipo de servicio: Cambio de pantalla: 2-3 horas, Cambio de batería: 1 hora, Puerto de carga: 1-2 horas, Daño por agua: 3-5 horas (después del diagnóstico). Para reparaciones más complejas, te daremos un tiempo estimado después de la evaluación gratuita.'
    },
    {
      categoria: 'reparaciones',
      pregunta: '¿El diagnóstico tiene costo?',
      respuesta: '¡No! El diagnóstico es completamente GRATUITO. Nuestros técnicos evaluarán tu equipo sin ningún compromiso. Solo pagarás si decides realizar la reparación. Te explicaremos claramente el problema, la solución y el costo antes de proceder.'
    },
    {
      categoria: 'reparaciones',
      pregunta: '¿Qué pasa si no se puede reparar mi celular?',
      respuesta: 'Si después del diagnóstico determinamos que tu equipo no es reparable o no es económicamente viable repararlo, te lo informaremos con total transparencia. No tendrás que pagar nada y te devolveremos tu equipo. También podemos asesorarte sobre opciones de renovación o reciclaje responsable.'
    },
    {
      categoria: 'reparaciones',
      pregunta: '¿Usan repuestos originales?',
      respuesta: 'Sí, utilizamos repuestos originales o de primera calidad certificados. Para marcas premium como Apple y Samsung, usamos repuestos OEM (Original Equipment Manufacturer) que cumplen con los mismos estándares del fabricante. Cada repuesto viene con garantía.'
    },
    {
      categoria: 'pagos',
      pregunta: '¿Qué métodos de pago aceptan?',
      respuesta: 'Aceptamos múltiples formas de pago: 1) Tarjetas de crédito y débito (Visa, Mastercard, American Express). 2) Transferencias bancarias. 3) Pago contra entrega (efectivo o datáfono al recibir). 4) PSE. 5) Pagos en efectivo en nuestra tienda física.'
    },
    {
      categoria: 'pagos',
      pregunta: '¿Ofrecen financiación?',
      respuesta: 'Sí, tenemos convenios con tarjetas de crédito participantes para ofrecer hasta 3 meses sin intereses en compras superiores a $100.000. También manejamos cuotas con interés para plazos mayores. Consulta disponibilidad al momento de tu compra.'
    },
    {
      categoria: 'pagos',
      pregunta: '¿Es seguro pagar en línea?',
      respuesta: 'Totalmente seguro. Utilizamos encriptación SSL de 256 bits y trabajamos con pasarelas de pago certificadas por PCI DSS. Nunca almacenamos información completa de tarjetas. Todas las transacciones están protegidas y monitoreadas.'
    },
    {
      categoria: 'envios',
      pregunta: '¿Hacen envíos a toda Colombia?',
      respuesta: 'Sí, realizamos envíos a todo el territorio nacional. Trabajamos con transportadoras confiables para garantizar que tu pedido llegue en perfectas condiciones. Los tiempos de entrega varían según la ciudad: Quibdó: 1-2 días, Ciudades principales: 3-5 días, Zonas rurales: 5-8 días.'
    },
    {
      categoria: 'envios',
      pregunta: '¿Cuánto cuesta el envío?',
      respuesta: 'Los costos de envío varían según el destino y el peso del paquete. Sin embargo, tenemos ENVÍO GRATIS en compras superiores a $80.000 a ciudades principales. Para calcular el costo exacto de envío a tu dirección, agrégalo al carrito y verás el valor antes de confirmar la compra.'
    },
    {
      categoria: 'envios',
      pregunta: '¿Puedo rastrear mi pedido?',
      respuesta: 'Sí, puedes rastrear tu pedido en tiempo real. Una vez que tu pedido sea despachado, recibirás un correo y WhatsApp con tu número de guía. Puedes ingresar este número en nuestra sección de "Seguimiento" o directamente en la página de la transportadora.'
    },
    {
      categoria: 'garantias',
      pregunta: '¿Qué cubre la garantía?',
      respuesta: 'Nuestra garantía cubre: Reparaciones: 30 días en mano de obra y 90 días en repuestos originales. Productos nuevos: 30 días por defectos de fábrica. La garantía cubre defectos de fabricación y fallas en el servicio realizado, pero NO cubre daños por mal uso, golpes, líquidos o manipulación por terceros no autorizados.'
    },
    {
      categoria: 'garantias',
      pregunta: '¿Cómo hago efectiva mi garantía?',
      respuesta: 'Para hacer efectiva tu garantía: 1) Conserva tu factura o comprobante de servicio. 2) Contáctanos por WhatsApp, correo o acude a nuestra tienda. 3) Presenta tu equipo y factura. 4) Nuestros técnicos evaluarán el caso. 5) Si aplica la garantía, el servicio es sin costo. El proceso de garantía suele resolverse en 24-48 horas.'
    },
    {
      categoria: 'garantias',
      pregunta: '¿Puedo devolver un producto?',
      respuesta: 'Sí, aceptamos devoluciones dentro de los primeros 30 días si el producto está sin usar, en su empaque original y con todos sus accesorios. Para iniciar una devolución, contáctanos con tu número de factura. Te reembolsaremos el valor del producto (los costos de envío no son reembolsables). Las devoluciones por productos defectuosos no tienen costo adicional.'
    }
  ]

  const preguntasFiltradas = preguntas.filter(p => {
    const coincideBusqueda = p.pregunta.toLowerCase().includes(busqueda.toLowerCase()) ||
                            p.respuesta.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaActiva === 'todas' || p.categoria === categoriaActiva
    return coincideBusqueda && coincideCategoria
  })

  return (
    <div style={{ background: '#ffffff' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '45vh',
        display: 'flex',
        alignItems: 'center',
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
            <Col md={8} className="mx-auto text-center">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '20px',
                marginBottom: '1.5rem'
              }}>
                <HelpCircle size={40} color="white" />
              </div>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: '800',
                color: 'white',
                marginBottom: '1rem',
                textShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                Preguntas Frecuentes
              </h1>
              <p style={{
                fontSize: '1.25rem',
                color: 'rgba(255,255,255,0.95)',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Encuentra respuestas rápidas a todas tus dudas
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <Container style={{ padding: '5rem 0' }}>
        {/* Buscador */}
        <Row className="mb-5">
          <Col md={8} className="mx-auto">
            <Card style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}>
              <Card.Body style={{ padding: '2rem' }}>
                <Form>
                  <Form.Group>
                    <div style={{ position: 'relative' }}>
                      <Search 
                        size={20} 
                        color="#718096"
                        style={{
                          position: 'absolute',
                          left: '1.25rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 1
                        }}
                      />
                      <Form.Control
                        type="text"
                        placeholder="Busca tu pregunta aquí..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{
                          padding: '1rem 1rem 1rem 3.5rem',
                          fontSize: '1.0625rem',
                          border: '2px solid #e2e8f0',
                          borderRadius: '12px',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4C8BF5';
                          e.target.style.boxShadow = '0 0 0 4px rgba(76, 139, 245, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Categorías */}
        <Row className="mb-5">
          <Col>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center'
            }}>
              {categorias.map(cat => (
                <Button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '50px',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    border: 'none',
                    background: categoriaActiva === cat.id ? cat.color : 'white',
                    color: categoriaActiva === cat.id ? 'white' : '#1a202c',
                    boxShadow: categoriaActiva === cat.id 
                      ? `0 4px 12px ${cat.color}40` 
                      : '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (categoriaActiva !== cat.id) {
                      e.currentTarget.style.background = `${cat.color}15`;
                      e.currentTarget.style.color = cat.color;
                    }
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    if (categoriaActiva !== cat.id) {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#1a202c';
                    }
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '1.125rem' }}>{cat.icono}</span>
                  <span>{cat.nombre}</span>
                  <Badge 
                    style={{
                      background: categoriaActiva === cat.id 
                        ? 'rgba(255,255,255,0.3)' 
                        : `${cat.color}20`,
                      color: categoriaActiva === cat.id ? 'white' : cat.color,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}
                  >
                    {cat.id === 'todas' 
                      ? preguntas.length 
                      : preguntas.filter(p => p.categoria === cat.id).length
                    }
                  </Badge>
                </Button>
              ))}
            </div>
          </Col>
        </Row>

        {/* Preguntas y Respuestas */}
        <Row>
          <Col md={10} className="mx-auto">
            <h5 style={{
              marginBottom: '2rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#718096'
            }}>
              {preguntasFiltradas.length} pregunta(s) encontrada(s)
            </h5>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {preguntasFiltradas.map((item, index) => (
                <Card 
                  key={index}
                  style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <details>
                    <summary style={{
                      padding: '1.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      listStyle: 'none',
                      fontSize: '1.0625rem',
                      fontWeight: '600',
                      color: '#1a202c',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {categorias.find(c => c.id === item.categoria)?.icono}
                      </span>
                      <span style={{ flex: 1 }}>{item.pregunta}</span>
                    </summary>
                    <div style={{
                      padding: '0 1.5rem 1.5rem 1.5rem',
                      color: '#4b5563',
                      lineHeight: '1.7',
                      fontSize: '0.9375rem',
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '1.5rem'
                    }}>
                      {item.respuesta}
                    </div>
                  </details>
                </Card>
              ))}
            </div>

            {preguntasFiltradas.length === 0 && (
              <Card style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                padding: '4rem 2rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '80px', marginBottom: '1.5rem' }}>🔍</div>
                <h5 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '0.75rem'
                }}>
                  No encontramos resultados
                </h5>
                <p style={{ color: '#718096', fontSize: '1rem', marginBottom: 0 }}>
                  Intenta con otras palabras clave o selecciona una categoría diferente
                </p>
              </Card>
            )}
          </Col>
        </Row>

        {/* Contacto */}
        <Row className="mt-5">
          <Col md={10} className="mx-auto">
            <Card style={{
              border: 'none',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 12px 32px rgba(102, 126, 234, 0.3)',
              overflow: 'hidden'
            }}>
              <Card.Body style={{ padding: '3rem', textAlign: 'center' }}>
                <h5 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  ¿No encontraste lo que buscabas?
                </h5>
                <p style={{
                  fontSize: '1.0625rem',
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: '2rem',
                  maxWidth: '500px',
                  margin: '0 auto 2rem'
                }}>
                  Nuestro equipo está listo para ayudarte con cualquier consulta
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button style={{
                    background: 'white',
                    color: '#667eea',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}>
                    <MessageCircle size={20} />
                    WhatsApp: 300 123 4567
                  </Button>
                  <Button style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: '2px solid white',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#667eea';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <Mail size={20} />
                    Enviar Consulta
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

export default FAQ