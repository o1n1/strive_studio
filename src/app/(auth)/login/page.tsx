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

      // 3. FIX: Usar window.location.href para forzar recarga completa del servidor
      window.location.href = DASHBOARD_ROUTES[profile.rol]
    } catch (err) {
      console.error('Error en login:', err)
      setError(err instanceof Error ? err.message : 'Email o contraseña incorrectos')
      setCargando(false)
    }
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glassmorphism-premium rounded-3xl shadow-2xl border border-white/10 p-8 md:p-10">
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
              <p className="text-white/60 text-sm font-light tracking-wide">
                No limits, just power
              </p>
            </motion.div>

            <form onSubmit={manejarLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={datos.email}
                  onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                  placeholder="tu@email.com"
                  required
                  disabled={cargando}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  value={datos.password}
                  onChange={(e) => setDatos({ ...datos, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  disabled={cargando}
                  className="w-full"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={cargando}
                className="w-full"
              >
                {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              <div className="space-y-3 pt-4">
                <div className="text-center">
                  <Link
                    href="/recuperar-password"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#1A1814]/80 px-2 text-white/40">O</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    href="/registro"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    ¿No tienes cuenta? <span className="text-[#E84A27]">Regístrate</span>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}