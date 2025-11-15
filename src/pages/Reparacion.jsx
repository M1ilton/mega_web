import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Smartphone, Battery, Plug, Camera, 
  Circle, Droplet, Settings, Wrench, CheckCircle,
  Clock, Shield, UserCheck, Package,
  ArrowRight, ArrowLeft, Phone, Mail,
  Award, AlertCircle, Star, Loader
} from 'lucide-react'
import { Alert } from 'react-bootstrap'

const API_URL = 'http://localhost/megacell_backend'

function Reparacion() {
  const navigate = useNavigate()
  const [paso, setPaso] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    tipoDano: '',
    descripcion: '',
    nombre: '',
    telefono: '',
    email: ''
  })
  const [cotizacion, setCotizacion] = useState(null)
  const [usuarioLogueado, setUsuarioLogueado] = useState(null)

  const marcas = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Motorola', 'LG', 'Otra']
  
  const tiposDano = [
    { 
      id: 'pantalla', 
      nombre: 'Pantalla Rota', 
      icono: Smartphone, 
      precio: 150000, 
      tiempo: '2-3 horas',
      descripcion: 'Reemplazo completo de display',
      color: '#e74c3c'
    },
    { 
      id: 'bateria', 
      nombre: 'Batería Agotada', 
      icono: Battery, 
      precio: 80000, 
      tiempo: '1 hora',
      descripcion: 'Cambio de batería original',
      color: '#2ecc71'
    },
    { 
      id: 'puerto', 
      nombre: 'Puerto de Carga', 
      icono: Plug, 
      precio: 60000, 
      tiempo: '1-2 horas',
      descripcion: 'Reparación de puerto USB',
      color: '#3498db'
    },
    { 
      id: 'camara', 
      nombre: 'Cámara Dañada', 
      icono: Camera, 
      precio: 120000, 
      tiempo: '2-3 horas',
      descripcion: 'Cambio de módulo de cámara',
      color: '#9b59b6'
    },
    { 
      id: 'boton', 
      nombre: 'Botones', 
      icono: Circle, 
      precio: 45000, 
      tiempo: '1 hora',
      descripcion: 'Reparación de botones',
      color: '#f39c12'
    },
    { 
      id: 'agua', 
      nombre: 'Daño por Agua', 
      icono: Droplet, 
      precio: 180000, 
      tiempo: '3-5 horas',
      descripcion: 'Limpieza profunda y recuperación',
      color: '#1abc9c'
    },
    { 
      id: 'software', 
      nombre: 'Problema de Software', 
      icono: Settings, 
      precio: 40000, 
      tiempo: '30 min',
      descripcion: 'Reinstalación y configuración',
      color: '#34495e'
    },
    { 
      id: 'otro', 
      nombre: 'Otro Daño', 
      icono: Wrench, 
      precio: 0, 
      tiempo: 'Por definir',
      descripcion: 'Requiere diagnóstico previo',
      color: '#95a5a6'
    }
  ]

  // Verificar si hay usuario logueado
  useEffect(() => {
    verificarSesion()
  }, [])

  const verificarSesion = async () => {
    try {
      const response = await fetch(`${API_URL}/check_session.php`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success && data.authenticated) {
        setUsuarioLogueado(data.usuario)
        setFormData(prev => ({
          ...prev,
          nombre: `${data.usuario.nombres} ${data.usuario.apellidos}`,
          telefono: data.usuario.telefono || '',
          email: data.usuario.email || ''
        }))
      }
    } catch (err) {
      console.log('No hay sesión activa')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError(null)
  }

  const validarPaso1 = () => {
    if (!formData.marca) {
      setError('Por favor selecciona una marca')
      return false
    }
    if (!formData.modelo || formData.modelo.trim().length < 2) {
      setError('Por favor ingresa un modelo válido')
      return false
    }
    return true
  }

  const validarPaso2 = () => {
    if (!formData.tipoDano) {
      setError('Por favor selecciona el tipo de daño')
      return false
    }
    return true
  }

  const validarPaso3 = () => {
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      setError('Por favor ingresa tu nombre completo')
      return false
    }
    if (!formData.telefono || formData.telefono.length < 10) {
      setError('Por favor ingresa un teléfono válido (mínimo 10 dígitos)')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido')
      return false
    }
    return true
  }

  const calcularCotizacion = () => {
    if (!validarPaso2()) return
    
    const dano = tiposDano.find(d => d.id === formData.tipoDano)
    if (dano) {
      setCotizacion({
        ...dano,
        descuento: 0.1,
        precioFinal: dano.precio > 0 ? dano.precio * 0.9 : 0
      })
      setPaso(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const enviarSolicitud = async () => {
    if (!validarPaso3()) return

    setLoading(true)
    setError(null)

    try {
      const dataToSend = {
        equipo: `${formData.marca} ${formData.modelo}`,
        servicio: cotizacion.nombre,
        descripcion: formData.descripcion || cotizacion.descripcion,
        precio: cotizacion.precioFinal,
        tiempo_estimado: cotizacion.tiempo,
        nombre_cliente: formData.nombre,
        telefono_cliente: formData.telefono,
        email_cliente: formData.email,
        usuario_id: usuarioLogueado ? usuarioLogueado.id : null
      }

      const response = await fetch(`${API_URL}/reparaciones.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          if (usuarioLogueado) {
            navigate('/tienda')
          } else {
            navigate('/')
          }
        }, 3000)
      } else {
        setError(data.message || 'Error al enviar la solicitud')
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta nuevamente.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatoPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio)
  }

  // Mostrar mensaje de éxito
  if (success) {
    return (
      <div style={{ background: '#f8f9fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          maxWidth: '600px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
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
          <h2 style={{ color: '#1a202c', fontWeight: '700', marginBottom: '1rem' }}>
            ¡Solicitud Enviada Exitosamente!
          </h2>
          <p style={{ color: '#718096', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: '1.7' }}>
            Hemos recibido tu solicitud de reparación. Nuestro equipo se pondrá en contacto contigo 
            en las próximas horas para confirmar los detalles y agendar tu cita.
          </p>
          <div style={{
            background: '#f0f9ff',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <p style={{ margin: 0, color: '#1e40af', fontSize: '0.9375rem' }}>
              <strong>Código de Referencia:</strong> REP-{Date.now().toString().slice(-6)}
            </p>
          </div>
          <p style={{ color: '#718096', fontSize: '0.9375rem' }}>
            Redirigiendo en 3 segundos...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
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
              <Wrench size={48} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: '800',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                Reparación de Celulares
              </h1>
              <p style={{
                fontSize: '1.25rem',
                color: 'rgba(255,255,255,0.95)',
                marginBottom: 0
              }}>
                Diagnóstico gratuito • Reparación express • Garantía de 30 días
              </p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Mensajes de error */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} style={{ marginBottom: '2rem' }}>
            {error}
          </Alert>
        )}

        {/* Barra de Progreso */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e2e8f0',
            borderRadius: '50px',
            overflow: 'hidden',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: `${(paso / 3) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #FFA726 0%, #FB8C00 100%)',
              transition: 'width 0.5s ease'
            }}></div>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            gap: '1rem', 
            flexWrap: 'wrap' 
          }}>
            {[
              { num: 1, texto: 'Información del Equipo' },
              { num: 2, texto: 'Tipo de Daño' },
              { num: 3, texto: 'Cotización y Contacto' }
            ].map((item) => (
              <span 
                key={item.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: paso >= item.num ? '#1a202c' : '#718096',
                  fontWeight: paso >= item.num ? '600' : '400',
                  fontSize: '0.9375rem'
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: paso >= item.num ? '#FFA726' : '#cbd5e0',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '700'
                }}>
                  {item.num}
                </span>
                {item.texto}
              </span>
            ))}
          </div>
        </div>

        {/* PASO 1 */}
        {paso === 1 && (
          <div style={{
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            background: 'white',
            padding: '2.5rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: '#4C8BF515',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Smartphone size={28} color="#4C8BF5" />
              </div>
              <h4 style={{ margin: 0, fontWeight: '700', color: '#1a202c', fontSize: '1.5rem' }}>
                Información del Equipo
              </h4>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                fontWeight: '600', 
                color: '#1a202c', 
                display: 'block', 
                marginBottom: '0.5rem',
                fontSize: '0.9375rem'
              }}>
                Marca del Celular *
              </label>
              <select 
                name="marca" 
                value={formData.marca}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4C8BF5'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              >
                <option value="">Selecciona una marca</option>
                {marcas.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                fontWeight: '600', 
                color: '#1a202c', 
                display: 'block', 
                marginBottom: '0.5rem',
                fontSize: '0.9375rem'
              }}>
                Modelo *
              </label>
              <input
                type="text"
                name="modelo"
                placeholder="Ej: iPhone 13, Galaxy S21, Redmi Note 10"
                value={formData.modelo}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4C8BF5'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <small style={{ color: '#718096', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
                Ingresa el modelo específico de tu celular
              </small>
            </div>

            <button 
              onClick={() => {
                if (validarPaso1()) {
                  setPaso(2)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
              disabled={!formData.marca || !formData.modelo}
              style={{
                width: '100%',
                padding: '14px',
                background: formData.marca && formData.modelo 
                  ? 'linear-gradient(135deg, #4C8BF5 0%, #5FC88F 100%)' 
                  : '#cbd5e0',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                cursor: formData.marca && formData.modelo ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (formData.marca && formData.modelo) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(76, 139, 245, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (formData.marca && formData.modelo) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              Continuar <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* PASO 2 */}
        {paso === 2 && (
          <div>
            <div style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              background: 'white',
              padding: '2.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#FFA72615',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertCircle size={28} color="#FFA726" />
                </div>
                <h4 style={{ margin: 0, fontWeight: '700', color: '#1a202c', fontSize: '1.5rem' }}>
                  ¿Qué le sucede a tu celular?
                </h4>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {tiposDano.map((dano) => {
                  const IconComponent = dano.icono
                  const isSelected = formData.tipoDano === dano.id
                  return (
                    <div
                      key={dano.id}
                      onClick={() => setFormData({ ...formData, tipoDano: dano.id })}
                      style={{
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: isSelected ? `3px solid ${dano.color}` : '2px solid #e2e8f0',
                        background: isSelected ? `${dano.color}08` : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(-4px)'
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }
                      }}
                    >
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: dano.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CheckCircle size={16} color="white" />
                        </div>
                      )}
                      
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: `${dano.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}>
                        <IconComponent size={24} color={dano.color} />
                      </div>
                      
                      <h6 style={{ 
                        fontWeight: '700', 
                        color: '#1a202c', 
                        marginBottom: '0.5rem',
                        fontSize: '1rem'
                      }}>
                        {dano.nombre}
                      </h6>
                      
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#718096', 
                        marginBottom: '0.75rem',
                        lineHeight: '1.5'
                      }}>
                        {dano.descripcion}
                      </p>
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #e2e8f0'
                      }}>
                        <span style={{ 
                          fontWeight: '700', 
                          color: dano.color,
                          fontSize: '1.125rem'
                        }}>
                          {dano.precio > 0 ? formatoPrecio(dano.precio) : 'Consultar'}
                        </span>
                        <span style={{ 
                          fontSize: '0.8125rem', 
                          color: '#718096',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Clock size={14} />
                          {dano.tiempo}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  fontWeight: '600', 
                  color: '#1a202c', 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontSize: '0.9375rem'
                }}>
                  Descripción adicional (opcional)
                </label>
                <textarea
                  name="descripcion"
                  placeholder="Cuéntanos más detalles sobre el problema..."
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4C8BF5'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => {
                    setPaso(1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  style={{
                    flex: '0 0 auto',
                    padding: '14px 24px',
                    background: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#4b5563',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
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
                  <ArrowLeft size={20} /> Atrás
                </button>
                
                <button 
                  onClick={calcularCotizacion}
                  disabled={!formData.tipoDano}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: formData.tipoDano 
                      ? 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)' 
                      : '#cbd5e0',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    cursor: formData.tipoDano ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.tipoDano) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 167, 38, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.tipoDano) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  Ver Cotización <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {paso === 3 && cotizacion && (
          <div>
            {/* Cotización */}
            <div style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              background: 'white',
              padding: '2.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: '#5FC88F15',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Award size={28} color="#5FC88F" />
                  </div>
                  <h4 style={{ margin: 0, fontWeight: '700', color: '#1a202c', fontSize: '1.5rem' }}>
                    Tu Cotización
                  </h4>
                </div>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: '#5FC88F15',
                  color: '#5FC88F',
                  borderRadius: '50px',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Star size={16} fill="#5FC88F" />
                  10% de descuento aplicado
                </span>
              </div>

              <div style={{
                background: `${cotizacion.color}08`,
                border: `2px solid ${cotizacion.color}30`,
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <div>
                    <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Equipo
                    </p>
                    <h5 style={{ color: '#1a202c', fontWeight: '700', fontSize: '1.25rem', marginBottom: 0 }}>
                      {formData.marca} {formData.modelo}
                    </h5>
                  </div>
                  <div>
                    <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Servicio
                    </p>
                    <h5 style={{ color: '#1a202c', fontWeight: '700', fontSize: '1.25rem', marginBottom: 0 }}>
                      {cotizacion.nombre}
                    </h5>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '1rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <Clock size={24} color={cotizacion.color} style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>
                      Tiempo estimado
                    </p>
                    <strong style={{ color: '#1a202c', fontSize: '1rem' }}>{cotizacion.tiempo}</strong>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Shield size={24} color={cotizacion.color} style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>
                      Garantía
                    </p>
                    <strong style={{ color: '#1a202c', fontSize: '1rem' }}>30 días</strong>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <UserCheck size={24} color={cotizacion.color} style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>
                      Técnicos
                    </p>
                    <strong style={{ color: '#1a202c', fontSize: '1rem' }}>Certificados</strong>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Package size={24} color={cotizacion.color} style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>
                      Repuestos
                    </p>
                    <strong style={{ color: '#1a202c', fontSize: '1rem' }}>Originales</strong>
                  </div>
                </div>
              </div>

              {cotizacion.precio > 0 && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
                  borderRadius: '12px',
                  padding: '2rem',
                  color: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>Precio original:</span>
                    <span style={{ 
                      fontSize: '1.125rem', 
                      textDecoration: 'line-through',
                      opacity: 0.7
                    }}>
                      {formatoPrecio(cotizacion.precio)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>Descuento (10%):</span>
                    <span style={{ fontSize: '1.125rem', color: '#5FC88F' }}>
                      -{formatoPrecio(cotizacion.precio * 0.1)}
                    </span>
                  </div>
                  <div style={{ 
                    borderTop: '2px solid rgba(255,255,255,0.2)',
                    paddingTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>Total a pagar:</span>
                    <span style={{ fontSize: '2rem', fontWeight: '800', color: '#5FC88F' }}>
                      {formatoPrecio(cotizacion.precioFinal)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Formulario de Contacto */}
            <div style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              background: 'white',
              padding: '2.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#4C8BF515',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserCheck size={28} color="#4C8BF5" />
                </div>
                <h4 style={{ margin: 0, fontWeight: '700', color: '#1a202c', fontSize: '1.5rem' }}>
                  Datos de Contacto
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ 
                    fontWeight: '600', 
                    color: '#1a202c', 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontSize: '0.9375rem'
                  }}>
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4C8BF5'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div>
                  <label style={{ 
                    fontWeight: '600', 
                    color: '#1a202c', 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontSize: '0.9375rem'
                  }}>
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="300 123 4567"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4C8BF5'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ 
                    fontWeight: '600', 
                    color: '#1a202c', 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontSize: '0.9375rem'
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4C8BF5'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>

              <div style={{
                background: '#f0f9ff',
                border: '2px solid #bfdbfe',
                borderRadius: '12px',
                padding: '1.5rem',
                marginTop: '2rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <AlertCircle size={24} color="#4C8BF5" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                  <div>
                    <h6 style={{ color: '#1e40af', fontWeight: '700', marginBottom: '0.5rem', fontSize: '1rem' }}>
                      Próximos pasos
                    </h6>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: '1.25rem', 
                      color: '#1e40af',
                      fontSize: '0.9375rem',
                      lineHeight: '1.7'
                    }}>
                      <li>Nos comunicaremos contigo en las próximas horas</li>
                      <li>Confirmaremos la disponibilidad y agenda tu cita</li>
                      <li>Recibes tu equipo reparado con garantía de 30 días</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => {
                    setPaso(2)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={loading}
                  style={{
                    flex: '0 0 auto',
                    padding: '14px 24px',
                    background: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#4b5563',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: loading ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.borderColor = '#4C8BF5'
                      e.currentTarget.style.color = '#4C8BF5'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.color = '#4b5563'
                    }
                  }}
                >
                  <ArrowLeft size={20} /> Modificar
                </button>
                
                <button 
                  onClick={enviarSolicitud}
                  disabled={!formData.nombre || !formData.telefono || !formData.email || loading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: formData.nombre && formData.telefono && formData.email && !loading
                      ? 'linear-gradient(135deg, #5FC88F 0%, #4db87b 100%)' 
                      : '#cbd5e0',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    cursor: formData.nombre && formData.telefono && formData.email && !loading ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.nombre && formData.telefono && formData.email && !loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(95, 200, 143, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.nombre && formData.telefono && formData.email && !loading) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} /> Confirmar Solicitud
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Contacto Directo */}
            <div style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              padding: '2.5rem',
              textAlign: 'center'
            }}>
              <h5 style={{ 
                color: '#1a202c', 
                fontWeight: '700', 
                marginBottom: '1rem',
                fontSize: '1.25rem'
              }}>
                ¿Prefieres contactarnos directamente?
              </h5>
              <p style={{ color: '#718096', marginBottom: '1.5rem', fontSize: '1rem' }}>
                Estamos disponibles para atenderte de inmediato
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a 
                  href="https://wa.me/573001234567" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <button style={{
                    padding: '14px 32px',
                    background: '#5FC88F',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#4db87b'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(95, 200, 143, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#5FC88F'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}>
                    <Phone size={20} />
                    WhatsApp: 300 123 4567
                  </button>
                </a>
                <a 
                  href="mailto:soporte@megacell.com"
                  style={{ textDecoration: 'none' }}
                >
                  <button style={{
                    padding: '14px 32px',
                    background: 'white',
                    border: '2px solid #4C8BF5',
                    color: '#4C8BF5',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#4C8BF5'
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.color = '#4C8BF5'
                  }}>
                    <Mail size={20} />
                    soporte@megacell.com
                  </button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Beneficios */}
        {paso === 1 && (
          <div style={{ marginTop: '3rem' }}>
            <h4 style={{ 
              textAlign: 'center', 
              marginBottom: '2rem',
              fontWeight: '700',
              color: '#1a202c',
              fontSize: '1.75rem'
            }}>
              ¿Por qué elegirnos?
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {[
                {
                  icon: Shield,
                  color: '#5FC88F',
                  titulo: 'Garantía de 30 días',
                  desc: 'Todos nuestros servicios incluyen garantía certificada'
                },
                {
                  icon: Clock,
                  color: '#4C8BF5',
                  titulo: 'Reparación Express',
                  desc: 'La mayoría de reparaciones en el mismo día'
                },
                {
                  icon: Award,
                  color: '#FFA726',
                  titulo: 'Técnicos Certificados',
                  desc: 'Personal capacitado y con años de experiencia'
                },
                {
                  icon: Package,
                  color: '#9b59b6',
                  titulo: 'Repuestos Originales',
                  desc: 'Solo utilizamos piezas de la más alta calidad'
                }
              ].map((item, index) => {
                const IconComponent = item.icon
                return (
                  <div
                    key={index}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '2rem',
                      textAlign: 'center',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                      transition: 'all 0.3s ease'
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
                      width: '80px',
                      height: '80px',
                      background: `${item.color}15`,
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem'
                    }}>
                      <IconComponent size={40} color={item.color} />
                    </div>
                    <h5 style={{ 
                      fontWeight: '700', 
                      color: '#1a202c', 
                      marginBottom: '0.75rem',
                      fontSize: '1.125rem'
                    }}>
                      {item.titulo}
                    </h5>
                    <p style={{ 
                      color: '#718096', 
                      marginBottom: 0,
                      fontSize: '0.9375rem',
                      lineHeight: '1.6'
                    }}>
                      {item.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default Reparacion