'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RegistrarPagoForm({ hermanoId, cuotaVigente }) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  const [form, setForm] = useState({
    monto: String(cuotaVigente || ''),
    fecha: new Date().toISOString().split('T')[0],
    notas: '',
    registrado_por: '',
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    setExito(false)

    if (!form.monto || parseFloat(form.monto) <= 0) {
      setError('El monto debe ser mayor a cero.')
      setCargando(false)
      return
    }
    if (!form.registrado_por.trim()) {
      setError('Indicá quién está registrando este pago.')
      setCargando(false)
      return
    }

    const { error: err } = await supabase.from('pagos').insert({
      hermano_id: hermanoId,
      monto: parseFloat(form.monto),
      fecha: form.fecha,
      notas: form.notas.trim() || null,
      registrado_por: form.registrado_por.trim(),
    })

    if (err) {
      setError('Ocurrió un error al guardar. Intentá de nuevo.')
      console.error(err)
      setCargando(false)
      return
    }

    setExito(true)
    setForm(f => ({ ...f, monto: String(cuotaVigente || ''), notas: '' }))
    setCargando(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>

      {error && (
        <div style={{
          backgroundColor: '#FCEBEB', color: '#791F1F',
          padding: '0.75rem 1rem', borderRadius: '8px',
          fontSize: '13px', marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {exito && (
        <div style={{
          backgroundColor: '#EAF3DE', color: '#27500A',
          padding: '0.75rem 1rem', borderRadius: '8px',
          fontSize: '13px', marginBottom: '1rem'
        }}>
          Pago registrado correctamente. El saldo fue actualizado.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={estiloLabel}>Monto *</label>
          <input
            name="monto"
            type="number"
            min="0"
            step="1"
            value={form.monto}
            onChange={handleChange}
            style={estiloInput}
          />
          {cuotaVigente > 0 && (
            <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
              Cuota vigente: {new Intl.NumberFormat('es-AR', {
                style: 'currency', currency: 'ARS', maximumFractionDigits: 0
              }).format(cuotaVigente)}
            </p>
          )}
        </div>
        <div>
          <label style={estiloLabel}>Fecha *</label>
          <input
            name="fecha"
            type="date"
            value={form.fecha}
            onChange={handleChange}
            style={estiloInput}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={estiloLabel}>Registrado por *</label>
          <input
            name="registrado_por"
            value={form.registrado_por}
            onChange={handleChange}
            placeholder="Nombre del tesorero"
            style={estiloInput}
          />
        </div>
        <div>
          <label style={estiloLabel}>Notas (opcional)</label>
          <input
            name="notas"
            value={form.notas}
            onChange={handleChange}
            placeholder="Ej: Pago meses enero y febrero"
            style={estiloInput}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={cargando}
        style={{
          fontSize: '13px',
          padding: '8px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#1a1a2e',
          color: '#ffffff',
          cursor: cargando ? 'not-allowed' : 'pointer',
          opacity: cargando ? 0.6 : 1
        }}
      >
        {cargando ? 'Guardando...' : 'Confirmar pago'}
      </button>

    </form>
  )
}

const estiloLabel = {
  display: 'block',
  fontSize: '12px',
  color: '#666',
  marginBottom: '4px'
}

const estiloInput = {
  width: '100%',
  padding: '8px 10px',
  fontSize: '13px',
  border: '0.5px solid #c8c5b8',
  borderRadius: '8px',
  backgroundColor: '#fafaf8',
  color: '#1a1a2e',
  boxSizing: 'border-box'
}