'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Shield, CreditCard, FileText, CheckCircle, Clock, AlertCircle, BookOpen } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function MiPerfilPage() {
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  // ATENCIÓN: Seguimos usando tu email de prueba
  const { usuario, cargandoAuth } = useAuth()

  const cargarDatosPerfil = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('hermanos')
        .select(`
          id, nombre, apellido, email, telefono, grado, 
          fecha_iniciacion, fecha_aumento, fecha_exaltacion, created_at,
          pagos (id, monto, fecha),
          planchas (id, titulo, estado, fecha_presentacion, fecha_lectura),
          asistencia_instrucciones (
            presente,
            instrucciones (titulo, fecha)
          )
        `)
        .eq('email', usuario?.email)
        .single()

      if (error) throw error

      if (data) {
        // --- TESORERÍA ---
        const hoy = new Date()
        const mesActual = hoy.getMonth() + 1
        const anioActual = hoy.getFullYear()
        
        let estaAlDia = false
        let ultimoMesPagoStr = 'Sin registros'

        const pagos = data.pagos || []
        if (pagos.length > 0) {
          const pagosOrdenados = pagos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          const ultimoPago = pagosOrdenados

          const [yyyy, mm] = ultimoPago.fecha.split('T').split('-')
          const anioPago = parseInt(yyyy, 10)
          const mesPago = parseInt(mm, 10)

          estaAlDia = (anioPago > anioActual) || (anioPago === anioActual && mesPago >= mesActual)
          ultimoMesPagoStr = `${mesPago}/${anioPago}`
        }

        // --- TRAZADOS Y ASISTENCIA ---
        const planchas = data.planchas || []
        const asistencias = data.asistencia_instrucciones || []
        
        const clasesTotales = asistencias.length
        const clasesPresente = asistencias.filter(a => a.presente).length

        setPerfil({
          ...data,
          resumen: {
            estaAlDia,
            ultimoMesPago: ultimoMesPagoStr,
            planchasTotales: planchas.length,
            planchasLeidas: planchas.filter(p => p.estado === 'leida').length,
            planchasBajoMallete: planchas.filter(p => p.estado === 'bajo_mallete').length,
            clasesTotales,
            clasesPresente,
            asistenciaPorcentaje: clasesTotales > 0 ? Math.round((clasesPresente / clasesTotales) * 100) : 0
          }
        })
      }
    } catch (error) {
      console.error("Error al cargar el perfil:", error.message)
    } finally {
      setCargando(false)
    }
  }, [usuario?.email])

  useEffect(() => {
    if (usuario?.email) {
      cargarDatosPerfil()
    }
  }, [cargarDatosPerfil, usuario])

  // Si está cargando el login o los datos del perfil, mostramos el mensaje
  if (cargandoAuth || cargando) return <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Buscando tu expediente en Secretaría...</div>
  if (!perfil) return <div style={{ padding: '3rem', textAlign: 'center', color: '#A32D2D', fontWeight: '600' }}>No se pudo encontrar tu registro. Verificá que tu email esté correcto.</div>
  
  return (
    <div style={{ maxWidth: '1000px', paddingBottom: '3rem' }}>
      {/* Cabecera del Perfil */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '1.5rem', borderBottom: '1px solid #e8e6e0' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#fafaf8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #CDA434' }}>
          <User size={40} color="#1a1a2e" />
        </div>
        <div>
          <h1 style={{ fontSize: '28px', color: '#1a1a2e', margin: '0 0 4px', fontWeight: '600' }}>{perfil.nombre} {perfil.apellido}</h1>
          <p style={{ color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
            <Shield size={16} color="#CDA434" /> 
            {perfil.grado === 1 ? 'Aprendiz Masón' : perfil.grado === 2 ? 'Compañero Masón' : 'Maestro Masón'}
          </p>
        </div>
      </div>

      {/* Grid de Tarjetas de Estado */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Tarjeta de Tesorería */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e8e6e0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontWeight: '600' }}>Tesorería</h3>
            <CreditCard size={18} color="#CDA434" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            {perfil.resumen.estaAlDia ? (
              <CheckCircle color="#3B6D11" size={28} />
            ) : (
              <AlertCircle color="#A32D2D" size={28} />
            )}
            <span style={{ fontSize: '20px', fontWeight: '600', color: perfil.resumen.estaAlDia ? '#27500A' : '#A32D2D' }}>
              {perfil.resumen.estaAlDia ? 'A Plomo' : 'Deuda Pendiente'}
            </span>
          </div>
          <div style={{ backgroundColor: '#fafaf8', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f0efe9', marginBottom: perfil.resumen.estaAlDia ? '0' : '12px' }}>
             <p style={{ fontSize: '13px', color: '#666', margin: 0, display: 'flex', justifyContent: 'space-between' }}>
               <span>Último mes abonado:</span>
               <strong style={{ color: '#1a1a2e' }}>{perfil.resumen.ultimoMesPago}</strong>
             </p>
          </div>
          {!perfil.resumen.estaAlDia && (
            <p style={{ fontSize: '11px', color: '#888', margin: 'auto 0 0', textAlign: 'center', fontStyle: 'italic' }}>
              Para regularizar tu situación, comunicate con el H.·. Tesorero.
            </p>
          )}
        </div>

        {/* Tarjeta de Carrera Masónica */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e8e6e0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontWeight: '600' }}>Progresión</h3>
            <Clock size={18} color="#CDA434" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0efe9', paddingBottom: '8px' }}>
               <span style={{ fontSize: '13px', color: '#666' }}>Iniciación</span>
               <strong style={{ fontSize: '14px', color: '#1a1a2e' }}>{perfil.fecha_iniciacion ? new Date(perfil.fecha_iniciacion + 'T00:00:00').toLocaleDateString('es-AR') : 'Pendiente'}</strong>
             </div>
             
             {perfil.grado >= 2 && (
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0efe9', paddingBottom: '8px' }}>
                 <span style={{ fontSize: '13px', color: '#666' }}>Aumento de Salario</span>
                 <strong style={{ fontSize: '14px', color: '#1a1a2e' }}>{perfil.fecha_aumento ? new Date(perfil.fecha_aumento + 'T00:00:00').toLocaleDateString('es-AR') : 'Pendiente'}</strong>
               </div>
             )}
             
             {perfil.grado >= 3 && (
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '13px', color: '#666' }}>Exaltación</span>
                 <strong style={{ fontSize: '14px', color: '#1a1a2e' }}>{perfil.fecha_exaltacion ? new Date(perfil.fecha_exaltacion + 'T00:00:00').toLocaleDateString('es-AR') : 'Pendiente'}</strong>
               </div>
             )}
          </div>
        </div>

        {/* Tarjeta de Asistencia (NUEVA) */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e8e6e0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontWeight: '600' }}>Instrucción</h3>
            <BookOpen size={18} color="#CDA434" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             {/* Gráfico circular con CSS puro */}
             <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `conic-gradient(#3B6D11 ${perfil.resumen.asistenciaPorcentaje}%, #f0efe9 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '52px', height: '52px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a2e' }}>{perfil.resumen.asistenciaPorcentaje}%</span>
                </div>
             </div>
             <div>
               <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 2px' }}>Asistencia Global</p>
               {perfil.resumen.clasesTotales > 0 ? (
                 <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Has asistido a <strong>{perfil.resumen.clasesPresente}</strong> de {perfil.resumen.clasesTotales} clases.</p>
               ) : (
                 <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Aún no hay clases registradas.</p>
               )}
             </div>
          </div>
        </div>

        {/* Tarjeta de Trabajos y Planchas */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e8e6e0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontWeight: '600' }}>Trazados</h3>
            <FileText size={18} color="#CDA434" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: perfil.resumen.planchasBajoMallete > 0 ? '1fr 1fr 1fr' : '1fr 1fr', gap: '10px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#fafaf8', padding: '12px', borderRadius: '8px', border: '1px solid #f0efe9' }}>
              <p style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 4px' }}>{perfil.resumen.planchasTotales}</p>
              <p style={{ fontSize: '10px', color: '#888', margin: 0, fontWeight: '600' }}>TOTALES</p>
            </div>
            <div style={{ backgroundColor: '#EAF3DE', padding: '12px', borderRadius: '8px', border: '1px solid #b8d598' }}>
              <p style={{ fontSize: '22px', fontWeight: '700', color: '#27500A', margin: '0 0 4px' }}>{perfil.resumen.planchasLeidas}</p>
              <p style={{ fontSize: '10px', color: '#3B6D11', margin: 0, fontWeight: '600' }}>LEÍDOS</p>
            </div>
            {perfil.resumen.planchasBajoMallete > 0 && (
              <div style={{ backgroundColor: '#FCEBEB', padding: '12px', borderRadius: '8px', border: '1px solid #F8D7D7' }}>
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#A32D2D', margin: '0 0 4px' }}>{perfil.resumen.planchasBajoMallete}</p>
                <p style={{ fontSize: '10px', color: '#A32D2D', margin: 0, fontWeight: '600' }}>RECHAZADOS</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}