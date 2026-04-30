'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { BookOpen, Users, FileText, CreditCard, Sparkles } from 'lucide-react'
// IMPORTAMOS LA BASE DE DATOS DE FRASES DIRECTO DEL JSON
import capsulasMaconicas from '@/data/capsulas.json'

// --- BIBLIOTECA DE LUZ MASÓNICA (Sin autor, listos para los manuales) ---

export default function PanelInicio() {
  const { usuario, cargandoAuth } = useAuth()

// 1. Tomamos el grado del usuario (si no cargó, asumimos 1 por seguridad)
  const gradoUsuario = usuario?.grado || 1

  // 2. Filtramos el JSON para que solo queden las frases de su grado
  const reflexionesDelGrado = capsulasMaconicas.filter(capsula => capsula.grado === gradoUsuario)

  // 3. Por si acaso se olvidaron de cargar frases para algún grado, usamos un Plan B
  const arrayAUsar = reflexionesDelGrado.length > 0 ? reflexionesDelGrado : capsulasMaconicas

  // 4. Elegimos la cápsula del día basada SÓLO en las de su grado
  const diaActual = new Date().getDate()
  const indice = diaActual % arrayAUsar.length
  const capsulaDelDia = arrayAUsar[indice]

  if (cargandoAuth) return null

  const rol = usuario?.rol_oficial
  const esVenerable = rol === 'Venerable Maestro'
  const veTesoreria = esVenerable || rol === 'Tesorero'
  const veSecretaria = esVenerable || rol === 'Secretario'

  return (
    <div style={{ maxWidth: '1000px', paddingBottom: '3rem' }}>
      
      {/* Mensaje de Bienvenida */}
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e8e6e0' }}>
        <h1 style={{ fontSize: '28px', color: '#1a1a2e', margin: '0 0 8px', fontWeight: '600' }}>
          Bienvenido, Q.·. H.·. {usuario?.nombre}
        </h1>
        <p style={{ color: '#666', margin: 0, fontSize: '15px' }}>
          Panel de gestión administrativa y operativa de la Logia Sanitas Sanitatum N° 763.
        </p>
      </div>

      {/* CÁPSULA MASÓNICA DIARIA */}
      <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '2rem', marginBottom: '2.5rem', color: '#e8e6e0', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(26,26,46,0.1)' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: '0.05' }}>
          <Sparkles size={200} />
        </div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <Sparkles size={20} color="#CDA434" />
            <h2 style={{ fontSize: '14px', color: '#CDA434', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, fontWeight: '600' }}>
              Reflexión del Día
            </h2>
          </div>
          
          <h3 style={{ fontSize: '22px', margin: '0 0 1rem', color: '#fff', fontWeight: '500' }}>
            {capsulaDelDia.titulo}
          </h3>
          
          <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#c4c2ba', fontStyle: 'italic', margin: 0, maxWidth: '800px' }}>
            &quot;{capsulaDelDia.texto}&quot;
          </p>
        </div>
      </div>

      {/* ACCESOS RÁPIDOS DE OFICIALES (Sólo aparecen si tienen el cargo) */}
      {(veSecretaria || veTesoreria) && (
        <div>
          <h3 style={{ fontSize: '16px', color: '#1a1a2e', marginBottom: '1.2rem', fontWeight: '600' }}>
            Accesos de Oficialidad
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            
            {veSecretaria && (
              <>
                <TarjetaAcceso 
                  href="/panel/secretaria/candidatos" 
                  icono={<Users size={24} />} 
                  titulo="Candidatos" 
                  descripcion="Gestión de profanos" 
                />
                <TarjetaAcceso 
                  href="/panel/secretaria/tenidas" 
                  icono={<FileText size={24} />} 
                  titulo="Tenidas" 
                  descripcion="Control de asistencia" 
                />
              </>
            )}

            {veTesoreria && (
              <>
                <TarjetaAcceso 
                  href="/panel/tesoreria" 
                  icono={<CreditCard size={24} />} 
                  titulo="Tesoro" 
                  descripcion="Dashboard financiero" 
                />
                <TarjetaAcceso 
                  href="/panel/tesoreria/hermanos" 
                  icono={<BookOpen size={24} />} 
                  titulo="Cuadro Lógico" 
                  descripcion="Estado de los HH.·." 
                />
              </>
            )}

          </div>
        </div>
      )}

    </div>
  )
}

// Componente visual para las tarjetas
function TarjetaAcceso({ href, icono, titulo, descripcion }) {
  return (
    <Link href={href} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      padding: '1.2rem',
      backgroundColor: '#fff',
      border: '1px solid #e8e6e0',
      borderRadius: '12px',
      textDecoration: 'none',
      color: '#1a1a2e',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
      <div style={{ width: '48px', height: '48px', backgroundColor: '#f0efe9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CDA434' }}>
        {icono}
      </div>
      <div>
        <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600' }}>{titulo}</h4>
        <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{descripcion}</p>
      </div>
    </Link>
  )
}