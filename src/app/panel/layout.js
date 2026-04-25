'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import BotonLogout from './components/BotonLogout'
// Importamos el pasaporte y el hook
import { AuthProvider, useAuth } from '@/context/AuthContext'

// 1. ESTA ES LA CAPA PROTECTORA (Resuelve tu duda de los returns)
export default function PanelLayout({ children }) {
  return (
    <AuthProvider>
      <LayoutInterno>{children}</LayoutInterno>
    </AuthProvider>
  )
}

// 2. ESTE ES TU CÓDIGO ORIGINAL (Adaptado para leer el pasaporte)
function LayoutInterno({ children }) {
  const pathname = usePathname()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // En vez de buscar en Supabase acá, leemos el contexto global
  const { usuario, cargandoAuth } = useAuth()
  const rol = usuario?.rol_oficial

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLinkClick = () => {
    if (isMobile) setMenuAbierto(false)
  }

  // --- LÓGICA DE ROLES ---
  const esVenerable = rol === 'Venerable Maestro'
  const veTesoreria = esVenerable || rol === 'Tesorero'
  const veSecretaria = esVenerable || rol === 'Secretario'
  const veHospitalario = esVenerable || rol === 'Hospitalario'
  const veColumnaSur = esVenerable || rol === '1er Vigilante'
  const veColumnaNorte = esVenerable || rol === '2do Vigilante'

  // --- GUARDA TEMPLO INTERIOR (Protección de Rutas) ---
  const router = useRouter()

  useEffect(() => {
    // Si todavía está leyendo el pasaporte, no hacemos nada
    if (cargandoAuth) return

    // Si el usuario por algún motivo no existe, lo sacamos al login
    if (!usuario) {
      router.push('/') // Cambiá esto por la ruta de tu login si es distinta
      return
    }

    // Blindaje de cada área: si la ruta empieza con la palabra prohibida y no tiene el rol, ¡afuera!
    if (pathname.startsWith('/panel/secretaria') && !veSecretaria) {
      router.push('/panel/mi-perfil')
    } 
    else if (pathname.startsWith('/panel/tesoreria') && !veTesoreria) {
      router.push('/panel/mi-perfil')
    } 
    else if (pathname.startsWith('/panel/hospitalario') && !veHospitalario) {
      router.push('/panel/mi-perfil')
    } 
    else if (pathname.startsWith('/panel/columna-norte') && !veColumnaNorte) {
      router.push('/panel/mi-perfil')
    } 
    else if (pathname.startsWith('/panel/columna-sur') && !veColumnaSur) {
      router.push('/panel/mi-perfil')
    }
  }, [pathname, usuario, cargandoAuth, router, veSecretaria, veTesoreria, veHospitalario, veColumnaNorte, veColumnaSur])
  

  // PRIMER RETURN: PANTALLA DE CARGA
  if (cargandoAuth) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#CDA434', fontFamily: 'system-ui, sans-serif' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/templo-cargando.gif"
          alt="Abriendo las Puertas" 
          style={{ width: '180px', marginBottom: '1.5rem' }} 
        />
        <p style={{ fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '500', margin: 0, color: '#CDA434' }}>
          Abriendo las Puertas del Templo...
        </p>
      </div>
    )
  }

  // SEGUNDO RETURN: INTERFAZ COMPLETA
  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', backgroundColor: '#f5f4f0', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* BARRA SUPERIOR MOBILE */}
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a2e', padding: '1rem', color: '#e8e6e0' }}>
          <span style={{ fontSize: '16px', fontWeight: '500' }}>Logia Sanitas N°763</span>
          <button onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: 'none', border: 'none', color: '#CDA434', fontSize: '24px', cursor: 'pointer' }}>
            {menuAbierto ? '✖' : '☰'}
          </button>
        </div>
      )}

      {/* BARRA LATERAL (Sidebar) */}
      <aside style={{
        width: isMobile ? '100%' : '240px',
        backgroundColor: '#1a1a2e',
        color: '#e8e6e0',
        display: (isMobile && !menuAbierto) ? 'none' : 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        flexShrink: 0,
        height: isMobile ? 'auto' : '100vh',
        position: isMobile ? 'absolute' : 'sticky',
        top: isMobile ? '60px' : 0,
        zIndex: 50
      }}>

        {!isMobile && (
          <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '11px', color: '#9e9b8e', marginBottom: '4px', letterSpacing: '0.05em' }}>A.·.L.·.G.·.D.·.G.·.A.·.D.·.U.·.</p>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', lineHeight: '1.4' }}>Logia Sanitas Sanitatum</p>
            <p style={{ fontSize: '12px', color: '#CDA434', marginTop: '4px' }}>Cargo: {rol || 'Hermano'}</p>
          </div>
        )}

        <nav style={{ padding: '1rem 0', flex: 1, overflowY: 'auto' }}>
          <Enlace href="/panel" texto="Panel General" onClick={handleLinkClick} exacto={true} />
          <Enlace href="/panel/mi-perfil" texto="Mi Perfil" onClick={handleLinkClick} />

          {/* ADMINISTRACIÓN */}
          {(veSecretaria || veTesoreria) && (
            <div style={estiloGrupo}>
              <p style={estiloTituloGrupo}>ADMINISTRACIÓN</p>
              <Enlace href="/panel/tesoreria/hermanos" texto="Cuadro Lógico" onClick={handleLinkClick} />
            </div>
          )}

          {/* SECRETARÍA */}
          {veSecretaria && (
            <div style={estiloGrupo}>
              <p style={estiloTituloGrupo}>SECRETARÍA</p>
              <Enlace href="/panel/secretaria/candidatos" texto="Candidatos / Profanos" onClick={handleLinkClick} />
              <Enlace href="/panel/secretaria/tenidas" texto="Tenidas y Asistencia" onClick={handleLinkClick} />
              {(rol === 'Secretario' || esVenerable) && (
                <Enlace href="/panel/secretaria/registro-historico" texto="Registro Histórico" onClick={handleLinkClick} />
              )}
            </div>
          )}

          {/* TESORERÍA */}
          {veTesoreria && (
            <div style={estiloGrupo}>
              <p style={estiloTituloGrupo}>TESORERÍA</p>
              <Enlace href="/panel/tesoreria" texto="Dashboard Tesoro" onClick={handleLinkClick} exacto={true} />
              <Enlace href="/panel/tesoreria/ingresos" texto="Ingresos" onClick={handleLinkClick} />
              <Enlace href="/panel/tesoreria/egresos" texto="Egresos" onClick={handleLinkClick} />
              <Enlace href="/panel/tesoreria/iniciaciones" texto="Próximas Iniciaciones" onClick={handleLinkClick} />
              <Enlace href="/panel/tesoreria/configuracion" texto="Configuración" onClick={handleLinkClick} />
            </div>
          )}

          {/* HOSPITALARIO */}
          {veHospitalario && (
            <div style={estiloGrupo}>
              <p style={estiloTituloGrupo}>HOSPITALARIO</p>
              <Enlace href="/panel/hospitalario" texto="Saco de Beneficencia" onClick={handleLinkClick} />
            </div>
          )}

          {/* COLUMNA SUR */}
          {veColumnaSur && (
            <div style={estiloGrupo}>
              <p style={estiloTituloGrupo}>COLUMNA SUR</p>
              <Enlace href="/panel/columna-sur" texto="Compañeros" onClick={handleLinkClick} />
            </div>
          )}

          {/* COLUMNA NORTE */}
          {veColumnaNorte && (
            <div style={estiloGrupo}>
              <p style={estiloTituloGrupo}>COLUMNA NORTE</p>
              <Enlace href="/panel/columna-norte" texto="Aprendices" onClick={handleLinkClick} />
            </div>
          )}
        </nav>

        <div style={{ padding: '0 1.25rem 1rem' }}>
          <BotonLogout />
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{
        flex: 1,
        padding: isMobile ? '1rem' : '2rem',
        overflowY: 'auto',
        display: (isMobile && menuAbierto) ? 'none' : 'block'
      }}>
        {children}
      </main>

    </div>
  )
}

function Enlace({ href, texto, onClick, exacto = false }) {
  const pathname = usePathname()
  const activo = exacto ? pathname === href : (pathname === href || pathname.startsWith(`${href}/`))

  return (
    <Link href={href} onClick={onClick} style={{
      display: 'block',
      padding: '0.75rem 1.25rem',
      fontSize: '15px',
      color: activo ? '#ffffff' : '#9e9b8e',
      backgroundColor: activo ? 'rgba(205, 164, 52, 0.1)' : 'transparent',
      borderLeft: activo ? '3px solid #CDA434' : '3px solid transparent',
      textDecoration: 'none',
      transition: 'all 0.2s',
      fontWeight: activo ? '500' : '400'
    }}>
      {texto}
    </Link>
  )
}

const estiloGrupo = {
  marginTop: '1rem',
  borderTop: '1px solid rgba(255,255,255,0.05)',
  paddingTop: '0.5rem'
}

const estiloTituloGrupo = {
  fontSize: '10px',
  color: '#888',
  padding: '0 1.25rem',
  marginBottom: '4px',
  letterSpacing: '0.1em',
  fontWeight: '600'
}