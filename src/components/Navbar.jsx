import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { 
  Smartphone, Wrench, Shield, Package, ShoppingCart,
  Star, HelpCircle, MessageSquare, Phone, Menu, X,
  User, LogOut, LayoutDashboard, ChevronDown
} from 'lucide-react'

function NavigationBar({ isLoggedIn, onLogout }) {
  const [usuario, setUsuario] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Cargar datos del usuario desde localStorage
    const usuarioGuardado = localStorage.getItem('usuario')
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado))
    }

    // Detectar scroll para cambiar estilo del navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoggedIn])

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    setUsuario(null)
    onLogout()
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'white',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2rem'
      }}>
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(155, 89, 182, 0.3)'
          }}>
            <Smartphone size={28} color="white" />
          </div>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: '#1a202c'
          }}>
            MegaCell
          </span>
        </Link>

        {/* Menú Desktop */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flex: 1,
          justifyContent: 'center'
        }}
        className="desktop-menu">
          <NavLink to="/" texto="Inicio" />
          <NavDropdown 
            titulo="Servicios"
            items={[
              { to: '/reparacion', icono: Wrench, texto: 'Reparación de Celulares' },
              { to: '/garantias', icono: Shield, texto: 'Garantías y Soporte' },
              { to: '/seguimiento', icono: Package, texto: 'Seguimiento de Servicios' }
            ]}
          />
          <NavLink to="/tienda" texto="Tienda Virtual" />
          <NavDropdown 
            titulo="Más"
            items={[
              { to: '/resenas', icono: Star, texto: 'Reseñas' },
              { to: '/faq', icono: HelpCircle, texto: 'Preguntas Frecuentes' },
              { to: '/ayuda', icono: MessageSquare, texto: 'Ayuda' },
              { to: '/contacto', icono: Phone, texto: 'Contacto', divider: true }
            ]}
          />
        </div>

        {/* Acciones de Usuario */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
        className="user-actions">
          {isLoggedIn && usuario ? (
            <NavDropdown
              titulo={usuario.nombre}
              icono={User}
              items={[
                { to: '/mi-cuenta', icono: User, texto: 'Mi Cuenta' },
                { 
                  onClick: handleLogout, 
                  icono: LogOut, 
                  texto: 'Cerrar Sesión', 
                  color: '#e74c3c',
                  divider: true 
                }
              ]}
            />
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  color: '#4b5563',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9b59b6'
                  e.currentTarget.style.color = '#9b59b6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.color = '#4b5563'
                }}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/registro"
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(155, 89, 182, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Botón Menú Mobile */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
          className="mobile-menu-button"
        >
          {menuAbierto ? <X size={28} color="#1a202c" /> : <Menu size={28} color="#1a202c" />}
        </button>
      </div>

      {/* Menú Mobile */}
      {menuAbierto && (
        <div style={{
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          padding: '1rem 2rem',
          display: 'none'
        }}
        className="mobile-menu">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <MobileNavLink to="/" texto="Inicio" onClick={() => setMenuAbierto(false)} />
            <MobileNavLink to="/reparacion" texto="Reparación" onClick={() => setMenuAbierto(false)} />
            <MobileNavLink to="/tienda" texto="Tienda Virtual" onClick={() => setMenuAbierto(false)} />
            <MobileNavLink to="/garantias" texto="Garantías" onClick={() => setMenuAbierto(false)} />
            <MobileNavLink to="/seguimiento" texto="Seguimiento" onClick={() => setMenuAbierto(false)} />
            <MobileNavLink to="/resenas" texto="Reseñas" onClick={() => setMenuAbierto(false)} />
            <MobileNavLink to="/faq" texto="FAQ" onClick={() => setMenuAbierto(false)} />
            <MobileNavLink to="/contacto" texto="Contacto" onClick={() => setMenuAbierto(false)} />
            
            {isLoggedIn && usuario ? (
              <>
                <div style={{ 
                  height: '1px', 
                  background: '#e2e8f0', 
                  margin: '0.5rem 0' 
                }}></div>
                <MobileNavLink to="/mi-cuenta" texto="Mi Cuenta" onClick={() => setMenuAbierto(false)} />
                <button
                  onClick={() => {
                    handleLogout()
                    setMenuAbierto(false)
                  }}
                  style={{
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#e74c3c',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <div style={{ 
                  height: '1px', 
                  background: '#e2e8f0', 
                  margin: '0.5rem 0' 
                }}></div>
                <MobileNavLink to="/login" texto="Iniciar Sesión" onClick={() => setMenuAbierto(false)} />
                <MobileNavLink to="/registro" texto="Registrarse" onClick={() => setMenuAbierto(false)} />
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu,
          .user-actions {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
          .mobile-menu {
            display: block !important;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  )
}

// Componente NavLink
function NavLink({ to, texto }) {
  return (
    <Link
      to={to}
      style={{
        padding: '10px 16px',
        color: '#4b5563',
        textDecoration: 'none',
        fontSize: '0.9375rem',
        fontWeight: '600',
        borderRadius: '8px',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f8f9fa'
        e.currentTarget.style.color = '#9b59b6'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = '#4b5563'
      }}
    >
      {texto}
    </Link>
  )
}

// Componente NavDropdown CORREGIDO
function NavDropdown({ titulo, items, icono: IconoProp }) {
  const [abierto, setAbierto] = useState(false)
  const dropdownRef = useRef(null)
  const timeoutRef = useRef(null)

  // Manejar cierre al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAbierto(false)
      }
    }

    if (abierto) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [abierto])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setAbierto(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setAbierto(false)
    }, 200)
  }

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        style={{
          padding: '10px 16px',
          background: abierto ? '#f8f9fa' : 'transparent',
          border: 'none',
          color: abierto ? '#9b59b6' : '#4b5563',
          fontSize: '0.9375rem',
          fontWeight: '600',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.3s ease'
        }}
        onClick={() => setAbierto(!abierto)}
      >
        {IconoProp && <IconoProp size={18} />}
        {titulo}
        <ChevronDown 
          size={16} 
          style={{ 
            transition: 'transform 0.3s ease',
            transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </button>

      {abierto && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '0.5rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          minWidth: '250px',
          padding: '0.5rem',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          {items.map((item, index) => {
            const IconComponent = item.icono
            return (
              <div key={index}>
                {item.divider && (
                  <div style={{ 
                    height: '1px', 
                    background: '#e2e8f0', 
                    margin: '0.5rem 0' 
                  }}></div>
                )}
                {item.onClick ? (
                  <button
                    onClick={() => {
                      item.onClick()
                      setAbierto(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '8px',
                      color: item.color || '#4b5563',
                      fontSize: '0.9375rem',
                      fontWeight: '500',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = item.color ? '#fef2f2' : '#f8f9fa'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {IconComponent && <IconComponent size={18} />}
                    {item.texto}
                  </button>
                ) : (
                  <Link
                    to={item.to}
                    onClick={() => setAbierto(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '12px 16px',
                      color: item.color || '#4b5563',
                      textDecoration: 'none',
                      fontSize: '0.9375rem',
                      fontWeight: '500',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8f9fa'
                      e.currentTarget.style.color = '#9b59b6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = item.color || '#4b5563'
                    }}
                  >
                    {IconComponent && <IconComponent size={18} />}
                    {item.texto}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Componente MobileNavLink
function MobileNavLink({ to, texto, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        padding: '12px 16px',
        color: '#4b5563',
        textDecoration: 'none',
        fontSize: '0.9375rem',
        fontWeight: '600',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        display: 'block'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f8f9fa'
        e.currentTarget.style.color = '#9b59b6'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = '#4b5563'
      }}
    >
      {texto}
    </Link>
  )
}

export default NavigationBar