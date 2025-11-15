import { useState, useEffect } from 'react'
import { 
  Package, X, Plus, Edit, Trash2, Search, ArrowLeft, Save, ShoppingCart,
  ChevronLeft, ChevronRight // Importados para la paginación
} from 'lucide-react'

// URL del backend PHP
const API_URL = 'http://localhost/megacell_backend'

function GestionProductos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  
  // --- Estados de Paginación ---
  const [paginaActual, setPaginaActual] = useState(1)
  const [productosPorPagina] = useState(10) // Define cuántos productos por página
  // -----------------------------

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'accesorios',
    stock: '',
    imagen_url: ''
  })

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      console.log('Cargando productos desde:', `${API_URL}/dproductos.php`)
      
      const response = await fetch(`${API_URL}/dproductos.php`, {
        method: 'GET',
        credentials: 'include'
      })

      console.log('Respuesta recibida:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Datos recibidos:', data)

      if (data.success) {
        setProductos(data.productos || [])
        console.log('Productos cargados:', data.productos?.length || 0)
        setPaginaActual(1) // Resetear a la primera página al cargar nuevos datos
      } else {
        console.error('Error al cargar productos:', data.message)
        alert('Error al cargar productos: ' + data.message)
      }
    } catch (error) {
      console.error('Error al cargar productos:', error)
      alert('Error de conexión al cargar productos: ' + error.message)
    } finally {
      setLoading(false)
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
      nombre: '',
      descripcion: '',
      precio: '',
      categoria: 'accesorios',
      stock: '',
      imagen_url: ''
    })
    setProductoSeleccionado(null)
    setModalOpen(true)
  }

  const abrirModalEditar = (producto) => {
    setFormData({  
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria: producto.categoria,
      stock: producto.stock,
      imagen_url: producto.imagen_url || ''
    })
    setProductoSeleccionado(producto)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = productoSeleccionado 
        ? `${API_URL}/dproductos.php?id=${productoSeleccionado.id}`
        : `${API_URL}/dproductos.php`
      
      const method = productoSeleccionado ? 'PUT' : 'POST'
      
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
        alert(productoSeleccionado ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente')
        setModalOpen(false)
        cargarProductos()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al guardar producto:', error)
      alert('Error al guardar el producto')
    }
  }

  const confirmarEliminar = (producto) => {
    setProductoSeleccionado(producto)
    setModalEliminar(true)
  }

  const eliminarProducto = async () => {
    try {
      const response = await fetch(`${API_URL}/dproductos.php?id=${productoSeleccionado.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        alert('Producto eliminado exitosamente')
        setModalEliminar(false)
        cargarProductos()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      alert('Error al eliminar el producto')
    }
  }

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    producto.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
    producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  )

  // --- Lógica de Paginación ---
  const indiceUltimoProducto = paginaActual * productosPorPagina
  const indicePrimerProducto = indiceUltimoProducto - productosPorPagina
  const productosPaginaActual = productosFiltrados.slice(indicePrimerProducto, indiceUltimoProducto)

  const numeroTotalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina)

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

  const getCategoriaColor = (categoria) => {
    switch(categoria) {
      case 'accesorios': return '#667eea'
      case 'repuestos': return '#FFA726'
      case 'equipos': return '#EF5350'
      case 'servicios': return '#10B981'
      default: return '#9ca3af'
    }
  }

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio)
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
          <p style={{ marginTop: '1rem', color: '#718096' }}>Cargando productos...</p>
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
                Gestión de Productos
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#718096',
                margin: 0
              }}>
                Administra el inventario de productos
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
            Nuevo Producto
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
            placeholder="Buscar por nombre, categoría o descripción..."
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

      {/* Tabla de productos */}
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
                <th style={estiloTh}>Producto</th>
                <th style={estiloTh}>Descripción</th>
                <th style={estiloTh}>Precio</th>
                <th style={estiloTh}>Categoría</th>
                <th style={estiloTh}>Stock</th>
                <th style={estiloTh}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosPaginaActual.length === 0 ? ( // Usar productosPaginaActual
                <tr>
                  <td colSpan="6" style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: '#9ca3af'
                  }}>
                    <Package size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ margin: 0, fontSize: '1rem' }}>
                      {busqueda ? 'No se encontraron productos' : 'No hay productos registrados'}
                    </p>
                  </td>
                </tr>
              ) : (
                productosPaginaActual.map((producto) => ( // Usar productosPaginaActual
                    <tr
                      key={producto.id}
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
                            <Package size={20} color="#667eea" />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: '600', color: '#1a202c' }}>
                              {producto.nombre}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <p style={{ margin: 0, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {producto.descripcion}
                        </p>
                      </td>
                      <td style={estiloTd}>
                        <span style={{ fontWeight: '600', color: '#10B981' }}>
                          {formatearPrecio(producto.precio)}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          background: `${getCategoriaColor(producto.categoria)}15`,
                          color: getCategoriaColor(producto.categoria),
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {producto.categoria}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '6px 12px',
                          background: producto.stock > 10 ? '#10B98115' : producto.stock > 0 ? '#FFA72615' : '#EF535015',
                          color: producto.stock > 10 ? '#10B981' : producto.stock > 0 ? '#FFA726' : '#EF5350',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: '600'
                        }}>
                          <ShoppingCart size={14} />
                          {producto.stock} unidades
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => abrirModalEditar(producto)}
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
                            onClick={() => confirmarEliminar(producto)}
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
      </div>

      {/* --- Controles de Paginación --- */}
      {productosFiltrados.length > productosPorPagina && (
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
            Mostrando {indicePrimerProducto + 1} a {Math.min(indiceUltimoProducto, productosFiltrados.length)} de {productosFiltrados.length} productos
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
                {productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'}
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

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={estiloLabel}>Nombre del Producto *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  style={estiloInput}
                  placeholder="Ej: Cargador Rápido USB-C"
                />
              </div>

              <div>
                <label style={estiloLabel}>Descripción *</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  style={{...estiloInput, resize: 'vertical'}}
                  placeholder="Descripción detallada del producto"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={estiloLabel}>Precio (COP) *</label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    style={estiloInput}
                    placeholder="35000"
                  />
                </div>
                <div>
                  <label style={estiloLabel}>Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    style={estiloInput}
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label style={estiloLabel}>Categoría *</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  required
                  style={{...estiloInput, cursor: 'pointer'}}
                >
                  <option value="accesorios">Accesorios</option>
                  <option value="repuestos">Repuestos</option>
                  <option value="equipos">Equipos</option>
                  <option value="servicios">Servicios</option>
                </select>
              </div>

              <div>
                <label style={estiloLabel}>URL de Imagen (opcional)</label>
                <input
                  type="url"
                  name="imagen_url"
                  value={formData.imagen_url}
                  onChange={handleInputChange}
                  style={estiloInput}
                  placeholder="https://ejemplo.com/imagen.jpg"
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
                onClick={handleSubmit}
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
                {productoSeleccionado ? 'Actualizar' : 'Crear'}
              </button>
            </div>
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
              ¿Eliminar Producto?
            </h3>

            <p style={{
              fontSize: '0.9375rem',
              color: '#718096',
              textAlign: 'center',
              margin: '0 0 1.5rem'
            }}>
              ¿Estás seguro de que deseas eliminar{' '}
              <strong>{productoSeleccionado?.nombre}</strong>?
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
                onClick={eliminarProducto}
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

export default GestionProductos