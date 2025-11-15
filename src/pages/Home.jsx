import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'
import { 
  Wrench, 
  ShoppingBag, 
  CheckCircle, 
  Package, 
  Award,
  Zap,
  Shield,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  Phone,
  MapPin,
  Mail
} from 'lucide-react'

const API_URL = 'http://localhost/megacell_backend'

function Home() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)
  const [estadisticasDinamicas, setEstadisticasDinamicas] = useState({
    clientes: '5000+',
    experiencia: '10+',
    tasa: '99%',
    soporte: '24/7'
  })
  const [loading, setLoading] = useState(true)

  // Efecto de scroll para animaciones
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cargar estadísticas del backend (si están disponibles)
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const response = await fetch(`${API_URL}/estadisticas.php`, {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Actualizar estadísticas con datos reales
            setEstadisticasDinamicas({
              clientes: data.data.total_usuarios ? `${data.data.total_usuarios}+` : '5000+',
              experiencia: '10+',
              tasa: data.data.total_reparaciones ? 
                `${Math.round((data.data.reparaciones_por_estado?.find(r => r.estado === 'completado')?.total || 0) / data.data.total_reparaciones * 100)}%` : 
                '99%',
              soporte: '24/7'
            })
          }
        }
      } catch (error) {
        console.log('Usando estadísticas por defecto')
      } finally {
        setLoading(false)
      }
    }

    cargarEstadisticas()
  }, [])

  const serviciosDestacados = [
    {
      icon: Wrench,
      titulo: 'Reparación Profesional',
      descripcion: 'Diagnóstico gratuito y reparación garantizada para todos los modelos.',
      link: '/reparacion',
      color: '#4C8BF5'
    },
    {
      icon: ShoppingBag,
      titulo: 'Tienda de Accesorios',
      descripcion: 'Productos originales certificados: fundas, cargadores y más.',
      link: '/tienda',
      color: '#5FC88F'
    },
    {
      icon: CheckCircle,
      titulo: 'Garantía de Calidad',
      descripcion: 'Todos nuestros servicios incluyen garantía extendida.',
      link: '/garantias',
      color: '#8b5cf6'
    },
    {
      icon: Package,
      titulo: 'Seguimiento en Tiempo Real',
      descripcion: 'Monitorea el estado de tu pedido o reparación.',
      link: '/seguimiento',
      color: '#FFA726'
    }
  ]

  const promociones = [
    {
      titulo: 'Cambio de Pantalla',
      descripcion: '20% de descuento en reparación de pantallas para todos los modelos',
      badge: 'Oferta Limitada',
      variant: 'primary',
      link: '/reparacion'
    },
    {
      titulo: 'Diagnóstico Sin Costo',
      descripcion: 'Evaluación técnica profesional completamente gratuita',
      badge: 'Servicio Incluido',
      variant: 'success',
      link: '/reparacion'
    },
    {
      titulo: 'Pack de Protección',
      descripcion: 'Cargador + Cable USB-C + Funda protectora con 15% de descuento',
      badge: 'Combo',
      variant: 'info',
      link: '/tienda'
    }
  ]

  const resenas = [
    {
      nombre: 'María González',
      comentario: 'Servicio excelente y profesional. Repararon mi iPhone en menos de una hora con garantía completa.',
      estrellas: 5,
      fecha: 'Hace 2 días'
    },
    {
      nombre: 'Carlos Ramírez',
      comentario: 'Atención de primera calidad y precios justos. Totalmente recomendado para reparaciones.',
      estrellas: 5,
      fecha: 'Hace 1 semana'
    },
    {
      nombre: 'Ana López',
      comentario: 'Plataforma intuitiva y fácil de usar. Encontré todos los accesorios que necesitaba.',
      estrellas: 4,
      fecha: 'Hace 2 semanas'
    }
  ]

  const estadisticas = [
    { numero: estadisticasDinamicas.clientes, label: 'Clientes Satisfechos' },
    { numero: estadisticasDinamicas.experiencia, label: 'Años de Experiencia' },
    { numero: estadisticasDinamicas.tasa, label: 'Tasa de Éxito' },
    { numero: estadisticasDinamicas.soporte, label: 'Soporte Disponible' }
  ]

  const valores = [
    { icon: Award, titulo: 'Calidad Garantizada', color: '#fbbf24' },
    { icon: Zap, titulo: 'Servicio Rápido', color: '#f59e0b' },
    { icon: Shield, titulo: 'Seguridad Total', color: '#4C8BF5' },
    { icon: DollarSign, titulo: 'Precios Justos', color: '#5FC88F' }
  ]

  const handleNavigation = (path) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    navigate(path)
  }

  return (
    <div style={{ background: '#ffffff' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '85vh',
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
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          transform: `translateY(${scrollY * 0.3}px)`
        }}></div>
        
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <Row className="align-items-center">
            <Col lg={7}>
              <div style={{ 
                maxWidth: '650px',
                transform: `translateY(${scrollY * -0.1}px)`,
                transition: 'transform 0.3s ease-out'
              }}>
                <h1 style={{
                  fontSize: '3.5rem',
                  fontWeight: '800',
                  color: 'white',
                  lineHeight: '1.1',
                  marginBottom: '1.5rem',
                  textShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  animation: 'fadeInUp 0.8s ease-out'
                }}>
                  Centro Especializado en Reparación de Dispositivos Móviles
                </h1>
                <p style={{
                  fontSize: '1.25rem',
                  color: 'rgba(255,255,255,0.95)',
                  marginBottom: '2.5rem',
                  lineHeight: '1.7',
                  animation: 'fadeInUp 0.8s ease-out 0.2s both'
                }}>
                  Soluciones técnicas profesionales con garantía certificada. 
                  Servicio rápido, confiable y respaldado por expertos.
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  flexWrap: 'wrap', 
                  marginBottom: '3rem',
                  animation: 'fadeInUp 0.8s ease-out 0.4s both'
                }}>
                  <Button
                    onClick={() => handleNavigation('/tienda')}
                    style={{
                      padding: '16px 36px',
                      fontSize: '1.0625rem',
                      fontWeight: '600',
                      borderRadius: '12px',
                      background: 'white',
                      color: '#667eea',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                    }}
                  >
                    <ShoppingBag size={20} />
                    Explorar Productos
                  </Button>
                  
                  <Button
                    onClick={() => handleNavigation('/reparacion')}
                    style={{
                      padding: '16px 36px',
                      fontSize: '1.0625rem',
                      fontWeight: '600',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      border: '2px solid white',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#667eea';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Wrench size={20} />
                    Solicitar Reparación
                  </Button>
                </div>
                
                {/* Estadísticas */}
                <Row style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both' }}>
                  {estadisticas.map((stat, index) => (
                    <Col xs={6} md={3} key={index} className="text-center mb-3">
                      <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        padding: '1.5rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'transform 0.3s ease',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <h3 style={{
                          fontSize: '2rem',
                          fontWeight: '800',
                          color: 'white',
                          marginBottom: '0.25rem'
                        }}>
                          {stat.numero}
                        </h3>
                        <small style={{
                          fontSize: '0.875rem',
                          color: 'rgba(255,255,255,0.85)',
                          fontWeight: '500'
                        }}>
                          {stat.label}
                        </small>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>
            <Col lg={5} className="text-center d-none d-lg-block">
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '3rem',
                border: '1px solid rgba(255,255,255,0.2)',
                animation: 'fadeInRight 0.8s ease-out 0.4s both'
              }}>
                <div style={{
                  width: '280px',
                  height: '280px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                  animation: 'float 3s ease-in-out infinite'
                }}>
                  <svg width="160" height="160" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="2" width="14" height="20" rx="2" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.1)"/>
                    <path d="M9 6H15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="12" cy="18" r="1" fill="white"/>
                  </svg>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Sección de Servicios */}
      <section style={{ padding: '5rem 0', background: '#f8f9fa' }}>
        <Container>
          <div className="text-center mb-5">
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '1rem'
            }}>
              Nuestros Servicios Profesionales
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#718096',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Soluciones técnicas integrales para tu dispositivo móvil
            </p>
          </div>
          <Row>
            {serviciosDestacados.map((servicio, index) => {
              const IconComponent = servicio.icon
              return (
                <Col lg={3} md={6} key={index} className="mb-4">
                  <Card style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleNavigation(servicio.link)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)';
                  }}>
                    <Card.Body style={{ padding: '2rem', textAlign: 'center' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: `${servicio.color}15`,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        transition: 'transform 0.3s ease'
                      }}>
                        <IconComponent size={40} color={servicio.color} />
                      </div>
                      <h5 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#1a202c',
                        marginBottom: '1rem'
                      }}>
                        {servicio.titulo}
                      </h5>
                      <p style={{
                        color: '#718096',
                        marginBottom: '1.5rem',
                        lineHeight: '1.6',
                        fontSize: '0.9375rem'
                      }}>
                        {servicio.descripcion}
                      </p>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNavigation(servicio.link)
                        }}
                        style={{
                          background: 'transparent',
                          border: `2px solid ${servicio.color}`,
                          color: servicio.color,
                          padding: '10px 28px',
                          borderRadius: '50px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = servicio.color;
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = servicio.color;
                        }}>
                        Ver Detalles
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </Container>
      </section>

      {/* Sección de Promociones */}
      <section style={{ padding: '5rem 0', background: 'white' }}>
        <Container>
          <div className="text-center mb-5">
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '1rem'
            }}>
              Ofertas Especiales del Mes
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#718096',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Aprovecha nuestras promociones exclusivas en servicios y productos
            </p>
          </div>
          <Row>
            {promociones.map((promo, index) => (
              <Col lg={4} md={6} key={index} className="mb-4">
                <Card style={{
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => handleNavigation(promo.link)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)';
                }}>
                  <Card.Body style={{ padding: '2rem' }}>
                    <Badge 
                      bg={promo.variant} 
                      style={{ 
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        padding: '0.5rem 1rem',
                        borderRadius: '50px',
                        marginBottom: '1.25rem'
                      }}
                    >
                      {promo.badge}
                    </Badge>
                    <h5 style={{
                      fontSize: '1.375rem',
                      fontWeight: '700',
                      color: '#1a202c',
                      marginBottom: '1rem'
                    }}>
                      {promo.titulo}
                    </h5>
                    <p style={{
                      color: '#718096',
                      marginBottom: '1.5rem',
                      lineHeight: '1.6'
                    }}>
                      {promo.descripcion}
                    </p>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNavigation(promo.link)
                      }}
                      style={{
                        background: promo.variant === 'primary' ? '#4C8BF5' :
                                   promo.variant === 'success' ? '#5FC88F' :
                                   '#0ea5e9',
                        border: 'none',
                        color: 'white',
                        padding: '12px 32px',
                        borderRadius: '50px',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}>
                      Aprovechar Oferta
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Sección de Acceso Rápido */}
      <section style={{
        padding: '5rem 0',
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
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
          <div className="text-center mb-5">
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Acceso Directo a Servicios
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: 'rgba(255,255,255,0.9)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Navega rápidamente a las funciones más utilizadas
            </p>
          </div>
          <Row>
            {[
              { icon: ShoppingBag, title: 'Tienda Virtual', desc: 'Explora nuestro catálogo completo', path: '/tienda' },
              { icon: Package, title: 'Seguimiento de Pedidos', desc: 'Rastrea tu orden en tiempo real', path: '/seguimiento' },
              { icon: Phone, title: 'Atención al Cliente', desc: 'Soporte técnico especializado', path: '/contacto' }
            ].map((item, index) => {
              const IconComponent = item.icon
              return (
                <Col md={4} key={index} className="mb-4">
                  <div
                    onClick={() => handleNavigation(item.path)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      padding: '2.5rem',
                      borderRadius: '16px',
                      border: '2px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'translateY(-8px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <IconComponent size={48} color="white" style={{ marginBottom: '1rem' }} />
                    <h5 style={{ color: 'white', fontWeight: '700', marginBottom: '0.5rem' }}>
                      {item.title}
                    </h5>
                    <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 0, fontSize: '0.9375rem' }}>
                      {item.desc}
                    </p>
                  </div>
                </Col>
              )
            })}
          </Row>
        </Container>
      </section>

      {/* Sección de Reseñas */}
      <section style={{ padding: '5rem 0', background: '#f8f9fa' }}>
        <Container>
          <div className="text-center mb-5">
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '1rem'
            }}>
              Testimonios de Clientes
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#718096',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Experiencias reales de usuarios satisfechos con nuestros servicios
            </p>
          </div>
          <Row>
            {resenas.map((resena, index) => (
              <Col lg={4} md={6} key={index} className="mb-4">
                <Card style={{
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  height: '100%',
                  background: 'white',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)';
                }}>
                  <Card.Body style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem' }}>
                      {[...Array(resena.estrellas)].map((_, i) => (
                        <Star key={i} size={20} fill="#fbbf24" color="#fbbf24" />
                      ))}
                    </div>
                    <p style={{
                      fontStyle: 'italic',
                      color: '#4b5563',
                      marginBottom: '1.5rem',
                      lineHeight: '1.7',
                      fontSize: '0.9375rem'
                    }}>
                      "{resena.comentario}"
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e2e8f0'
                    }}>
                      <p style={{
                        fontWeight: '700',
                        color: '#1a202c',
                        marginBottom: 0,
                        fontSize: '0.9375rem'
                      }}>
                        {resena.nombre}
                      </p>
                      <small style={{ color: '#a0aec0', fontSize: '0.8125rem' }}>
                        {resena.fecha}
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Sección de Información de la Empresa */}
      <section style={{ padding: '5rem 0', background: 'white' }}>
        <Container>
          <Row className="align-items-center mb-5">
            <Col md={6} className="mb-4 mb-md-0">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <TrendingUp size={32} color="#4C8BF5" />
                <h3 style={{
                  fontWeight: '700',
                  fontSize: '1.875rem',
                  color: '#1a202c',
                  marginBottom: 0
                }}>
                  Nuestra Misión
                </h3>
              </div>
              <p style={{
                lineHeight: '1.8',
                color: '#4b5563',
                fontSize: '1rem'
              }}>
                Proporcionar soluciones tecnológicas profesionales y accesibles, 
                ofreciendo servicios de reparación certificados y productos de 
                calidad premium con garantía completa. Nos comprometemos con la 
                excelencia en cada servicio.
              </p>
            </Col>
            <Col md={6}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <Award size={32} color="#5FC88F" />
                <h3 style={{
                  fontWeight: '700',
                  fontSize: '1.875rem',
                  color: '#1a202c',
                  marginBottom: 0
                }}>
                  Nuestra Visión
                </h3>
              </div>
              <p style={{
                lineHeight: '1.8',
                color: '#4b5563',
                fontSize: '1rem'
              }}>
                Convertirnos en el centro de servicios tecnológicos de referencia 
                en la región del Chocó, reconocidos por nuestra calidad técnica, 
                atención personalizada e innovación constante en soluciones móviles.
              </p>
            </Col>
          </Row>

          {/* Valores corporativos */}
          <Row className="mt-5">
            {valores.map((valor, index) => {
              const IconComponent = valor.icon
              return (
                <Col md={3} sm={6} key={index} className="text-center mb-4">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: `${valor.color}15`,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) rotate(-5deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  }}>
                    <IconComponent size={40} color={valor.color} />
                  </div>
                  <h6 style={{
                    fontWeight: '700',
                    fontSize: '1.0625rem',
                    color: '#1a202c'
                  }}>
                    {valor.titulo}
                  </h6>
                </Col>
              )
            })}
          </Row>
        </Container>
      </section>

      {/* Sección de Contacto Rápido */}
      <section style={{
        padding: '4rem 0',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '1rem'
              }}>
                ¿Tienes alguna pregunta?
              </h3>
              <p style={{
                fontSize: '1.125rem',
                color: '#718096',
                marginBottom: '2rem',
                lineHeight: '1.7'
              }}>
                Nuestro equipo está listo para ayudarte. Contáctanos por cualquiera de nuestros canales.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: Phone, label: 'Teléfono', value: '+57 300 123 4567', color: '#4C8BF5', href: 'tel:+573001234567' },
                  { icon: Mail, label: 'Email', value: 'contacto@megacell.com', color: '#5FC88F', href: 'mailto:contacto@megacell.com' },
                  { icon: MapPin, label: 'Ubicación', value: 'Quibdó, Chocó, Colombia', color: '#FFA726', href: '#' }
                ].map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <a
                      key={index}
                      href={item.href}
                      style={{
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(8px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: `${item.color}15`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconComponent size={24} color={item.color} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#718096' }}>{item.label}</p>
                        <p style={{ margin: 0, fontWeight: '600', color: '#1a202c' }}>{item.value}</p>
                      </div>
                    </a>
                  )
                })}
              </div>
            </Col>
            <Col md={6}>
              <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  Horarios de Atención
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { dia: 'Lunes - Viernes', horario: '8:00 AM - 6:00 PM', color: '#4C8BF5' },
                    { dia: 'Sábados', horario: '9:00 AM - 2:00 PM', color: '#4C8BF5' },
                    { dia: 'Domingos', horario: 'Cerrado', color: '#718096' }
                  ].map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '12px'
                    }}>
                      <span style={{ fontWeight: '600', color: '#1a202c' }}>{item.dia}</span>
                      <span style={{ color: item.color, fontWeight: '600' }}>{item.horario}</span>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #4C8BF5 0%, #8b5cf6 100%)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>
                    <Clock size={20} color="white" />
                    <span style={{
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '1rem'
                    }}>
                      Soporte 24/7
                    </span>
                  </div>
                  <p style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '0.875rem',
                    marginBottom: 0
                  }}>
                    Atención en línea disponible todos los días
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  )
}

export default Home