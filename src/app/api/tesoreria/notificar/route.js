import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const CRON_SECRET = process.env.CRON_SECRET

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'
]

export async function GET(request) {

  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (!secret || secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const ahora = new Date()
  const mesActual = MESES[ahora.getMonth()]
  const anioActual = ahora.getFullYear()
  const hoy = ahora.toISOString().split('T')[0]
  const aliasTransferencia = process.env.ALIAS_TRANSFERENCIA || 'consultar con el tesorero'

  const resultados = {
    enviados: 0,
    sin_email: 0,
    errores: [],
  }

  try {

    const { data: hermanos, error: errHermanos } = await supabase
      .from('hermanos')
      .select(`
        id,
        nombre,
        apellido,
        email,
        saldo,
        exento,
        exento_hasta,
        exento_motivo,
        tipo_cuota_id,
        tipos_cuota (
          nombre
        )
      `)
      .eq('activo', true)
      .eq('estado', 'activo')

    if (errHermanos) throw errHermanos

    for (const hermano of hermanos) {

      if (!hermano.email) {
        resultados.sin_email++
        continue
      }

      let estadoTexto = ''
      let estadoColor = ''
      let mensajeEstado = ''

      if (hermano.exento) {
        estadoTexto = 'Exento de capita'
        estadoColor = '#854F0B'
        const hasta = hermano.exento_hasta
          ? new Date(hermano.exento_hasta + 'T00:00:00').toLocaleDateString('es-AR')
          : 'fecha indefinida'
        mensajeEstado = `Tu exención de capita está vigente hasta el ${hasta}.`
        if (hermano.exento_motivo) {
          mensajeEstado += ` Motivo: ${hermano.exento_motivo}.`
        }
      } else if (hermano.saldo >= 0) {
        estadoTexto = 'A plomo'
        estadoColor = '#3B6D11'
        mensajeEstado = 'Tu situación con el tesoro está al día. No tenés deuda pendiente.'
      } else {
        estadoTexto = 'Con deuda'
        estadoColor = '#A32D2D'
        const deuda = Math.abs(hermano.saldo)
        mensajeEstado = `Tenés una deuda de ${formatPesos(deuda)} con el tesoro del taller. Te pedimos que regularices tu situación a la brevedad.`
      }

      const { data: cuota } = await supabase
        .from('cuotas')
        .select('importe')
        .eq('tipo_cuota_id', hermano.tipo_cuota_id)
        .lte('vigencia_desde', hoy)
        .order('vigencia_desde', { ascending: false })
        .limit(1)
        .single()

      const importeCuota = cuota ? formatPesos(cuota.importe) : 'a consultar'

      const { error: errMail } = await resend.emails.send({
        from: 'Tesorería Logia Sanitas <tesoro@logiasanitas763.com.ar>',
        to: hermano.email,
        subject: `Estado de cuenta — ${mesActual} ${anioActual} (e.·.v.·.)`,
        html: templateMail({
          nombre: hermano.nombre,
          apellido: hermano.apellido,
          tipoCuota: hermano.tipos_cuota?.nombre || '—',
          importeCuota,
          saldo: hermano.saldo,
          estadoTexto,
          estadoColor,
          mensajeEstado,
          mesActual,
          anioActual,
          exento: hermano.exento,
          aliasTransferencia,
        })
      })

      if (errMail) {
        resultados.errores.push(`Error enviando a ${hermano.email}: ${errMail.message}`)
        continue
      }

      await supabase.from('auditoria').insert({
        accion: 'recordatorio_enviado',
        hermano_id: hermano.id,
        detalle: `Recordatorio mensual enviado a ${hermano.email} — ${mesActual} ${anioActual}`,
        usuario: 'sistema'
      })

      resultados.enviados++
    }

    return NextResponse.json({
      ok: true,
      fecha: hoy,
      ...resultados,
      mensaje: `Notificaciones completadas. ${resultados.enviados} mails enviados, ${resultados.sin_email} hermanos sin email.`
    })

  } catch (error) {
    console.error('Error en notificaciones:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

// ─── Template del mail ────────────────────────────────────────

function templateMail({
  nombre, apellido, tipoCuota, importeCuota,
  saldo, estadoTexto, estadoColor, mensajeEstado,
  mesActual, anioActual, exento, aliasTransferencia
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Estado de cuenta</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f4f0;font-family:system-ui,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f4f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- ENCABEZADO -->
          <tr>
            <td style="background-color:#1a1a2e;border-radius:12px 12px 0 0;padding:24px 32px;">
              <p style="margin:0;font-size:11px;color:#9e9b8e;letter-spacing:0.05em;">
                A.·.L.·.G.·.D.·.G.·.A.·.D.·.U.·.
              </p>
              <p style="margin:6px 0 0;font-size:18px;font-weight:500;color:#ffffff;">
                Logia Sanitas Sanitatum N°763
              </p>
              <p style="margin:2px 0 0;font-size:12px;color:#9e9b8e;">
                Bajo los auspicios de la Gran Logia de la Argentina de L.·.y A.·.M.·.
              </p>
            </td>
          </tr>

          <!-- CUERPO -->
          <tr>
            <td style="background-color:#ffffff;padding:32px;">

              <p style="margin:0 0 8px;font-size:13px;color:#888;">
                Estado de cuenta — ${mesActual} ${anioActual} (e.·.v.·.)
              </p>
              <p style="margin:0 0 24px;font-size:20px;font-weight:500;color:#1a1a2e;">
                Hola, H.·. ${apellido}
              </p>

              <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.6;">
                Te enviamos el resumen de tu situación con el tesoro del taller
                correspondiente al mes de ${mesActual} ${anioActual} (e.·.v.·.).
              </p>

              <!-- ESTADO -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background-color:#f5f4f0;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;">
                      Tu estado actual
                    </p>
                    <p style="margin:0 0 8px;font-size:22px;font-weight:500;color:${estadoColor};">
                      ${estadoTexto}
                    </p>
                    ${!exento ? `
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;">
                      Saldo con el tesoro
                    </p>
                    <p style="margin:0;font-size:18px;font-weight:500;color:${estadoColor};">
                      ${formatPesos(saldo)}
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.6;">
                ${mensajeEstado}
              </p>

              <!-- CUOTA Y DATOS DE PAGO -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border:0.5px solid #e8e6e0;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 24px;border-bottom:0.5px solid #e8e6e0;">
                    <p style="margin:0;font-size:12px;color:#888;">Tipo de capita</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a2e;">${tipoCuota}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:0.5px solid #e8e6e0;">
                    <p style="margin:0;font-size:12px;color:#888;">Importe mensual vigente</p>
                    <p style="margin:4px 0 0;font-size:14px;font-weight:500;color:#1a1a2e;">${importeCuota}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;background-color:#EAF3DE;border-radius:0 0 8px 8px;">
                    <p style="margin:0 0 8px;font-size:12px;color:#3B6D11;text-transform:uppercase;letter-spacing:0.05em;font-weight:500;">
                      Datos para transferencia
                    </p>
                    <p style="margin:0 0 4px;font-size:12px;color:#888;">Alias</p>
                    <p style="margin:0 0 12px;font-size:16px;font-weight:500;color:#1a1a2e;letter-spacing:0.02em;">
                      ${aliasTransferencia}
                    </p>
                    <p style="margin:0;font-size:12px;color:#555;line-height:1.5;">
                      Una vez realizada la transferencia, recordá enviar el comprobante
                      al Tesorero del taller para que quede registrado en el sistema.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
                Este mensaje es generado automáticamente por el sistema de tesorería
                de la Logia Sanitas Sanitatum N°763. Si tenés consultas, comunicate
                con el Tesorero del taller.
              </p>

            </td>
          </tr>

          <!-- PIE -->
          <tr>
            <td style="background-color:#f0efe9;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#888;">
                Logia Sanitas Sanitatum N°763 · Rosario, Santa Fe
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#aaa;">
                Bajo los auspicios de la Gran Logia de la Argentina de Libres y Aceptados Masones
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `
}

// ─── Helper ───────────────────────────────────────────────────

function formatPesos(monto) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(monto)
}