import { useState, useEffect } from 'react'
import { 
  Users, X, Plus, Edit, Trash2, Search, Eye, EyeOff,
  Mail, Phone, MapPin, Shield, ArrowLeft, Save, Calendar, CreditCard,
  ChevronLeft, ChevronRight // Iconos para paginación
} from 'lucide-react'

// URL del backend PHP - mismo directorio que Dashboard
const API_URL = 'http://localhost/megacell_backend'

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [vistaActual, setVistaActual] = useState('usuarios')
  
  // --- Estados de Paginación ---
  const [paginaActual, setPaginaActual] = useState(1)
  const [usuariosPorPagina] = useState(10) // Define cuántos usuarios por página
  // -----------------------------

  const [formData, setFormData] = useState({
    identificacion: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    municipio: '',
    contrasena: '',
    rol: 'cliente'
  })

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      console.log('Cargando usuarios desde:', `${API_URL}/usuarios.php`)
      
      const response = await fetch(`${API_URL}/usuarios.php`, {
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
        setUsuarios(data.usuarios || [])
        console.log('Usuarios cargados:', data.usuarios?.length || 0)
        setPaginaActual(1) // Resetear a la primera página al cargar nuevos datos
      } else {
        console.error('Error al cargar usuarios:', data.message)
        alert('Error al cargar usuarios: ' + data.message)
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      alert('Error de conexión al cargar usuarios: ' + error.message)
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
      identificacion: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      fecha_nacimiento: '',
      municipio: '',
      contrasena: '',
      rol: 'cliente'
    })
    setUsuarioSeleccionado(null)
    setModalOpen(true)
  }

  const abrirModalEditar = (usuario) => {
    setFormData({
      identificacion: usuario.identificacion,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      telefono: usuario.telefono,
      fecha_nacimiento: usuario.fecha_nacimiento,
      municipio: usuario.municipio,
      contrasena: '',
      rol: usuario.rol
    })
    setUsuarioSeleccionado(usuario)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = usuarioSeleccionado 
        ? `${API_URL}/usuarios.php?id=${usuarioSeleccionado.id}`
        : `${API_URL}/usuarios.php`
      
      const method = usuarioSeleccionado ? 'PUT' : 'POST'
      
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
        alert(usuarioSeleccionado ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente')
        setModalOpen(false)
        cargarUsuarios()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error)
      alert('Error al guardar el usuario')
    }
  }

  const confirmarEliminar = (usuario) => {
    setUsuarioSeleccionado(usuario)
    setModalEliminar(true)
  }

  const eliminarUsuario = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios.php?id=${usuarioSeleccionado.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        alert('Usuario eliminado exitosamente')
        setModalEliminar(false)
        cargarUsuarios()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      alert('Error al eliminar el usuario')
    }
  }

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.identificacion.toLowerCase().includes(busqueda.toLowerCase())
  )

  // --- Lógica de Paginación ---
  const indiceUltimoUsuario = paginaActual * usuariosPorPagina
  const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina
  const usuariosPaginaActual = usuariosFiltrados.slice(indicePrimerUsuario, indiceUltimoUsuario)

  const numeroTotalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina)

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

  const getRolColor = (rol) => {
    switch(rol) {
      case 'admin': return '#EF5350'
      case 'trabajador': return '#FFA726'
      case 'cliente': return '#667eea'
      default: return '#9ca3af'
    }
  }

  const getEstadoBadge = (estado) => {
    const colores = {
      'activo': { bg: '#10B98115', color: '#10B981' },
      'inactivo': { bg: '#9ca3af15', color: '#9ca3af' },
      'suspendido': { bg: '#EF535015', color: '#EF5350' }
    }
    return colores[estado] || colores.activo
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
          <p style={{ marginTop: '1rem', color: '#718096' }}>Cargando usuarios...</p>
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
              onClick={() => setVistaActual('dashboard')}
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
                Gestión de Usuarios
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#718096',
                margin: 0
              }}>
                Administra todos los usuarios del sistema
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
            Nuevo Usuario
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
            placeholder="Buscar por nombre, apellido, correo o identificación..."
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

      {/* Tabla de usuarios */}
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
                <th style={estiloTh}>Identificación</th>
                <th style={estiloTh}>Nombre Completo</th>
                <th style={estiloTh}>Email</th>
                <th style={estiloTh}>Teléfono</th>
                <th style={estiloTh}>Municipio</th>
                <th style={estiloTh}>Rol</th>
                <th style={estiloTh}>Estado</th>
                <th style={estiloTh}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginaActual.length === 0 ? ( // Usar usuariosPaginaActual
                <tr>
                  <td colSpan="8" style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: '#9ca3af'
                  }}>
                    <Users size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ margin: 0, fontSize: '1rem' }}>
                      {busqueda ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                    </p>
                  </td>
                </tr>
              ) : (
                usuariosPaginaActual.map((usuario) => { // Usar usuariosPaginaActual
                  const estadoBadge = getEstadoBadge(usuario.estado)
                  return (
                    <tr
                      key={usuario.id}
                      style={{ borderBottom: '1px solid #f3f4f6' }}
                    >
                      <td style={estiloTd}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CreditCard size={16} color="#9ca3af" />
                          {usuario.identificacion}
                        </div>
                      </td>
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
                            <Users size={20} color="#667eea" />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: '600', color: '#1a202c' }}>
                              {usuario.nombres} {usuario.apellidos}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={16} color="#9ca3af" />
                          {usuario.email}
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Phone size={16} color="#9ca3af" />
                          {usuario.telefono}
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={16} color="#9ca3af" />
                          {usuario.municipio}
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '6px 12px',
                          background: `${getRolColor(usuario.rol)}15`,
                          color: getRolColor(usuario.rol),
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          <Shield size={14} />
                          {usuario.rol}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          background: estadoBadge.bg,
                          color: estadoBadge.color,
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {usuario.estado}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => abrirModalEditar(usuario)}
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
                            onClick={() => confirmarEliminar(usuario)}
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
      {usuariosFiltrados.length > usuariosPorPagina && (
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
            Mostrando {indicePrimerUsuario + 1} a {Math.min(indiceUltimoUsuario, usuariosFiltrados.length)} de {usuariosFiltrados.length} usuarios
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

      {/* Modal Crear/Editar (sin cambios) */}
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
                {usuarioSeleccionado ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                <label style={estiloLabel}>Identificación *</label>
                <input
                  type="text"
                  name="identificacion"
                  value={formData.identificacion}
                  onChange={handleInputChange}
                  required
                  style={estiloInput}
                  placeholder="Cédula o documento"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={estiloLabel}>Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    required
                    style={estiloInput}
                  />
                </div>
                <div>
                  <label style={estiloLabel}>Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    required
                    style={estiloInput}
                  />
                </div>
              </div>

              <div>
                <label style={estiloLabel}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={estiloInput}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={estiloLabel}>Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                    style={estiloInput}
                  />
                </div>
                <div>
                  <label style={estiloLabel}>Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                    required
                    style={estiloInput}
                  />
                </div>
              </div>

              <div>
                <label style={estiloLabel}>Municipio *</label>
                <input
                  type="text"
                  name="municipio"
                  value={formData.municipio}
                  onChange={handleInputChange}
                  required
                  style={estiloInput}
                />
              </div>

              <div>
                <label style={estiloLabel}>
                  Contraseña {usuarioSeleccionado ? '(Dejar vacío para no cambiar)' : '*'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    required={!usuarioSeleccionado}
                    style={estiloInput}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {mostrarPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                  </button>
                </div>
              </div>

              <div>
                <label style={estiloLabel}>Rol *</label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  required
                  style={{...estiloInput, cursor: 'pointer'}}
                >
                  <option value="cliente">Cliente</option>
                  <option value="trabajador">Trabajador</option>
                  <option value="admin">Administrador</option>
                </select>
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
                {usuarioSeleccionado ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar (sin cambios) */}
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
              ¿Eliminar Usuario?
            </h3>

            <p style={{
              fontSize: '0.9375rem',
              color: '#718096',
              textAlign: 'center',
              margin: '0 0 1.5rem'
            }}>
              ¿Estás seguro de que deseas eliminar a{' '}
              <strong>{usuarioSeleccionado?.nombres} {usuarioSeleccionado?.apellidos}</strong>?
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
                onClick={eliminarUsuario}
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

export default GestionUsuarios