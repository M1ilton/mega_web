import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, Users, Package, Settings, LogOut, 
  Menu, X, User, Phone, Mail, MapPin, Shield, TrendingUp,
  ShoppingCart, Wrench, DollarSign, Activity, MessageSquare, Tag
} from 'lucide-react'
import GestionUsuarios from './Usuarios'
import GestionGarantias from './DGarantias'
import Gestionproductos from './Productos'
import GestionReparaciones from './DReparaciones'
import GestionPedidos from './Pedidos'
import GestionResenas from './DResenas'
import GestionCupones from './Cupones'

// URL del backend PHP
const API_URL = 'http://localhost/megacell_backend'

function Dashboard() {
  const [usuario, setUsuario] = useState(null)
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [vistaActual, setVistaActual] = useState('dashboard')

  useEffect(() => {
    verificarSesion()
  }, [])

  useEffect(() => {
    if (usuario) {
      cargarEstadisticas()
    }
  }, [usuario])

  const verificarSesion = async () => {
    try {
      const response = await fetch(`${API_URL}/check_session.php`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success && data.authenticated) {
        if (data.usuario.rol === 'admin' || data.usuario.rol === 'trabajador') {
          setUsuario(data.usuario)
        } else {
          alert('Acceso denegado. Solo administradores pueden acceder al dashboard.')
          window.location.href = '/'
        }
      } else {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error)
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(`${API_URL}/estadisticas.php`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setEstadisticas(data.data)
      } else {
        console.error('Error al cargar estadísticas:', data.message)
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/logout.php`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        localStorage.removeItem('usuario')
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const formatoPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio || 0)
  }

  const formatoFecha = (fecha) => {
    if (!fecha) return 'N/A'
    const date = new Date(fecha)
    return date.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const cambiarVista = (vista) => {
    setVistaActual(vista)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #667eea',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#718096' }}>Verificando sesión...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    { icon: LayoutDashboard, text: 'Dashboard', vista: 'dashboard' },
    { icon: Users, text: 'Usuarios', vista: 'usuarios' },
    { icon: Package, text: 'Productos', vista: 'productos' },
    { icon: ShoppingCart, text: 'Pedidos', vista: 'pedidos' },
    { icon: Wrench, text: 'Reparaciones', vista: 'reparaciones' },
    { icon: Shield, text: 'Garantías', vista: 'garantias' },
    { icon: Tag, text: 'Cupones', vista: 'cupones' },
    { icon: MessageSquare, text: 'Reseñas', vista: 'resenas' },
    { icon: Settings, text: 'Configuración', vista: 'configuracion' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      display: 'flex'
    }}>
      {/* Sidebar con scroll */}
      <aside style={{
        width: sidebarOpen ? '280px' : '0',
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000,
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header fijo del sidebar */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: 0
          }}>
            Mega Web
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} color="white" />
          </button>
        </div>

        {/* Información del usuario - fija */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={24} color="white" />
            </div>
            <div>
              <p style={{
                color: 'white',
                fontWeight: '600',
                margin: 0,
                fontSize: '1rem'
              }}>
                {usuario?.nombres} {usuario?.apellidos}
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.875rem',
                margin: 0,
                textTransform: 'capitalize'
              }}>
                {usuario?.rol}
              </p>
            </div>
          </div>
        </div>

        {/* Menú con scroll */}
        <nav style={{ 
          padding: '1rem',
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon
            const isActive = vistaActual === item.vista
            return (
              <button
                key={index}
                onClick={() => cambiarVista(item.vista)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.875rem 1rem',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  marginBottom: '0.5rem',
                  transition: 'all 0.3s ease',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <IconComponent size={20} />
                <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{item.text}</span>
              </button>
            )
          })}
        </nav>

        {/* Botón de cerrar sesión - fijo en la parte inferior */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '0.875rem',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '0',
        transition: 'all 0.3s ease'
      }}>
        {/* Renderizado condicional según la vista actual */}
        {vistaActual === 'usuarios' ? (
          <GestionUsuarios onVolver={() => cambiarVista('dashboard')} />
        ) : vistaActual === 'productos' ? (
          <Gestionproductos onVolver={() => cambiarVista('dashboard')} />
        ) : vistaActual === 'pedidos' ? (
          <GestionPedidos onVolver={() => cambiarVista('dashboard')} />
        ) : vistaActual === 'garantias' ? (
          <GestionGarantias onVolver={() => cambiarVista('dashboard')} />
        ) : vistaActual === 'reparaciones' ? (
          <GestionReparaciones onVolver={() => cambiarVista('dashboard')} />
        ) : vistaActual === 'cupones' ? (
          <GestionCupones onVolver={() => cambiarVista('dashboard')} />
        ) : vistaActual === 'resenas' ? (
          <GestionResenas onVolver={() => cambiarVista('dashboard')} />
        ): vistaActual === 'dashboard' ? (
          <>
            {/* Header */}
            <header style={{
              background: 'white',
              padding: '1.5rem 2rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Menu size={20} color="white" />
                  </button>
                )}
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1a202c',
                  margin: 0
                }}>
                  Panel de Control
                </h1>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                borderRadius: '12px'
              }}>
                <Shield size={18} color="#667eea" />
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#667eea',
                  textTransform: 'capitalize'
                }}>
                  {usuario?.rol}
                </span>
              </div>
            </header>

            {/* Contenido del dashboard */}
            <div style={{ padding: '2rem' }}>
              {/* Cards de estadísticas principales */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {[
                  { 
                    title: 'Usuarios Totales', 
                    value: estadisticas?.total_usuarios || '0', 
                    color: '#667eea', 
                    icon: Users,
                    subtext: 'Usuarios activos'
                  },
                  { 
                    title: 'Productos', 
                    value: estadisticas?.total_productos || '0', 
                    color: '#5FC88F', 
                    icon: Package,
                    subtext: 'En catálogo'
                  },
                  { 
                    title: 'Pedidos', 
                    value: estadisticas?.total_pedidos || '0', 
                    color: '#FFA726', 
                    icon: ShoppingCart,
                    subtext: 'Total procesados'
                  },
                  { 
                    title: 'Reparaciones', 
                    value: estadisticas?.total_reparaciones || '0', 
                    color: '#EF5350', 
                    icon: Wrench,
                    subtext: 'En el sistema'
                  }
                ].map((stat, index) => {
                  const IconComponent = stat.icon
                  return (
                    <div key={index} style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1rem'
                      }}>
                        <h3 style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#718096',
                          margin: 0
                        }}>
                          {stat.title}
                        </h3>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: `${stat.color}15`,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <IconComponent size={20} color={stat.color} />
                        </div>
                      </div>
                      <p style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#1a202c',
                        margin: 0,
                        marginBottom: '0.5rem'
                      }}>
                        {stat.value}
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        margin: 0
                      }}>
                        {stat.subtext}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Sección de ventas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px',
                  padding: '2rem',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Ventas Totales</p>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>
                        {formatoPrecio(estadisticas?.ventas_totales)}
                      </h3>
                    </div>
                  </div>
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <p style={{ fontSize: '0.875rem', margin: 0, marginBottom: '0.5rem' }}>
                      Ventas del mes
                    </p>
                    <p style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                      {formatoPrecio(estadisticas?.ventas_mes_actual)}
                    </p>
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <TrendingUp size={20} color="#667eea" />
                    Estado de Pedidos
                  </h3>
                  {estadisticas?.pedidos_por_estado?.map((estado, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0',
                      borderBottom: index < estadisticas.pedidos_por_estado.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#4b5563',
                        textTransform: 'capitalize'
                      }}>
                        {estado.estado}
                      </span>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: '#667eea'
                      }}>
                        {estado.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información del perfil */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
              }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <User size={20} color="#667eea" />
                  Información del Perfil
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {[
                    { icon: User, label: 'Nombre Completo', value: `${usuario?.nombres} ${usuario?.apellidos}` },
                    { icon: Mail, label: 'Correo Electrónico', value: usuario?.email },
                    { icon: Phone, label: 'Teléfono', value: usuario?.telefono },
                    { icon: MapPin, label: 'Municipio', value: usuario?.municipio || 'No especificado' }
                  ].map((field, index) => {
                    const IconComponent = field.icon
                    return (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: '#667eea15',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <IconComponent size={20} color="#667eea" />
                        </div>
                        <div>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#718096',
                            margin: 0,
                            marginBottom: '0.25rem'
                          }}>
                            {field.label}
                          </p>
                          <p style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#1a202c',
                            margin: 0
                          }}>
                            {field.value}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actividad reciente */}
              {estadisticas?.actividad_reciente && estadisticas.actividad_reciente.length > 0 && (
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Activity size={20} color="#667eea" />
                    Actividad Reciente
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {estadisticas.actividad_reciente.slice(0, 5).map((actividad, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: '#f9fafb',
                        borderRadius: '12px',
                        borderLeft: '4px solid #667eea'
                      }}>
                        <div>
                          <p style={{
                            fontSize: '0.9375rem',
                            fontWeight: '600',
                            color: '#1a202c',
                            margin: 0,
                            marginBottom: '0.25rem'
                          }}>
                            {actividad.nombres} {actividad.apellidos}
                          </p>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#718096',
                            margin: 0
                          }}>
                            {actividad.descripcion}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{
                            fontSize: '0.75rem',
                            color: '#9ca3af',
                            margin: 0
                          }}>
                            {formatoFecha(actividad.fecha_actividad)}
                          </p>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            background: '#667eea15',
                            color: '#667eea',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            marginTop: '0.5rem',
                            textTransform: 'capitalize'
                          }}>
                            {actividad.tipo_actividad.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#1a202c' }}>Sección en desarrollo: {vistaActual}</h2>
            <p style={{ color: '#718096' }}>Esta funcionalidad estará disponible próximamente.</p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Estilos personalizados del scrollbar para el menú */
        nav::-webkit-scrollbar {
          width: 6px;
        }

        nav::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }

        nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  )
}

export default Dashboard