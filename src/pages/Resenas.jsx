import { useState, useEffect } from 'react'
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle, 
  Filter, 
  Edit3,
  TrendingUp,
  Award,
  Calendar,
  Package,
  Wrench,
  ShoppingBag,
  X
} from 'lucide-react'

// IMPORTANTE: Cambia esta URL por la ruta correcta de tu API
const API_URL = 'http://localhost/megacell_backend/resenas.php'

function Resenas() {
  const [filtroEstrellas, setFiltroEstrellas] = useState('todas')
  const [resenas, setResenas] = useState([])
  const [estadisticas, setEstadisticas] = useState({
    promedioGeneral: 0,
    totalResenas: 0,
    distribucion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    estrellas: 5,
    servicio: '',
    comentario: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState({ show: false, type: '', message: '' })
  
  useEffect(() => {
    cargarResenas()
  }, [filtroEstrellas])
  
  const cargarResenas = async () => {
    try {
      setLoading(true)
      const url = filtroEstrellas === 'todas' 
        ? API_URL
        : `${API_URL}?estrellas=${filtroEstrellas}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setResenas(data.data || [])
        setEstadisticas(data.estadisticas || {
          promedioGeneral: 0,
          totalResenas: 0,
          distribucion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        })
      } else {
        console.error('Error en respuesta:', data.message)
        setAlert({
          show: true,
          type: 'danger',
          message: data.message || 'Error al cargar reseñas'
        })
      }
    } catch (error) {
      console.error('Error al cargar reseñas:', error)
      setAlert({
        show: true,
        type: 'danger',
        message: 'Error de conexión. Verifica que el servidor esté corriendo.'
      })
      setResenas([])
      setEstadisticas({
        promedioGeneral: 0,
        totalResenas: 0,
        distribucion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (resenaId) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resena_id: resenaId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResenas(resenas.map(r => 
          r.id === resenaId 
            ? { ...r, total_likes: data.data.total_likes }
            : r
        ))
      }
    } catch (error) {
      console.error('Error al actualizar like:', error)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.servicio.trim()) newErrors.servicio = 'Selecciona un servicio'
    if (!formData.comentario.trim()) {
      newErrors.comentario = 'El comentario es requerido'
    } else if (formData.comentario.trim().length < 10) {
      newErrors.comentario = 'El comentario debe tener al menos 10 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitResena = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Por favor corrige los errores en el formulario'
      })
      return
    }
    
    setSubmitting(true)
    setAlert({ show: false, type: '', message: '' })
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAlert({
          show: true,
          type: 'success',
          message: data.message
        })
        setFormData({
          nombre: '',
          email: '',
          estrellas: 5,
          servicio: '',
          comentario: ''
        })
        setShowModal(false)
        cargarResenas()
        
        setTimeout(() => {
          setAlert({ show: false, type: '', message: '' })
        }, 5000)
      } else {
        setAlert({
          show: true,
          type: 'danger',
          message: data.message || 'Error al enviar reseña'
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setAlert({
        show: true,
        type: 'danger',
        message: 'Error de conexión. Por favor intenta de nuevo.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const calcularPorcentaje = (cantidad) => {
    return estadisticas.totalResenas > 0 
      ? (cantidad / estadisticas.totalResenas) * 100 
      : 0
  }

  const renderEstrellas = (cantidad) => {
    return Array(cantidad).fill(0).map((_, i) => (
      <Star key={i} size={18} fill="#fbbf24" color="#fbbf24" style={{ display: 'inline' }} />
    ))
  }

  const renderEstrellasInteractivas = (value, onChange) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={32}
        fill={i < value ? "#fbbf24" : "none"}
        color="#fbbf24"
        style={{ cursor: 'pointer', marginRight: '0.25rem' }}
        onClick={() => onChange(i + 1)}
      />
    ))
  }

  const getServicioIcon = (servicio) => {
    if (servicio.toLowerCase().includes('compra')) return ShoppingBag
    if (servicio.toLowerCase().includes('cambio') || servicio.toLowerCase().includes('reparación')) return Wrench
    return Package
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        padding: '3rem 1rem',
        boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Award size={40} color="#1a202c" />
            Reseñas de Clientes
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#78350f',
            marginBottom: 0
          }}>
            Lo que nuestros clientes dicen sobre nosotros
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        {/* Alerta */}
        {alert.show && (
          <div style={{
            background: alert.type === 'success' ? '#d4edda' : '#f8d7da',
            border: `1px solid ${alert.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            color: alert.type === 'success' ? '#155724' : '#721c24',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {alert.type === 'success' && <CheckCircle size={20} />}
            <span style={{ flex: 1 }}>{alert.message}</span>
            <button
              onClick={() => setAlert({ show: false, type: '', message: '' })}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? '350px 1fr' : '1fr',
          gap: '2rem'
        }}>
          {/* Sidebar - Estadísticas */}
          <div style={{
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '2rem',
            height: 'fit-content',
            position: window.innerWidth > 768 ? 'sticky' : 'relative',
            top: '2rem',
            background: 'white'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{
                fontSize: '4rem',
                fontWeight: '700',
                color: '#fbbf24',
                marginBottom: '0.5rem'
              }}>
                {estadisticas.promedioGeneral.toFixed(1)}
              </h1>
              <div style={{ marginBottom: '0.75rem' }}>
                {renderEstrellas(Math.round(estadisticas.promedioGeneral))}
              </div>
              <p style={{
                color: '#718096',
                marginBottom: 0,
                fontSize: '0.9375rem'
              }}>
                Basado en {estadisticas.totalResenas} reseñas
              </p>
            </div>

            <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />

            <h6 style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <TrendingUp size={18} color="#4C8BF5" />
              Distribución de Calificaciones
            </h6>
            
            {[5, 4, 3, 2, 1].map(estrella => (
              <div key={estrella} style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    marginRight: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1a202c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    minWidth: '60px'
                  }}>
                    {estrella} <Star size={14} fill="#fbbf24" color="#fbbf24" />
                  </span>
                  <div style={{
                    flex: 1,
                    height: '10px',
                    borderRadius: '50px',
                    background: '#e2e8f0',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${calcularPorcentaje(estadisticas.distribucion[estrella])}%`,
                      height: '100%',
                      borderRadius: '50px',
                      background: estrella >= 4 ? '#5FC88F' : estrella === 3 ? '#fbbf24' : '#FF5C7C',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span style={{
                    marginLeft: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#718096',
                    fontWeight: '600',
                    minWidth: '30px',
                    textAlign: 'right'
                  }}>
                    {estadisticas.distribucion[estrella]}
                  </span>
                </div>
              </div>
            ))}

            <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />

            <h6 style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Filter size={18} color="#4C8BF5" />
              Filtrar por Calificación
            </h6>
            <select 
              value={filtroEstrellas}
              onChange={(e) => setFiltroEstrellas(e.target.value)}
              style={{
                width: '100%',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                fontWeight: '500',
                color: '#1a202c',
                outline: 'none'
              }}
            >
              <option value="todas">Todas las reseñas</option>
              <option value="5">5 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="2">2 estrellas</option>
              <option value="1">1 estrella</option>
            </select>

            <button 
              onClick={() => setShowModal(true)}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                background: 'linear-gradient(135deg, #4C8BF5 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.875rem 1.5rem',
                fontWeight: '600',
                fontSize: '1rem',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(76, 139, 245, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(76, 139, 245, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 139, 245, 0.3)';
              }}
            >
              <Edit3 size={20} /> Escribir una Reseña
            </button>
          </div>

          {/* Listado de Reseñas */}
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '0.5rem'
              }}>
                Todas las Reseñas ({resenas.length})
              </h4>
              <p style={{
                color: '#718096',
                fontSize: '0.9375rem',
                marginBottom: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle size={16} color="#5FC88F" />
                Reseñas verificadas de clientes reales
              </p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  border: '5px solid #e2e8f0',
                  borderTop: '5px solid #4C8BF5',
                  borderRadius: '50%',
                  margin: '0 auto',
                  animation: 'spin 1s linear infinite'
                }} />
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                <p style={{ marginTop: '1rem', color: '#718096' }}>Cargando reseñas...</p>
              </div>
            ) : resenas.length === 0 ? (
              <div style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                textAlign: 'center',
                padding: '3rem 2rem',
                background: 'white'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#f8f9fa',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <Star size={40} color="#cbd5e0" />
                </div>
                <h5 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '0.5rem'
                }}>
                  No hay reseñas con esta calificación
                </h5>
                <p style={{
                  color: '#718096',
                  fontSize: '0.9375rem',
                  marginBottom: 0
                }}>
                  Intenta con otro filtro
                </p>
              </div>
            ) : (
              resenas.map(resena => {
                const IconServicio = getServicioIcon(resena.servicio)

                return (
                  <div key={resena.id} style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    marginBottom: '1.5rem',
                    padding: '2rem',
                    background: 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '1.5rem',
                      flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
                    }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #4C8BF5 0%, #8b5cf6 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(76, 139, 245, 0.3)',
                        border: '3px solid white',
                        flexShrink: 0
                      }}>
                        <span style={{
                          fontSize: '2rem',
                          fontWeight: '700',
                          color: 'white'
                        }}>
                          {resena.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '1rem',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}>
                          <div>
                            <h6 style={{
                              marginBottom: '0.5rem',
                              fontSize: '1.125rem',
                              fontWeight: '700',
                              color: '#1a202c',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              flexWrap: 'wrap'
                            }}>
                              {resena.nombre}
                              {resena.verificado && (
                                <span style={{
                                  background: '#5FC88F',
                                  padding: '0.35rem 0.75rem',
                                  fontSize: '0.8125rem',
                                  fontWeight: '600',
                                  borderRadius: '50px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  color: 'white'
                                }}>
                                  <CheckCircle size={14} /> Verificado
                                </span>
                              )}
                            </h6>
                            <small style={{
                              color: '#718096',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <Calendar size={14} />
                              {resena.fecha}
                            </small>
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '0.25rem'
                          }}>
                            {renderEstrellas(resena.estrellas)}
                          </div>
                        </div>
                        
                        <div style={{
                          background: '#f8f9fa',
                          padding: '0.75rem 1rem',
                          borderRadius: '12px',
                          marginBottom: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <IconServicio size={16} color="#4C8BF5" />
                          <span style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#4C8BF5'
                          }}>
                            {resena.servicio}
                          </span>
                        </div>
                        
                        <p style={{
                          marginBottom: '1.5rem',
                          fontSize: '0.9375rem',
                          color: '#1a202c',
                          lineHeight: '1.6'
                        }}>
                          {resena.comentario}
                        </p>

                        {resena.respuesta && (
                          <div style={{
                            background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
                            padding: '1.25rem',
                            borderRadius: '12px',
                            borderLeft: '4px solid #4C8BF5',
                            marginBottom: '1rem'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'start',
                              gap: '0.75rem'
                            }}>
                              <MessageSquare size={20} color="#4C8BF5" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <div>
                                <strong style={{
                                  color: '#4C8BF5',
                                  fontSize: '0.9375rem',
                                  fontWeight: '700'
                                }}>
                                  Respuesta de MegaCell:
                                </strong>
                                <p style={{
                                  marginBottom: 0,
                                  marginTop: '0.5rem',
                                  fontSize: '0.9375rem',
                                  color: '#1a202c',
                                  lineHeight: '1.6'
                                }}>
                                  {resena.respuesta}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div style={{
                          display: 'flex',
                          gap: '1.5rem',
                          marginTop: '1rem'
                        }}>
                          <button 
                            onClick={() => handleLike(resena.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: '#718096',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              cursor: 'pointer',
                              transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#4C8BF5'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#718096'}
                          >
                            <ThumbsUp size={16} /> Útil ({resena.total_likes})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal para escribir reseña */}
      {showModal && (
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
        }}
        onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, #4C8BF5 0%, #8b5cf6 100%)',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h5 style={{
                marginBottom: 0,
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Edit3 size={24} />
                Escribir Reseña
              </h5>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'white'
                }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem', display: 'block' }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: `2px solid ${errors.nombre ? '#dc3545' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.nombre && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '0.25rem' }}>
                    {errors.nombre}
                  </small>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem', display: 'block' }}>
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem', display: 'block' }}>
                  Calificación *
                </label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {renderEstrellasInteractivas(formData.estrellas, (value) => 
                    setFormData({...formData, estrellas: value})
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem', display: 'block' }}>
                  Servicio *
                </label>
                <select
                  value={formData.servicio}
                  onChange={(e) => setFormData({...formData, servicio: e.target.value})}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: `2px solid ${errors.servicio ? '#dc3545' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Selecciona un servicio</option>
                  <option value="Compra de producto">Compra de producto</option>
                  <option value="Cambio de pantalla">Cambio de pantalla</option>
                  <option value="Cambio de batería">Cambio de batería</option>
                  <option value="Reparación por agua">Reparación por agua</option>
                  <option value="Cambio de puerto de carga">Cambio de puerto de carga</option>
                  <option value="Otro servicio">Otro servicio</option>
                </select>
                {errors.servicio && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '0.25rem' }}>
                    {errors.servicio}
                  </small>
                )}
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem', display: 'block' }}>
                  Comentario *
                </label>
                <textarea
                  rows={5}
                  value={formData.comentario}
                  onChange={(e) => setFormData({...formData, comentario: e.target.value})}
                  disabled={submitting}
                  placeholder="Cuéntanos sobre tu experiencia..."
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: `2px solid ${errors.comentario ? '#dc3545' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.comentario && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '0.25rem' }}>
                    {errors.comentario}
                  </small>
                )}
              </div>

              <button 
                onClick={handleSubmitResena}
                disabled={submitting}
                style={{
                  width: '100%',
                  background: submitting ? '#cbd5e0' : 'linear-gradient(135deg, #4C8BF5 0%, #8b5cf6 100%)',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '12px',
                  fontSize: '1.0625rem',
                  fontWeight: '600',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: submitting ? 'none' : '0 4px 12px rgba(76, 139, 245, 0.3)',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Enviando...' : 'Publicar Reseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Resenas