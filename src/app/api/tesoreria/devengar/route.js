import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// Clave secreta para proteger este endpoint
// Solo puede llamarlo quien tenga esta clave
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request) {

  // Verificamos que la llamada venga con la clave correcta
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (!secret || secret !== CRON_SECRET) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    )
  }

  const hoy = new Date().toISOString().split('T')[0]
  const resultados = {
    devengados: 0,
    exentos_saltados: 0,
    errores: [],
  }

  try {

    // 1. Traemos todos los hermanos activos con su tipo de cuota
    const { data: hermanos, error: errHermanos } = await supabase
      .from('hermanos')
      .select(`
        id,
        nombre,
        apellido,
        saldo,
        exento,
        exento_hasta,
        tipo_cuota_id,
        tipos_cuota (
          id,
          nombre
        )
      `)
      .eq('activo', true)
      .eq('estado', 'activo')

    if (errHermanos) throw errHermanos

    // 2. Procesamos cada hermano
    for (const hermano of hermanos) {

      // Si está exento y la exención sigue vigente, lo saltamos
      if (hermano.exento) {
        if (!hermano.exento_hasta || hermano.exento_hasta >= hoy) {
          resultados.exentos_saltados++
          continue
        }
        // Si la exención venció, la levantamos automáticamente
        await supabase
          .from('hermanos')
          .update({ exento: false, exento_hasta: null })
          .eq('id', hermano.id)
      }

      // 3. Buscamos la cuota vigente para este hermano
      const { data: cuota, error: errCuota } = await supabase
        .from('cuotas')
        .select('importe, vigencia_desde')
        .eq('tipo_cuota_id', hermano.tipo_cuota_id)
        .lte('vigencia_desde', hoy)
        .order('vigencia_desde', { ascending: false })
        .limit(1)
        .single()

      if (errCuota || !cuota) {
        resultados.errores.push(`Sin cuota vigente: ${hermano.apellido}, ${hermano.nombre}`)
        continue
      }

      // 4. Descontamos la cuota del saldo del hermano
      const nuevoSaldo = Number(hermano.saldo) - Number(cuota.importe)

      const { error: errUpdate } = await supabase
        .from('hermanos')
        .update({ saldo: nuevoSaldo })
        .eq('id', hermano.id)

      if (errUpdate) {
        resultados.errores.push(`Error al actualizar: ${hermano.apellido}, ${hermano.nombre}`)
        continue
      }

      // 5. Registramos en auditoría
      await supabase.from('auditoria').insert({
        accion: 'devengamiento_cuota',
        hermano_id: hermano.id,
        monto: cuota.importe,
        detalle: `Devengamiento automático de ${hermano.tipos_cuota?.nombre} — $${cuota.importe.toLocaleString('es-AR')}. Saldo anterior: $${Number(hermano.saldo).toLocaleString('es-AR')}. Saldo nuevo: $${nuevoSaldo.toLocaleString('es-AR')}.`,
        usuario: 'sistema'
      })

      resultados.devengados++
    }

    // 6. Devolvemos el resultado del proceso
    return NextResponse.json({
      ok: true,
      fecha: hoy,
      ...resultados,
      mensaje: `Devengamiento completado. ${resultados.devengados} hermanos procesados, ${resultados.exentos_saltados} exentos saltados.`
    })

  } catch (error) {
    console.error('Error en devengamiento:', error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  }
}