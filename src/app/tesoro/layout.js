import Link from 'next/link'
// 1. Importamos el componente que creaste (asegurate de que la ruta sea correcta)
import BotonLogout from './components/BotonLogout'

export const metadata = {
  title: 'Tesoro — Logia Sanitas Sanitatum N°763',
}

export default function TesoroLayout({ children }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f4f0',
      fontFamily: 'system-ui, sans-serif'
    }}>

      {/* BARRA LATERAL */}
      <aside style={{
        width: '240px',
        backgroundColor: '#1a1a2e',
        color: '#e8e6e0',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        flexShrink: 0
      }}>

        {/* Logo / nombre de la logia */}
        <div style={{
          padding: '0 1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <p style={{
            fontSize: '11px',
            color: '#9e9b8e',
            marginBottom: '4px',
            letterSpacing: '0.05em'
          }}>
            A.·.L.·.G.·.D.·.G.·.A.·.D.·.U.·.
          </p>
          <p style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#ffffff',
            lineHeight: '1.4'
          }}>
            Logia Sanitas Sanitatum
          </p>
          <p style={{
            fontSize: '12px',
            color: '#9e9b8e'
          }}>
            N°763 — Tesorería
          </p>
        </div>

        {/* Navegación (El flex: 1 empuja todo lo que está debajo hacia el fondo) */}
        <nav style={{ padding: '1rem 0', flex: 1 }}>
          <Link href="/tesoro" style={{
            display: 'block',
            padding: '0.6rem 1.25rem',
            fontSize: '14px',
            color: '#c8c5b8',
            textDecoration: 'none',
          }}>
            Panel principal
          </Link>
          <Link href="/tesoro/hermanos" style={{
            display: 'block',
            padding: '0.6rem 1.25rem',
            fontSize: '14px',
            color: '#c8c5b8',
            textDecoration: 'none',
          }}>
            Hermanos
          </Link>
          <Link href="/tesoro/egresos" style={{
            display: 'block',
            padding: '0.6rem 1.25rem',
            fontSize: '14px',
            color: '#c8c5b8',
            textDecoration: 'none',
          }}>
            Movimientos
          </Link>
          {/* Nuevo enlace de Configuración */}
          <Link href="/tesoro/configuracion" style={{
            display: 'block',
            padding: '0.6rem 1.25rem',
            fontSize: '14px',
            color: '#c8c5b8',
            textDecoration: 'none',
          }}>
            Configuración
          </Link>
        </nav>

        {/* 2. Colocamos el Botón de Logout aquí */}
        <div style={{ padding: '0 1.25rem 1rem' }}>
          <BotonLogout />
        </div>

        {/* Pie de la barra */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          fontSize: '11px',
          color: '#9e9b8e'
        }}>
          Bajo los auspicios de la <br />
          Gran Logia de la Argentina de Libres y Aceptados Masones
        </div>

      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{
        flex: 1,
        padding: '2rem',
        overflowY: 'auto'
      }}>
        {children}
      </main>

    </div>
  )
}