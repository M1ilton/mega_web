// components/NotFound.jsx
import { Link } from 'react-router-dom'
import { AlertCircle, Home } from 'lucide-react'

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f3f4f6',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <AlertCircle size={80} color="#ef4444" style={{ marginBottom: '2rem' }} />
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '800',
          color: '#1a202c',
          marginBottom: '1rem'
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#4b5563',
          marginBottom: '1rem'
        }}>
          Página no encontrada
        </h2>
        <p style={{
          color: '#718096',
          marginBottom: '2rem',
          fontSize: '1.125rem'
        }}>
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          <Home size={20} />
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFound