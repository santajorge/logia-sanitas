'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardTesoro() {
  const [stats, setStats] = useState({ activos: 0, deudaTotal: 0, ingresosMes: 0, egresosMes: 0 })
  const [ultimosIngresos, setUltimosIngresos] = useState([])
  const [ultimosEgresos, setUltimosEgresos] = useState([])
  const [cargando, setCargando] = useState(true)

  // Calcular mes actual
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const mesActual = meses[new Date().getMonth()]

  useEffect(() => {
    async function cargarDatos() {
      // 1. Stats Generales
      const { data: hermanos } = await supabase.from('hermanos').select('saldo, activo, estado')
      let activos = 0, deudaTotal = 0
      if (hermanos) {
        activos = hermanos.filter(h => h.activo && h.estado === 'activo').length
        deudaTotal = hermanos.reduce((acc, h) => (h.saldo < 0 ? acc + Math.abs(h.saldo) : acc), 0)
      }

      // 2. Mes actual (Ingresos y Egresos)
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { data: pagos } = await supabase.from('pagos').select('monto').gte('fecha', inicioMes)
      const { data: ingresosV } = await supabase.from('ingresos_varios').select('monto, descripcion, fecha').gte('fecha', inicioMes)
      const { data: egresos } = await supabase.from('egresos').select('monto, descripcion, fecha').gte('fecha', inicioMes)

      const totalPagos = pagos?.reduce((acc, p) => acc + Number(p.monto), 0) || 0
      const totalIngresosV = ingresosV?.reduce((acc, i) => acc + Number(i.monto), 0) || 0
      const egresosMes = egresos?.reduce((acc, e) => acc + Number(e.monto), 0) || 0
      
      setStats({ activos, deudaTotal, ingresosMes: totalPagos + totalIngresosV, egresosMes })

      // 3. Tablas de actividad reciente (Últimos 5)
      const { data: recientesIngresos } = await supabase.from('ingresos_varios').select('*').order('fecha', { ascending: false }).limit(5)
      const { data: recientesEgresos } = await supabase.from('egresos').select('*').order('fecha', { ascending: false }).limit(5)
      
      setUltimosIngresos(recientesIngresos || [])
      setUltimosEgresos(recientesEgresos || [])
      setCargando(false)
    }
    cargarDatos()
  }, [])

  const formatPesos = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monto)
  const formatFecha = (fecha) => new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })

  if (cargando) return <p style={{ fontSize: '13px', color: '#888' }}>Calculando finanzas...</p>

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px' }}>Dashboard de Tesorería</h1>
        <p style={{ fontSize: '13px', color: '#888' }}>Resumen financiero de {mesActual} (E.·. V.·.) y estado general del Taller.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Tarjeta label="Hermanos Activos" valor={stats.activos} color="#1a1a2e" />
        <Tarjeta label="Deuda a Recuperar" valor={formatPesos(stats.deudaTotal)} color="#A32D2D" />
        <Tarjeta label="Ingresos del Mes" valor={formatPesos(stats.ingresosMes)} color="#3B6D11" />
        <Tarjeta label="Egresos del Mes" valor={formatPesos(stats.egresosMes)} color="#A32D2D" />
      </div>

      {/* BLOQUE DE ACTIVIDAD RECIENTE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Tabla Últimos Ingresos Varios */}
        <div style={{ backgroundColor: '#ffffff', border: '0.5px solid #e8e6e0', borderRadius: '12px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', marginTop: 0 }}>Últimos Ingresos Varios</h3>
          {ultimosIngresos.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#aaa' }}>Sin movimientos recientes.</p>
          ) : (
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <tbody>
                {ultimosIngresos.map((i) => (
                  <tr key={i.id} style={{ borderBottom: '0.5px solid #f0efe9' }}>
                    <td style={{ padding: '8px 0', color: '#888', width: '40px' }}>{formatFecha(i.fecha)}</td>
                    <td style={{ padding: '8px', color: '#1a1a2e' }}>{i.descripcion}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600', color: '#3B6D11' }}>{formatPesos(i.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Tabla Últimos Egresos */}
        <div style={{ backgroundColor: '#ffffff', border: '0.5px solid #e8e6e0', borderRadius: '12px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', marginTop: 0 }}>Últimos Egresos</h3>
          {ultimosEgresos.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#aaa' }}>Sin movimientos recientes.</p>
          ) : (
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <tbody>
                {ultimosEgresos.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '0.5px solid #f0efe9' }}>
                    <td style={{ padding: '8px 0', color: '#888', width: '40px' }}>{formatFecha(e.fecha)}</td>
                    <td style={{ padding: '8px', color: '#1a1a2e' }}>{e.descripcion}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600', color: '#A32D2D' }}>- {formatPesos(e.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}

function Tarjeta({ label, valor, color }) {
  return (
    <div style={{ backgroundColor: '#ffffff', border: '0.5px solid #e8e6e0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ fontSize: '12px', color: '#888', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
      <p style={{ fontSize: '24px', fontWeight: '600', color: color, margin: 0 }}>{valor}</p>
    </div>
  )
}