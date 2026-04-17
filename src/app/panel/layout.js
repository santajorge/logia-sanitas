'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BotonLogout from './components/BotonLogout'

export default function PanelLayout({ children }) {
  const pathname = usePathname()
  const [rol, setRol] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detectar tamaño de pantalla para el Responsive
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Cargar el rol del usuario desde Supabase
    async function cargarPerfil() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: hermano } = await supabase
          .from('hermanos')
          .select('rol_oficial')
          .eq('user_id', session.user.id)
          .single()
        
        if (hermano) setRol(hermano.rol_oficial)
      }
      setCargando(false)
    }

    cargarPerfil()
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cierra el menú en móviles cuando hacés clic en un enlace
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

  if (cargando) {
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

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', backgroundColor: '#f5f4f0', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* BARRA SUPERIOR MOBILE (Solo se ve en celulares) */}
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
          {/* ACÁ ESTÁ EL PRIMER exacto={true} */}
          <Enlace href="/panel" texto="Panel General" onClick={handleLinkClick} exacto={true} />
          <Enlace href="/panel/mi-perfil" texto="Mi Perfil" onClick={handleLinkClick} />

          {/* CUADRO LÓGICO - Visible para VM, Sec y Tes */}
          {(veSecretaria || veTesoreria) && (
            <div style={estiloGrupo}>
              <p style={estiloTituloGrupo}>ADMINISTRACIÓN</p>
              <Enlace href="/panel/tesoreria/hermanos" texto="Cuadro Lógico" onClick={handleLinkClick} />
            </div>
          )}

          {veSecretaria && (
            <div style={estiloGrupo}>
              <p style={estiloTituloGrupo}>SECRETARÍA</p>
              <Enlace href="/panel/secretaria/candidatos" texto="Candidatos" onClick={handleLinkClick} />
              <Enlace href="/panel/secretaria/tenidas" texto="Tenidas y Asistencia" onClick={handleLinkClick} />
              <Enlace href="/panel/secretaria/libro-negro" texto="Libro Negro" onClick={handleLinkClick} />
            </div>
          )}

          {veTesoreria && (
            <div style={estiloGrupo}>
              <p style={estiloTituloGrupo}>TESORERÍA</p>
              {/* ACÁ ESTÁ EL SEGUNDO exacto={true} */}
              <Enlace href="/panel/tesoreria" texto="Dashboard Tesoro" onClick={handleLinkClick} exacto={true} />
              <Enlace href="/panel/tesoreria/ingresos" texto="Ingresos" onClick={handleLinkClick} />
              <Enlace href="/panel/tesoreria/egresos" texto="Egresos" onClick={handleLinkClick} />
              <Enlace href="/panel/tesoreria/configuracion" texto="Configuración" onClick={handleLinkClick} />
            </div>
          )}

          {veHospitalario && (
            <div style={estiloGrupo}>
              <p style={estiloTituloGrupo}>HOSPITALARIO</p>
              <Enlace href="/panel/hospitalario" texto="Saco de Beneficencia" onClick={handleLinkClick} />
            </div>
          )}

          {veColumnaSur && (
            <div style={estiloGrupo}>
              <p style={estiloTituloGrupo}>COLUMNA SUR</p>
              <Enlace href="/panel/columna-sur" texto="Compañeros" onClick={handleLinkClick} />
            </div>
          )}

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
        display: (isMobile && menuAbierto) ? 'none' : 'block' // Oculta el fondo si el menú está abierto en el celu
      }}>
        {children}
      </main>

    </div>
  )
}

// Subcomponente para que los enlaces queden prolijos
function Enlace({ href, texto, onClick, exacto = false }) {
  const pathname = usePathname()
  
  // Ahora esta línea ya no va a tirar error porque "exacto" sí existe
  const activo = exacto ? pathname === href : (pathname === href || pathname.startsWith(`${href}/`))

  return (
    <Link href={href} onClick={onClick} style={{
      display: 'block',
      padding: '0.6rem 1.25rem',
      fontSize: '14px',
      color: activo ? '#ffffff' : '#c8c5b8',
      backgroundColor: activo ? 'rgba(205, 164, 52, 0.1)' : 'transparent',
      borderLeft: activo ? '3px solid #CDA434' : '3px solid transparent',
      textDecoration: 'none',
      transition: 'all 0.2s'
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