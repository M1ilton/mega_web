import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import NavigationBar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tienda from './pages/Tienda'
import Reparacion from './pages/Reparacion'
import MiCuenta from './pages/MiCuenta'
import Garantias from './pages/Garantias'
import Seguimiento from './pages/Seguimiento'
import Resenas from './pages/Resenas'
import FAQ from './pages/FAQ'
import Ayuda from './pages/Ayuda'
import Contacto from './pages/Contacto'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario')
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado)
      if (usuario.estaLogueado) {
        setIsLoggedIn(true)
      }
    }
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('usuario')
  }

  return (
    <Router>
      <div className="app-container">
        <NavigationBar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/registro" element={<Register onRegister={handleLogin} />} />
            <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/reparacion" element={<Reparacion />} />
            <Route path="/mi-cuenta" element={isLoggedIn ? <MiCuenta /> : <Navigate to="/login" />} />
            <Route path="/garantias" element={<Garantias />} />
            <Route path="/seguimiento" element={<Seguimiento />} />
            <Route path="/resenas" element={<Resenas />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/ayuda" element={<Ayuda />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/carrito" element={<div className="container py-5"><h2>🛒 Carrito - En desarrollo</h2></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App