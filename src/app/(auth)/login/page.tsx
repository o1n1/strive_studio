// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Intentar iniciar sesión
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      if (data.user) {
        // Obtener el perfil del usuario para redirigir según su rol
        const { data: profile } = await supabase
          .from('profiles')
          .select('rol')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          // Redirigir según el rol
          const dashboardRoutes: Record<string, string> = {
            admin: '/admin',
            coach: '/coach',
            staff: '/staff',
            cliente: '/cliente',
          }
          const redirectUrl = dashboardRoutes[profile.rol] || '/cliente'
          router.push(redirectUrl)
          router.refresh()
        }
      }
    } catch (err: unknown) {
      console.error('Error al iniciar sesión:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión. Verifica tus credenciales.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1A1814] mb-2">
          Iniciar Sesión
        </h2>
        <p className="text-gray-600 text-sm">
          Ingresa tus credenciales para acceder
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          type="email"
          label="Correo Electrónico"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          }
        />

        <Input
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          }
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-[#AE3F21] focus:ring-[#AE3F21]"
            />
            <span className="ml-2 text-gray-600">Recordarme</span>
          </label>
          <Link
            href="/recuperar-password"
            className="text-[#AE3F21] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="text-[#AE3F21] font-medium hover:underline">
          Regístrate aquí
        </Link>
      </div>

      {/* Línea divisora */}
      <div className="mt-6 mb-6 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="px-4 text-sm text-gray-500">o</div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Nota para desarrollo */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Nota:</strong> Para crear la primera cuenta de administrador, 
          regístrate normalmente y luego actualiza el campo <code>rol</code> en la 
          tabla <code>profiles</code> de Supabase a <code>admin</code>.
        </p>
      </div>
    </div>
  )
}