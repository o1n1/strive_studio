// src/middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/types/database.types'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ====== RUTAS PÚBLICAS ====== (FIX: pathname exacto para '/')
  const rutasPublicas = ['/', '/login', '/registro', '/recuperar-password', '/verificar-email', '/email-confirmado']
  const esRutaPublica = pathname === '/' || rutasPublicas.slice(1).some(ruta => pathname.startsWith(ruta))

  if (esRutaPublica) {
    if (user && pathname !== '/verificar-email' && pathname !== '/email-confirmado') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single()

      if (profile) {
        const dashboardUrl = getDashboardUrlByRole(profile.rol)
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      }
    }
    return response
  }

  // ====== RUTAS PROTEGIDAS ======
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ====== VALIDAR EMAIL VERIFICADO ======
  if (!user.email_confirmed_at && pathname !== '/verificar-email') {
    return NextResponse.redirect(new URL('/verificar-email', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol, activo')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!profile.activo) {
    return NextResponse.redirect(new URL('/cuenta-desactivada', request.url))
  }

  // ====== VERIFICAR ACCESO POR ROL ======
  const rutaBase = pathname.split('/')[1]

  if (rutaBase !== profile.rol && ['admin', 'coach', 'staff', 'cliente'].includes(rutaBase)) {
    const dashboardUrl = getDashboardUrlByRole(profile.rol)
    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }

  return response
}

function getDashboardUrlByRole(rol: string): string {
  const dashboards: Record<string, string> = {
    admin: '/admin',
    coach: '/coach',
    staff: '/staff',
    cliente: '/cliente',
  }
  return dashboards[rol] || '/login'
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}