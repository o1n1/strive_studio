// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { DASHBOARD_ROUTES, type RolUsuario } from '@/lib/types/enums'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [datos, setDatos] = useState({
    email: '',
    password: '',
  })

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)

  // Validación de email en tiempo real
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)
  const mostrarErrorEmail = emailTouched && datos.email && !emailValido

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#FFFCF3] via-[#FFF5E5] to-[#FFE8D0]">
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#AE3F21]/5 via-[#9C7A5E]/5 to-[#1A1814]/5 animate-gradient" />
      
      {/* Partículas flotantes decorativas */}
      <div className="absolute top-20 left-[10%] w-64 h-64 bg-[#AE3F21]/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-[#9C7A5E]/10 rounded-full blur-3xl animate-floatDelayed" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#AE3F21]/5 rounded-full blur-3xl animate-floatSlow" />

      {/* Partículas pequeñas */}
      <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-[#AE3F21] rounded-full animate-float opacity-40" />
      <div className="absolute top-[60%] right-[20%] w-3 h-3 bg-[#9C7A5E] rounded-full animate-floatDelayed opacity-30" />
      <div className="absolute bottom-[30%] left-[25%] w-2 h-2 bg-[#AE3F21] rounded-full animate-floatSlow opacity-35" />
      <div className="absolute top-[40%] right-[15%] w-2 h-2 bg-[#9C7A5E] rounded-full animate-float opacity-40" />

      {/* Card de login */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Logo y título con animación */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3 animate-logoReveal">
              <span className="gradient-text">STRIVE STUDIO</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-[#9C7A5E] font-medium text-lg"
            >
              Tu transformación empieza aquí
            </motion.p>
          </motion.div>

          {/* Mensaje de error con shake animation */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg ${error ? 'animate-shake' : ''}`}
            >
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Formulario */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={manejarLogin}
            className="space-y-6"
          >
            {/* Input Email con floating label */}
            <div className="relative">
              <input
                type="email"
                id="email"
                value={datos.email}
                onChange={(e) => {
                  setDatos({ ...datos, email: e.target.value })
                  if (!emailTouched) setEmailTouched(true)
                }}
                onBlur={() => setEmailTouched(true)}
                disabled={cargando}
                className={`
                  peer w-full px-4 pt-6 pb-2 bg-white/50 border-2 rounded-xl
                  transition-all duration-300 outline-none
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${mostrarErrorEmail 
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-[#AE3F21] focus:ring-4 focus:ring-[#AE3F21]/10'
                  }
                  hover:border-gray-300 focus:bg-white
                `}
                placeholder=" "
                required
              />
              <label
                htmlFor="email"
                className={`
                  absolute left-4 transition-all duration-300 pointer-events-none
                  peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                  peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#AE3F21]
                  ${datos.email ? 'top-2 text-xs text-[#AE3F21]' : 'top-4 text-base text-gray-400'}
                `}
              >
                Email
              </label>
              {/* Icono de email */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className={`w-5 h-5 transition-colors duration-300 ${emailValido && datos.email ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              {/* Mensaje de error email */}
              {mostrarErrorEmail && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 mt-1 ml-1"
                >
                  Ingresa un email válido
                </motion.p>
              )}
            </div>

            {/* Input Password con floating label */}
            <div className="relative">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                id="password"
                value={datos.password}
                onChange={(e) => {
                  setDatos({ ...datos, password: e.target.value })
                  if (!passwordTouched) setPasswordTouched(true)
                }}
                onBlur={() => setPasswordTouched(true)}
                disabled={cargando}
                className={`
                  peer w-full px-4 pt-6 pb-2 bg-white/50 border-2 rounded-xl
                  transition-all duration-300 outline-none
                  disabled:opacity-50 disabled:cursor-not-allowed
                  border-gray-200 focus:border-[#AE3F21] focus:ring-4 focus:ring-[#AE3F21]/10
                  hover:border-gray-300 focus:bg-white
                `}
                placeholder=" "
                required
              />
              <label
                htmlFor="password"
                className={`
                  absolute left-4 transition-all duration-300 pointer-events-none
                  peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                  peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#AE3F21]
                  ${datos.password ? 'top-2 text-xs text-[#AE3F21]' : 'top-4 text-base text-gray-400'}
                `}
              >
                Contraseña
              </label>
              {/* Botón mostrar/ocultar password */}
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#AE3F21] transition-colors duration-200"
                disabled={cargando}
              >
                {mostrarPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Link recuperar contraseña */}
            <div className="text-right">
              <Link
                href="/recuperar-password"
                className="text-sm text-[#AE3F21] hover:text-[#8E3219] font-medium transition-colors duration-200 inline-flex items-center group"
              >
                ¿Olvidaste tu contraseña?
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Botón de submit con ripple effect */}
            <Button
              type="submit"
              disabled={cargando || !emailValido}
              className={`
                w-full bg-gradient-to-r from-[#AE3F21] to-[#9C7A5E] 
                hover:from-[#8E3219] hover:to-[#7d6248] 
                text-white font-semibold py-4 rounded-xl 
                transition-all duration-300 
                hover:shadow-xl hover:shadow-[#AE3F21]/20
                transform hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                button-ripple relative overflow-hidden
              `}
            >
              {cargando ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Iniciar Sesión
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              )}
            </Button>
          </motion.form>

          {/* Línea divisora */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300" />
            <div className="px-4 text-sm text-gray-500 font-medium">o</div>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Link a registro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <p className="text-gray-600 mb-4">
              ¿No tienes cuenta?
            </p>
            <Link
              href="/registro"
              className="inline-flex items-center justify-center w-full px-6 py-3 border-2 border-[#AE3F21] text-[#AE3F21] font-semibold rounded-xl hover:bg-[#AE3F21] hover:text-white transition-all duration-300 transform hover:scale-[1.02] group"
            >
              Crear cuenta
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-6 text-sm text-gray-500"
        >
          <p>
            ¿Necesitas ayuda?{' '}
            <a href="mailto:soporte@strivestudio.com" className="text-[#AE3F21] hover:text-[#8E3219] font-medium transition-colors duration-200">
              Contáctanos
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}