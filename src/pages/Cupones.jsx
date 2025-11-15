import { useState, useEffect } from 'react'
import { 
  Tag, X, Plus, Edit, Trash2, Search, ArrowLeft, Save, Calendar,
  Percent, DollarSign, Truck, Copy, Check, Users, TrendingUp
} from 'lucide-react'

// URL del backend PHP
const API_URL = 'http://localhost/megacell_backend'

function GestionCupones() {
  const [cupones, setCupones] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [cuponSeleccionado, setCuponSeleccionado] = useState(null)
  const [copiado, setCopiado] = useState(null)
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    tipo_descuento: 'porcentaje',
    valor_descuento: '',
    fecha_inicio: '',
    fecha_expiracion: '',
    usos_maximos: '100',
    usos_por_usuario: '1',
    activo: 1
  })

  useEffect(() => {
    cargarCupones()
  }, [])

  const cargarCupones = async () => {
    try {
      const response = await fetch(`${API_URL}/dcupones.php`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setCupones(data.cupones || [])
      } else {
        console.error('Error al cargar cupones:', data.message)
        alert('Error al cargar cupones: ' + data.message)
      }
    } catch (error) {
      console.error('Error al cargar cupones:', error)
      alert('Error de conexión al cargar cupones: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }))
  }

  const generarCodigoAleatorio = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let codigo = ''
    for (let i = 0; i < 8; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, codigo }))
  }

  const abrirModalCrear = () => {
    const fechaInicio = new Date().toISOString().split('T')[0]
    const fechaExpiracion = new Date()
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 30)
    
    setFormData({
      codigo: '',
      descripcion: '',
      tipo_descuento: 'porcentaje',
      valor_descuento: '',
      fecha_inicio: fechaInicio,
      fecha_expiracion: fechaExpiracion.toISOString().split('T')[0],
      usos_maximos: '100',
      usos_por_usuario: '1',
      activo: 1
    })
    setCuponSeleccionado(null)
    setModalOpen(true)
  }

  const abrirModalEditar = (cupon) => {
    setFormData({
      codigo: cupon.codigo || '',
      descripcion: cupon.descripcion || '',
      tipo_descuento: cupon.tipo_descuento || 'porcentaje',
      valor_descuento: cupon.valor_descuento || '',
      fecha_inicio: cupon.fecha_inicio || '',
      fecha_expiracion: cupon.fecha_expiracion || '',
      usos_maximos: cupon.usos_maximos || '100',
      usos_por_usuario: cupon.usos_por_usuario || '1',
      activo: cupon.activo || 0
    })
    setCuponSeleccionado(cupon)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.codigo.trim()) {
      alert('Por favor ingresa un código de cupón')
      return
    }

    if (formData.tipo_descuento !== 'envio_gratis' && !formData.valor_descuento) {
      alert('Por favor ingresa el valor del descuento')
      return
    }

    try {
      const url = cuponSeleccionado 
        ? `${API_URL}/dcupones.php?id=${cuponSeleccionado.id}`
        : `${API_URL}/dcupones.php`
      
      const method = cuponSeleccionado ? 'PUT' : 'POST'
      
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
        alert(cuponSeleccionado ? 'Cupón actualizado exitosamente' : 'Cupón creado exitosamente')
        setModalOpen(false)
        cargarCupones()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al guardar cupón:', error)
      alert('Error al guardar el cupón: ' + error.message)
    }
  }

  const confirmarEliminar = (cupon) => {
    setCuponSeleccionado(cupon)
    setModalEliminar(true)
  }

  const eliminarCupon = async () => {
    try {
      const response = await fetch(`${API_URL}/dcupones.php?id=${cuponSeleccionado.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        alert('Cupón eliminado exitosamente')
        setModalEliminar(false)
        cargarCupones()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al eliminar cupón:', error)
      alert('Error al eliminar el cupón')
    }
  }

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo)
    setCopiado(codigo)
    setTimeout(() => setCopiado(null), 2000)
  }

  const cuponesFiltrados = cupones.filter(cupon =>
    cupon.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    cupon.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    cupon.tipo_descuento?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'porcentaje': return <Percent size={20} />
      case 'fijo': return <DollarSign size={20} />
      case 'envio_gratis': return <Truck size={20} />
      default: return <Tag size={20} />
    }
  }

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'porcentaje': return '#667eea'
      case 'fijo': return '#10B981'
      case 'envio_gratis': return '#FFA726'
      default: return '#9ca3af'
    }
  }

  const getTipoTexto = (tipo) => {
    switch(tipo) {
      case 'porcentaje': return 'Porcentaje'
      case 'fijo': return 'Descuento Fijo'
      case 'envio_gratis': return 'Envío Gratis'
      default: return tipo
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

  const esVigente = (fechaInicio, fechaExpiracion) => {
    const hoy = new Date()
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaExpiracion)
    return hoy >= inicio && hoy <= fin
  }

  const formatoPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio || 0)
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
          <p style={{ marginTop: '1rem', color: '#718096' }}>Cargando cupones...</p>
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
                Gestión de Cupones
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#718096',
                margin: 0
              }}>
                Administra cupones y descuentos promocionales
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
            Nuevo Cupón
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
            placeholder="Buscar por código, descripción o tipo..."
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

      {/* Grid de cupones */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {cuponesFiltrados.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            background: 'white',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Tag size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
            <p style={{ margin: 0, fontSize: '1rem', color: '#9ca3af' }}>
              {busqueda ? 'No se encontraron cupones' : 'No hay cupones registrados'}
            </p>
          </div>
        ) : (
          cuponesFiltrados.map((cupon) => {
            const vigente = esVigente(cupon.fecha_inicio, cupon.fecha_expiracion)
            const usado = parseInt(cupon.total_usos || 0)
            const maximo = parseInt(cupon.usos_maximos)
            const porcentajeUso = (usado / maximo) * 100

            return (
              <div
                key={cupon.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  border: `2px solid ${vigente && cupon.activo === 1 ? getTipoColor(cupon.tipo_descuento) : '#e5e7eb'}`,
                  opacity: cupon.activo === 0 ? 0.6 : 1
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
                {/* Header del cupón */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: `${getTipoColor(cupon.tipo_descuento)}15`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getTipoColor(cupon.tipo_descuento)
                    }}>
                      {getTipoIcon(cupon.tipo_descuento)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: '#1a202c',
                        margin: 0,
                        marginBottom: '0.25rem'
                      }}>
                        {cupon.codigo}
                      </h3>
                      <span style={{
                        fontSize: '0.75rem',
                        color: getTipoColor(cupon.tipo_descuento),
                        fontWeight: '600'
                      }}>
                        {getTipoTexto(cupon.tipo_descuento)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      copiarCodigo(cupon.codigo)
                    }}
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
                    title="Copiar código"
                  >
                    {copiado === cupon.codigo ? (
                      <Check size={16} color="#10B981" />
                    ) : (
                      <Copy size={16} color="#718096" />
                    )}
                  </button>
                </div>

                {/* Valor del descuento */}
                <div style={{
                  background: `${getTipoColor(cupon.tipo_descuento)}10`,
                  padding: '1rem',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    color: getTipoColor(cupon.tipo_descuento),
                    margin: 0
                  }}>
                    {cupon.tipo_descuento === 'envio_gratis' 
                      ? 'GRATIS'
                      : cupon.tipo_descuento === 'porcentaje'
                      ? `${cupon.valor_descuento}%`
                      : formatoPrecio(cupon.valor_descuento)
                    }
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#718096',
                    margin: '0.25rem 0 0'
                  }}>
                    {cupon.descripcion || 'Sin descripción'}
                  </p>
                </div>

                {/* Fechas de vigencia */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.8125rem',
                  color: '#718096'
                }}>
                  <div style={{ flex: 1 }}>
                    <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {formatearFecha(cupon.fecha_inicio)}
                  </div>
                  <span>→</span>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    {formatearFecha(cupon.fecha_expiracion)}
                  </div>
                </div>

                {/* Progreso de uso */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.8125rem', color: '#718096' }}>
                      Usos: {usado} / {maximo}
                    </span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: getTipoColor(cupon.tipo_descuento) }}>
                      {porcentajeUso.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: '#f3f4f6',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(porcentajeUso, 100)}%`,
                      height: '100%',
                      background: getTipoColor(cupon.tipo_descuento),
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                {/* Estados y acciones */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {cupon.activo === 0 && (
                      <span style={{
                        padding: '4px 8px',
                        background: '#9ca3af15',
                        color: '#9ca3af',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Inactivo
                      </span>
                    )}
                    {vigente && cupon.activo === 1 && (
                      <span style={{
                        padding: '4px 8px',
                        background: '#10B98115',
                        color: '#10B981',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Vigente
                      </span>
                    )}
                    {!vigente && cupon.activo === 1 && (
                      <span style={{
                        padding: '4px 8px',
                        background: '#EF535015',
                        color: '#EF5350',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Expirado
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => abrirModalEditar(cupon)}
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
                      onClick={() => confirmarEliminar(cupon)}
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
                </div>
              </div>
            )
          })
        )}
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
                {cuponSeleccionado ? 'Editar Cupón' : 'Nuevo Cupón'}
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
                <div>
                  <label style={estiloLabel}>Código del Cupón *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleInputChange}
                      required
                      maxLength={20}
                      style={{ ...estiloInput, flex: 1, textTransform: 'uppercase' }}
                      placeholder="Ej: MEGA10"
                    />
                    {!cuponSeleccionado && (
                      <button
                        type="button"
                        onClick={generarCodigoAleatorio}
                        style={{
                          padding: '0.75rem 1rem',
                          background: '#667eea15',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#667eea',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Generar
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label style={estiloLabel}>Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    maxLength={200}
                    style={estiloInput}
                    placeholder="Ej: Descuento en toda la tienda"
                  />
                </div>

                <div>
                  <label style={estiloLabel}>Tipo de Descuento *</label>
                  <select
                    name="tipo_descuento"
                    value={formData.tipo_descuento}
                    onChange={handleInputChange}
                    required
                    style={{...estiloInput, cursor: 'pointer'}}
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Descuento Fijo ($)</option>
                    <option value="envio_gratis">Envío Gratis</option>
                  </select>
                </div>

                {formData.tipo_descuento !== 'envio_gratis' && (
                  <div>
                    <label style={estiloLabel}>
                      Valor del Descuento * 
                      {formData.tipo_descuento === 'porcentaje' ? ' (%)' : ' (COP)'}
                    </label>
                    <input
                      type="number"
                      name="valor_descuento"
                      value={formData.valor_descuento}
                      onChange={handleInputChange}
                      required={formData.tipo_descuento !== 'envio_gratis'}
                      min="0"
                      max={formData.tipo_descuento === 'porcentaje' ? '100' : undefined}
                      step={formData.tipo_descuento === 'porcentaje' ? '1' : '1000'}
                      style={estiloInput}
                      placeholder={formData.tipo_descuento === 'porcentaje' ? 'Ej: 10' : 'Ej: 50000'}
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={estiloLabel}>Fecha Inicio *</label>
                    <input
                      type="date"
                      name="fecha_inicio"
                      value={formData.fecha_inicio}
                      onChange={handleInputChange}
                      required
                      style={estiloInput}
                    />
                  </div>
                  <div>
                    <label style={estiloLabel}>Fecha Expiración *</label>
                    <input
                      type="date"
                      name="fecha_expiracion"
                      value={formData.fecha_expiracion}
                      onChange={handleInputChange}
                      required
                      style={estiloInput}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={estiloLabel}>Usos Máximos *</label>
                    <input
                      type="number"
                      name="usos_maximos"
                      value={formData.usos_maximos}
                      onChange={handleInputChange}
                      required
                      min="1"
                      style={estiloInput}
                      placeholder="Ej: 100"
                    />
                  </div>
                  <div>
                    <label style={estiloLabel}>Usos por Usuario *</label>
                    <input
                      type="number"
                      name="usos_por_usuario"
                      value={formData.usos_por_usuario}
                      onChange={handleInputChange}
                      required
                      min="1"
                      style={estiloInput}
                      placeholder="Ej: 1"
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '10px'
                }}>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo === 1}
                    onChange={handleInputChange}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer'
                    }}
                  />
                  <label style={{
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    margin: 0
                  }}>
                    Cupón activo y disponible para uso
                  </label>
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
                  {cuponSeleccionado ? 'Actualizar' : 'Crear Cupón'}
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
              ¿Eliminar Cupón?
            </h3>

            <p style={{
              fontSize: '0.9375rem',
              color: '#718096',
              textAlign: 'center',
              margin: '0 0 1.5rem'
            }}>
              ¿Estás seguro de que deseas eliminar el cupón{' '}
              <strong>{cuponSeleccionado?.codigo}</strong>?
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
                onClick={eliminarCupon}
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

export default GestionCupones