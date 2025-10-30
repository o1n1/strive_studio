// src/app/(auth)/recuperar-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
    } catch (err: any) {
      console.error('Error al enviar email:', err)
      setError(err.message || 'Error al enviar el correo. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#AE3F21]/10 via-[#9C7A5E]/10 to-[#1A1814]/10 animate-gradient"></div>

      {/* Círculos decorativos */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#AE3F21]/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#9C7A5E]/20 rounded-full blur-3xl animate-float-delayed"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-scaleIn">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {!enviado ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#AE3F21] to-[#9C7A5E] bg-clip-text text-transparent mb-2">
                  Recuperar Contraseña
                </h1>
                <p className="text-gray-600">
                  Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={manejarRecuperacion} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={cargando}
                  className="transition-all duration-200 focus:scale-[1.02]"
                />

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
                      Enviando...
                    </span>
                  ) : (
                    'Enviar Enlace'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <Link href="/login" className="text-[#AE3F21] font-semibold hover:text-[#8E3219] transition-colors">
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Email Enviado!</h2>
              <p className="text-gray-600 mb-6">
                Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
                Revisa tu bandeja de entrada y sigue las instrucciones.
              </p>

              <Link
                href="/login"
                className="inline-block w-full px-4 py-3 bg-gradient-to-r from-[#AE3F21] to-[#9C7A5E] text-white font-semibold rounded-xl hover:from-[#8E3219] hover:to-[#7d6248] transition-all duration-300 hover:scale-[1.02]"
              >
                Volver al Inicio de Sesión
              </Link>
            </div>
          )}
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
      `}</style>
    </div>
  )
}