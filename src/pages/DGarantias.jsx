import { useState, useEffect } from 'react'
import {
  Shield, X, Plus, Edit, Trash2, Search, ArrowLeft, Save, AlertCircle
} from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// URL del backend PHP
const API_URL = 'http://localhost/megacell_backend'

function GestionGarantias() {
  const [garantias, setGarantias] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [garantiaSeleccionada, setGarantiaSeleccionada] = useState(null)
  const [formData, setFormData] = useState({
    usuario_id: '',
    producto: '',
    tipo_cobertura: '',
    detalles_cobertura: '',
    fecha_vencimiento: '',
    estado: 'activa',
    observaciones: ''
  })
  
  // 🆕 ESTADOS DE PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1)
  const garantiasPorPagina = 10 // Número de elementos por página

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    await Promise.all([
      cargarGarantias(),
      cargarUsuarios()
    ])
  }

  const cargarGarantias = async () => {
    try {
      const response = await fetch(`${API_URL}/dgarantias.php`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setGarantias(data.garantias || [])
        setPaginaActual(1) // 🆕 Resetear a la primera página al cargar datos
      } else {
        console.error('Error al cargar garantías:', data.message)
        alert('Error al cargar garantías: ' + data.message)
      }
    } catch (error) {
      console.error('Error al cargar garantías:', error)
      alert('Error de conexión al cargar garantías: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const cargarUsuarios = async () => {
    setLoadingUsuarios(true)
    try {
      const response = await fetch(`${API_URL}/dusuarios.php`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        console.log('Usuarios cargados:', data.usuarios)
        setUsuarios(data.usuarios || [])
      } else {
        console.error('Error al cargar usuarios:', data.message)
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      alert('Error al cargar usuarios: ' + error.message)
    } finally {
      setLoadingUsuarios(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const abrirModalCrear = () => {
    // Establecer fecha de vencimiento por defecto (90 días desde hoy)
    const fechaVencimiento = new Date()
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 90)

    setFormData({
      usuario_id: '',
      producto: '',
      tipo_cobertura: '',
      detalles_cobertura: '',
      fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
      estado: 'activa',
      observaciones: ''
    })
    setGarantiaSeleccionada(null)
    setModalOpen(true)
  }

  const abrirModalEditar = (garantia) => {
    console.log('Editando garantía:', garantia)
    setFormData({
      usuario_id: garantia.usuario_id || '',
      producto: garantia.producto || '',
      tipo_cobertura: garantia.tipo_cobertura || '',
      detalles_cobertura: garantia.detalles_cobertura || '',
      fecha_vencimiento: garantia.fecha_vencimiento || '',
      estado: garantia.estado || 'activa',
      observaciones: garantia.observaciones || ''
    })
    setGarantiaSeleccionada(garantia)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validación adicional
    if (!garantiaSeleccionada && !formData.usuario_id) {
      alert('Por favor selecciona un cliente')
      return
    }

    if (!formData.fecha_vencimiento) {
      alert('Por favor ingresa la fecha de vencimiento')
      return
    }

    // Preparar datos para enviar
    const dataToSend = {
      ...formData,
      // Asegurar que tipo_cobertura tenga un valor
      tipo_cobertura: formData.tipo_cobertura || formData.producto || 'Cobertura general'
    }

    console.log('Enviando datos:', dataToSend)

    try {
      const url = garantiaSeleccionada
        ? `${API_URL}/dgarantias.php?id=${garantiaSeleccionada.id}`
        : `${API_URL}/dgarantias.php`

      const method = garantiaSeleccionada ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()
      console.log('Respuesta del servidor:', data)

      if (data.success) {
        alert(garantiaSeleccionada ? 'Garantía actualizada exitosamente' : 'Garantía creada exitosamente')
        setModalOpen(false)
        cargarGarantias()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al guardar garantía:', error)
      alert('Error al guardar la garantía: ' + error.message)
    }
  }

  const confirmarEliminar = (garantia) => {
    setGarantiaSeleccionada(garantia)
    setModalEliminar(true)
  }

  const eliminarGarantia = async () => {
    try {
      const response = await fetch(`${API_URL}/dgarantias.php?id=${garantiaSeleccionada.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        alert('Garantía eliminada exitosamente')
        setModalEliminar(false)
        cargarGarantias()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al eliminar garantía:', error)
      alert('Error al eliminar la garantía')
    }
  }

  const garantiasFiltradas = garantias.filter(garantia =>
    garantia.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    garantia.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    garantia.producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
    garantia.estado?.toLowerCase().includes(busqueda.toLowerCase())
  )

  // 🆕 LÓGICA DE PAGINACIÓN
  const indiceUltimaGarantia = paginaActual * garantiasPorPagina
  const indicePrimeraGarantia = indiceUltimaGarantia - garantiasPorPagina
  const garantiasPaginadas = garantiasFiltradas.slice(indicePrimeraGarantia, indiceUltimaGarantia)
  const totalPaginas = Math.ceil(garantiasFiltradas.length / garantiasPorPagina)

  const cambiarPagina = (numeroPagina) => {
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
      setPaginaActual(numeroPagina)
    }
  }
  // -------------------------

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'activa': return '#10B981'
      case 'vencida': return '#EF5350'
      case 'reclamada': return '#FFA726'
      case 'cancelada': return '#9ca3af'
      default: return '#667eea'
    }
  }

  const getEstadoTexto = (estado) => {
    switch(estado) {
      case 'activa': return 'Activa'
      case 'vencida': return 'Vencida'
      case 'reclamada': return 'Reclamada'
      case 'cancelada': return 'Cancelada'
      default: return estado
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const esVencida = (fechaVencimiento) => {
    if (!fechaVencimiento) return false
    // Se compara con la fecha de hoy sin la parte de la hora
    const hoy = new Date().setHours(0, 0, 0, 0);
    const vencimiento = new Date(fechaVencimiento).setHours(0, 0, 0, 0);
    return vencimiento < hoy;
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
          <p style={{ marginTop: '1rem', color: '#718096' }}>Cargando garantías...</p>
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
                Gestión de Garantías
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#718096',
                margin: 0
              }}>
                Administra las garantías de pedidos y reparaciones
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
            Nueva Garantía
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
            placeholder="Buscar por código, cliente, producto o estado..."
            value={busqueda}
            onChange={(e) => {
                setBusqueda(e.target.value)
                setPaginaActual(1) // 🆕 Resetear a la primera página en cada búsqueda
            }}
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

      {/* Tabla de garantías */}
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
                <th style={estiloTh}>Producto/Servicio</th>
                <th style={estiloTh}>Cobertura</th>
                <th style={estiloTh}>Fecha Inicio</th>
                <th style={estiloTh}>Vencimiento</th>
                <th style={estiloTh}>Estado</th>
                <th style={estiloTh}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {garantiasPaginadas.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: '#9ca3af'
                  }}>
                    <Shield size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ margin: 0, fontSize: '1rem' }}>
                      {busqueda ? 'No se encontraron garantías' : 'No hay garantías registradas'}
                    </p>
                  </td>
                </tr>
              ) : (
                garantiasPaginadas.map((garantia) => (
                    <tr
                      key={garantia.id}
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
                            <Shield size={20} color="#667eea" />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: '600', color: '#1a202c' }}>
                              {garantia.codigo}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', color: '#1a202c' }}>
                            {garantia.nombre_cliente || 'N/A'}
                          </p>
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#9ca3af' }}>
                            {garantia.telefono || 'Sin teléfono'}
                          </p>
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <span style={{ fontWeight: '500' }}>
                          {garantia.producto || 'N/A'}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <p style={{
                          margin: 0,
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {garantia.tipo_cobertura || 'N/A'}
                        </p>
                      </td>
                      <td style={estiloTd}>
                        <span style={{ fontSize: '0.875rem' }}>
                          {formatearFecha(garantia.fecha_inicio || garantia.fecha_reclamo)}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        {garantia.fecha_vencimiento ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {esVencida(garantia.fecha_vencimiento) && (
                              <AlertCircle size={14} color="#EF5350" />
                            )}
                            <span style={{
                              fontSize: '0.875rem',
                              color: esVencida(garantia.fecha_vencimiento) ? '#EF5350' : '#4b5563'
                            }}>
                              {formatearFecha(garantia.fecha_vencimiento)}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>N/A</span>
                        )}
                      </td>
                      <td style={estiloTd}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          background: `${getEstadoColor(garantia.estado)}15`,
                          color: getEstadoColor(garantia.estado),
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: '600'
                        }}>
                          {getEstadoTexto(garantia.estado)}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => abrirModalEditar(garantia)}
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
                            onClick={() => confirmarEliminar(garantia)}
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
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🆕 CONTROLES DE PAGINACIÓN */}
        {garantiasFiltradas.length > garantiasPorPagina && (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderTop: '1px solid #f3f4f6'
            }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#718096' }}>
                    Mostrando **{indicePrimeraGarantia + 1}** a **{Math.min(indiceUltimaGarantia, garantiasFiltradas.length)}** de **{garantiasFiltradas.length}** resultados
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '0.5rem 0.75rem',
                            cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: paginaActual === 1 ? '#9ca3af' : '#4b5563',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => paginaActual !== 1 && (e.currentTarget.style.background = '#e5e7eb')}
                        onMouseLeave={(e) => paginaActual !== 1 && (e.currentTarget.style.background = '#f9fafb')}
                    >
                        <ChevronLeft size={18} />
                        Anterior
                    </button>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '32px',
                        height: '32px',
                        background: '#667eea',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                    }}>
                        {paginaActual}
                    </div>
                    <button
                        onClick={() => cambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '0.5rem 0.75rem',
                            cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: paginaActual === totalPaginas ? '#9ca3af' : '#4b5563',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => paginaActual !== totalPaginas && (e.currentTarget.style.background = '#e5e7eb')}
                        onMouseLeave={(e) => paginaActual !== totalPaginas && (e.currentTarget.style.background = '#f9fafb')}
                    >
                        Siguiente
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        )}
        {/* FIN CONTROLES DE PAGINACIÓN */}
      </div>

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
            maxWidth: '600px',
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
                {garantiaSeleccionada ? 'Editar Garantía' : 'Nueva Garantía'}
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
                {!garantiaSeleccionada && (
                  <div>
                    <label style={estiloLabel}>Cliente *</label>
                    {loadingUsuarios ? (
                      <div style={{
                        ...estiloInput,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af'
                      }}>
                        Cargando usuarios...
                      </div>
                    ) : usuarios.length === 0 ? (
                      <div style={{
                        ...estiloInput,
                        color: '#EF5350',
                        background: '#FEE'
                      }}>
                        No hay usuarios disponibles
                      </div>
                    ) : (
                      <select
                        name="usuario_id"
                        value={formData.usuario_id}
                        onChange={handleInputChange}
                        required
                        style={{...estiloInput, cursor: 'pointer'}}
                      >
                        <option value="">Seleccionar cliente</option>
                        {usuarios.filter(u => u.rol === 'cliente' || u.rol === '').map(usuario => (
                          <option key={usuario.id} value={usuario.id}>
                            {usuario.nombre_completo || `${usuario.nombres} ${usuario.apellidos}`} - {usuario.identificacion}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <div>
                  <label style={estiloLabel}>Producto/Servicio *</label>
                  <input
                    type="text"
                    name="producto"
                    value={formData.producto}
                    onChange={handleInputChange}
                    required
                    style={estiloInput}
                    placeholder="Ej: iPhone 13 Pro Max o Cambio de pantalla"
                  />
                </div>

                <div>
                  <label style={estiloLabel}>Tipo de Cobertura *</label>
                  <input
                    type="text"
                    name="tipo_cobertura"
                    value={formData.tipo_cobertura}
                    onChange={handleInputChange}
                    style={estiloInput}
                    placeholder="Ej: Mano de obra y repuestos"
                  />
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                    Si está vacío, se usará el producto/servicio
                  </p>
                </div>

                <div>
                  <label style={estiloLabel}>Detalles de Cobertura</label>
                  <textarea
                    name="detalles_cobertura"
                    value={formData.detalles_cobertura}
                    onChange={handleInputChange}
                    rows={3}
                    style={{...estiloInput, resize: 'vertical'}}
                    placeholder="Describe qué cubre esta garantía..."
                  />
                </div>

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
                      <option value="activa">Activa</option>
                      <option value="vencida">Vencida</option>
                      <option value="reclamada">Reclamada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label style={estiloLabel}>Fecha de Vencimiento *</label>
                    <input
                      type="date"
                      name="fecha_vencimiento"
                      value={formData.fecha_vencimiento}
                      onChange={handleInputChange}
                      required
                      style={estiloInput}
                    />
                  </div>
                </div>

                <div>
                  <label style={estiloLabel}>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    rows={3}
                    style={{...estiloInput, resize: 'vertical'}}
                    placeholder="Notas adicionales sobre la garantía..."
                  />
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
                  disabled={!garantiaSeleccionada && (loadingUsuarios || usuarios.length === 0)}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: (!garantiaSeleccionada && (loadingUsuarios || usuarios.length === 0))
                      ? '#9ca3af'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: (!garantiaSeleccionada && (loadingUsuarios || usuarios.length === 0)) ? 'not-allowed' : 'pointer',
                    fontSize: '0.9375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (garantiaSeleccionada || (!loadingUsuarios && usuarios.length > 0)) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (garantiaSeleccionada || (!loadingUsuarios && usuarios.length > 0)) {
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  <Save size={20} />
                  {garantiaSeleccionada ? 'Actualizar' : 'Crear'}
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
              ¿Eliminar Garantía?
            </h3>

            <p style={{
              fontSize: '0.9375rem',
              color: '#718096',
              textAlign: 'center',
              margin: '0 0 1.5rem'
            }}>
              ¿Estás seguro de que deseas eliminar la garantía{' '}
              <strong>{garantiaSeleccionada?.codigo}</strong>?
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
                onClick={eliminarGarantia}
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

export default GestionGarantias