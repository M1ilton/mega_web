import { Link } from 'react-router-dom'
import { 
  Smartphone, Mail, Phone, MapPin, 
  Facebook, Instagram, MessageCircle,
  Wrench, ShoppingCart, Shield, Package,
  Info, Star, HelpCircle, MessageSquare,
  FileText, Lock, Clock, Award
} from 'lucide-react'

function Footer() {
  const servicios = [
    { to: '/reparacion', icono: Wrench, texto: 'Reparación' },
    { to: '/tienda', icono: ShoppingCart, texto: 'Tienda Virtual' },
    { to: '/garantias', icono: Shield, texto: 'Garantías' },
    { to: '/seguimiento', icono: Package, texto: 'Seguimiento' }
  ]

  const informacion = [
    { to: '/nosotros', icono: Info, texto: 'Acerca de' },
    { to: '/resenas', icono: Star, texto: 'Reseñas' },
    { to: '/faq', icono: HelpCircle, texto: 'Preguntas Frecuentes' },
    { to: '/ayuda', icono: MessageSquare, texto: 'Ayuda' },
    { to: '/contacto', icono: Phone, texto: 'Contacto' }
  ]

  const legal = [
    { to: '/privacidad', icono: Lock, texto: 'Políticas de Privacidad' },
    { to: '/terminos', icono: FileText, texto: 'Términos y Condiciones' },
    { to: '/seguridad', icono: Shield, texto: 'Seguridad Digital' }
  ]

  const redesSociales = [
    { href: 'https://facebook.com', icono: Facebook, texto: 'Facebook', color: '#1877F2' },
    { href: 'https://instagram.com', icono: Instagram, texto: 'Instagram', color: '#E4405F' },
    { href: 'https://wa.me/573001234567', icono: MessageCircle, texto: 'WhatsApp', color: '#25D366' }
  ]

  return (
    <footer style={{
      background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
      color: 'white',
      marginTop: '5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Patrón de fondo decorativo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.03,
        background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      }}></div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Contenido Principal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Columna 1: Logo e Información */}
          <div style={{ maxWidth: '320px' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                  <Smartphone size={28} color="white" />
                </div>
                <span style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  color: 'white',
                  letterSpacing: '-0.02em'
                }}>
                  MegaCell
                </span>
              </div>
            </Link>
            
            <p style={{
              color: 'rgba(255,255,255,0.75)',
              lineHeight: '1.6',
              marginBottom: '1.25rem',
              fontSize: '0.9375rem'
            }}>
              Tu centro de confianza para reparación de celulares y accesorios 
              tecnológicos en Quibdó, Chocó.
            </p>

            {/* Insignias de calidad */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.875rem',
                background: 'rgba(95, 200, 143, 0.15)',
                borderRadius: '50px',
                border: '1px solid rgba(95, 200, 143, 0.3)'
              }}>
                <Award size={14} color="#5FC88F" />
                <span style={{ fontSize: '0.75rem', color: '#5FC88F', fontWeight: '600' }}>
                  Calidad Certificada
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.875rem',
                background: 'rgba(76, 139, 245, 0.15)',
                borderRadius: '50px',
                border: '1px solid rgba(76, 139, 245, 0.3)'
              }}>
                <Clock size={14} color="#4C8BF5" />
                <span style={{ fontSize: '0.75rem', color: '#4C8BF5', fontWeight: '600' }}>
                  Soporte 24/7
                </span>
              </div>
            </div>

            {/* Redes Sociales */}
            <div>
              <h6 style={{
                fontSize: '0.875rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.875rem',
                letterSpacing: '0.02em'
              }}>
                Síguenos en Redes
              </h6>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                {redesSociales.map((red, index) => {
                  const IconComponent = red.icono
                  return (
                    <a
                      key={index}
                      href={red.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        transition: 'all 0.3s ease',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = red.color
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.boxShadow = `0 6px 12px ${red.color}40`
                        e.currentTarget.style.borderColor = red.color
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                      }}
                    >
                      <IconComponent size={18} color="white" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Columna 2: Servicios */}
          <div>
            <h6 style={{
              fontSize: '0.875rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1.25rem',
              letterSpacing: '0.02em'
            }}>
              Nuestros Servicios
            </h6>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem'
            }}>
              {servicios.map((item, index) => {
                const IconComponent = item.icono
                return (
                  <li key={index}>
                    <Link
                      to={item.to}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        color: 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        padding: '0.5rem 0.625rem',
                        borderRadius: '6px',
                        transition: 'all 0.3s ease',
                        fontSize: '0.9375rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'white'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.paddingLeft = '0.875rem'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.paddingLeft = '0.625rem'
                      }}
                    >
                      <IconComponent size={16} />
                      {item.texto}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Columna 3: Información */}
          <div>
            <h6 style={{
              fontSize: '0.875rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1.25rem',
              letterSpacing: '0.02em'
            }}>
              Información
            </h6>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem'
            }}>
              {informacion.map((item, index) => {
                const IconComponent = item.icono
                return (
                  <li key={index}>
                    <Link
                      to={item.to}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        color: 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        padding: '0.5rem 0.625rem',
                        borderRadius: '6px',
                        transition: 'all 0.3s ease',
                        fontSize: '0.9375rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'white'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.paddingLeft = '0.875rem'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.paddingLeft = '0.625rem'
                      }}
                    >
                      <IconComponent size={16} />
                      {item.texto}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Legal */}
            <h6 style={{
              fontSize: '0.875rem',
              fontWeight: '700',
              color: 'white',
              marginTop: '1.5rem',
              marginBottom: '0.875rem',
              letterSpacing: '0.02em'
            }}>
              Legal
            </h6>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem'
            }}>
              {legal.map((item, index) => {
                const IconComponent = item.icono
                return (
                  <li key={index}>
                    <Link
                      to={item.to}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        color: 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        padding: '0.5rem 0.625rem',
                        borderRadius: '6px',
                        transition: 'all 0.3s ease',
                        fontSize: '0.9375rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'white'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.paddingLeft = '0.875rem'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.paddingLeft = '0.625rem'
                      }}
                    >
                      <IconComponent size={16} />
                      {item.texto}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h6 style={{
              fontSize: '0.875rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1.25rem',
              letterSpacing: '0.02em'
            }}>
              Contáctanos
            </h6>

            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'rgba(95, 200, 143, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MapPin size={16} color="#5FC88F" />
                  </div>
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: '0.25rem',
                      fontWeight: '600'
                    }}>
                      Ubicación
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: 'rgba(255,255,255,0.9)',
                      lineHeight: '1.4'
                    }}>
                      Calle 25 #5-42<br />
                      Quibdó, Chocó
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'rgba(76, 139, 245, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Phone size={16} color="#4C8BF5" />
                  </div>
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: '0.25rem',
                      fontWeight: '600'
                    }}>
                      Teléfono
                    </p>
                    <a href="tel:+573001234567" style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: 'rgba(255,255,255,0.9)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#4C8BF5'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}>
                      +57 300 123 4567
                    </a>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'rgba(255, 167, 38, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Mail size={16} color="#FFA726" />
                  </div>
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: '0.25rem',
                      fontWeight: '600'
                    }}>
                      Email
                    </p>
                    <a href="mailto:info@megacell.com" style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: 'rgba(255,255,255,0.9)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      wordBreak: 'break-all'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FFA726'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}>
                      info@megacell.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separador decorativo */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
          marginBottom: '2rem'
        }}></div>

        {/* Copyright */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.875rem',
            margin: 0,
            lineHeight: '1.7'
          }}>
            © 2025 MegaCell. Todos los derechos reservados.
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.8125rem',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Desarrollado con 💜 por <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Milton Alexander Mosquera</strong>, 
            <strong style={{ color: 'rgba(255,255,255,0.7)' }}> Omar Stivenson Rivas</strong> & 
            <strong style={{ color: 'rgba(255,255,255,0.7)' }}> Jhon Jairo Palacios</strong>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer