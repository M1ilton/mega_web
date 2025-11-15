import { useState, useEffect } from 'react'
import { 
  Wrench, X, Plus, Edit, Trash2, Search, ArrowLeft, Save, AlertCircle, 
  Clock, CheckCircle, XCircle, Package,
  ChevronLeft, ChevronRight // Ya estaban importados, listos para usar
} from 'lucide-react'

// URL del backend PHP
const API_URL = 'http://localhost/megacell_backend'

function GestionReparaciones({ onVolver }) {
  const [reparaciones, setReparaciones] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [reparacionSeleccionada, setReparacionSeleccionada] = useState(null)
  
  // --- Estados de Paginación ---
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina] = useState(10) // Fijo a 10 elementos por página
  // -----------------------------

  const [formData, setFormData] = useState({
    usuario_id: '',
    equipo: '',
    servicio: '',
    descripcion: '',
    precio: '',
    tiempo_estimado: '',
    estado: 'recibido',
    diagnostico: '',
    observaciones: '',
    nombre_cliente: '',
    telefono_cliente: '',
    email_cliente: '',
    fecha_estimada_entrega: ''
  })

  // Servicios disponibles
  const serviciosDisponibles = [
    { nombre: 'Pantalla Rota', precio: 135000, tiempo: '2-3 horas' },
    { nombre: 'Batería Agotada', precio: 72000, tiempo: '1 hora' },
    { nombre: 'Puerto de Carga', precio: 54000, tiempo: '1-2 horas' },
    { nombre: 'Daño por Agua', precio: 162000, tiempo: '3-5 horas' },
    { nombre: 'Botones', precio: 40500, tiempo: '1 hora' },
    { nombre: 'Cámara', precio: 90000, tiempo: '2 horas' },
    { nombre: 'Altavoz', precio: 45000, tiempo: '1 hora' },
    { nombre: 'Micrófono', precio: 50000, tiempo: '1-2 horas' }
  ]

  useEffect(() => {
    cargarReparaciones()
    cargarUsuarios()
  }, [])

  const cargarReparaciones = async () => {
    try {
      const response = await fetch(`${API_URL}/dreparaciones.php`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setReparaciones(data.reparaciones || [])
        setPaginaActual(1) // Reiniciar a la primera página al cargar nuevos datos
      } else {
        alert('Error al cargar reparaciones: ' + data.message)
      }
    } catch (error) {
      console.error('Error al cargar reparaciones:', error)
      alert('Error de conexión al cargar reparaciones: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const cargarUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/dusuarios.php`, {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUsuarios(data.usuarios || [])
        }
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleServicioChange = (e) => {
    const servicioSeleccionado = serviciosDisponibles.find(s => s.nombre === e.target.value)
    if (servicioSeleccionado) {
      setFormData(prev => ({
        ...prev,
        servicio: servicioSeleccionado.nombre,
        precio: servicioSeleccionado.precio,
        tiempo_estimado: servicioSeleccionado.tiempo
      }))
    }
  }

  const handleUsuarioChange = (e) => {
    const usuarioId = e.target.value
    const usuario = usuarios.find(u => u.id === parseInt(usuarioId))
    
    if (usuario) {
      setFormData(prev => ({
        ...prev,
        usuario_id: usuarioId,
        nombre_cliente: `${usuario.nombres} ${usuario.apellidos}`,
        telefono_cliente: usuario.telefono,
        email_cliente: usuario.email
      }))
    }
  }

  const abrirModalCrear = () => {
    setFormData({
      usuario_id: '',
      equipo: '',
      servicio: '',
      descripcion: '',
      precio: '',
      tiempo_estimado: '',
      estado: 'recibido',
      diagnostico: '',
      observaciones: '',
      nombre_cliente: '',
      telefono_cliente: '',
      email_cliente: '',
      fecha_estimada_entrega: ''
    })
    setReparacionSeleccionada(null)
    setModalOpen(true)
  }

  const abrirModalEditar = (reparacion) => {
    setFormData({
      usuario_id: reparacion.usuario_id || '',
      equipo: reparacion.equipo || '',
      servicio: reparacion.servicio || '',
      descripcion: reparacion.descripcion || '',
      precio: reparacion.precio || '',
      tiempo_estimado: reparacion.tiempo_estimado || '',
      estado: reparacion.estado || 'recibido',
      diagnostico: reparacion.diagnostico || '',
      observaciones: reparacion.observaciones || '',
      nombre_cliente: reparacion.nombre_cliente || '',
      telefono_cliente: reparacion.telefono_cliente || '',
      email_cliente: reparacion.email_cliente || '',
      fecha_estimada_entrega: reparacion.fecha_estimada_entrega?.split(' ')[0] || ''
    })
    setReparacionSeleccionada(reparacion)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = reparacionSeleccionada 
        ? `${API_URL}/dreparaciones.php?id=${reparacionSeleccionada.id}`
        : `${API_URL}/dreparaciones.php`
      
      const method = reparacionSeleccionada ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        alert(reparacionSeleccionada ? 'Reparación actualizada exitosamente' : 'Reparación creada exitosamente')
        setModalOpen(false)
        cargarReparaciones()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al guardar reparación:', error)
      alert('Error al guardar la reparación')
    }
  }

  const confirmarEliminar = (reparacion) => {
    setReparacionSeleccionada(reparacion)
    setModalEliminar(true)
  }

  const eliminarReparacion = async () => {
    try {
      const response = await fetch(`${API_URL}/dreparaciones.php?id=${reparacionSeleccionada.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        alert('Reparación eliminada exitosamente')
        setModalEliminar(false)
        cargarReparaciones()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al eliminar reparación:', error)
      alert('Error al eliminar la reparación')
    }
  }

  const reparacionesFiltradas = reparaciones.filter(reparacion =>
    reparacion.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    reparacion.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    reparacion.equipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    reparacion.servicio?.toLowerCase().includes(busqueda.toLowerCase()) ||
    reparacion.estado?.toLowerCase().includes(busqueda.toLowerCase())
  )

  // --- Lógica de Paginación ---
  const indiceUltimoItem = paginaActual * itemsPorPagina
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina
  const reparacionesPaginaActual = reparacionesFiltradas.slice(indicePrimerItem, indiceUltimoItem)

  const numeroTotalPaginas = Math.ceil(reparacionesFiltradas.length / itemsPorPagina)

  const cambiarPagina = (numeroPagina) => {
    if (numeroPagina >= 1 && numeroPagina <= numeroTotalPaginas) {
      setPaginaActual(numeroPagina)
    }
  }

  // Si la búsqueda cambia, reiniciar la paginación
  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda])
  // -----------------------------

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'recibido': return '#667eea'
      case 'en_diagnostico': return '#FFA726'
      case 'en_proceso': return '#42A5F5'
      case 'completado': return '#10B981'
      case 'entregado': return '#22C55E'
      case 'cancelado': return '#EF5350'
      default: return '#9ca3af'
    }
  }

  const getEstadoTexto = (estado) => {
    switch(estado) {
      case 'recibido': return 'Recibido'
      case 'en_diagnostico': return 'En Diagnóstico'
      case 'en_proceso': return 'En Proceso'
      case 'completado': return 'Completado'
      case 'entregado': return 'Entregado'
      case 'cancelado': return 'Cancelado'
      default: return estado
    }
  }

  const getEstadoIcono = (estado) => {
    switch(estado) {
      case 'recibido': return Package
      case 'en_diagnostico': return Search
      case 'en_proceso': return Wrench
      case 'completado': return CheckCircle
      case 'entregado': return CheckCircle
      case 'cancelado': return XCircle
      default: return Clock
    }
  }

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio || 0)
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
          <p style={{ marginTop: '1rem', color: '#718096' }}>Cargando reparaciones...</p>
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
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={onVolver}
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
                Gestión de Reparaciones
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#718096',
                margin: 0
              }}>
                Administra las reparaciones y servicios técnicos
              </p>
            </div>
          </div>

          <button
            onClick={abrirModalCrear}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '10px',
              padding: '0.875rem 1.5rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              fontSize: '0.9375rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={20} />
            Nueva Reparación
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div style={{
          marginTop: '1.5rem',
          position: 'relative'
        }}>
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
            placeholder="Buscar por código, cliente, equipo, servicio o estado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 3rem',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
          />
        </div>
      </div>

      {/* Tabla de reparaciones */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={estiloTh}>Código</th>
                <th style={estiloTh}>Cliente</th>
                <th style={estiloTh}>Equipo</th>
                <th style={estiloTh}>Servicio</th>
                <th style={estiloTh}>Precio</th>
                <th style={estiloTh}>Fecha Ingreso</th>
                <th style={estiloTh}>Tiempo Est.</th>
                <th style={estiloTh}>Estado</th>
                <th style={estiloTh}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* USAR reparacionesPaginaActual */}
              {reparacionesPaginaActual.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: '#9ca3af'
                  }}>
                    <Wrench size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ margin: 0, fontSize: '1rem' }}>
                      {busqueda ? 'No se encontraron reparaciones' : 'No hay reparaciones registradas'}
                    </p>
                  </td>
                </tr>
              ) : (
                reparacionesPaginaActual.map((reparacion) => {
                  const IconoEstado = getEstadoIcono(reparacion.estado)
                  return (
                    <tr
                      key={reparacion.id}
                      style={{ borderBottom: '1px solid #f3f4f6' }}
                    >
                      <td style={estiloTd}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                            <Wrench size={20} color="#667eea" />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: '600', color: '#1a202c' }}>
                              {reparacion.codigo}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', color: '#1a202c' }}>
                            {reparacion.nombre_cliente || 'N/A'}
                          </p>
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#9ca3af' }}>
                            {reparacion.telefono_cliente || 'Sin teléfono'}
                          </p>
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <span style={{ fontWeight: '500' }}>
                          {reparacion.equipo || 'N/A'}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <span style={{ fontSize: '0.875rem' }}>
                          {reparacion.servicio || 'N/A'}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <span style={{ fontWeight: '600', color: '#667eea' }}>
                          {formatearPrecio(reparacion.precio)}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <span style={{ fontSize: '0.875rem' }}>
                          {formatearFecha(reparacion.fecha_ingreso)}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={14} color="#9ca3af" />
                          <span style={{ fontSize: '0.875rem' }}>
                            {reparacion.tiempo_estimado || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '6px 12px',
                          background: `${getEstadoColor(reparacion.estado)}15`,
                          color: getEstadoColor(reparacion.estado),
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: '600'
                        }}>
                          <IconoEstado size={14} />
                          {getEstadoTexto(reparacion.estado)}
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => abrirModalEditar(reparacion)}
                            style={{
                              background: '#667eea15',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#667eea25'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea15'}
                          >
                            <Edit size={16} color="#667eea" />
                          </button>
                          <button
                            onClick={() => confirmarEliminar(reparacion)}
                            style={{
                              background: '#EF535015',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#EF535025'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#EF535015'}
                          >
                            <Trash2 size={16} color="#EF5350" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Controles de Paginación --- */}
      {reparacionesFiltradas.length > itemsPorPagina && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.5rem',
          padding: '1rem 2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#718096' }}>
            Mostrando {indicePrimerItem + 1} a {Math.min(indiceUltimoItem, reparacionesFiltradas.length)} de {reparacionesFiltradas.length} reparaciones
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Botón Anterior */}
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              style={{
                background: paginaActual === 1 ? '#e5e7eb' : '#f3f4f6',
                color: paginaActual === 1 ? '#9ca3af' : '#4b5563',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { if (paginaActual !== 1) e.currentTarget.style.background = '#e5e7eb' }}
              onMouseLeave={(e) => { if (paginaActual !== 1) e.currentTarget.style.background = '#f3f4f6' }}
            >
              <ChevronLeft size={16} />
              Anterior
            </button>

            {/* Indicador de Página */}
            <span style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1a202c',
              padding: '0 0.5rem'
            }}>
              Página {paginaActual} de {numeroTotalPaginas}
            </span>

            {/* Botón Siguiente */}
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === numeroTotalPaginas}
              style={{
                background: paginaActual === numeroTotalPaginas ? '#e5e7eb' : '#f3f4f6',
                color: paginaActual === numeroTotalPaginas ? '#9ca3af' : '#4b5563',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                cursor: paginaActual === numeroTotalPaginas ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { if (paginaActual !== numeroTotalPaginas) e.currentTarget.style.background = '#e5e7eb' }}
              onMouseLeave={(e) => { if (paginaActual !== numeroTotalPaginas) e.currentTarget.style.background = '#f3f4f6' }}
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      {/* ------------------------------------- */}

      {/* Modal Crear/Editar */}
      {modalOpen && (
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
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
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
                {reparacionSeleccionada ? 'Editar Reparación' : 'Nueva Reparación'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
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

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Información del Cliente */}
                <div style={{
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '10px',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 1rem 0'
                  }}>
                    Información del Cliente
                  </h3>

                  {!reparacionSeleccionada && (
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={estiloLabel}>Cliente Registrado (Opcional)</label>
                      <select
                        name="usuario_id"
                        value={formData.usuario_id}
                        onChange={handleUsuarioChange}
                        style={{...estiloInput, cursor: 'pointer'}}
                      >
                        <option value="">Seleccionar cliente o ingresar manualmente</option>
                        {usuarios.filter(u => u.rol === 'cliente').map(usuario => (
                          <option key={usuario.id} value={usuario.id}>
                            {usuario.nombres} {usuario.apellidos} - {usuario.identificacion}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    <div>
                      <label style={estiloLabel}>Nombre Completo *</label>
                      <input
                        type="text"
                        name="nombre_cliente"
                        value={formData.nombre_cliente}
                        onChange={handleInputChange}
                        required
                        style={estiloInput}
                        placeholder="Nombre completo del cliente"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={estiloLabel}>Teléfono *</label>
                        <input
                          type="tel"
                          name="telefono_cliente"
                          value={formData.telefono_cliente}
                          onChange={handleInputChange}
                          required
                          style={estiloInput}
                          placeholder="3001234567"
                        />
                      </div>
                      <div>
                        <label style={estiloLabel}>Email *</label>
                        <input
                          type="email"
                          name="email_cliente"
                          value={formData.email_cliente}
                          onChange={handleInputChange}
                          required
                          style={estiloInput}
                          placeholder="cliente@email.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del Servicio */}
                <div>
                  <label style={estiloLabel}>Equipo *</label>
                  <input
                    type="text"
                    name="equipo"
                    value={formData.equipo}
                    onChange={handleInputChange}
                    required
                    style={estiloInput}
                    placeholder="Ej: iPhone 13 Pro, Samsung Galaxy S21"
                  />
                </div>

                <div>
                  <label style={estiloLabel}>Servicio *</label>
                  <select
                    name="servicio"
                    value={formData.servicio}
                    onChange={handleServicioChange}
                    required
                    style={{...estiloInput, cursor: 'pointer'}}
                  >
                    <option value="">Seleccionar servicio</option>
                    {serviciosDisponibles.map((servicio, index) => (
                      <option key={index} value={servicio.nombre}>
                        {servicio.nombre} - {formatearPrecio(servicio.precio)} ({servicio.tiempo})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={estiloLabel}>Precio *</label>
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleInputChange}
                      required
                      style={estiloInput}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label style={estiloLabel}>Tiempo Estimado *</label>
                    <input
                      type="text"
                      name="tiempo_estimado"
                      value={formData.tiempo_estimado}
                      onChange={handleInputChange}
                      required
                      style={estiloInput}
                      placeholder="Ej: 2-3 horas"
                    />
                  </div>
                </div>

                <div>
                  <label style={estiloLabel}>Descripción del Problema</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    style={{...estiloInput, resize: 'vertical'}}
                    placeholder="Describe el problema reportado por el cliente"
                  />
                </div>

                {reparacionSeleccionada && (
                  <>
                    <div>
                      <label style={estiloLabel}>Diagnóstico</label>
                      <textarea
                        name="diagnostico"
                        value={formData.diagnostico}
                        onChange={handleInputChange}
                        rows={3}
                        style={{...estiloInput, resize: 'vertical'}}
                        placeholder="Diagnóstico técnico del equipo"
                      />
                    </div>

                    <div>
                      <label style={estiloLabel}>Observaciones</label>
                      <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleInputChange}
                        rows={2}
                        style={{...estiloInput, resize: 'vertical'}}
                        placeholder="Notas adicionales"
                      />
                    </div>
                  </>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={estiloLabel}>Estado *</label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      required
                      style={{...estiloInput, cursor: 'pointer'}}
                    >
                      <option value="recibido">Recibido</option>
                      <option value="en_diagnostico">En Diagnóstico</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="completado">Completado</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label style={estiloLabel}>Fecha Estimada de Entrega</label>
                    <input
                      type="date"
                      name="fecha_estimada_entrega"
                      value={formData.fecha_estimada_entrega}
                      onChange={handleInputChange}
                      style={estiloInput}
                    />
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                  type="submit"
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Save size={20} />
                  {reparacionSeleccionada ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
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
              ¿Eliminar Reparación?
            </h3>

            <p style={{
              fontSize: '0.9375rem',
              color: '#718096',
              textAlign: 'center',
              margin: '0 0 1.5rem'
            }}>
              ¿Estás seguro de que deseas eliminar la reparación{' '}
              <strong>{reparacionSeleccionada?.codigo}</strong>?
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
                onClick={eliminarReparacion}
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

// Estilos reutilizables
const estiloTh = {
  padding: '1rem',
  textAlign: 'left',
  fontSize: '0.8125rem',
  fontWeight: '700',
  color: '#718096',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const estiloTd = {
  padding: '1rem',
  fontSize: '0.875rem',
  color: '#4b5563'
}

const estiloLabel = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '0.5rem'
}

const estiloInput = {
  width: '100%',
  padding: '0.75rem',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '0.9375rem',
  outline: 'none',
  transition: 'all 0.3s ease',
  boxSizing: 'border-box'
}

export default GestionReparaciones