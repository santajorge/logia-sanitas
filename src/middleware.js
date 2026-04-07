import { NextResponse } from 'next/server'

export function middleware(request) {
  const session = request.cookies.get('sanitas_session')
  const { pathname } = request.nextUrl

  // Si intenta acceder al área reservada sin sesión válida, redirige al login
  if (pathname.startsWith('/tesoro')) {
    if (!session || session.value !== process.env.SESSION_SECRET) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/tesoro/:path*']
}