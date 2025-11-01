// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import { createClient } from '@/lib/supabase/client'
import { DASHBOARD_ROUTES, type RolUsuario } from '@/lib/types/enums'

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
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        {/* Card glassmorphism premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glassmorphism-premium rounded-3xl shadow-2xl border border-white/10 p-8 md:p-10">
            {/* Logo con gradient animado */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center mb-8"
            >
              <motion.h1
                className="text-5xl font-bold mb-3"
                style={{
                  background: 'linear-gradient(135deg, #E84A27 0%, #FF6B35 50%, #FF006E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                STRIVE
              </motion.h1>
              <p className="text-white/70 text-sm">
                No limits, just power
              </p>
            </motion.div>

            {/* Mensaje de error con shake animation */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-shake"
              >
                <div className="flex items-start">
                  <svg 
                    className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  <p className="text-sm text-red-300 font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Formulario */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onSubmit={manejarLogin}
              className="space-y-5"
            >
              <Input
                label="Email"
                type="email"
                value={datos.email}
                onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                placeholder="tu@email.com"
                required
                disabled={cargando}
                className="transition-all duration-300 focus:scale-[1.01]"
              />

              <Input
                label="Contraseña"
                type="password"
                value={datos.password}
                onChange={(e) => setDatos({ ...datos, password: e.target.value })}
                placeholder="••••••••"
                required
                disabled={cargando}
                className="transition-all duration-300 focus:scale-[1.01]"
              />

              <div className="text-right">
                <Link
                  href="/recuperar-password"
                  className="text-sm text-[#FF6B35] hover:text-[#E84A27] font-medium transition-colors duration-200 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón con efecto glow */}
              <Button
                type="submit"
                disabled={cargando}
                className="w-full relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #E84A27 0%, #FF6B35 100%)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12" />
                
                <span className="relative flex items-center justify-center text-white font-semibold py-3">
                  {cargando ? (
                    <>
                      <svg 
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      Iniciar Sesión
                      <svg 
                        className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M14 5l7 7m0 0l-7 7m7-7H3" 
                        />
                      </svg>
                    </>
                  )}
                </span>
              </Button>
            </motion.form>

            {/* Divisor */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-white/10" />
              <div className="px-4 text-sm text-white/50 font-medium">o</div>
              <div className="flex-1 border-t border-white/10" />
            </div>

            {/* Link a registro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center text-sm"
            >
              <span className="text-white/60">¿No tienes cuenta? </span>
              <Link
                href="/registro"
                className="text-[#FF6B35] font-semibold hover:text-[#E84A27] transition-colors duration-200 hover:underline"
              >
                Regístrate aquí
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}