import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 0

async function obtenerDatos() {
  const ahora = new Date()
  const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split('T')[0]
  const ultimoDia = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).toISOString().split('T')[0]

  const [{ data: egresos }, { data: ingresos }] = await Promise.all([
    supabase.from('egresos').select('*').order('fecha', { ascending: false }),
    supabase.from('ingresos_varios').select('*').order('fecha', { ascending: false })
  ])

  return { egresos: egresos || [], ingresos: ingresos || [] }
}

export default async function EgresosPage() {
  const { egresos, ingresos } = await obtenerDatos()

  const totalEgresos = egresos.reduce((acc, e) => acc + Number(e.monto), 0)
  const totalIngresos = ingresos.reduce((acc, i) => acc + Number(i.monto), 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px' }}>
            Movimientos
          </h1>
          <p style={{ fontSize: '13px', color: '#888' }}>
            Egresos e ingresos varios del taller
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/tesoro/ingresos/nuevo" style={estiloBoton}>
            + Nuevo ingreso
          </Link>
          <Link href="/tesoro/egresos/nuevo" style={estiloBotonPrimario}>
            + Nuevo egreso
          </Link>
        </div>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '12px', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#EAF3DE', borderRadius: '8px', padding: '1rem' }}>
          <p style={{ fontSize: '12px', color: '#3B6D11', marginBottom: '6px' }}>Total ingresos varios</p>
          <p style={{ fontSize: '20px', fontWeight: '500', color: '#27500A' }}>{formatPesos(totalIngresos)}</p>
        </div>
        <div style={{ backgroundColor: '#FCEBEB', borderRadius: '8px', padding: '1rem' }}>
          <p style={{ fontSize: '12px', color: '#A32D2D', marginBottom: '6px' }}>Total egresos</p>
          <p style={{ fontSize: '20px', fontWeight: '500', color: '#791F1F' }}>{formatPesos(totalEgresos)}</p>
        </div>
        <div style={{ backgroundColor: totalIngresos - totalEgresos >= 0 ? '#EAF3DE' : '#FCEBEB', borderRadius: '8px', padding: '1rem' }}>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Balance</p>
          <p style={{ fontSize: '20px', fontWeight: '500', color: totalIngresos - totalEgresos >= 0 ? '#27500A' : '#791F1F' }}>
            {formatPesos(totalIngresos - totalEgresos)}
          </p>
        </div>
      </div>

      {/* Ingresos varios */}
      <div style={estiloSeccion}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <p style={estiloTituloSeccion}>Ingresos varios</p>
          <Link href="/tesoro/ingresos/nuevo" style={estiloBotonAccion}>+ Nuevo ingreso</Link>
        </div>
        {ingresos.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#888', padding: '1rem 0' }}>No hay ingresos varios registrados.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>{['Fecha', 'Categoría', 'Descripción', 'Monto', 'Registrado por'].map(col => (
                <th key={col} style={estiloTh}>{col}</th>
              ))}</tr>
            </thead>
            <tbody>
              {ingresos.map((item, i) => (
                <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : '#fafaf8' }}>
                  <td style={estiloTd}>{formatFecha(item.fecha)}</td>
                  <td style={estiloTd}><BadgeCategoria categoria={item.categoria} tipo="ingreso" /></td>
                  <td style={estiloTd}>{item.descripcion}</td>
                  <td style={{ ...estiloTd, color: '#3B6D11', fontWeight: '500' }}>+{formatPesos(item.monto)}</td>
                  <td style={estiloTd}>{item.registrado_por}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Egresos */}
      <div style={estiloSeccion}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <p style={estiloTituloSeccion}>Egresos</p>
          <Link href="/tesoro/egresos/nuevo" style={estiloBotonAccion}>+ Nuevo egreso</Link>
        </div>
        {egresos.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#888', padding: '1rem 0' }}>No hay egresos registrados.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>{['Fecha', 'Categoría', 'Descripción', 'Monto', 'Registrado por'].map(col => (
                <th key={col} style={estiloTh}>{col}</th>
              ))}</tr>
            </thead>
            <tbody>
              {egresos.map((item, i) => (
                <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : '#fafaf8' }}>
                  <td style={estiloTd}>{formatFecha(item.fecha)}</td>
                  <td style={estiloTd}><BadgeCategoria categoria={item.categoria} tipo="egreso" /></td>
                  <td style={estiloTd}>{item.descripcion}</td>
                  <td style={{ ...estiloTd, color: '#A32D2D', fontWeight: '500' }}>-{formatPesos(item.monto)}</td>
                  <td style={estiloTd}>{item.registrado_por}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function BadgeCategoria({ categoria, tipo }) {
  const estilosEgreso = {
    'SFU': { background: '#EEEDFE', color: '#3C3489' },
    'Gran Logia': { background: '#E1F5EE', color: '#085041' },
    'Gastos varios': { background: '#F1EFE8', color: '#444441' },
  }
  const estilosIngreso = {
    'Intereses': { background: '#EAF3DE', color: '#27500A' },
    'Donación': { background: '#E6F1FB', color: '#0C447C' },
    'Otros': { background: '#F1EFE8', color: '#444441' },
  }
  const estilos = tipo === 'ingreso' ? estilosIngreso : estilosEgreso
  const estilo = estilos[categoria] || { background: '#F1EFE8', color: '#444441' }
  return <span style={{ ...estiloBadge, ...estilo }}>{categoria}</span>
}

function formatPesos(monto) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monto)
}

function formatFecha(fecha) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const estiloSeccion = { backgroundColor: '#ffffff', border: '0.5px solid #e8e6e0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }
const estiloTituloSeccion = { fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '0', textTransform: 'uppercase', letterSpacing: '0.05em' }
const estiloTh = { textAlign: 'left', padding: '8px 10px', fontWeight: '500', color: '#888', borderBottom: '0.5px solid #e8e6e0', fontSize: '12px' }
const estiloTd = { padding: '10px 10px', borderBottom: '0.5px solid #f0efe9', color: '#1a1a2e', verticalAlign: 'middle' }
const estiloBadge = { display: 'inline-block', fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500' }
const estiloBotonPrimario = { fontSize: '13px', padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#1a1a2e', color: '#ffffff', textDecoration: 'none', cursor: 'pointer' }
const estiloBoton = { fontSize: '13px', padding: '8px 20px', borderRadius: '8px', border: '0.5px solid #c8c5b8', backgroundColor: 'transparent', color: '#1a1a2e', textDecoration: 'none', cursor: 'pointer' }
const estiloBotonAccion = { fontSize: '11px', padding: '4px 10px', borderRadius: '8px', border: '0.5px solid #c8c5b8', backgroundColor: 'transparent', color: '#666', textDecoration: 'none' }