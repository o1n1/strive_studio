// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { DASHBOARD_ROUTES, type RolUsuario, type Profile } from '@/lib/types/enums'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [datos, setDatos] = useState({
    email: '',
    password: '',
  })

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)

    try {
      // 1. Autenticar usuario
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: datos.email,
        password: datos.password,
      })

      if (authError) throw authError

      // 2. Obtener perfil para redirección por rol
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', authData.user.id)
        .single<{ rol: RolUsuario }>()

      if (profileError) throw profileError

      // 3. Redirigir según rol
      router.push(DASHBOARD_ROUTES[profile.rol])
    } catch (err) {
      console.error('Error en login:', err)
      setError(err instanceof Error ? err.message : 'Email o contraseña incorrectos')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#AE3F21]/10 via-[#9C7A5E]/10 to-[#1A1814]/10 animate-gradient"></div>
      
      {/* Círculos decorativos con blur */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#AE3F21]/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#9C7A5E]/20 rounded-full blur-3xl animate-float-delayed"></div>

      {/* Card de login */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-scaleIn">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#AE3F21] to-[#9C7A5E] bg-clip-text text-transparent mb-2">
              STRIVE STUDIO
            </h1>
            <p className="text-gray-600">Inicia sesión en tu cuenta</p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slideIn">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={manejarLogin} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={datos.email}
              onChange={(e) => setDatos({ ...datos, email: e.target.value })}
              placeholder="tu@email.com"
              required
              disabled={cargando}
              className="transition-all duration-200 focus:scale-[1.02]"
            />

            <Input
              label="Contraseña"
              type="password"
              value={datos.password}
              onChange={(e) => setDatos({ ...datos, password: e.target.value })}
              placeholder="••••••••"
              required
              disabled={cargando}
              className="transition-all duration-200 focus:scale-[1.02]"
            />

            <div className="text-right">
              <Link
                href="/recuperar-password"
                className="text-sm text-[#AE3F21] hover:text-[#8E3219] font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-[#AE3F21] to-[#9C7A5E] hover:from-[#8E3219] hover:to-[#7d6248] text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              {cargando ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Línea divisora */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-4 text-sm text-gray-500">o</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Link a registro */}
          <div className="text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link
              href="/registro"
              className="text-[#AE3F21] font-semibold hover:text-[#8E3219] transition-colors"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}