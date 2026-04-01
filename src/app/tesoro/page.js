import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Esta función obtiene todos los datos que necesita el panel
async function obtenerDatos() {

  // Traemos todos los hermanos activos junto con su tipo de cuota
  const { data: hermanos } = await supabase
    .from('hermanos')
    .select(`
      id,
      nombre,
      apellido,
      grado,
      saldo,
      activo,
      exento,
      exento_hasta,
      tipos_cuota (
        nombre
      )
    `)
    .eq('activo', true)
    .order('apellido')

  // Traemos los egresos del mes actual
  const ahora = new Date()
  const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    .toISOString().split('T')[0]
  const ultimoDiaMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0)
    .toISOString().split('T')[0]

  const { data: egresos } = await supabase
    .from('egresos')
    .select('monto, categoria, descripcion, fecha')
    .gte('fecha', primerDiaMes)
    .lte('fecha', ultimoDiaMes)
    .order('fecha', { ascending: false })

  // Traemos los pagos del mes actual
  const { data: pagosMes } = await supabase
    .from('pagos')
    .select('monto')
    .gte('fecha', primerDiaMes)
    .lte('fecha', ultimoDiaMes)

  return { hermanos: hermanos || [], egresos: egresos || [], pagosMes: pagosMes || [] }
}

export default async function TesoroPage() {
  const { hermanos, egresos, pagosMes } = await obtenerDatos()

  // Calculamos las métricas
  const totalHermanos = hermanos.length
  const alDia = hermanos.filter(h => !h.exento && h.saldo >= 0).length
  const conDeuda = hermanos.filter(h => !h.exento && h.saldo < 0).length
  const exentos = hermanos.filter(h => h.exento).length

  const totalIngresosMes = pagosMes.reduce((acc, p) => acc + Number(p.monto), 0)
  const totalEgresosMes = egresos.reduce((acc, e) => acc + Number(e.monto), 0)
  const balanceMes = totalIngresosMes - totalEgresosMes
  const deudaTotal = hermanos
    .filter(h => h.saldo < 0)
    .reduce((acc, h) => acc + Number(h.saldo), 0)

  const meses = ['enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre']
  const mesActual = `${meses[new Date().getMonth()]} ${new Date().getFullYear()}`

  return (
    <div>

      {/* ENCABEZADO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px' }}>
            Panel del Tesorero
          </h1>
          <p style={{ fontSize: '13px', color: '#888' }}>
            {mesActual} (e.·.v.·.)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/tesoro/hermanos/nuevo" style={estiloBotonPrimario}>
            + Nuevo hermano
          </Link>
          <Link href="/tesoro/egresos/nuevo" style={estiloBoton}>
            + Registrar egreso
          </Link>
        </div>
      </div>

      {/* MÉTRICAS DE HERMANOS */}
      <div style={estiloGrilla4}>
        <Metrica label="Hermanos activos" valor={totalHermanos} />
        <Metrica label="Al día" valor={alDia} color="#27500A" bg="#EAF3DE" />
        <Metrica label="Con deuda" valor={conDeuda} color="#791F1F" bg="#FCEBEB" />
        <Metrica label="Exentos" valor={exentos} color="#633806" bg="#FAEEDA" />
      </div>

      {/* MÉTRICAS FINANCIERAS */}
      <div style={{ ...estiloGrilla4, marginBottom: '1.5rem' }}>
        <Metrica label="Ingresos del mes" valor={formatPesos(totalIngresosMes)} color="#27500A" bg="#EAF3DE" />
        <Metrica label="Egresos del mes" valor={formatPesos(totalEgresosMes)} color="#791F1F" bg="#FCEBEB" />
        <Metrica
          label="Balance mensual"
          valor={formatPesos(balanceMes)}
          color={balanceMes >= 0 ? '#27500A' : '#791F1F'}
          bg={balanceMes >= 0 ? '#EAF3DE' : '#FCEBEB'}
        />
        <Metrica label="Deuda total del taller" valor={formatPesos(deudaTotal)} color="#791F1F" bg="#FCEBEB" />
      </div>

      {/* TABLA DE HERMANOS */}
      <div style={estiloSeccion}>
        <div style={estiloEncabezadoSeccion}>
          <span style={estiloTituloSeccion}>Estado de cuenta — hermanos</span>
          <Link href="/tesoro/hermanos/nuevo" style={estiloBoton}>
            + Nuevo hermano
          </Link>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['Hermano', 'Grado', 'Tipo de cuota', 'Saldo', 'Estado', 'Acciones'].map(col => (
                <th key={col} style={estiloTh}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hermanos.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                  No hay hermanos cargados todavía.
                </td>
              </tr>
            ) : (
              hermanos.map((h, i) => (
                <tr key={h.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : '#fafaf8' }}>
                  <td style={estiloTd}>
                    <span style={{ fontWeight: '500' }}>{h.apellido}, {h.nombre}</span>
                  </td>
                  <td style={estiloTd}>{h.grado}°</td>
                  <td style={estiloTd}>{h.tipos_cuota?.nombre || '—'}</td>
                  <td style={estiloTd}>
                    <span style={{ color: h.exento ? '#854F0B' : h.saldo >= 0 ? '#3B6D11' : '#A32D2D', fontWeight: '500' }}>
                      {h.exento ? 'Exento' : formatPesos(h.saldo)}
                    </span>
                  </td>
                  <td style={estiloTd}>
                    <Badge hermano={h} />
                  </td>
                  <td style={estiloTd}>
                    <Link href={`/tesoro/hermanos/${h.id}`} style={estiloBotonAccion}>
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TABLA DE EGRESOS */}
      <div style={estiloSeccion}>
        <div style={estiloEncabezadoSeccion}>
          <span style={estiloTituloSeccion}>Egresos del mes</span>
          <Link href="/tesoro/egresos/nuevo" style={estiloBoton}>
            + Nuevo egreso
          </Link>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['Fecha', 'Categoría', 'Descripción', 'Monto'].map(col => (
                <th key={col} style={estiloTh}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {egresos.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                  No hay egresos registrados este mes.
                </td>
              </tr>
            ) : (
              egresos.map((e, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : '#fafaf8' }}>
                  <td style={estiloTd}>{formatFecha(e.fecha)}</td>
                  <td style={estiloTd}><BadgeCategoria categoria={e.categoria} /></td>
                  <td style={estiloTd}>{e.descripcion}</td>
                  <td style={{ ...estiloTd, color: '#A32D2D', fontWeight: '500' }}>
                    -{formatPesos(e.monto)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

// ─── Componentes auxiliares ───────────────────────────────────

function Metrica({ label, valor, color, bg }) {
  return (
    <div style={{
      backgroundColor: bg || '#f0efe9',
      borderRadius: '8px',
      padding: '1rem',
    }}>
      <p style={{ fontSize: '12px', color: color || '#666', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontSize: '22px', fontWeight: '500', color: color || '#1a1a2e' }}>{valor}</p>
    </div>
  )
}

function Badge({ hermano }) {
  if (hermano.exento) {
    return <span style={{ ...estiloBadge, background: '#FAEEDA', color: '#633806' }}>Exento</span>
  }
  if (hermano.saldo >= 0) {
    return <span style={{ ...estiloBadge, background: '#EAF3DE', color: '#27500A' }}>A plomo</span>
  }
  return <span style={{ ...estiloBadge, background: '#FCEBEB', color: '#791F1F' }}>En deuda</span>
}

function BadgeCategoria({ categoria }) {
  const estilos = {
    'SFU': { background: '#EEEDFE', color: '#3C3489' },
    'Gran Logia': { background: '#E1F5EE', color: '#085041' },
    'Gastos varios': { background: '#F1EFE8', color: '#444441' },
  }
  const estilo = estilos[categoria] || estilos['Gastos varios']
  return <span style={{ ...estiloBadge, ...estilo }}>{categoria}</span>
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

// ─── Estilos compartidos ──────────────────────────────────────

const estiloGrilla4 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
  marginBottom: '12px'
}

const estiloSeccion = {
  backgroundColor: '#ffffff',
  border: '0.5px solid #e8e6e0',
  borderRadius: '12px',
  padding: '1.25rem',
  marginBottom: '1rem'
}

const estiloEncabezadoSeccion = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem'
}

const estiloTituloSeccion = {
  fontSize: '15px',
  fontWeight: '500',
  color: '#1a1a2e'
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

const estiloBadge = {
  display: 'inline-block',
  fontSize: '11px',
  padding: '3px 8px',
  borderRadius: '20px',
  fontWeight: '500'
}

const estiloBoton = {
  fontSize: '13px',
  padding: '6px 14px',
  borderRadius: '8px',
  border: '0.5px solid #c8c5b8',
  backgroundColor: 'transparent',
  color: '#1a1a2e',
  textDecoration: 'none',
  cursor: 'pointer'
}

const estiloBotonPrimario = {
  fontSize: '13px',
  padding: '6px 14px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#1a1a2e',
  color: '#ffffff',
  textDecoration: 'none',
  cursor: 'pointer'
}

const estiloBotonAccion = {
  fontSize: '11px',
  padding: '4px 10px',
  borderRadius: '8px',
  border: '0.5px solid #c8c5b8',
  backgroundColor: 'transparent',
  color: '#666',
  textDecoration: 'none'
}