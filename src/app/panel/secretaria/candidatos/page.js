'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Definimos las columnas de nuestro flujo activo
const COLUMNAS = [
  { id: 'contacto', titulo: '1. Contacto Inicial', color: '#e8e6e0', border: '#c8c5b8' },
  { id: 'circulacion', titulo: '2. En Circulación', color: '#EAF3DE', border: '#b8d598' },
  { id: 'aplomacion', titulo: '3. Aplomación', color: '#FAEEDA', border: '#e8cfa6' },
  { id: 'aprobado', titulo: '4. Aprobados', color: '#EAE6F3', border: '#b8a6d9' }
]

export default function TableroCandidatos() {
  const [candidatos, setCandidatos] = useState([])
  const [cargando, setCargando] = useState(true)

useEffect(() => {
    // 1. Definimos la función ADENTRO del useEffect
    async function cargarCandidatos() {
      const { data, error } = await supabase
        .from('candidatos')
        .select('*')
        .in('estado', ['contacto', 'circulacion', 'aplomacion', 'aprobado'])
        .order('created_at', { ascending: false })

      if (!error && data) {
        setCandidatos(data)
      }
      setCargando(false)
    }

    // 2. La llamamos inmediatamente
    cargarCandidatos()
  }, []) // 3. Los corchetes quedan vacíos sin que React se enoje

  // --- LÓGICA DE DRAG & DROP (Arrastrar y Soltar) ---
  
  // 1. Cuando agarramos una tarjeta, guardamos su ID en la memoria del navegador
  const handleDragStart = (e, candidatoId) => {
    e.dataTransfer.setData('candidatoId', candidatoId)
    // Efecto visual de transparencia al arrastrar
    setTimeout(() => { e.target.style.opacity = '0.5' }, 0)
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
  }

  // 2. Permitimos que la columna reciba la tarjeta (por defecto HTML lo bloquea)
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // 3. Cuando soltamos la tarjeta en una nueva columna
  const handleDrop = async (e, nuevoEstado) => {
    e.preventDefault()
    const candidatoId = e.dataTransfer.getData('candidatoId')
    
    if (!candidatoId) return

    // Actualizamos la vista inmediatamente (Optimistic UI) para que se sienta rápido
    setCandidatos(prev => prev.map(c => 
      c.id === candidatoId ? { ...c, estado: nuevoEstado } : c
    ))

    // Luego actualizamos en la base de datos de fondo
    const { error } = await supabase
      .from('candidatos')
      .update({ estado: nuevoEstado })
      .eq('id', candidatoId)

    if (error) {
      console.error('Error al mover candidato:', error)
      // Si falla, recargamos la base de datos real
      cargarCandidatos() 
    }
  }

  if (cargando) return <p style={{ fontSize: '13px', color: '#888', padding: '2rem' }}>Cargando tablero...</p>

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
    {/* CABECERA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px' }}>
            Tablero de Candidatos
          </h1>
          <p style={{ fontSize: '13px', color: '#888' }}>
            Arrastrá las tarjetas para avanzar a los profanos en su proceso de admisión.
          </p>
        </div>
        
        {/* Botón Nuevo Candidato conectado */}
        <Link 
          href="/panel/secretaria/candidatos/nuevo" 
          style={{ fontSize: '13px', padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#1a1a2e', color: '#ffffff', cursor: 'pointer', textDecoration: 'none' }}
        >
          + Ingresar Profano
        </Link>
      </div>

      {/* CONTENEDOR DEL KANBAN (Con scroll horizontal para móviles) */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        overflowX: 'auto', 
        paddingBottom: '1rem',
        flex: 1, // Toma todo el alto disponible
        alignItems: 'flex-start' 
      }}>
        
        {COLUMNAS.map(columna => {
          // Filtramos los candidatos que pertenecen a esta columna
          const candidatosColumna = candidatos.filter(c => c.estado === columna.id)

          return (
            <div 
              key={columna.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columna.id)}
              style={{
                backgroundColor: '#fafaf8',
                borderRadius: '12px',
                minWidth: '280px',
                maxWidth: '300px',
                flex: '0 0 auto',
                border: `1px solid ${columna.border}`,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '400px' // Alto mínimo para que sea fácil soltar tarjetas
              }}
            >
              {/* Título de la Columna */}
              <div style={{ padding: '1rem', backgroundColor: columna.color, borderTopLeftRadius: '11px', borderTopRightRadius: '11px', borderBottom: `1px solid ${columna.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {columna.titulo}
                </h3>
                <span style={{ backgroundColor: '#ffffff', color: '#888', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                  {candidatosColumna.length}
                </span>
              </div>

              {/* Zona donde caen las tarjetas */}
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {candidatosColumna.map(candidato => (
                  <div
                    key={candidato.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, candidato.id)}
                    onDragEnd={handleDragEnd}
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '1rem',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      border: '1px solid #e8e6e0',
                      cursor: 'grab',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <h4 style={{ fontSize: '14px', margin: '0 0 4px', color: '#1a1a2e', fontWeight: '600' }}>
                      {candidato.nombre} {candidato.apellido}
                    </h4>
                    
                    {candidato.boletin_nro && (
                      <p style={{ fontSize: '11px', color: '#CDA434', margin: '0 0 8px', fontWeight: '500' }}>
                        Boletín N° {candidato.boletin_nro}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#888', fontWeight: '500' }}>
                        {candidato.estado === 'contacto' && 'Contactado'}
                        {candidato.estado === 'circulacion' && 'En vía administrativa'}
                        {candidato.estado === 'aplomacion' && 'Siendo aplomado'}
                        {candidato.estado === 'aprobado' && 'Aprobado / Para iniciar'}
                      </span>

                      {/* Este botón luego nos llevará al detalle para asignar aplomadores, etc. */}
                      <Link href={`/panel/secretaria/candidatos/${candidato.id}`} style={{ fontSize: '11px', color: '#1a1a2e', textDecoration: 'none', backgroundColor: '#f5f4f0', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' }}>
                        Abrir legajo
                      </Link>
                    </div>
                  </div>
                ))}

                {candidatosColumna.length === 0 && (
                  <div style={{ border: '1px dashed #c8c5b8', borderRadius: '8px', padding: '1rem', textAlign: 'center', color: '#aaa', fontSize: '12px' }}>
                    Soltar tarjeta aquí
                  </div>
                )}
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}