import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Facebook, Instagram, Twitter, CheckCircle, X } from 'lucide-react'

function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, type: '', message: '' })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido'
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    } else if (formData.telefono.length < 10) {
      newErrors.telefono = 'Teléfono debe tener al menos 10 dígitos'
    }
    if (!formData.asunto) newErrors.asunto = 'Selecciona un asunto'
    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es requerido'
    } else if (formData.mensaje.trim().length < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Por favor corrige los errores en el formulario'
      })
      return
    }
    
    setLoading(true)
    setAlert({ show: false, type: '', message: '' })
    
    try {
      const response = await fetch('http://localhost/megacell_backend/contacto.php', {
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
          telefono: '',
          asunto: '',
          mensaje: ''
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setAlert({
          show: true,
          type: 'danger',
          message: data.message || 'Error al enviar el mensaje'
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
      setLoading(false)
    }
  }

  const handleWhatsApp = () => {
    const phone = '573001234567'
    const message = encodeURIComponent('Hola, me gustaría obtener más información sobre sus servicios.')
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  const handleCall = () => {
    window.location.href = 'tel:+573001234567'
  }

  const handleGoogleMaps = () => {
    window.open('https://www.google.com/maps/search/?api=1&query=Calle+25+5-42+Quibdó+Chocó', '_blank')
  }

  const handleSocialMedia = (platform) => {
    const urls = {
      facebook: 'https://facebook.com/megacell',
      instagram: 'https://instagram.com/megacell',
      twitter: 'https://twitter.com/megacell'
    }
    window.open(urls[platform], '_blank')
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
        minHeight: '45vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '3rem 1rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            marginBottom: '1.5rem'
          }}>
            <Phone size={40} color="white" />
          </div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: 'white',
            marginBottom: '1rem',
            textShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            Contáctanos
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255,255,255,0.95)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Estamos aquí para ayudarte con cualquier consulta
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 1rem' }}>
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
            gap: '0.75rem',
            position: 'relative'
          }}>
            {alert.type === 'success' && <CheckCircle size={20} />}
            <span style={{ flex: 1 }}>{alert.message}</span>
            <button
              onClick={() => setAlert({ show: false, type: '', message: '' })}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Cards de información */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '5rem'
        }}>
          {/* Ubicación */}
          <div style={{
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            padding: '2.5rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onClick={handleGoogleMaps}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              background: '#4C8BF515',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <MapPin size={32} color="#4C8BF5" />
            </div>
            <h5 style={{
              fontSize: '1.375rem',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '1.5rem'
            }}>
              Nuestra Ubicación
            </h5>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem' }}>
                Dirección:
              </p>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: 0 }}>
                Calle 25 #5-42<br />
                Barrio Centro<br />
                Quibdó, Chocó<br />
                Colombia
              </p>
            </div>
          </div>

          {/* Comunicación */}
          <div style={{
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            padding: '2.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              background: '#5FC88F15',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <MessageCircle size={32} color="#5FC88F" />
            </div>
            <h5 style={{
              fontSize: '1.375rem',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '1.5rem'
            }}>
              Canales de Comunicación
            </h5>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                background: '#5FC88F15',
                borderRadius: '12px',
                border: '2px solid #5FC88F30'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <MessageCircle size={18} color="#5FC88F" />
                  <strong style={{ color: '#1a202c', fontSize: '0.9375rem' }}>WhatsApp:</strong>
                </div>
                <p style={{ marginBottom: '0.75rem', color: '#4b5563', fontSize: '0.9375rem', paddingLeft: '1.75rem' }}>
                  +57 300 123 4567
                </p>
                <button 
                  onClick={handleWhatsApp}
                  style={{
                    width: '100%',
                    background: '#5FC88F',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#4db87d';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#5FC88F';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                  Chatear Ahora
                </button>
              </div>
            </div>
          </div>

          {/* Tiempo de Respuesta */}
          <div style={{
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            padding: '2.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              background: '#FFA72615',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <Clock size={32} color="#FFA726" />
            </div>
            <h5 style={{
              fontSize: '1.375rem',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '1.5rem'
            }}>
              Tiempo de Respuesta
            </h5>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <MessageCircle size={18} color="#5FC88F" />
                  <strong style={{ fontSize: '0.9375rem', color: '#1a202c' }}>WhatsApp:</strong>
                </div>
                <p style={{ marginBottom: 0, color: '#4b5563', fontSize: '0.9375rem', paddingLeft: '1.75rem' }}>
                  Inmediato (horario laboral)
                </p>
              </div>

              <div style={{
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <Mail size={18} color="#0ea5e9" />
                  <strong style={{ fontSize: '0.9375rem', color: '#1a202c' }}>Email:</strong>
                </div>
                <p style={{ marginBottom: 0, color: '#4b5563', fontSize: '0.9375rem', paddingLeft: '1.75rem' }}>
                  24-48 horas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Contacto */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          <div style={{
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
              padding: '1.5rem'
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
                <Send size={24} />
                Formulario de Contacto
              </h5>
            </div>
            
            <div style={{ padding: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem', display: 'block' }}>
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: `2px solid ${errors.nombre ? '#dc3545' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none'
                    }}
                  />
                  {errors.nombre && (
                    <small style={{ color: '#dc3545', display: 'block', marginTop: '0.25rem' }}>
                      {errors.nombre}
                    </small>
                  )}
                </div>

                <div>
                  <label style={{ fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem', display: 'block' }}>
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="300 123 4567"
                    value={formData.telefono}
                    onChange={handleChange}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: `2px solid ${errors.telefono ? '#dc3545' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none'
                    }}
                  />
                  {errors.telefono && (
                    <small style={{ color: '#dc3545', display: 'block', marginTop: '0.25rem' }}>
                      {errors.telefono}
                    </small>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem', display: 'block' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: `2px solid ${errors.email ? '#dc3545' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none'
                    }}
                  />
                  {errors.email && (
                    <small style={{ color: '#dc3545', display: 'block', marginTop: '0.25rem' }}>
                      {errors.email}
                    </small>
                  )}
                </div>

                <div>
                  <label style={{ fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem', display: 'block' }}>
                    Asunto *
                  </label>
                  <select
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: `2px solid ${errors.asunto ? '#dc3545' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="consulta">Consulta General</option>
                    <option value="reparacion">Pregunta sobre Reparación</option>
                    <option value="pedido">Seguimiento de Pedido</option>
                    <option value="garantia">Reclamación de Garantía</option>
                    <option value="queja">Queja o Reclamo</option>
                    <option value="sugerencia">Sugerencia</option>
                  </select>
                  {errors.asunto && (
                    <small style={{ color: '#dc3545', display: 'block', marginTop: '0.25rem' }}>
                      {errors.asunto}
                    </small>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem', display: 'block' }}>
                  Mensaje *
                </label>
                <textarea
                  name="mensaje"
                  rows={5}
                  placeholder="Escribe tu mensaje aquí..."
                  value={formData.mensaje}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: `2px solid ${errors.mensaje ? '#dc3545' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />
                {errors.mensaje && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '0.25rem' }}>
                    {errors.mensaje}
                  </small>
                )}
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#cbd5e0' : 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
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
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(6, 182, 212, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(6, 182, 212, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.3)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTop: '3px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Enviando...
                    <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              padding: '2rem'
            }}>
              <h6 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <MapPin size={20} color="#4C8BF5" />
                Encuéntranos
              </h6>
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                padding: '3rem 2rem',
                borderRadius: '12px',
                textAlign: 'center',
                marginBottom: '1rem',
                cursor: 'pointer'
              }}
              onClick={handleGoogleMaps}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'white',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <MapPin size={40} color="#4C8BF5" />
                </div>
                <p style={{
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#1a202c',
                  fontSize: '0.9375rem'
                }}>
                  Mapa de Google
                </p>
                <small style={{ color: '#718096' }}>
                  Calle 25 #5-42, Quibdó
                </small>
              </div>
              <button 
                onClick={handleGoogleMaps}
                style={{
                  width: '100%',
                  background: 'white',
                  border: '2px solid #4C8BF5',
                  color: '#4C8BF5',
                  padding: '0.875rem',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#4C8BF5';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#4C8BF5';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                <MapPin size={18} />
                Ver en Google Maps
              </button>
            </div>

            <div style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <MapPin size={28} color="white" />
              </div>
              <h6 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.75rem'
              }}>
                ¿Prefieres visitarnos?
              </h6>
              <p style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.9375rem',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                Visítanos en nuestra tienda física. Nuestro equipo estará encantado de atenderte.
              </p>
              <button 
                onClick={handleGoogleMaps}
                style={{
                  width: '100%',
                  background: 'white',
                  border: 'none',
                  color: '#667eea',
                  padding: '0.875rem',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}>
                Ver Ubicación Detallada
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contacto