import { useState, useEffect } from 'react'
import { 
  ShoppingCart, X, Plus, Edit, Trash2, Search, ArrowLeft, Save, 
  Package, Truck, CheckCircle, XCircle, Clock, AlertCircle
} from 'lucide-react'

// URL del backend PHP
const API_URL = 'http://localhost/megacell_backend'

function GestionPedidos({ onVolver }) {
  const [pedidos, setPedidos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)
  const [formData, setFormData] = useState({
    usuario_id: '',
    estado: 'pendiente',
    total: '',
    productos: 1,
    direccion_envio: '',
    metodo_pago: 'efectivo'
  })

  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'nequi', label: 'Nequi' },
    { value: 'daviplata', label: 'Daviplata' }
  ]

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    await Promise.all([
      cargarPedidos(),
      cargarUsuarios()
    ])
  }

  const cargarPedidos = async () => {
    try {
      const response = await fetch(`${API_URL}/dpedidos.php`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setPedidos(data.pedidos || [])
      } else {
        console.error('Error al cargar pedidos:', data.message)
        alert('Error al cargar pedidos: ' + data.message)
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error)
      alert('Error de conexión al cargar pedidos: ' + error.message)
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
        console.log('Usuarios cargados:', data.usuarios) // Debug
        setUsuarios(data.usuarios || [])
      } else {
        console.error('Error al cargar usuarios:', data.message)
        alert('Error al cargar usuarios: ' + data.message)
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      alert('Error de conexión al cargar usuarios. Asegúrate de que el archivo dusuarios.php existe: ' + error.message)
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
    setFormData({
      usuario_id: '',
      estado: 'pendiente',
      total: '',
      productos: 1,
      direccion_envio: '',
      metodo_pago: 'efectivo'
    })
    setPedidoSeleccionado(null)
    setModalOpen(true)
  }

  const abrirModalEditar = (pedido) => {
    setFormData({
      usuario_id: pedido.usuario_id || '',
      estado: pedido.estado || 'pendiente',
      total: pedido.total || '',
      productos: pedido.productos || 1,
      direccion_envio: pedido.direccion_envio || '',
      metodo_pago: pedido.metodo_pago || 'efectivo'
    })
    setPedidoSeleccionado(pedido)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validación adicional
    if (!formData.usuario_id) {
      alert('Por favor selecciona un usuario')
      return
    }
    
    try {
      const url = pedidoSeleccionado 
        ? `${API_URL}/dpedidos.php?id=${pedidoSeleccionado.id}`
        : `${API_URL}/dpedidos.php`
      
      const method = pedidoSeleccionado ? 'PUT' : 'POST'
      
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
        alert(pedidoSeleccionado ? 'Pedido actualizado exitosamente' : 'Pedido creado exitosamente')
        setModalOpen(false)
        cargarPedidos()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al guardar pedido:', error)
      alert('Error al guardar el pedido')
    }
  }

  const confirmarEliminar = (pedido) => {
    setPedidoSeleccionado(pedido)
    setModalEliminar(true)
  }

  const eliminarPedido = async () => {
    try {
      const response = await fetch(`${API_URL}/dpedidos.php?id=${pedidoSeleccionado.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        alert('Pedido eliminado exitosamente')
        setModalEliminar(false)
        cargarPedidos()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al eliminar pedido:', error)
      alert('Error al eliminar el pedido')
    }
  }

  const pedidosFiltrados = pedidos.filter(pedido =>
    pedido.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    pedido.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    pedido.estado?.toLowerCase().includes(busqueda.toLowerCase()) ||
    pedido.metodo_pago?.toLowerCase().includes(busqueda.toLowerCase())
  )

  // Cálculos de paginación
  const indexUltimo = paginaActual * itemsPorPagina
  const indexPrimero = indexUltimo - itemsPorPagina
  const pedidosPaginados = pedidosFiltrados.slice(indexPrimero, indexUltimo)
  const totalPaginas = Math.ceil(pedidosFiltrados.length / itemsPorPagina)

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      cambiarPagina(paginaActual - 1)
    }
  }

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      cambiarPagina(paginaActual + 1)
    }
  }

  // Resetear página al buscar
  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda])

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pendiente': return '#FFA726'
      case 'procesando': return '#42A5F5'
      case 'en_camino': return '#667eea'
      case 'entregado': return '#10B981'
      case 'cancelado': return '#EF5350'
      default: return '#9ca3af'
    }
  }

  const getEstadoTexto = (estado) => {
    switch(estado) {
      case 'pendiente': return 'Pendiente'
      case 'procesando': return 'Procesando'
      case 'en_camino': return 'En Camino'
      case 'entregado': return 'Entregado'
      case 'cancelado': return 'Cancelado'
      default: return estado
    }
  }

  const getEstadoIcono = (estado) => {
    switch(estado) {
      case 'pendiente': return Clock
      case 'procesando': return Package
      case 'en_camino': return Truck
      case 'entregado': return CheckCircle
      case 'cancelado': return XCircle
      default: return AlertCircle
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
          <p style={{ marginTop: '1rem', color: '#718096' }}>Cargando pedidos...</p>
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
                Gestión de Pedidos
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#718096',
                margin: 0
              }}>
                Administra los pedidos de productos
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
            Nuevo Pedido
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
            placeholder="Buscar por código, cliente, estado o método de pago..."
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

      {/* Tabla de pedidos */}
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
                <th style={estiloTh}>Fecha</th>
                <th style={estiloTh}>Productos</th>
                <th style={estiloTh}>Total</th>
                <th style={estiloTh}>Método Pago</th>
                <th style={estiloTh}>Estado</th>
                <th style={estiloTh}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: '#9ca3af'
                  }}>
                    <ShoppingCart size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ margin: 0, fontSize: '1rem' }}>
                      {busqueda ? 'No se encontraron pedidos' : 'No hay pedidos registrados'}
                    </p>
                  </td>
                </tr>
              ) : (
                pedidosPaginados.map((pedido) => {
                  const IconoEstado = getEstadoIcono(pedido.estado)
                  return (
                    <tr
                      key={pedido.id}
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
                            <ShoppingCart size={20} color="#667eea" />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: '600', color: '#1a202c' }}>
                              {pedido.codigo}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', color: '#1a202c' }}>
                            {pedido.nombre_cliente || 'N/A'}
                          </p>
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#9ca3af' }}>
                            {pedido.email || 'Sin email'}
                          </p>
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <span style={{ fontSize: '0.875rem' }}>
                          {formatearFecha(pedido.fecha_pedido)}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '4px 12px',
                          background: '#f3f4f6',
                          borderRadius: '6px'
                        }}>
                          <Package size={14} color="#667eea" />
                          <span style={{ fontWeight: '600' }}>
                            {pedido.productos || 0}
                          </span>
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <span style={{ fontWeight: '700', color: '#667eea', fontSize: '1rem' }}>
                          {formatearPrecio(pedido.total)}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          background: '#10B98115',
                          color: '#10B981',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {pedido.metodo_pago || 'N/A'}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '6px 12px',
                          background: `${getEstadoColor(pedido.estado)}15`,
                          color: getEstadoColor(pedido.estado),
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: '600'
                        }}>
                          <IconoEstado size={14} />
                          {getEstadoTexto(pedido.estado)}
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => abrirModalEditar(pedido)}
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
                            onClick={() => confirmarEliminar(pedido)}
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

        {/* Paginación */}
        {pedidosFiltrados.length > 0 && (
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.875rem',
              color: '#718096'
            }}>
              <span>
                Mostrando {indexPrimero + 1} a {Math.min(indexUltimo, pedidosFiltrados.length)} de {pedidosFiltrados.length} pedidos
              </span>
              <select
                value={itemsPorPagina}
                onChange={(e) => {
                  setItemsPorPagina(Number(e.target.value))
                  setPaginaActual(1)
                }}
                style={{
                  padding: '0.5rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  cursor: 'pointer',
                  background: 'white'
                }}
              >
                <option value={5}>5 por página</option>
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <button
                onClick={paginaAnterior}
                disabled={paginaActual === 1}
                style={{
                  padding: '0.5rem 1rem',
                  background: paginaActual === 1 ? '#f3f4f6' : 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  color: paginaActual === 1 ? '#9ca3af' : '#374151',
                  cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (paginaActual !== 1) {
                    e.currentTarget.style.background = '#f9fafb'
                    e.currentTarget.style.borderColor = '#667eea'
                  }
                }}
                onMouseLeave={(e) => {
                  if (paginaActual !== 1) {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }
                }}
              >
                Anterior
              </button>

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter(num => {
                    return (
                      num === 1 ||
                      num === totalPaginas ||
                      (num >= paginaActual - 1 && num <= paginaActual + 1)
                    )
                  })
                  .map((num, index, array) => {
                    const prevNum = array[index - 1]
                    const showSeparator = prevNum && num - prevNum > 1

                    return (
                      <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {showSeparator && (
                          <span style={{ 
                            padding: '0 0.25rem', 
                            color: '#9ca3af',
                            fontSize: '0.875rem'
                          }}>
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => cambiarPagina(num)}
                          style={{
                            minWidth: '36px',
                            height: '36px',
                            padding: '0.5rem',
                            background: num === paginaActual 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                              : 'white',
                            border: '2px solid',
                            borderColor: num === paginaActual ? 'transparent' : '#e5e7eb',
                            borderRadius: '8px',
                            color: num === paginaActual ? 'white' : '#374151',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (num !== paginaActual) {
                              e.currentTarget.style.background = '#f9fafb'
                              e.currentTarget.style.borderColor = '#667eea'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (num !== paginaActual) {
                              e.currentTarget.style.background = 'white'
                              e.currentTarget.style.borderColor = '#e5e7eb'
                            }
                          }}
                        >
                          {num}
                        </button>
                      </div>
                    )
                  })}
              </div>

              <button
                onClick={paginaSiguiente}
                disabled={paginaActual === totalPaginas}
                style={{
                  padding: '0.5rem 1rem',
                  background: paginaActual === totalPaginas ? '#f3f4f6' : 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  color: paginaActual === totalPaginas ? '#9ca3af' : '#374151',
                  cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (paginaActual !== totalPaginas) {
                    e.currentTarget.style.background = '#f9fafb'
                    e.currentTarget.style.borderColor = '#667eea'
                  }
                }}
                onMouseLeave={(e) => {
                  if (paginaActual !== totalPaginas) {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
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
                {pedidoSeleccionado ? 'Editar Pedido' : 'Nuevo Pedido'}
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
                  <label style={estiloLabel}>Usuario *</label>
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
                      No hay usuarios disponibles. Verifica que el archivo dusuarios.php existe.
                    </div>
                  ) : (
                    <select
                      name="usuario_id"
                      value={formData.usuario_id}
                      onChange={handleInputChange}
                      required
                      style={{...estiloInput, cursor: 'pointer'}}
                    >
                      <option value="">Seleccionar usuario</option>
                      {usuarios.map(usuario => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nombre_completo || `${usuario.nombres} ${usuario.apellidos}`} - {usuario.identificacion} ({usuario.rol || 'cliente'})
                        </option>
                      ))}
                    </select>
                  )}
                  {usuarios.length > 0 && (
                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: '#10B981', 
                      marginTop: '0.25rem' 
                    }}>
                      ✓ {usuarios.length} usuarios cargados correctamente
                    </p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={estiloLabel}>Total *</label>
                    <input
                      type="number"
                      name="total"
                      value={formData.total}
                      onChange={handleInputChange}
                      required
                      style={estiloInput}
                      placeholder="0"
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div>
                    <label style={estiloLabel}>Cantidad de Productos *</label>
                    <input
                      type="number"
                      name="productos"
                      value={formData.productos}
                      onChange={handleInputChange}
                      required
                      style={estiloInput}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label style={estiloLabel}>Dirección de Envío *</label>
                  <textarea
                    name="direccion_envio"
                    value={formData.direccion_envio}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    style={{...estiloInput, resize: 'vertical'}}
                    placeholder="Dirección completa de envío"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={estiloLabel}>Método de Pago *</label>
                    <select
                      name="metodo_pago"
                      value={formData.metodo_pago}
                      onChange={handleInputChange}
                      required
                      style={{...estiloInput, cursor: 'pointer'}}
                    >
                      {metodosPago.map(metodo => (
                        <option key={metodo.value} value={metodo.value}>
                          {metodo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={estiloLabel}>Estado *</label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      required
                      style={{...estiloInput, cursor: 'pointer'}}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="procesando">Procesando</option>
                      <option value="en_camino">En Camino</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
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
                  disabled={loadingUsuarios || usuarios.length === 0}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: (loadingUsuarios || usuarios.length === 0) 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: (loadingUsuarios || usuarios.length === 0) ? 'not-allowed' : 'pointer',
                    fontSize: '0.9375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingUsuarios && usuarios.length > 0) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingUsuarios && usuarios.length > 0) {
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  <Save size={20} />
                  {pedidoSeleccionado ? 'Actualizar' : 'Crear'}
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
              ¿Eliminar Pedido?
            </h3>

            <p style={{
              fontSize: '0.9375rem',
              color: '#718096',
              textAlign: 'center',
              margin: '0 0 1.5rem'
            }}>
              ¿Estás seguro de que deseas eliminar el pedido{' '}
              <strong>{pedidoSeleccionado?.codigo}</strong>?
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
                onClick={eliminarPedido}
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

export default GestionPedidos