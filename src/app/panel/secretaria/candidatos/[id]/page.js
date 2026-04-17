'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LegajoCandidato() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id : params?.id
  const router = useRouter()

  const [candidato, setCandidato] = useState(null)
  const [hermanos, setHermanos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [mostrarCuartoAplomo, setMostrarCuartoAplomo] = useState(false)

  useEffect(() => {
    async function cargarDatos() {
      if (!id) return 

      const { data: cand } = await supabase.from('candidatos').select('*').eq('id', id).single()
      
      const { data: herms } = await supabase
        .from('hermanos')
        .select('id, nombre, apellido, email')
        .eq('activo', true)
        .eq('grado', 3) 

      if (cand) {
        setCandidato(cand)
        if (cand.aplomador_4_id) setMostrarCuartoAplomo(true)
      }
      if (herms) setHermanos(herms)

      setCargando(false)
    }

    cargarDatos()
  }, [id])

  const handleActualizarCampo = async (campo, valor) => {
    setGuardando(true)

    const { error } = await supabase
      .from('candidatos')
      .update({ [campo]: valor || null })
      .eq('id', id)

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar.' })
    } else {
      setCandidato(prev => ({ ...prev, [campo]: valor }))
      setMensaje({ tipo: 'exito', texto: 'Guardado correctamente.' })
      
      // Si cambiamos el aplomador, reseteamos su estado de notificado a false
      if (campo.includes('aplomador_') && valor) {
        const num = campo.split('_') // Saca el 1, 2, 3 o 4
        await supabase.from('candidatos').update({ [`aplomo_${num}_notificado`]: false }).eq('id', id)
        setCandidato(prev => ({ ...prev, [`aplomo_${num}_notificado`]: false }))
      }

      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000)
    }

    setGuardando(false)
  }

  // 📩 NUEVA FUNCIÓN: ENVÍO MANUAL DE MAIL
  const notificarAplomadorManual = async (num) => {
    setGuardando(true)
    const hermanoId = candidato[`aplomador_${num}_id`]
    const hermano = hermanos.find(h => h.id == hermanoId)

    if (!hermano?.email) {
      setMensaje({ tipo: 'error', texto: 'El hermano seleccionado no tiene email registrado.' })
      setGuardando(false)
      return
    }

    try {
      const res = await fetch('/api/secretaria/enviar-aplomo', {
        method: 'POST',
        body: JSON.stringify({
          email: hermano.email,
          nombreAplomador: hermano.nombre,
          candidato: `${candidato.nombre} ${candidato.apellido}`,
          telefonoCandidato: candidato.telefono
        })
      })

      if (res.ok) {
        // Si el mail salió bien, guardamos en la BD que ya fue notificado
        await handleActualizarCampo(`aplomo_${num}_notificado`, true)
        setMensaje({ tipo: 'exito', texto: `Se ha notificado oficialmente al Q.·.H.·. ${hermano.apellido}.` })
      } else {
        throw new Error('Falló el envío en la API')
      }
    } catch (error) {
      console.error(error)
      setMensaje({ tipo: 'error', texto: 'Hubo un problema al enviar el correo.' })
    }
    
    setGuardando(false)
  }

  const handleProgramarIniciacion = async () => {
    setGuardando(true)

    const { error } = await supabase
      .from('candidatos')
      .update({ estado: 'aprobado' })
      .eq('id', id)

    if (!error) {
      router.push('/panel/secretaria/candidatos')
      router.refresh()
    } else {
      setMensaje({ tipo: 'error', texto: 'Error al mover al candidato.' })
      setGuardando(false)
    }
  }

  if (cargando) return <p style={{ fontSize: '13px', color: '#888', padding: '2rem' }}>Abriendo legajo...</p>
  if (!candidato) return <p style={{ fontSize: '13px', color: '#A32D2D', padding: '2rem' }}>Error: Candidato no encontrado.</p>

  // 🧠 REGLAS DE NEGOCIO
  let pasaron30Dias = false
  if (candidato?.fecha_boletin) {
    const fecha = new Date(candidato.fecha_boletin)
    const hoy = new Date()
    pasaron30Dias = (hoy - fecha) / (1000 * 60 * 60 * 24) >= 30
  }

  const estadosAplomos = [
    candidato?.estado_aplomo_1,
    candidato?.estado_aplomo_2,
    candidato?.estado_aplomo_3,
    candidato?.estado_aplomo_4
  ]

  const hayDesfavorable = estadosAplomos.includes('desfavorable')

  const aplomosBaseFavorables =
    candidato?.estado_aplomo_1 === 'favorable' &&
    candidato?.estado_aplomo_2 === 'favorable' &&
    candidato?.estado_aplomo_3 === 'favorable'

  const tieneCuarto = !!candidato?.aplomador_4_id
  const cuartoOk = candidato?.estado_aplomo_4 === 'favorable'

  const aplomosFavorables = !hayDesfavorable && aplomosBaseFavorables && (!tieneCuarto || cuartoOk)
  const listoParaIniciar = pasaron30Dias && aplomosFavorables

  const cantidadAplomos = mostrarCuartoAplomo ? 4 : 3
  const aplomosVisibles = Array.from({ length: cantidadAplomos }, (_, i) => i + 1)

  return (
    <div style={{ maxWidth: '800px', paddingBottom: '2rem' }}>
      
      {/* CABECERA */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/panel/secretaria/candidatos" style={{ fontSize: '12px', color: '#666', textDecoration: 'none', marginBottom: '8px', display: 'inline-block' }}>
          ← Volver al Tablero
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>
            {candidato.nombre} {candidato.apellido}
          </h1>
          <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: '12px', backgroundColor: '#e8e6e0', color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Estado: {candidato.estado}
          </span>
        </div>
      </div>

      {mensaje.texto && (
        <div style={{ backgroundColor: mensaje.tipo === 'error' ? '#FCEBEB' : '#EAF3DE', color:  mensaje.tipo === 'error' ? '#791F1F' : '#27500A', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '13px', marginBottom: '1.5rem' }}>
          {mensaje.texto}
        </div>
      )}

      {/* BLOQUE 1 Y 2 */}
      <div style={{ backgroundColor: '#ffffff', border: '0.5px solid #e8e6e0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={estiloTituloSeccion}>Contacto Inicial</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div><span style={estiloLabel}>Email</span><p style={{ margin: '4px 0 0', fontSize: '14px', color: '#1a1a2e', fontWeight: '500' }}>{candidato.email || 'No registrado'}</p></div>
          <div><span style={estiloLabel}>Teléfono</span><p style={{ margin: '4px 0 0', fontSize: '14px', color: '#1a1a2e', fontWeight: '500' }}>{candidato.telefono || 'No registrado'}</p></div>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '0.5px solid #e8e6e0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={estiloTituloSeccion}>Circulación (Gran Secretaría)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div><label style={estiloLabel}>N° de Boletín</label><input type="text" defaultValue={candidato.boletin_nro || ''} onBlur={(e) => handleActualizarCampo('boletin_nro', e.target.value)} placeholder="Ej: 145/2026" style={estiloInput} /></div>
          <div><label style={estiloLabel}>Fecha de Publicación</label><input type="date" defaultValue={candidato.fecha_boletin || ''} onBlur={(e) => handleActualizarCampo('fecha_boletin', e.target.value)} style={estiloInput} /></div>
          <div style={{ paddingBottom: '8px' }}>
            {candidato.fecha_boletin ? ( pasaron30Dias ? <span style={{ fontSize: '12px', color: '#3B6D11', fontWeight: '600' }}>✓ Plazo de 30 días cumplido</span> : <span style={{ fontSize: '12px', color: '#CDA434', fontWeight: '600' }}>⏳ En período de tachas</span>) : (<span style={{ fontSize: '12px', color: '#888' }}>Esperando fecha...</span>)}
          </div>
        </div>
      </div>

      {/* BLOQUE 3: APLOMACIONES CON BOTÓN MANUAL */}
      <div style={{ backgroundColor: '#ffffff', border: '0.5px solid #e8e6e0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={estiloTituloSeccion}>Proceso de Aplomación</h3>
        
        {aplomosVisibles.map((num, index) => (
          <div key={num} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: index !== aplomosVisibles.length - 1 ? '1px solid #f0efe9' : 'none', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 250px' }}>
              <label style={estiloLabel}>Aplomador {num}</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select value={candidato[`aplomador_${num}_id`] || ''} onChange={(e) => handleActualizarCampo(`aplomador_${num}_id`, e.target.value)} style={{...estiloInput, flex: 1}}>
                  <option value="">-- Asignar Hermano --</option>
                  {hermanos.map(h => (<option key={h.id} value={h.id}>{h.nombre} {h.apellido}</option>))}
                </select>
                
                {/* BOTÓN O CARTEL DE NOTIFICACIÓN */}
                {candidato[`aplomador_${num}_id`] && (
                  candidato[`aplomo_${num}_notificado`] 
                    ? <span style={{ fontSize: '12px', color: '#3B6D11', fontWeight: '600', padding: '8px', whiteSpace: 'nowrap' }}>✅ Notificado</span>
                    : <button 
                        onClick={(e) => { e.preventDefault(); notificarAplomadorManual(num); }} 
                        disabled={guardando}
                        style={{ fontSize: '12px', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: guardando ? 'not-allowed' : 'pointer', fontWeight: '500', whiteSpace: 'nowrap' }}
                      >
                        📩 Notificar
                      </button>
                )}
              </div>
            </div>
            
            <div style={{ flex: '1 1 150px' }}>
              <label style={estiloLabel}>Dictamen</label>
              <select value={candidato[`estado_aplomo_${num}`] || 'pendiente'} onChange={(e) => handleActualizarCampo(`estado_aplomo_${num}`, e.target.value)} style={{ ...estiloInput, backgroundColor: candidato[`estado_aplomo_${num}`] === 'favorable' ? '#EAF3DE' : candidato[`estado_aplomo_${num}`] === 'desfavorable' ? '#FCEBEB' : candidato[`estado_aplomo_${num}`] === 'presentado' ? '#FFF4E5' : '#fafaf8' }}>
                <option value="pendiente">Pendiente</option>
                <option value="presentado">Presentado</option>
                <option value="favorable">Favorable</option>
                <option value="desfavorable">Desfavorable</option>
              </select>
            </div>
          </div>
        ))}

        {!mostrarCuartoAplomo ? (
          <button onClick={(e) => { e.preventDefault(); setMostrarCuartoAplomo(true); }} style={{ fontSize: '12px', color: '#1a1a2e', backgroundColor: '#f5f4f0', border: '1px solid #e8e6e0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
            + Requerir 4º Aplomo
          </button>
        ) : (
          <button onClick={(e) => { 
            e.preventDefault(); 
            setMostrarCuartoAplomo(false);
            handleActualizarCampo('aplomador_4_id', null);
            handleActualizarCampo('estado_aplomo_4', 'pendiente');
            handleActualizarCampo('aplomo_4_notificado', false);
          }} style={{ fontSize: '12px', color: '#A32D2D', backgroundColor: '#FCEBEB', border: '1px solid #FCEBEB', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
            Quitar 4º Aplomo
          </button>
        )}
      </div>

      {/* BLOQUE 4: ACCIONES FINALES */}
      <div style={{ backgroundColor: '#fafaf8', border: '1px solid #e8e6e0', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 250px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 4px' }}>Iniciación</h3>
          {hayDesfavorable && <p style={{ fontSize: '12px', color: '#A32D2D', margin: 0 }}>✖ Candidato rechazado (Aplomo desfavorable).</p>}
          {!hayDesfavorable && listoParaIniciar && <p style={{ fontSize: '12px', color: '#3B6D11', margin: 0 }}>✓ El candidato cumple todos los requisitos.</p>}
          {!hayDesfavorable && !listoParaIniciar && <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Faltan requisitos para habilitar la iniciación.</p>}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {listoParaIniciar && !hayDesfavorable && (
            <div>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Fecha Fijada *</label>
              <input type="date" value={candidato.fecha_iniciacion || ''} onChange={(e) => handleActualizarCampo('fecha_iniciacion', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #888', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#1a1a2e', backgroundColor: '#ffffff', fontWeight: '600' }} />
            </div>
          )}
          
          <button onClick={handleProgramarIniciacion} disabled={!listoParaIniciar || hayDesfavorable || guardando || !candidato?.fecha_iniciacion} style={{ fontSize: '13px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: (listoParaIniciar && !hayDesfavorable && candidato?.fecha_iniciacion) ? '#3B6D11' : '#c8c5b8', color: '#ffffff', cursor: (listoParaIniciar && !hayDesfavorable && candidato?.fecha_iniciacion) ? 'pointer' : 'not-allowed', fontWeight: '600', marginTop: (listoParaIniciar && !hayDesfavorable) ? '18px' : '0' }}>
            Aprobar y Mover al Tablero
          </button>
        </div>
      </div>

    </div>
  )
}

const estiloTituloSeccion = { fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', marginTop: 0 }
const estiloLabel = { display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '500' }
const estiloInput = { width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #c8c5b8', borderRadius: '8px', backgroundColor: '#fafaf8', color: '#1a1a2e', outline: 'none' }