// src/app/(auth)/recuperar-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const manejarRecuperacion = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/restablecer-password`,
      })

      if (resetError) throw resetError

      setEnviado(true)
    } catch (err) {
      console.error('Error al enviar email:', err)
      setError(err instanceof Error ? err.message : 'Error al enviar el correo. Intenta nuevamente.')
    } finally {
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
            {!enviado ? (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#E84A27] to-[#FF6B35] rounded-full flex items-center justify-center"
                  >
                    <svg 
                      className="w-10 h-10 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                      />
                    </svg>
                  </motion.div>

                  <motion.h1
                    className="text-3xl md:text-4xl font-bold mb-3"
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
                    Recuperar Contraseña
                  </motion.h1>
                  <p className="text-white/60 text-sm">
                    Ingresa tu email y te enviaremos un enlace
                  </p>
                </motion.div>

                <form onSubmit={manejarRecuperacion} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
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
                    {cargando ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                  </Button>

                  <div className="text-center pt-4">
                    <Link
                      href="/login"
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      Volver al inicio de sesión
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#9D4EDD] to-[#FF006E] rounded-full flex items-center justify-center"
                >
                  <svg 
                    className="w-10 h-10 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  ¡Email Enviado!
                </h2>
                <p className="text-white/70 mb-6 text-sm md:text-base">
                  Hemos enviado un enlace de recuperación a{' '}
                  <span className="text-white font-semibold">{email}</span>.
                  <br />
                  Revisa tu bandeja de entrada y sigue las instrucciones.
                </p>

                <Link href="/login">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Volver al Inicio de Sesión
                  </Button>
                </Link>

                <p className="text-white/50 text-xs mt-6">
                  ¿No recibiste el email? Revisa tu carpeta de spam
                </p>
              </motion.div>
            )}
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-white/40 text-sm mt-8 tracking-wide"
          >
            No limits, just power
          </motion.p>
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}