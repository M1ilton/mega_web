import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const API_URL = 'http://localhost/megacell_backend'

function ProtectedRoute({ children, requiredRole = null }) {
  const [loading, setLoading] = useState(true)
  const [usuario, setUsuario] = useState(null)
  const location = useLocation()

  useEffect(() => {
    verificarSesion()
  }, [])

  const verificarSesion = async () => {
    try {
      const response = await fetch(`${API_URL}/check_session.php`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success && data.authenticated) {
        setUsuario(data.usuario)
      } else {
        setUsuario(null)
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error)
      setUsuario(null)
    } finally {
      setLoading(false)
    }
  }

  // Mostrar spinner mientras carga
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
          <p style={{ marginTop: '1rem', color: '#718096' }}>Verificando sesión...</p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Si no hay usuario, redirigir al login
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar rol específico si es requerido
  if (requiredRole) {
    const rolesPermitidos = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    
    if (!rolesPermitidos.includes(usuario.rol)) {
      // Redirigir según el rol del usuario
      if (usuario.rol === 'cliente') {
        return <Navigate to="/" replace />
      } else {
        return <Navigate to="/dashboard" replace />
      }
    }
  }

  // Usuario autenticado y con permisos correctos
  return children
}

export default ProtectedRoute