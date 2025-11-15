import { useState } from 'react'
import { 
  BookOpen, Video, MessageCircle, Download, 
  ChevronDown, ChevronUp, FileText, RotateCcw,
  ClipboardList, Lock, Mail, Shield, Receipt,
  Phone, CheckCircle
} from 'lucide-react'

function Ayuda() {
  const [tutorialAbierto, setTutorialAbierto] = useState(0)

  const tutoriales = [
    {
      titulo: 'Cómo Registrarse en MegaCell',
      icono: '👤',
      color: '#4C8BF5',
      pasos: [
        'Haz clic en el botón "Registrarse" en la parte superior derecha',
        'Completa todos los campos del formulario (identificación, nombres, apellidos, etc.)',
        'Selecciona tu municipio de residencia',
        'Crea una contraseña segura y confírmala',
        'Haz clic en "Registrar" y tu cuenta quedará creada automáticamente',
        'Serás redirigido al inicio y podrás ver tu nombre en el menú'
      ]
    },
    {
      titulo: 'Cómo Comprar en la Tienda Virtual',
      icono: '🛒',
      color: '#9b59b6',
      pasos: [
        'Ve a la sección "Tienda Virtual" desde el menú principal',
        'Explora los productos por categorías o usa el buscador',
        'Selecciona el producto que te interesa',
        'Haz clic en "Agregar al Carrito"',
        'Ve al carrito y verifica tu pedido',
        'Completa el proceso de compra ingresando tu dirección de envío',
        'Selecciona tu método de pago preferido',
        'Confirma tu pedido y recibirás un número de seguimiento'
      ]
    },
    {
      titulo: 'Cómo Solicitar una Reparación',
      icono: '🔧',
      color: '#FFA726',
      pasos: [
        'Accede a "Servicios → Reparación de Celulares"',
        'Selecciona la marca y modelo de tu celular',
        'Elige el tipo de daño que tiene tu equipo',
        'Describe el problema con más detalle (opcional)',
        'Verás una cotización estimada del servicio',
        'Ingresa tus datos de contacto',
        'Envía la solicitud y nos comunicaremos contigo',
        'Podrás hacer seguimiento del estado de tu reparación'
      ]
    },
    {
      titulo: 'Cómo Hacer Seguimiento de mi Pedido',
      icono: '📦',
      color: '#5FC88F',
      pasos: [
        'Ve a "Servicios → Seguimiento de Servicios"',
        'Selecciona si quieres rastrear un pedido o una reparación',
        'Ingresa tu número de seguimiento (lo recibes por correo)',
        'Haz clic en "Rastrear Ahora"',
        'Verás el estado actual y el historial completo',
        'Puedes activar notificaciones por WhatsApp o email'
      ]
    }
  ]

  const formatos = [
    {
      nombre: 'Formato de Garantía',
      descripcion: 'Documento para reclamar garantía de productos o servicios',
      icono: FileText,
      color: '#4C8BF5',
      archivo: 'formato-garantia.pdf'
    },
    {
      nombre: 'Formato de Devolución',
      descripcion: 'Solicitud de devolución de productos',
      icono: RotateCcw,
      color: '#FFA726',
      archivo: 'formato-devolucion.pdf'
    },
    {
      nombre: 'Formato de Reclamo',
      descripcion: 'Presentar quejas o reclamos formales',
      icono: ClipboardList,
      color: '#e74c3c',
      archivo: 'formato-reclamo.pdf'
    }
  ]

  const recursos = [
    {
      icono: BookOpen,
      color: '#4C8BF5',
      titulo: 'Manual de Usuario',
      descripcion: 'Guía completa del sitio web',
      boton: 'Descargar PDF'
    },
    {
      icono: Video,
      color: '#9b59b6',
      titulo: 'Video Tutoriales',
      descripcion: 'Aprende visualmente paso a paso',
      boton: 'Ver Videos'
    },
    {
      icono: MessageCircle,
      color: '#5FC88F',
      titulo: 'Chat en Vivo',
      descripcion: 'Habla con un asesor ahora',
      boton: 'Iniciar Chat'
    }
  ]

  const consejos = [
    {
      icono: Lock,
      titulo: 'Seguridad',
      descripcion: 'Usa contraseñas seguras y no las compartas'
    },
    {
      icono: Mail,
      titulo: 'Confirmación',
      descripcion: 'Verifica tu email después de cada compra'
    },
    {
      icono: Receipt,
      titulo: 'Factura',
      descripcion: 'Guarda tus comprobantes para garantía'
    }
  ]

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
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
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 2rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
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
              <BookOpen size={48} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: '800',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                Centro de Ayuda
              </h1>
              <p style={{
                fontSize: '1.25rem',
                color: 'rgba(255,255,255,0.95)',
                marginBottom: 0
              }}>
                Guías y tutoriales para usar MegaCell
              </p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Recursos Principales */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {recursos.map((recurso, index) => {
            const IconComponent = recurso.icono
            return (
              <div
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2.5rem',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)'
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: `${recurso.color}15`,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <IconComponent size={40} color={recurso.color} />
                </div>
                <h5 style={{
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '0.75rem',
                  fontSize: '1.25rem'
                }}>
                  {recurso.titulo}
                </h5>
                <p style={{
                  color: '#718096',
                  marginBottom: '1.5rem',
                  fontSize: '0.9375rem',
                  lineHeight: '1.6'
                }}>
                  {recurso.descripcion}
                </p>
                <button style={{
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${recurso.color} 0%, ${recurso.color}dd 100%)`,
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = `0 6px 20px ${recurso.color}40`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                  {recurso.boton}
                </button>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Tutoriales */}
          <div>
            <h4 style={{
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '1.5rem',
              fontSize: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <BookOpen size={28} color="#8b5cf6" />
              Tutoriales Paso a Paso
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tutoriales.map((tutorial, index) => (
                <div
                  key={index}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                    border: tutorialAbierto === index ? `2px solid ${tutorial.color}` : '2px solid transparent'
                  }}
                >
                  <button
                    onClick={() => setTutorialAbierto(tutorialAbierto === index ? -1 : index)}
                    style={{
                      width: '100%',
                      padding: '1.5rem',
                      background: tutorialAbierto === index ? `${tutorial.color}08` : 'white',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (tutorialAbierto !== index) {
                        e.currentTarget.style.background = '#f8f9fa'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (tutorialAbierto !== index) {
                        e.currentTarget.style.background = 'white'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '2rem' }}>{tutorial.icono}</span>
                      <span style={{
                        fontWeight: '700',
                        color: '#1a202c',
                        fontSize: '1.125rem',
                        textAlign: 'left'
                      }}>
                        {tutorial.titulo}
                      </span>
                    </div>
                    {tutorialAbierto === index ? 
                      <ChevronUp size={24} color={tutorial.color} /> : 
                      <ChevronDown size={24} color="#718096" />
                    }
                  </button>

                  {tutorialAbierto === index && (
                    <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                      <ol style={{
                        margin: 0,
                        paddingLeft: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        {tutorial.pasos.map((paso, idx) => (
                          <li key={idx} style={{
                            color: '#4b5563',
                            fontSize: '0.9375rem',
                            lineHeight: '1.7',
                            paddingLeft: '0.5rem'
                          }}>
                            {paso}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Formatos Descargables */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #4C8BF5 0%, #5FC88F 100%)',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Download size={24} color="white" />
                <h6 style={{
                  margin: 0,
                  fontWeight: '700',
                  color: 'white',
                  fontSize: '1rem'
                }}>
                  Formatos Descargables
                </h6>
              </div>

              <div>
                {formatos.map((formato, index) => {
                  const IconComponent = formato.icono
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '1.5rem',
                        borderBottom: index < formatos.length - 1 ? '1px solid #e2e8f0' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: `${formato.color}15`,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <IconComponent size={24} color={formato.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h6 style={{
                            fontWeight: '700',
                            color: '#1a202c',
                            marginBottom: '0.25rem',
                            fontSize: '0.9375rem'
                          }}>
                            {formato.nombre}
                          </h6>
                          <p style={{
                            color: '#718096',
                            fontSize: '0.8125rem',
                            marginBottom: '0.75rem',
                            lineHeight: '1.5'
                          }}>
                            {formato.descripcion}
                          </p>
                          <button style={{
                            padding: '8px 16px',
                            background: 'white',
                            border: `2px solid ${formato.color}`,
                            borderRadius: '8px',
                            color: formato.color,
                            fontSize: '0.8125rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = formato.color
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white'
                            e.currentTarget.style.color = formato.color
                          }}>
                            <Download size={14} />
                            Descargar
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Ayuda Adicional */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
            }}>
              <h6 style={{
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '1rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <MessageCircle size={20} color="#5FC88F" />
                ¿Necesitas más ayuda?
              </h6>
              <p style={{
                color: '#718096',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                lineHeight: '1.6'
              }}>
                Contacta a nuestro equipo de soporte
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button style={{
                  padding: '12px',
                  background: '#25D366',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1fb855'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#25D366'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}>
                  <Phone size={18} />
                  WhatsApp
                </button>
                <button style={{
                  padding: '12px',
                  background: 'white',
                  border: '2px solid #4C8BF5',
                  borderRadius: '10px',
                  color: '#4C8BF5',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#4C8BF5'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.color = '#4C8BF5'
                }}>
                  <Mail size={18} />
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Consejos Útiles */}
        <div style={{
          marginTop: '3rem',
          background: 'white',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
        }}>
          <h5 style={{
            textAlign: 'center',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '2rem',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}>
            <CheckCircle size={28} color="#5FC88F" />
            Consejos Útiles
          </h5>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {consejos.map((consejo, index) => {
              const IconComponent = consejo.icono
              return (
                <div
                  key={index}
                  style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8f9fa'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: '#8b5cf615',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <IconComponent size={32} color="#8b5cf6" />
                  </div>
                  <h6 style={{
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '0.5rem',
                    fontSize: '1.125rem'
                  }}>
                    {consejo.titulo}
                  </h6>
                  <p style={{
                    color: '#718096',
                    marginBottom: 0,
                    fontSize: '0.9375rem',
                    lineHeight: '1.6'
                  }}>
                    {consejo.descripcion}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ayuda