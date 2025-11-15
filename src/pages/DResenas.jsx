import { useState, useEffect } from 'react'
import { 
  MessageSquare, X, Search, ArrowLeft, Star, Check, XCircle,
  ThumbsUp, Mail, User, Calendar, Eye, EyeOff, Trash2,
  ChevronLeft, ChevronRight
} from 'lucide-react'

// URL del backend PHP
const API_URL = 'http://localhost/megacell_backend'

// Componente de Paginación
function Paginacion({ paginaActual, totalPaginas, onCambioPagina, itemsPorPagina, totalItems, onCambioItemsPorPagina }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'white',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      marginTop: '2rem',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#718096' }}>
          Mostrar
        </span>
        <select
          value={itemsPorPagina}
          onChange={(e) => onCambioItemsPorPagina(Number(e.target.value))}
          style={{
            padding: '0.5rem',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '0.875rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value={6}>6</option>
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={50}>50</option>
        </select>
        <span style={{ fontSize: '0.875rem', color: '#718096' }}>
          de {totalItems} reseñas
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => onCambioPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          style={{
            padding: '0.5rem 0.75rem',
            background: paginaActual === 1 ? '#f3f4f6' : 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.875rem',
            color: paginaActual === 1 ? '#9ca3af' : '#374151',
            opacity: paginaActual === 1 ? 0.5 : 1
          }}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[...Array(totalPaginas)].map((_, index) => {
            const pagina = index + 1
            if (
              pagina === 1 ||
              pagina === totalPaginas ||
              (pagina >= paginaActual - 1 && pagina <= paginaActual + 1)
            ) {
              return (
                <button
                  key={pagina}
                  onClick={() => onCambioPagina(pagina)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: paginaActual === pagina ? '#667eea' : 'white',
                    border: '2px solid',
                    borderColor: paginaActual === pagina ? '#667eea' : '#e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: paginaActual === pagina ? '600' : '400',
                    color: paginaActual === pagina ? 'white' : '#374151',
                    minWidth: '40px'
                  }}
                >
                  {pagina}
                </button>
              )
            } else if (pagina === paginaActual - 2 || pagina === paginaActual + 2) {
              return <span key={pagina} style={{ padding: '0.5rem', color: '#9ca3af' }}>...</span>
            }
            return null
          })}
        </div>

        <button
          onClick={() => onCambioPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          style={{
            padding: '0.5rem 0.75rem',
            background: paginaActual === totalPaginas ? '#f3f4f6' : 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.875rem',
            color: paginaActual === totalPaginas ? '#9ca3af' : '#374151',
            opacity: paginaActual === totalPaginas ? 0.5 : 1
          }}
        >
          Siguiente
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function GestionResenas() {
  const [resenas, setResenas] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalDetalle, setModalDetalle] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [modalRespuesta, setModalRespuesta] = useState(false)
  const [resenaSeleccionada, setResenaSeleccionada] = useState(null)
  const [respuestaTexto, setRespuestaTexto] = useState('')
  const [filtroEstrellas, setFiltroEstrellas] = useState('todas')
  const [filtroAprobado, setFiltroAprobado] = useState('todas')
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(12)

  useEffect(() => {
    cargarResenas()
  }, [])

  const cargarResenas = async () => {
    try {
      const response = await fetch(`${API_URL}/dresenas.php`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setResenas(data.resenas || [])
      } else {
        console.error('Error al cargar reseñas:', data.message)
        alert('Error al cargar reseñas: ' + data.message)
      }
    } catch (error) {
      console.error('Error al cargar reseñas:', error)
      alert('Error de conexión al cargar reseñas: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const abrirModalDetalle = (resena) => {
    setResenaSeleccionada(resena)
    setModalDetalle(true)
  }

  const abrirModalRespuesta = (resena) => {
    setResenaSeleccionada(resena)
    setRespuestaTexto(resena.respuesta || '')
    setModalRespuesta(true)
  }

  const toggleAprobado = async (resena) => {
    try {
      const response = await fetch(`${API_URL}/dresenas.php?id=${resena.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          aprobado: resena.aprobado === 1 ? 0 : 1
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(resena.aprobado === 1 ? 'Reseña ocultada' : 'Reseña aprobada')
        cargarResenas()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al actualizar reseña:', error)
      alert('Error al actualizar la reseña')
    }
  }

  const toggleVerificado = async (resena) => {
    try {
      const response = await fetch(`${API_URL}/dresenas.php?id=${resena.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          verificado: resena.verificado === 1 ? 0 : 1
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(resena.verificado === 1 ? 'Marca de verificado removida' : 'Reseña verificada')
        cargarResenas()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al actualizar reseña:', error)
      alert('Error al actualizar la reseña')
    }
  }

  const guardarRespuesta = async () => {
    if (!respuestaTexto.trim()) {
      alert('Por favor escribe una respuesta')
      return
    }

    try {
      const response = await fetch(`${API_URL}/dresenas.php?id=${resenaSeleccionada.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          respuesta: respuestaTexto
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Respuesta guardada exitosamente')
        setModalRespuesta(false)
        cargarResenas()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al guardar respuesta:', error)
      alert('Error al guardar la respuesta')
    }
  }

  const confirmarEliminar = (resena) => {
    setResenaSeleccionada(resena)
    setModalEliminar(true)
  }

  const eliminarResena = async () => {
    try {
      const response = await fetch(`${API_URL}/dresenas.php?id=${resenaSeleccionada.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        alert('Reseña eliminada exitosamente')
        setModalEliminar(false)
        cargarResenas()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al eliminar reseña:', error)
      alert('Error al eliminar la reseña')
    }
  }

  const resenasFiltradas = resenas.filter(resena => {
    const cumpleBusqueda = 
      resena.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      resena.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      resena.servicio?.toLowerCase().includes(busqueda.toLowerCase()) ||
      resena.comentario?.toLowerCase().includes(busqueda.toLowerCase())

    const cumpleEstrellas = filtroEstrellas === 'todas' || 
      resena.estrellas === parseInt(filtroEstrellas)

    const cumpleAprobado = filtroAprobado === 'todas' ||
      (filtroAprobado === 'aprobadas' && resena.aprobado === 1) ||
      (filtroAprobado === 'pendientes' && resena.aprobado === 0)

    return cumpleBusqueda && cumpleEstrellas && cumpleAprobado
  })

  const totalPaginas = Math.ceil(resenasFiltradas.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const resenasPaginadas = resenasFiltradas.slice(indiceInicio, indiceFin)

  const renderEstrellas = (cantidad) => {
    return [...Array(5)].map((_, index) => (
      <Star 
        key={index}
        size={16}
        fill={index < cantidad ? '#FFA726' : 'none'}
        color="#FFA726"
      />
    ))
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calcularPromedioEstrellas = () => {
    if (resenas.length === 0) return 0
    const suma = resenas.reduce((acc, r) => acc + r.estrellas, 0)
    return (suma / resenas.length).toFixed(1)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6'
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
          <p style={{ marginTop: '1rem', color: '#718096' }}>Cargando reseñas...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => window.history.back()}
              style={{
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '10px',
                padding: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
            >
              <ArrowLeft size={20} color="#667eea" />
            </button>
            <div>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#1a202c',
                margin: 0,
                marginBottom: '0.25rem'
              }}>
                Gestión de Reseñas
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#718096',
                margin: 0
              }}>
                Administra las opiniones de tus clientes
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              background: '#FFA72615',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Star size={20} fill="#FFA726" color="#FFA726" />
              <div>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>Promedio</p>
                <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFA726', margin: 0 }}>
                  {calcularPromedioEstrellas()}
                </p>
              </div>
            </div>
            <div style={{
              background: '#10B98115',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <MessageSquare size={20} color="#10B981" />
              <div>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>Total</p>
                <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10B981', margin: 0 }}>
                  {resenas.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              color="#9ca3af"
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email, servicio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem 0.875rem 3rem',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>

          <select
            value={filtroEstrellas}
            onChange={(e) => setFiltroEstrellas(e.target.value)}
            style={{
              padding: '0.875rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '0.9375rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="todas">Todas las estrellas</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>

          <select
            value={filtroAprobado}
            onChange={(e) => setFiltroAprobado(e.target.value)}
            style={{
              padding: '0.875rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '0.9375rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="todas">Todas</option>
            <option value="aprobadas">Aprobadas</option>
            <option value="pendientes">Pendientes</option>
          </select>
        </div>
      </div>

      {/* Grid de reseñas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {resenasPaginadas.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            background: 'white',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <MessageSquare size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
            <p style={{ margin: 0, fontSize: '1rem', color: '#9ca3af' }}>
              {busqueda ? 'No se encontraron reseñas' : 'No hay reseñas registradas'}
            </p>
          </div>
        ) : (
          resenasPaginadas.map((resena) => (
            <div
              key={resena.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: resena.aprobado === 0 ? '2px solid #FFA726' : '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onClick={() => abrirModalDetalle(resena)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#1a202c',
                      margin: 0
                    }}>
                      {resena.nombre}
                    </h3>
                    {resena.verificado === 1 && (
                      <Check size={16} color="#10B981" />
                    )}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>
                    {resena.email}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {renderEstrellas(resena.estrellas)}
                </div>
              </div>

              <div style={{
                background: '#667eea15',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <p style={{
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: '#667eea',
                  margin: 0
                }}>
                  {resena.servicio}
                </p>
              </div>

              <p style={{
                fontSize: '0.9375rem',
                color: '#4b5563',
                margin: '0 0 1rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}>
                {resena.comentario}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ThumbsUp size={14} color="#9ca3af" />
                  <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                    {resena.total_likes || 0}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {resena.aprobado === 0 && (
                    <span style={{
                      padding: '4px 8px',
                      background: '#FFA72615',
                      color: '#FFA726',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Pendiente
                    </span>
                  )}
                  {resena.respuesta && (
                    <span style={{
                      padding: '4px 8px',
                      background: '#10B98115',
                      color: '#10B981',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Respondida
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {resenasFiltradas.length > 0 && (
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onCambioPagina={(pagina) => setPaginaActual(pagina)}
          itemsPorPagina={itemsPorPagina}
          totalItems={resenasFiltradas.length}
          onCambioItemsPorPagina={(items) => {
            setItemsPorPagina(items)
            setPaginaActual(1)
          }}
        />
      )}

      {/* Modal Detalle */}
      {modalDetalle && resenaSeleccionada && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }} onClick={() => setModalDetalle(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1a202c',
                margin: 0
              }}>
                Detalle de Reseña
              </h2>
              <button
                onClick={() => setModalDetalle(false)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} color="#718096" />
              </button>
            </div>

            <div style={{
              background: '#f9fafb',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                  {resenaSeleccionada.nombre}
                </h3>
                {resenaSeleccionada.verificado === 1 && (
                  <Check size={18} color="#10B981" />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Mail size={16} color="#9ca3af" />
                <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  {resenaSeleccionada.email}
                </span>
              </div>
              {resenaSeleccionada.nombre_usuario && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <User size={16} color="#9ca3af" />
                  <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                    Usuario: {resenaSeleccionada.nombre_usuario}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="#9ca3af" />
                <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  {formatearFecha(resenaSeleccionada.fecha_creacion)}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                {renderEstrellas(resenaSeleccionada.estrellas)}
                <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#1a202c' }}>
                  {resenaSeleccionada.estrellas}.0
                </span>
              </div>
              <div style={{
                background: '#667eea15',
                padding: '0.75rem 1rem',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#667eea',
                  margin: 0
                }}>
                  Servicio: {resenaSeleccionada.servicio}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#718096', marginBottom: '0.5rem' }}>
                Comentario
              </h4>
              <p style={{ fontSize: '0.9375rem', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
                {resenaSeleccionada.comentario}
              </p>
            </div>

            {resenaSeleccionada.respuesta && (
              <div style={{
                background: '#10B98115',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10B981', marginBottom: '0.5rem' }}>
                  Respuesta del administrador
                </h4>
                <p style={{ fontSize: '0.9375rem', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
                  {resenaSeleccionada.respuesta}
                </p>
                {resenaSeleccionada.fecha_respuesta && (
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem', marginBottom: 0 }}>
                    Respondido: {formatearFecha(resenaSeleccionada.fecha_respuesta)}
                  </p>
                )}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <ThumbsUp size={20} color="#667eea" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>Likes</p>
                <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                  {resenaSeleccionada.total_likes || 0}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setModalDetalle(false)
                  abrirModalRespuesta(resenaSeleccionada)
                }}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9375rem'
                }}
              >
                {resenaSeleccionada.respuesta ? 'Editar Respuesta' : 'Responder'}
              </button>
              <button
                onClick={() => toggleVerificado(resenaSeleccionada)}
                style={{
                  padding: '0.875rem 1.25rem',
                  background: resenaSeleccionada.verificado === 1 ? '#EF535015' : '#10B98115',
                  border: 'none',
                  borderRadius: '10px',
                  color: resenaSeleccionada.verificado === 1 ? '#EF5350' : '#10B981',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {resenaSeleccionada.verificado === 1 ? <XCircle size={18} /> : <Check size={18} />}
                {resenaSeleccionada.verificado === 1 ? 'Quitar Verificación' : 'Verificar'}
              </button>
              <button
                onClick={() => toggleAprobado(resenaSeleccionada)}
                style={{
                  padding: '0.875rem 1.25rem',
                  background: resenaSeleccionada.aprobado === 1 ? '#FFA72615' : '#10B98115',
                  border: 'none',
                  borderRadius: '10px',
                  color: resenaSeleccionada.aprobado === 1 ? '#FFA726' : '#10B981',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {resenaSeleccionada.aprobado === 1 ? <EyeOff size={18} /> : <Eye size={18} />}
                {resenaSeleccionada.aprobado === 1 ? 'Ocultar' : 'Aprobar'}
              </button>
              <button
                onClick={() => {
                  setModalDetalle(false)
                  confirmarEliminar(resenaSeleccionada)
                }}
                style={{
                  padding: '0.875rem 1.25rem',
                  background: '#EF535015',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#EF5350',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Respuesta */}
      {modalRespuesta && resenaSeleccionada && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1a202c',
                margin: 0
              }}>
                Responder Reseña
              </h2>
              <button
                onClick={() => setModalRespuesta(false)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} color="#718096" />
              </button>
            </div>

            <div style={{
              background: '#f9fafb',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                  {resenaSeleccionada.nombre}
                </h4>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {renderEstrellas(resenaSeleccionada.estrellas)}
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>
                {resenaSeleccionada.comentario}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Tu respuesta *
              </label>
              <textarea
                value={respuestaTexto}
                onChange={(e) => setRespuestaTexto(e.target.value)}
                rows={6}
                placeholder="Escribe una respuesta profesional y amable..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem', marginBottom: 0 }}>
                Esta respuesta será visible públicamente
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setModalRespuesta(false)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#718096',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                Cancelar
              </button>
              <button
                onClick={guardarRespuesta}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Guardar Respuesta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && resenaSeleccionada && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: '#EF535015',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Trash2 size={28} color="#EF5350" />
            </div>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1a202c',
              margin: '0 0 0.5rem',
              textAlign: 'center'
            }}>
              ¿Eliminar Reseña?
            </h3>

            <p style={{
              fontSize: '0.9375rem',
              color: '#718096',
              textAlign: 'center',
              margin: '0 0 1.5rem'
            }}>
              ¿Estás seguro de que deseas eliminar la reseña de{' '}
              <strong>{resenaSeleccionada.nombre}</strong>?
              Esta acción no se puede deshacer.
            </p>

            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <button
                onClick={() => setModalEliminar(false)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#718096',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                Cancelar
              </button>
              <button
                onClick={eliminarResena}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: '#EF5350',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e53935'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#EF5350'}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default GestionResenas