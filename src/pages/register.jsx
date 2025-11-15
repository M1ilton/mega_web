import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Smartphone, Eye, EyeOff, User, Mail, Phone, 
  Calendar, MapPin, Lock, AlertCircle, CheckCircle,
  Loader
} from 'lucide-react'

// URL del backend PHP - AJUSTAR SEGÚN TU CONFIGURACIÓN
const API_URL = 'http://localhost/megacell_backend'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    identificacion: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    municipio: '',
    contrasena: '',
    confirmarContrasena: ''
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const municipios = [
    'Quibdó', 'Acandí', 'Alto Baudó', 'Atrato', 'Bagadó',
    'Bahía Solano', 'Bajo Baudó', 'Bojayá', 'Cantón de San Pablo',
    'Carmen del Darién', 'Cértegui', 'Condoto', 'El Carmen de Atrato',
    'Istmina', 'Juradó', 'Lloró', 'Medio Atrato', 'Medio Baudó',
    'Medio San Juan', 'Nóvita', 'Nuquí', 'Río Iró', 'Río Quito',
    'Riosucio', 'San José del Palmar', 'Sipí', 'Tadó', 'Unguía',
    'Unión Panamericana'
  ]

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

    if (formData.identificacion.length < 6) {
      newErrors.identificacion = 'La identificación debe tener al menos 6 caracteres'
    }

    if (formData.nombres.trim().length < 3) {
      newErrors.nombres = 'Los nombres deben tener al menos 3 caracteres'
    }

    if (formData.apellidos.trim().length < 3) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 3 caracteres'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido'
    }

    if (formData.telefono.length < 10) {
      newErrors.telefono = 'El teléfono debe tener al menos 10 dígitos'
    }

    const hoy = new Date()
    const fechaNac = new Date(formData.fechaNacimiento)
    const edad = hoy.getFullYear() - fechaNac.getFullYear()
    if (edad < 18) {
      newErrors.fechaNacimiento = 'Debes ser mayor de 18 años para registrarte'
    }

    if (!formData.municipio) {
      newErrors.municipio = 'Debes seleccionar un municipio'
    }

    if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Las contraseñas no coinciden'
    }

    if (!acceptTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para las cookies de sesión
        body: JSON.stringify({
          identificacion: formData.identificacion,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono,
          fechaNacimiento: formData.fechaNacimiento,
          municipio: formData.municipio,
          contrasena: formData.contrasena
        })
      })

      const data = await response.json()

      if (data.success) {
        // Guardar información del usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        
        // Redirigir al home (los clientes van al home por defecto)
        navigate('/')
      } else {
        // Mostrar errores del servidor
        if (data.errors && Array.isArray(data.errors)) {
          const serverErrors = {}
          data.errors.forEach(error => {
            serverErrors.general = error
          })
          setErrors(serverErrors)
        } else {
          setErrors({ general: data.message || 'Error al registrar usuario' })
        }
      }
    } catch (error) {
      console.error('Error de conexión:', error)
      setErrors({ general: 'Error de conexión con el servidor. Por favor, intente nuevamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '900px',
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%)',
          padding: '2.5rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <Smartphone size={32} color="white" />
            </div>
            <span style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: 'white'
            }}>
              MegaCell
            </span>
          </Link>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            Crear Cuenta Nueva
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.125rem',
            marginBottom: 0
          }}>
            Complete el formulario para registrarse
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '2.5rem' }}>
          {/* Alerta de términos o errores generales */}
          {(errors.terms || errors.general) && (
            <div style={{
              background: '#FFA72615',
              border: '2px solid #FFA726',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <AlertCircle size={24} color="#FFA726" />
              <span style={{ color: '#FFA726', fontWeight: '600', fontSize: '0.9375rem' }}>
                {errors.terms || errors.general}
              </span>
            </div>
          )}

          {/* Grid de campos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {/* Identificación */}
            <div>
              <label style={{
                fontWeight: '600',
                color: '#1a202c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.9375rem'
              }}>
                <User size={18} color="#9b59b6" />
                Identificación *
              </label>
              <input
                type="text"
                name="identificacion"
                placeholder="Número de identificación"
                value={formData.identificacion}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.identificacion ? '2px solid #e74c3c' : '2px solid #e2e8f0',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => !errors.identificacion && (e.target.style.borderColor = '#9b59b6')}
                onBlur={(e) => !errors.identificacion && (e.target.style.borderColor = '#e2e8f0')}
              />
              {errors.identificacion && (
                <small style={{ color: '#e74c3c', fontSize: '0.8125rem', display: 'block', marginTop: '0.25rem' }}>
                  {errors.identificacion}
                </small>
              )}
            </div>

            {/* Nombres */}
            <div>
              <label style={{
                fontWeight: '600',
                color: '#1a202c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.9375rem'
              }}>
                <User size={18} color="#9b59b6" />
                Nombres *
              </label>
              <input
                type="text"
                name="nombres"
                placeholder="Nombres completos"
                value={formData.nombres}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.nombres ? '2px solid #e74c3c' : '2px solid #e2e8f0',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => !errors.nombres && (e.target.style.borderColor = '#9b59b6')}
                onBlur={(e) => !errors.nombres && (e.target.style.borderColor = '#e2e8f0')}
              />
              {errors.nombres && (
                <small style={{ color: '#e74c3c', fontSize: '0.8125rem', display: 'block', marginTop: '0.25rem' }}>
                  {errors.nombres}
                </small>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <label style={{
                fontWeight: '600',
                color: '#1a202c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.9375rem'
              }}>
                <User size={18} color="#9b59b6" />
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                placeholder="Apellidos completos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.apellidos ? '2px solid #e74c3c' : '2px solid #e2e8f0',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => !errors.apellidos && (e.target.style.borderColor = '#9b59b6')}
                onBlur={(e) => !errors.apellidos && (e.target.style.borderColor = '#e2e8f0')}
              />
              {errors.apellidos && (
                <small style={{ color: '#e74c3c', fontSize: '0.8125rem', display: 'block', marginTop: '0.25rem' }}>
                  {errors.apellidos}
                </small>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{
                fontWeight: '600',
                color: '#1a202c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.9375rem'
              }}>
                <Mail size={18} color="#9b59b6" />
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.email ? '2px solid #e74c3c' : '2px solid #e2e8f0',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => !errors.email && (e.target.style.borderColor = '#9b59b6')}
                onBlur={(e) => !errors.email && (e.target.style.borderColor = '#e2e8f0')}
              />
              {errors.email && (
                <small style={{ color: '#e74c3c', fontSize: '0.8125rem', display: 'block', marginTop: '0.25rem' }}>
                  {errors.email}
                </small>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label style={{
                fontWeight: '600',
                color: '#1a202c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.9375rem'
              }}>
                <Phone size={18} color="#9b59b6" />
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                placeholder="3001234567"
                value={formData.telefono}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.telefono ? '2px solid #e74c3c' : '2px solid #e2e8f0',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => !errors.telefono && (e.target.style.borderColor = '#9b59b6')}
                onBlur={(e) => !errors.telefono && (e.target.style.borderColor = '#e2e8f0')}
              />
              {errors.telefono && (
                <small style={{ color: '#e74c3c', fontSize: '0.8125rem', display: 'block', marginTop: '0.25rem' }}>
                  {errors.telefono}
                </small>
              )}
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label style={{
                fontWeight: '600',
                color: '#1a202c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.9375rem'
              }}>
                <Calendar size={18} color="#9b59b6" />
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.fechaNacimiento ? '2px solid #e74c3c' : '2px solid #e2e8f0',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => !errors.fechaNacimiento && (e.target.style.borderColor = '#9b59b6')}
                onBlur={(e) => !errors.fechaNacimiento && (e.target.style.borderColor = '#e2e8f0')}
              />
              {errors.fechaNacimiento && (
                <small style={{ color: '#e74c3c', fontSize: '0.8125rem', display: 'block', marginTop: '0.25rem' }}>
                  {errors.fechaNacimiento}
                </small>
              )}
            </div>

            {/* Municipio */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{
                fontWeight: '600',
                color: '#1a202c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.9375rem'
              }}>
                <MapPin size={18} color="#9b59b6" />
                Municipio *
              </label>
              <select
                name="municipio"
                value={formData.municipio}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.municipio ? '2px solid #e74c3c' : '2px solid #e2e8f0',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onFocus={(e) => !errors.municipio && (e.target.style.borderColor = '#9b59b6')}
                onBlur={(e) => !errors.municipio && (e.target.style.borderColor = '#e2e8f0')}
              >
                <option value="">Selecciona tu municipio</option>
                {municipios.map((municipio, index) => (
                  <option key={index} value={municipio}>{municipio}</option>
                ))}
              </select>
              {errors.municipio && (
                <small style={{ color: '#e74c3c', fontSize: '0.8125rem', display: 'block', marginTop: '0.25rem' }}>
                  {errors.municipio}
                </small>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label style={{
                fontWeight: '600',
                color: '#1a202c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.9375rem'
              }}>
                <Lock size={18} color="#9b59b6" />
                Contraseña *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="contrasena"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.contrasena}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    borderRadius: '12px',
                    border: errors.contrasena ? '2px solid #e74c3c' : '2px solid #e2e8f0',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => !errors.contrasena && (e.target.style.borderColor = '#9b59b6')}
                  onBlur={(e) => !errors.contrasena && (e.target.style.borderColor = '#e2e8f0')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={20} color="#718096" /> : <Eye size={20} color="#718096" />}
                </button>
              </div>
              {errors.contrasena && (
                <small style={{ color: '#e74c3c', fontSize: '0.8125rem', display: 'block', marginTop: '0.25rem' }}>
                  {errors.contrasena}
                </small>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label style={{
                fontWeight: '600',
                color: '#1a202c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.9375rem'
              }}>
                <Lock size={18} color="#9b59b6" />
                Confirmar Contraseña *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmarContrasena"
                  placeholder="Repita su contraseña"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    borderRadius: '12px',
                    border: errors.confirmarContrasena ? '2px solid #e74c3c' : '2px solid #e2e8f0',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => !errors.confirmarContrasena && (e.target.style.borderColor = '#9b59b6')}
                  onBlur={(e) => !errors.confirmarContrasena && (e.target.style.borderColor = '#e2e8f0')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={20} color="#718096" /> : <Eye size={20} color="#718096" />}
                </button>
              </div>
              {errors.confirmarContrasena && (
                <small style={{ color: '#e74c3c', fontSize: '0.8125rem', display: 'block', marginTop: '0.25rem' }}>
                  {errors.confirmarContrasena}
                </small>
              )}
            </div>
          </div>

          {/* Términos y Condiciones */}
          <div style={{ marginTop: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  marginTop: '2px',
                  cursor: 'pointer',
                  accentColor: '#9b59b6'
                }}
              />
              <span style={{ fontSize: '0.9375rem', color: '#4b5563', lineHeight: '1.6' }}>
                Acepto los{' '}
                <Link to="/terminos" target="_blank" style={{ color: '#9b59b6', fontWeight: '600' }}>
                  términos y condiciones
                </Link>
                {' '}y la{' '}
                <Link to="/privacidad" target="_blank" style={{ color: '#9b59b6', fontWeight: '600' }}>
                  política de privacidad
                </Link>
              </span>
            </label>
          </div>

          {/* Botón de Registro */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#cbd5e0' : 'linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(155, 89, 182, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            {loading ? (
              <>
                <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Creando cuenta...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Crear Cuenta
              </>
            )}
          </button>

          {/* Link a Login */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.9375rem', color: '#718096', margin: 0 }}>
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                style={{
                  color: '#9b59b6',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          form > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Register