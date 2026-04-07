import { NextResponse } from 'next/server'

export async function POST(request) {
  const { usuario, password } = await request.json()

  const usuarioCorrecto = process.env.ADMIN_USER
  const passwordCorrecta = process.env.ADMIN_PASSWORD

  console.log("Credenciales en servidor:", usuarioCorrecto, passwordCorrecta)

  if (usuario === usuarioCorrecto && password === passwordCorrecta) {
    const response = NextResponse.json({ ok: true })

    // Seteamos una cookie de sesión que dura 8 horas usando la clave secreta
    response.cookies.set('sanitas_session', process.env.SESSION_SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8
    })

    return response
  }

  return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
}