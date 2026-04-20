'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { CalendarDays, Users, BookOpen, ChevronRight } from 'lucide-react'

export default function PanelIndex() {
  const [perfil, setPerfil] = useState(null)
  const [stats, setStats] = useState({ tenidas: 0, candidatos: 0 })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarDashboard() {
      // 1. Obtener usuario actual
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: hermano } = await supabase
          .from('hermanos')
          .select('nombre, apellido, rol_oficial, grado')
          .eq('user_id', session.user.id)
          .single()
        setPerfil(hermano)
      }

      // 2. Traer estadísticas rápidas
      const { count: countTenidas } = await supabase
        .from('tenidas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'abierta')

      const { count: countCandidatos } = await supabase
        .from('candidatos')
        .select('*', { count: 'exact', head: true })
        // Si querés que solo cuente los activos, podés agregar un .eq() acá

      setStats({
        tenidas: countTenidas || 0,
        candidatos: countCandidatos || 0
      })

      setCargando(false)
    }

    cargarDashboard()
  }, [])

  if (cargando) return <div style={{ padding: '2rem', color: '#888' }}>Cargando tablero...</div>

  return (
    <div style={{ position: 'relative', minHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* MARCA DE AGUA DEL LOGO EN EL FONDO */}
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none', zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-sanitas.png" alt="Sello Logia" style={{ width: '450px' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', width: '100%' }}>
        
        {/* SALUDO DINÁMICO */}
        <div style={{ marginBottom: '3rem', borderBottom: '1px solid #e8e6e0', paddingBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 8px' }}>
            ¡Bienvenido, {perfil?.rol_oficial ? perfil.rol_oficial : `H.·. ${perfil?.nombre}`}!
          </h1>
          <p style={{ fontSize: '15px', color: '#666', margin: 0 }}>
            Panel de Control Administrativo — Logia Sanitas Sanitatum N° 763.
          </p>
        </div>

        {/* TARJETAS DE ACCESO RÁPIDO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>

          <Link href="/panel/secretaria/tenidas" style={estiloTarjeta}>
            <div style={estiloIcono}><CalendarDays size={24} color="#CDA434" /></div>
            <div>
              <h3 style={estiloTituloTarjeta}>Tenidas Abiertas</h3>
              <p style={estiloValorTarjeta}>{stats.tenidas} en registro</p>
            </div>
            <ChevronRight size={20} color="#c8c5b8" style={{ marginLeft: 'auto' }} />
          </Link>

          <Link href="/panel/secretaria/candidatos" style={estiloTarjeta}>
            <div style={estiloIcono}><Users size={24} color="#CDA434" /></div>
            <div>
              <h3 style={estiloTituloTarjeta}>Candidatos</h3>
              <p style={estiloValorTarjeta}>{stats.candidatos} expedientes</p>
            </div>
            <ChevronRight size={20} color="#c8c5b8" style={{ marginLeft: 'auto' }} />
          </Link>

          <Link href="/panel/tesoreria/hermanos" style={estiloTarjeta}>
            <div style={estiloIcono}><BookOpen size={24} color="#CDA434" /></div>
            <div>
              <h3 style={estiloTituloTarjeta}>Cuadro Lógico</h3>
              <p style={estiloValorTarjeta}>Gestión del Taller</p>
            </div>
            <ChevronRight size={20} color="#c8c5b8" style={{ marginLeft: 'auto' }} />
          </Link>

        </div>
      </div>
    </div>
  )
}

const estiloTarjeta = { display: 'flex', alignItems: 'center', gap: '1.25rem', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e8e6e0', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', transition: 'all 0.2s', cursor: 'pointer' }
const estiloIcono = { backgroundColor: '#fafaf8', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const estiloTituloTarjeta = { fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px', fontWeight: '600' }
const estiloValorTarjeta = { fontSize: '16px', color: '#1a1a2e', fontWeight: '600', margin: 0 }