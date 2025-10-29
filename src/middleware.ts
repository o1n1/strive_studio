// src/middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/types/database.types'

/**
 * Middleware de Next.js para:
 * 1. Actualizar sesión de Supabase
 * 2. Proteger rutas según autenticación
 * 3. Redirigir usuarios según su rol
 */
export async function middleware(request: NextRequest) {
  // Actualizar sesión de Supabase
  const response = await updateSession(request)

  // Crear cliente de Supabase para verificar autenticación
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

  // Obtener usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ====== RUTAS PÚBLICAS ======
  const rutasPublicas = ['/', '/login', '/registro']
  if (rutasPublicas.includes(pathname)) {
    // Si está autenticado, redirigir a su dashboard
    if (user) {
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
    // Si no está autenticado, redirigir a login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Obtener rol del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol, activo')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // Usuario sin perfil, cerrar sesión
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar que el usuario esté activo
  if (!profile.activo) {
    return NextResponse.redirect(new URL('/cuenta-desactivada', request.url))
  }

  // ====== VERIFICAR ACCESO POR ROL ======
  const rutaBase = pathname.split('/')[1] // Obtener 'admin', 'coach', 'staff' o 'cliente'

  // Si intenta acceder a una ruta que no le corresponde a su rol
  if (rutaBase !== profile.rol && ['admin', 'coach', 'staff', 'cliente'].includes(rutaBase)) {
    const dashboardUrl = getDashboardUrlByRole(profile.rol)
    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }

  return response
}

/**
 * Obtener URL del dashboard según el rol
 */
function getDashboardUrlByRole(rol: string): string {
  const dashboards: Record<string, string> = {
    admin: '/admin',
    coach: '/coach',
    staff: '/staff',
    cliente: '/cliente',
  }
  return dashboards[rol] || '/login'
}

/**
 * Configuración del middleware
 * Define qué rutas deben ser procesadas por el middleware
 */
export const config = {
  matcher: [
    /*
     * Aplicar middleware a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - Archivos en /public
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}