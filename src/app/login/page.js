'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ usuario: '', password: '' })
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setCargando(true)
    setError(null)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      // Reemplazamos router.push por una redirección tradicional
      window.location.href = '/tesoro'
    } else {
      setError('Usuario o contraseña incorrectos.')
      setCargando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1C1C1C',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'Montserrat', system-ui, sans-serif"
    }}>

      {/* Logo */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <Image
          src="/logo-sanitas.png"
          alt="Logo Logia Sanitas Sanitatum"
          width={130}
          height={130}
          style={{ 
            objectFit: 'contain', 
            marginBottom: '1rem',
            display: 'block',    
            margin: '0 auto'   
          }}
        />
        <p style={{ fontSize: '11px', color: '#CDA434', letterSpacing: '0.2em', marginBottom: '4px' }}>
          A L.·.G.·.D.·.G.·.A.·.D.·.U.·.
        </p>
        <p style={{ fontSize: '14px', color: '#F5F5F5', fontWeight: '500', margin: 0 }}>
          Logia Sanitas Sanitatum N°763
        </p>
        <p style={{ fontSize: '11px', color: '#9e9b8e', margin: '4px 0 0' }}>
          Área reservada
        </p>
      </div>

      {/* Formulario */}
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #CDA434',
        borderRadius: '8px',
        padding: '2rem',
        width: '100%',
        maxWidth: '360px'
      }}>
        <h1 style={{ fontSize: '16px', fontWeight: '500', color: '#F5F5F5', marginBottom: '1.5rem', textAlign: 'center' }}>
          Iniciar sesión
        </h1>

        {error && (
          <div style={{
            backgroundColor: '#FCEBEB',
            color: '#791F1F',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#9e9b8e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
              Usuario
            </label>
            <input
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              autoComplete="username"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '13px',
                border: '0.5px solid #444',
                borderRadius: '6px',
                backgroundColor: '#1C1C1C',
                color: '#F5F5F5',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#9e9b8e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '13px',
                border: '0.5px solid #444',
                borderRadius: '6px',
                backgroundColor: '#1C1C1C',
                color: '#F5F5F5',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: cargando ? '#a07a28' : '#CDA434',
              color: '#1C1C1C',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {cargando ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>

      <p style={{ fontSize: '11px', color: '#555', marginTop: '2rem', textAlign: 'center' }}>
        Bajo los auspicios de la Gran Logia de la Argentina de Libres y Aceptatos Masones
      </p>
    </div>
  )
}