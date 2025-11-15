import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    verificarSesion()
  }, [])

  const verificarSesion = async () => {
    try {
      const response = await fetch('http://localhost/mega_web/api/check_session.php', {
        method: 'GET',
        credentials: 'include', // IMPORTANTE: Incluir cookies de sesión
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success && data.authenticated) {
        // Sesión válida en el servidor
        setUsuario(data.usuario)
        setIsLoggedIn(true)
        // Guardar en localStorage como respaldo
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
      } else {
        // No hay sesión válida
        logout()
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (identificacion, contrasena, rememberMe = false) => {
    try {
      const response = await fetch('http://localhost/mega_web/api/login.php', {
        method: 'POST',
        credentials: 'include', // IMPORTANTE: Incluir cookies de sesión
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identificacion,
          contrasena,
          rememberMe
        })
      })

      const data = await response.json()

      if (data.success) {
        setUsuario(data.usuario)
        setIsLoggedIn(true)
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        
        // Redirigir según el rol
        navigate(data.redirectTo || '/')
        
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, message: 'Error de conexión con el servidor' }
    }
  }

  const register = async (datosUsuario) => {
    try {
      const response = await fetch('http://localhost/mega_web/api/register.php', {
        method: 'POST',
        credentials: 'include', // IMPORTANTE: Incluir cookies de sesión
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosUsuario)
      })

      const data = await response.json()

      if (data.success) {
        setUsuario(data.usuario)
        setIsLoggedIn(true)
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        
        // Redirigir a la página principal
        navigate('/')
        
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message, errors: data.errors }
      }
    } catch (error) {
      console.error('Error en registro:', error)
      return { success: false, message: 'Error de conexión con el servidor' }
    }
  }

  const logout = async () => {
    try {
      await fetch('http://localhost/mega_web/api/logout.php', {
        method: 'POST',
        credentials: 'include', // IMPORTANTE: Incluir cookies de sesión
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      // Limpiar estado local
      setUsuario(null)
      setIsLoggedIn(false)
      localStorage.removeItem('usuario')
      navigate('/login')
    }
  }

  const actualizarUsuario = (datosActualizados) => {
    const usuarioActualizado = { ...usuario, ...datosActualizados }
    setUsuario(usuarioActualizado)
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado))
  }

  const value = {
    usuario,
    isLoggedIn,
    loading,
    login,
    register,
    logout,
    verificarSesion,
    actualizarUsuario
  }

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>
            Verificando sesión...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}