import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import RegistrarPagoForm from './RegistrarPagoForm'

async function obtenerHermano(id) {
  const { data } = await supabase
    .from('hermanos')
    .select(`
      *,
      tipos_cuota (
        id,
        nombre
      )
    `)
    .eq('id', id)
    .single()
  return data
}

async function obtenerPagos(hermanoId) {
  const { data } = await supabase
    .from('pagos')
    .select('*')
    .eq('hermano_id', hermanoId)
    .order('fecha', { ascending: false })
  return data || []
}

async function obtenerCuotaVigente(tipoCuotaId) {
  const hoy = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('cuotas')
    .select('importe, vigencia_desde')
    .eq('tipo_cuota_id', tipoCuotaId)
    .lte('vigencia_desde', hoy)
    .order('vigencia_desde', { ascending: false })
    .limit(1)
    .single()
  return data
}

export default async function PerfilHermanoPage({ params }) {
  const { id } = await params
  const hermano = await obtenerHermano(id)

  if (!hermano) notFound()

  const pagos = await obtenerPagos(id)
  const cuotaVigente = hermano.tipos_cuota?.id
    ? await obtenerCuotaVigente(hermano.tipos_cuota.id)
    : null

  const estadoColor = hermano.exento
    ? { bg: '#FAEEDA', text: '#633806', label: 'Exento' }
    : hermano.saldo >= 0
    ? { bg: '#EAF3DE', text: '#27500A', label: 'A plomo' }
    : { bg: '#FCEBEB', text: '#791F1F', label: 'En deuda' }

  return (
    <div style={{ maxWidth: '700px' }}>

      {/* Volver */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/tesoro" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>
          ← Volver al panel
        </Link>
      </div>

      {/* Encabezado del perfil */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '0.5px solid #e8e6e0',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px' }}>
            {hermano.apellido}, {hermano.nombre}
          </h1>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
            Grado {hermano.grado}° · {hermano.tipos_cuota?.nombre || '—'}
            {cuotaVigente && ` · Cuota vigente: ${formatPesos(cuotaVigente.importe)}`}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {hermano.email && (
              <span style={{ fontSize: '12px', color: '#666' }}>✉ {hermano.email}</span>
            )}
            {hermano.telefono && (
              <span style={{ fontSize: '12px', color: '#666' }}>· ☎ {hermano.telefono}</span>
            )}
          </div>
        </div>

        {/* Saldo y estado */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: estadoColor.bg,
            color: estadoColor.text,
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            {estadoColor.label}
          </div>
          <p style={{
            fontSize: '24px',
            fontWeight: '500',
            color: hermano.exento ? '#854F0B' : hermano.saldo >= 0 ? '#3B6D11' : '#A32D2D'
          }}>
            {hermano.exento ? 'Exento' : formatPesos(hermano.saldo)}
          </p>
          {hermano.exento && hermano.exento_hasta && (
            <p style={{ fontSize: '11px', color: '#888' }}>
              hasta {formatFecha(hermano.exento_hasta)}
            </p>
          )}
          {hermano.exento && hermano.exento_motivo && (
            <p style={{ fontSize: '11px', color: '#888', maxWidth: '200px' }}>
              {hermano.exento_motivo}
            </p>
          )}
        </div>
      </div>

      {/* Registrar pago */}
      {!hermano.exento && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '0.5px solid #e8e6e0',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1rem'
        }}>
          <p style={estiloTituloSeccion}>Registrar pago</p>
          <RegistrarPagoForm
            hermanoId={hermano.id}
            cuotaVigente={cuotaVigente?.importe || 0}
          />
        </div>
      )}

      {/* Historial de pagos */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '0.5px solid #e8e6e0',
        borderRadius: '12px',
        padding: '1.25rem',
      }}>
        <p style={estiloTituloSeccion}>Historial de pagos</p>

        {pagos.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#888', padding: '1rem 0', textAlign: 'center' }}>
            No hay pagos registrados todavía.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {['Fecha', 'Monto', 'Registrado por', 'Notas'].map(col => (
                  <th key={col} style={estiloTh}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago, i) => (
                <tr key={pago.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : '#fafaf8' }}>
                  <td style={estiloTd}>{formatFecha(pago.fecha)}</td>
                  <td style={{ ...estiloTd, color: '#3B6D11', fontWeight: '500' }}>
                    +{formatPesos(pago.monto)}
                  </td>
                  <td style={estiloTd}>{pago.registrado_por}</td>
                  <td style={{ ...estiloTd, color: '#888' }}>{pago.notas || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────

function formatPesos(monto) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(monto)
}

function formatFecha(fecha) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

// ─── Estilos ──────────────────────────────────────────────────

const estiloTituloSeccion = {
  fontSize: '13px',
  fontWeight: '500',
  color: '#888',
  marginBottom: '1rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const estiloTh = {
  textAlign: 'left',
  padding: '8px 10px',
  fontWeight: '500',
  color: '#888',
  borderBottom: '0.5px solid #e8e6e0',
  fontSize: '12px'
}

const estiloTd = {
  padding: '10px 10px',
  borderBottom: '0.5px solid #f0efe9',
  color: '#1a1a2e',
  verticalAlign: 'middle'
}