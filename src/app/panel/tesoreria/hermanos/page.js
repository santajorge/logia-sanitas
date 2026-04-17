'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function HermanosPage() {
  const [hermanos, setHermanos] = useState([])
  const [rol, setRol] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      // 1. Validamos quién está mirando la pantalla
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: perfil } = await supabase
          .from('hermanos')
          .select('rol_oficial')
          .eq('user_id', session.user.id)
          .single()
        if (perfil) setRol(perfil.rol_oficial)
      }

      // 2. Traemos el Cuadro Lógico completo (ahora el RLS sí nos deja pasar)
      const { data, error } = await supabase
        .from('hermanos')
        .select(`
          id, nombre, apellido, grado, saldo, activo, exento, estado,
          email, telefono, tipos_cuota (nombre)
        `)
        .order('apellido')

      if (!error && data) {
        setHermanos(data)
      }
      setCargando(false)
    }

    cargarDatos()
  }, [])

  if (cargando) {
    return <p style={{ fontSize: '13px', color: '#888' }}>Cargando Cuadro Lógico...</p>
  }

  const activos = hermanos.filter(h => h.activo && h.estado === 'activo')
  const inactivos = hermanos.filter(h => !h.activo || h.estado !== 'activo')

  // Lógica de visualización según el rol
  const veFinanzas = rol === 'Tesorero' || rol === 'Venerable Maestro'
  const veContacto = rol === 'Secretario' || rol === 'Venerable Maestro'

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px' }}>
            Cuadro Lógico (Hermanos)
          </h1>
          <p style={{ fontSize: '13px', color: '#888' }}>
            {activos.length} activos · {inactivos.length} inactivos
          </p>
        </div>
        
        {/* Permite que tanto Sec como Tes o VM puedan agregar a alguien */}
        {(veFinanzas || veContacto) && (
          <Link href="/panel/tesoreria/hermanos/nuevo" style={estiloBotonPrimario}>
            + Nuevo hermano
          </Link>
        )}
      </div>

      {/* Activos */}
      <div style={estiloSeccion}>
        <p style={estiloTituloSeccion}>Hermanos activos</p>
        <TablaHermanos hermanos={activos} veFinanzas={veFinanzas} veContacto={veContacto} />
      </div>

      {/* Inactivos */}
      {inactivos.length > 0 && (
        <div style={estiloSeccion}>
          <p style={estiloTituloSeccion}>Inactivos / En sueños / Suspendidos</p>
          <TablaHermanos hermanos={inactivos} veFinanzas={veFinanzas} veContacto={veContacto} />
        </div>
      )}
    </div>
  )
}

function TablaHermanos({ hermanos, veFinanzas, veContacto }) {
  if (hermanos.length === 0) {
    return <p style={{ fontSize: '13px', color: '#888', padding: '1rem 0' }}>No hay hermanos en esta categoría.</p>
  }

  return (
    // El overflowX: 'auto' es la clave para que la tabla no rompa el diseño en celulares
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr>
            <th style={estiloTh}>Hermano</th>
            <th style={estiloTh}>Grado</th>
            
            {/* Columnas exclusivas de Secretaría / VM */}
            {veContacto && <th style={estiloTh}>Contacto</th>}

            {/* Columnas exclusivas de Tesorería / VM */}
            {veFinanzas && <th style={estiloTh}>Tipo de cuota</th>}
            {veFinanzas && <th style={estiloTh}>Saldo</th>}
            {veFinanzas && <th style={estiloTh}>Estado Fin.</th>}
            
            <th style={estiloTh}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {hermanos.map((h, i) => (
            <tr key={h.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : '#fafaf8' }}>
              <td style={estiloTd}><span style={{ fontWeight: '500' }}>{h.apellido}, {h.nombre}</span></td>
              <td style={estiloTd}>{h.grado}°</td>
              
              {/* Datos Secretaría */}
              {veContacto && (
                <td style={{...estiloTd, fontSize: '11px', color: '#666'}}>
                  {h.email || 'Sin correo'}<br/>
                  {h.telefono || 'Sin teléfono'}
                </td>
              )}

              {/* Datos Tesorería */}
              {veFinanzas && <td style={estiloTd}>{h.tipos_cuota?.nombre || '—'}</td>}
              {veFinanzas && (
                <td style={estiloTd}>
                  <span style={{ color: h.exento ? '#854F0B' : h.saldo >= 0 ? '#3B6D11' : '#A32D2D', fontWeight: '500' }}>
                    {h.exento ? 'Exento' : formatPesos(h.saldo)}
                  </span>
                </td>
              )}
              {veFinanzas && <td style={estiloTd}><Badge hermano={h} /></td>}
              
              <td style={estiloTd}>
                {/* Cambié la ruta para que apunte al nuevo panel */}
                <Link href={`/panel/tesoreria/hermanos/${h.id}`} style={estiloBotonAccion}>
                  Ver detalle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Badge({ hermano }) {
  if (!hermano.activo || hermano.estado !== 'activo') {
    const labels = {
      suspendido_201: 'Art. 201',
      en_suenos: 'En sueños',
      renunciado: 'Renunciado',
      baja: 'Baja'
    }
    return <span style={{ ...estiloBadge, background: '#F1EFE8', color: '#444441' }}>
      {labels[hermano.estado] || 'Inactivo'}
    </span>
  }
  if (hermano.exento) return <span style={{ ...estiloBadge, background: '#FAEEDA', color: '#633806' }}>Exento</span>
  if (hermano.saldo >= 0) return <span style={{ ...estiloBadge, background: '#EAF3DE', color: '#27500A' }}>A plomo</span>
  return <span style={{ ...estiloBadge, background: '#FCEBEB', color: '#791F1F' }}>En deuda</span>
}

function formatPesos(monto) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monto)
}

const estiloSeccion = { backgroundColor: '#ffffff', border: '0.5px solid #e8e6e0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }
const estiloTituloSeccion = { fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }
const estiloTh = { textAlign: 'left', padding: '8px 10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e8e6e0', fontSize: '12px', whiteSpace: 'nowrap' }
const estiloTd = { padding: '10px 10px', borderBottom: '0.5px solid #f0efe9', color: '#1a1a2e', verticalAlign: 'middle', whiteSpace: 'nowrap' }
const estiloBadge = { display: 'inline-block', fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500' }
const estiloBotonPrimario = { fontSize: '13px', padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#1a1a2e', color: '#ffffff', textDecoration: 'none', cursor: 'pointer' }
const estiloBotonAccion = { fontSize: '11px', padding: '4px 10px', borderRadius: '8px', border: '0.5px solid #c8c5b8', backgroundColor: 'transparent', color: '#666', textDecoration: 'none' }
// Agregamos whiteSpace: 'nowrap' para evitar que el texto o los botones se partan en dos
