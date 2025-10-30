// src/app/(auth)/registro/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (!aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    setLoading(true)

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre_completo: formData.nombreCompleto,
            telefono: formData.telefono,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (authData.user) {
        // 2. Verificar si el perfil ya existe (puede ser creado por trigger)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single()

        if (!existingProfile) {
          // Crear perfil solo si no existe
          const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            email: formData.email,
            nombre_completo: formData.nombreCompleto,
            telefono: formData.telefono,
            rol: 'cliente',
            activo: true,
            onboarding_completo: false,
            terminos_aceptados_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error('Error al crear perfil:', profileError)
            throw new Error('Error al crear el perfil de usuario')
          }
        }

        // 3. Verificar si el cliente ya existe
        const { data: existingCliente } = await supabase
          .from('clientes')
          .select('id')
          .eq('id', authData.user.id)
          .single()

        if (!existingCliente) {
          // Generar código de referido único
          const codigoReferido = `STR${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

          // Crear cliente solo si no existe
          const { error: clienteError } = await supabase.from('clientes').insert({
            id: authData.user.id,
            codigo_referido: codigoReferido,
            creditos_disponibles: 0,
            puntos_lealtad: 0,
            nivel_lealtad: 'bronze',
            total_clases_asistidas: 0,
            total_no_shows: 0,
            racha_asistencia: 0,
            notificaciones_email: true,
            notificaciones_push: true,
            notificaciones_telegram: false,
            deslinde_medico_firmado: false,
            disciplina_preferida: 'cycling',
          })

          if (clienteError) {
            console.error('Error al crear cliente:', clienteError)
            throw new Error('Error al crear el registro de cliente')
          }
        }

        // 4. Redirigir al login
        alert('¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.')
        router.push('/login')
      }
    } catch (err: unknown) {
      console.error('Error en registro:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Error al registrar. Intenta de nuevo.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1A1814] mb-2">Crear Cuenta</h2>
        <p className="text-gray-600 text-sm">Únete a STRIVE y empieza tu transformación</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleRegistro} className="space-y-4">
        <Input
          type="text"
          name="nombreCompleto"
          label="Nombre Completo"
          placeholder="Juan Pérez"
          value={formData.nombreCompleto}
          onChange={handleChange}
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />

        <Input
          type="email"
          name="email"
          label="Correo Electrónico"
          placeholder="tu@email.com"
          value={formData.email}
          onChange={handleChange}
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
          type="tel"
          name="telefono"
          label="Teléfono"
          placeholder="5512345678"
          value={formData.telefono}
          onChange={handleChange}
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          }
        />

        <Input
          type="password"
          name="password"
          label="Contraseña"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
          helperText="Mínimo 6 caracteres"
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

        <Input
          type="password"
          name="confirmPassword"
          label="Confirmar Contraseña"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
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

        <div className="flex items-start">
          <input
            type="checkbox"
            id="terminos"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            className="mt-1 rounded border-gray-300 text-[#AE3F21] focus:ring-[#AE3F21]"
            disabled={loading}
          />
          <label htmlFor="terminos" className="ml-2 text-sm text-gray-600">
            Acepto los{' '}
            <Link href="/terminos" className="text-[#AE3F21] hover:underline">
              términos y condiciones
            </Link>{' '}
            y la{' '}
            <Link href="/privacidad" className="text-[#AE3F21] hover:underline">
              política de privacidad
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          Crear Cuenta
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-[#AE3F21] font-medium hover:underline">
          Inicia sesión aquí
        </Link>
      </div>
    </div>
  )
}