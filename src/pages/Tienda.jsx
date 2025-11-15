import { useState, useEffect } from 'react'
import { 
  ShoppingCart, Search, Filter, Package, 
  Star, Heart, Eye, Plus, Minus, X,
  CheckCircle, Phone, Mail, MapPin, CreditCard,
  Truck, Shield, ArrowRight, ArrowLeft, Smartphone
} from 'lucide-react'

// Configuración del API
const API_URL = 'http://localhost/megacell_backend'; // Ajusta esto según tu configuración

function TiendaVirtual() {
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')
  const [paso, setPaso] = useState(1)
  const [datosEnvio, setDatosEnvio] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    metodoPago: 'contraentrega'
  })
  const [codigoCupon, setCodigoCupon] = useState('')
  const [cuponAplicado, setCuponAplicado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [codigoPedido, setCodigoPedido] = useState('')

  const categorias = ['Todos', 'accesorios', 'repuestos', 'equipos', 'servicios']

  // Cargar productos desde el API
  useEffect(() => {
    cargarProductos()
  }, [categoriaFiltro])

  const cargarProductos = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = `${API_URL}/productos.php?activo=1`
      if (categoriaFiltro !== 'Todos') {
        url += `&categoria=${categoriaFiltro}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setProductos(data.data)
      } else {
        setError('Error al cargar productos')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id)
    if (existe) {
      if (existe.cantidad < producto.stock) {
        setCarrito(carrito.map(item => 
          item.id === producto.id 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ))
      } else {
        alert('No hay más stock disponible')
      }
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }])
    }
  }

  const actualizarCantidad = (id, cambio) => {
    const item = carrito.find(i => i.id === id)
    const nuevaCantidad = item.cantidad + cambio
    
    if (nuevaCantidad > item.stock) {
      alert('No hay suficiente stock')
      return
    }
    
    setCarrito(carrito.map(item => 
      item.id === id 
        ? { ...item, cantidad: Math.max(1, nuevaCantidad) }
        : item
    ).filter(item => item.cantidad > 0))
  }

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id))
  }

  const calcularSubtotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0)
  }

  const calcularDescuento = () => {
    if (!cuponAplicado) return 0
    return cuponAplicado.descuento_aplicado || 0
  }

  const calcularTotal = () => {
    return calcularSubtotal() - calcularDescuento()
  }

  const validarCupon = async () => {
    if (!codigoCupon.trim()) {
      alert('Por favor ingresa un código de cupón')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/cupones.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo: codigoCupon,
          total: calcularSubtotal()
        })
      })

      const data = await response.json()

      if (data.success) {
        setCuponAplicado(data.data)
        alert(`¡Cupón aplicado! ${data.data.descripcion_descuento}`)
      } else {
        alert(data.message || 'Cupón no válido')
        setCuponAplicado(null)
      }
    } catch (err) {
      alert('Error al validar el cupón')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    return coincideBusqueda
  })

  const formatoPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio)
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    
    // Validaciones
    if (!datosEnvio.nombre || !datosEnvio.email || !datosEnvio.telefono || 
        !datosEnvio.direccion || !datosEnvio.ciudad) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/pedidos.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carrito: carrito,
          datosEnvio: datosEnvio,
          cupon: cuponAplicado ? cuponAplicado.codigo : null
        })
      })

      const data = await response.json()

      if (data.success) {
        setCodigoPedido(data.data.codigo)
        setPaso(4)
        setTimeout(() => {
          setCarrito([])
          setCuponAplicado(null)
          setCodigoCupon('')
          setDatosEnvio({
            nombre: '',
            telefono: '',
            email: '',
            direccion: '',
            ciudad: '',
            metodoPago: 'contraentrega'
          })
        }, 3000)
      } else {
        alert(data.message || 'Error al procesar el pedido')
      }
    } catch (err) {
      alert('Error al conectar con el servidor')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%)',
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
                <ShoppingCart size={48} color="white" />
              </div>
              <div>
                <h1 style={{
                  fontSize: '3rem',
                  fontWeight: '800',
                  color: 'white',
                  marginBottom: '0.5rem'
                }}>
                  Mega Web Store
                </h1>
                <p style={{
                  fontSize: '1.25rem',
                  color: 'rgba(255,255,255,0.95)',
                  marginBottom: 0
                }}>
                  Los mejores precios en tecnología • Envío gratis • Garantía oficial
                </p>
              </div>
            </div>
            <button
              onClick={() => setCarritoAbierto(!carritoAbierto)}
              style={{
                position: 'relative',
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <ShoppingCart size={22} />
              <span>Carrito</span>
              {carrito.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#5FC88F',
                  color: 'white',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  border: '3px solid white'
                }}>
                  {carrito.reduce((sum, item) => sum + item.cantidad, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Paso 1: Catálogo de productos */}
        {paso === 1 && (
          <>
            {/* Barra de búsqueda y filtros */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '2rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                flex: '1',
                minWidth: '300px',
                position: 'relative'
              }}>
                <Search 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }}
                />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 48px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#9b59b6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {categorias.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaFiltro(cat)}
                    style={{
                      padding: '14px 24px',
                      background: categoriaFiltro === cat 
                        ? 'linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%)'
                        : 'white',
                      color: categoriaFiltro === cat ? 'white' : '#4b5563',
                      border: categoriaFiltro === cat ? 'none' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textTransform: 'capitalize'
                    }}
                    onMouseEnter={(e) => {
                      if (categoriaFiltro !== cat) {
                        e.currentTarget.style.borderColor = '#9b59b6'
                        e.currentTarget.style.color = '#9b59b6'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (categoriaFiltro !== cat) {
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.color = '#4b5563'
                      }
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mensajes de estado */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9b59b6' }}>
                Cargando productos...
              </div>
            )}

            {error && (
              <div style={{ 
                textAlign: 'center', 
                padding: '1rem', 
                background: '#fee2e2',
                color: '#dc2626',
                borderRadius: '12px',
                marginBottom: '2rem'
              }}>
                {error}
              </div>
            )}

            {/* Grid de productos */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}>
              {productosFiltrados.map(producto => (
                <div
                  key={producto.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
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
                    width: '100%',
                    height: '200px',
                    background: producto.imagen_url 
                      ? `url(${producto.imagen_url}) center/cover`
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    {!producto.imagen_url && <Package size={60} />}
                  </div>
                  
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        background: '#f3f4f6',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'capitalize'
                      }}>
                        {producto.categoria}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={14} fill="#FCD34D" color="#FCD34D" />
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {producto.rating || '4.5'}
                        </span>
                      </div>
                    </div>

                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: '#1a202c',
                      marginBottom: '0.5rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {producto.nombre}
                    </h3>

                    <p style={{
                      fontSize: '0.875rem',
                      color: '#718096',
                      marginBottom: '1rem',
                      height: '40px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {producto.descripcion}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <p style={{
                          fontSize: '1.75rem',
                          fontWeight: '800',
                          color: '#9b59b6',
                          marginBottom: 0
                        }}>
                          {formatoPrecio(producto.precio)}
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: producto.stock > 10 ? '#10b981' : '#f59e0b',
                          marginBottom: 0
                        }}>
                          {producto.stock > 0 
                            ? `Stock: ${producto.stock}` 
                            : 'Agotado'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      disabled={producto.stock === 0}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: producto.stock > 0
                          ? 'linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%)'
                          : '#d1d5db',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        cursor: producto.stock > 0 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        if (producto.stock > 0) {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(155, 89, 182, 0.3)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (producto.stock > 0) {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }
                      }}
                    >
                      <Plus size={18} />
                      {producto.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {productosFiltrados.length === 0 && !loading && (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'white',
                borderRadius: '16px'
              }}>
                <Package size={64} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                <h3 style={{ color: '#4b5563', marginBottom: '0.5rem' }}>
                  No se encontraron productos
                </h3>
                <p style={{ color: '#9ca3af' }}>
                  Intenta con otra búsqueda o categoría
                </p>
              </div>
            )}
          </>
        )}

        {/* Paso 2: Carrito */}
        {paso === 2 && (
          <div>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '800', 
              color: '#1a202c', 
              marginBottom: '2rem' 
            }}>
              Tu Carrito
            </h2>

            {carrito.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '4rem 2rem',
                textAlign: 'center'
              }}>
                <ShoppingCart size={64} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                <h3 style={{ color: '#4b5563', marginBottom: '0.5rem' }}>
                  Tu carrito está vacío
                </h3>
                <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                  Agrega productos para continuar
                </p>
                <button
                  onClick={() => setPaso(1)}
                  style={{
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Volver a la Tienda
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                  {carrito.map(item => (
                    <div
                      key={item.id}
                      style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        display: 'flex',
                        gap: '1.5rem',
                        alignItems: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
                      }}
                    >
                      <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '12px',
                        background: item.imagen_url
                          ? `url(${item.imagen_url}) center/cover`
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        {!item.imagen_url && <Package size={40} />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          color: '#1a202c',
                          marginBottom: '0.25rem'
                        }}>
                          {item.nombre}
                        </h4>
                        <p style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: '#9b59b6',
                          marginBottom: 0
                        }}>
                          {formatoPrecio(item.precio)}
                        </p>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: '#f3f4f6',
                          borderRadius: '12px',
                          padding: '8px'
                        }}>
                          <button
                            onClick={() => actualizarCantidad(item.id, -1)}
                            style={{
                              width: '32px',
                              height: '32px',
                              background: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Minus size={16} />
                          </button>
                          <span style={{
                            minWidth: '32px',
                            textAlign: 'center',
                            fontWeight: '600'
                          }}>
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => actualizarCantidad(item.id, 1)}
                            disabled={item.cantidad >= item.stock}
                            style={{
                              width: '32px',
                              height: '32px',
                              background: item.cantidad < item.stock ? 'white' : '#e5e7eb',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: item.cantidad < item.stock ? 'pointer' : 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => eliminarDelCarrito(item.id)}
                          style={{
                            width: '40px',
                            height: '40px',
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sección de cupón */}
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
                }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '1rem'
                  }}>
                    ¿Tienes un cupón de descuento?
                  </h4>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Código de cupón"
                      value={codigoCupon}
                      onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                      disabled={cuponAplicado !== null}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={validarCupon}
                      disabled={loading || cuponAplicado !== null}
                      style={{
                        padding: '12px 24px',
                        background: cuponAplicado ? '#10b981' : '#9b59b6',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        cursor: cuponAplicado ? 'default' : 'pointer',
                        opacity: loading ? 0.6 : 1
                      }}
                    >
                      {cuponAplicado ? '✓ Aplicado' : 'Aplicar'}
                    </button>
                  </div>
                  {cuponAplicado && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '12px',
                      background: '#d1fae5',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ color: '#065f46', fontSize: '0.875rem' }}>
                        {cuponAplicado.descripcion_descuento}
                      </span>
                      <button
                        onClick={() => {
                          setCuponAplicado(null)
                          setCodigoCupon('')
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#065f46',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Resumen */}
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: '#1a202c',
                    marginBottom: '1.5rem'
                  }}>
                    Resumen del Pedido
                  </h3>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                      color: '#4b5563'
                    }}>
                      <span>Subtotal</span>
                      <span style={{ fontWeight: '600' }}>{formatoPrecio(calcularSubtotal())}</span>
                    </div>

                    {cuponAplicado && calcularDescuento() > 0 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem',
                        color: '#10b981'
                      }}>
                        <span>Descuento</span>
                        <span style={{ fontWeight: '600' }}>-{formatoPrecio(calcularDescuento())}</span>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                      color: '#4b5563'
                    }}>
                      <span>Envío</span>
                      <span style={{ fontWeight: '600', color: '#10b981' }}>
                        {cuponAplicado && cuponAplicado.tipo_descuento === 'envio_gratis' 
                          ? 'GRATIS' 
                          : formatoPrecio(0)}
                      </span>
                    </div>

                    <div style={{
                      borderTop: '2px solid #e5e7eb',
                      paddingTop: '1rem',
                      marginTop: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#1a202c'
                      }}>
                        Total
                      </span>
                      <span style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: '#9b59b6'
                      }}>
                        {formatoPrecio(calcularTotal())}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1.5rem'
                  }}>
                    <button
                      onClick={() => setPaso(1)}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#4b5563',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#9b59b6'
                        e.currentTarget.style.color = '#9b59b6'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.color = '#4b5563'
                      }}
                    >
                      <ArrowLeft size={20} /> Seguir Comprando
                    </button>

                    <button
                      onClick={() => setPaso(3)}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: 'linear-gradient(135deg, #5FC88F 0%, #4db87b 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(95, 200, 143, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      Continuar <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Paso 3: Checkout */}
        {paso === 3 && (
          <div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: '#1a202c',
              marginBottom: '2rem'
            }}>
              Datos de Envío
            </h2>

            <form onSubmit={handleCheckout}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={datosEnvio.nombre}
                      onChange={(e) => setDatosEnvio({...datosEnvio, nombre: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#9b59b6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={datosEnvio.telefono}
                      onChange={(e) => setDatosEnvio({...datosEnvio, telefono: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#9b59b6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={datosEnvio.email}
                      onChange={(e) => setDatosEnvio({...datosEnvio, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#9b59b6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Dirección *
                    </label>
                    <input
                      type="text"
                      required
                      value={datosEnvio.direccion}
                      onChange={(e) => setDatosEnvio({...datosEnvio, direccion: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#9b59b6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      required
                      value={datosEnvio.ciudad}
                      onChange={(e) => setDatosEnvio({...datosEnvio, ciudad: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#9b59b6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Método de Pago *
                    </label>
                    <select
                      value={datosEnvio.metodoPago}
                      onChange={(e) => setDatosEnvio({...datosEnvio, metodoPago: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        background: 'white'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#9b59b6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    >
                      <option value="contraentrega">Contra Entrega</option>
                      <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                      <option value="transferencia">Transferencia Bancaria</option>
                      <option value="efectivo">Efectivo en Tienda</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Resumen final */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '1rem'
                }}>
                  Resumen del Pedido
                </h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: '#9b59b6'
                }}>
                  <span>Total a Pagar:</span>
                  <span>{formatoPrecio(calcularTotal())}</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  onClick={() => setPaso(2)}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '14px',
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#4b5563',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4C8BF5'
                    e.currentTarget.style.color = '#4C8BF5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.color = '#4b5563'
                  }}
                >
                  <ArrowLeft size={20} /> Volver al Carrito
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '14px',
                    background: loading 
                      ? '#d1d5db' 
                      : 'linear-gradient(135deg, #5FC88F 0%, #4db87b 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(95, 200, 143, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  <CheckCircle size={20} /> 
                  {loading ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Paso 4: Confirmación */}
        {paso === 4 && (
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '3rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: '#5FC88F15',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem'
              }}>
                <CheckCircle size={60} color="#5FC88F" />
              </div>

              <h2 style={{
                color: '#1a202c',
                fontWeight: '800',
                marginBottom: '1rem',
                fontSize: '2rem'
              }}>
                ¡Pedido Confirmado!
              </h2>

              <p style={{
                color: '#718096',
                fontSize: '1.125rem',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                Hemos recibido tu pedido exitosamente. Te enviaremos un correo con los detalles
                y el código de seguimiento.
              </p>

              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Número de pedido
                </p>
                <h4 style={{ color: '#1a202c', fontWeight: '700', marginBottom: 0 }}>
                  {codigoPedido || `PED-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`}
                </h4>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h6 style={{ color: '#1a202c', fontWeight: '700', marginBottom: '1rem' }}>
                  Próximos pasos
                </h6>
                <ul style={{
                  textAlign: 'left',
                  margin: 0,
                  paddingLeft: '1.25rem',
                  color: '#4b5563',
                  fontSize: '0.9375rem',
                  lineHeight: '1.8'
                }}>
                  <li>Recibirás un email de confirmación en los próximos minutos</li>
                  <li>Te notificaremos cuando tu pedido sea despachado</li>
                  <li>Podrás rastrear tu pedido en tiempo real</li>
                  <li>Tiempo estimado de entrega: 2-5 días hábiles</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setPaso(1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(155, 89, 182, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Volver a la Tienda
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Carrito lateral */}
      {carritoAbierto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100%',
            maxWidth: '400px',
            height: '100vh',
            background: 'white',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a202c', marginBottom: 0 }}>
              Carrito ({carrito.reduce((sum, item) => sum + item.cantidad, 0)})
            </h3>
            <button
              onClick={() => setCarritoAbierto(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              <X size={24} color="#4b5563" />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {carrito.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <ShoppingCart size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                <p style={{ color: '#9ca3af' }}>Tu carrito está vacío</p>
              </div>
            ) : (
              carrito.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    background: item.imagen_url
                      ? `url(${item.imagen_url}) center/cover`
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    {!item.imagen_url && <Package size={24} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {item.nombre}
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#9b59b6', fontWeight: '700', marginBottom: '0.5rem' }}>
                      {formatoPrecio(item.precio)}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={() => actualizarCantidad(item.id, -1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{item.cantidad}</span>
                      <button
                        onClick={() => actualizarCantidad(item.id, 1)}
                        disabled={item.cantidad >= item.stock}
                        style={{
                          width: '24px',
                          height: '24px',
                          background: item.cantidad < item.stock ? '#f3f4f6' : '#e5e7eb',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: item.cantidad < item.stock ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        style={{
                          marginLeft: 'auto',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#dc2626'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {carrito.length > 0 && (
            <div style={{ 
              padding: '1.5rem', 
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                fontSize: '1.125rem',
                fontWeight: '700'
              }}>
                <span>Total:</span>
                <span style={{ color: '#9b59b6' }}>{formatoPrecio(calcularTotal())}</span>
              </div>
              <button
                onClick={() => {
                  setCarritoAbierto(false)
                  setPaso(2)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Ir al Carrito
              </button>
            </div>
          )}
        </div>
      )}

      {carritoAbierto && (
        <div
          onClick={() => setCarritoAbierto(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

export default TiendaVirtual