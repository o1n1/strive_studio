'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

type DisciplinaPreferida = 'cycling' | 'funcional' | 'ambos'

interface DatosRegistro {
  email: string
  password: string
  confirmPassword: string
  nombreCompleto: string
  telefono: string
  fechaNacimiento: string
  genero: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir'
  disciplinaPreferida: DisciplinaPreferida
  terminosAceptados: boolean
}

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [datos, setDatos] = useState<DatosRegistro>({
    email: '',
    password: '',
    confirmPassword: '',
    nombreCompleto: '',
    telefono: '',
    fechaNacimiento: '',
    genero: 'prefiero_no_decir',
    disciplinaPreferida: 'ambos',
    terminosAceptados: false
  })

  const validarFormulario = (): string | null => {
    if (!datos.email || !datos.password || !datos.nombreCompleto || !datos.telefono || !datos.fechaNacimiento) {
      return 'Por favor completa todos los campos requeridos'
    }

    if (datos.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }

    if (datos.password !== datos.confirmPassword) {
      return 'Las contraseñas no coinciden'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(datos.email)) {
      return 'Email inválido'
    }

    const telefonoRegex = /^[0-9]{10}$/
    if (!telefonoRegex.test(datos.telefono.replace(/\s/g, ''))) {
      return 'Teléfono debe tener 10 dígitos'
    }

    if (!datos.terminosAceptados) {
      return 'Debes aceptar los términos y condiciones'
    }

    return null
  }

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const errorValidacion = validarFormulario()
    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    setCargando(true)

    try {
      // 1. CREAR USUARIO EN AUTH
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: datos.email,
        password: datos.password,
        options: {
          data: {
            nombre_completo: datos.nombreCompleto,
            telefono: datos.telefono
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      const userId = authData.user.id

      // 2. CREAR/ACTUALIZAR PERFIL
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            email: datos.email,
            nombre_completo: datos.nombreCompleto,
            telefono: datos.telefono,
            fecha_nacimiento: datos.fechaNacimiento,
            genero: datos.genero,
            rol: 'cliente',
            activo: true,
            onboarding_completo: true,
            terminos_aceptados_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'id',
            ignoreDuplicates: false 
          }
        )

      if (profileError) {
        console.error('Error en profiles:', profileError)
        throw new Error(`Error al crear perfil: ${profileError.message}`)
      }

      // 3. GENERAR CÓDIGO DE REFERIDO ÚNICO (antes del insert)
      const codigoReferido = `${datos.nombreCompleto.split(' ')[0].toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      // 4. CREAR REGISTRO DE CLIENTE
      const { error: clienteError } = await supabase
        .from('clientes')
        .upsert(
          {
            id: userId,
            codigo_referido: codigoReferido,
            disciplina_preferida: datos.disciplinaPreferida,
            creditos_disponibles: 0,
            nivel_lealtad: 'bronze',
            notificaciones_email: true,
            notificaciones_push: true,
            notificaciones_telegram: false,
            total_clases_asistidas: 0,
            total_no_shows: 0,
            racha_asistencia: 0,
            puntos_lealtad: 0,
            total_referidos: 0,
            creditos_por_referidos: 0,
            creditos_congelados: false,
            deslinde_medico_firmado: false,
            condiciones_medicas: []
          },
          { 
            onConflict: 'id',
            ignoreDuplicates: false 
          }
        )

      if (clienteError) {
        console.error('Error en clientes:', clienteError)
        throw new Error(`Error al crear registro de cliente: ${clienteError.message}`)
      }

      // ÉXITO: Redirigir al dashboard de cliente
      router.push('/cliente/dashboard')

    } catch (err) {
      console.error('Error en registro:', err)
      setError(err instanceof Error ? err.message : 'Error al registrar usuario. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Únete a STRIVE STUDIO
          </h1>
          <p className="text-gray-600">
            Crea tu cuenta y comienza tu transformación
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={manejarRegistro} className="space-y-4">
          <Input
            label="Email *"
            type="email"
            value={datos.email}
            onChange={(e) => setDatos({ ...datos, email: e.target.value })}
            placeholder="tu@email.com"
            required
            disabled={cargando}
          />

          <Input
            label="Contraseña *"
            type="password"
            value={datos.password}
            onChange={(e) => setDatos({ ...datos, password: e.target.value })}
            placeholder="Mínimo 6 caracteres"
            required
            disabled={cargando}
          />

          <Input
            label="Confirmar Contraseña *"
            type="password"
            value={datos.confirmPassword}
            onChange={(e) => setDatos({ ...datos, confirmPassword: e.target.value })}
            placeholder="Repite tu contraseña"
            required
            disabled={cargando}
          />

          <Input
            label="Nombre Completo *"
            type="text"
            value={datos.nombreCompleto}
            onChange={(e) => setDatos({ ...datos, nombreCompleto: e.target.value })}
            placeholder="Juan Pérez"
            required
            disabled={cargando}
          />

          <Input
            label="Teléfono *"
            type="tel"
            value={datos.telefono}
            onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
            placeholder="4771234567"
            required
            disabled={cargando}
          />

          <Input
            label="Fecha de Nacimiento *"
            type="date"
            value={datos.fechaNacimiento}
            onChange={(e) => setDatos({ ...datos, fechaNacimiento: e.target.value })}
            required
            disabled={cargando}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género *
            </label>
            <select
              value={datos.genero}
              onChange={(e) => setDatos({ ...datos, genero: e.target.value as typeof datos.genero })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AE3F21]"
              required
              disabled={cargando}
            >
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
              <option value="prefiero_no_decir">Prefiero no decir</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disciplina Preferida *
            </label>
            <select
              value={datos.disciplinaPreferida}
              onChange={(e) => setDatos({ ...datos, disciplinaPreferida: e.target.value as DisciplinaPreferida })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AE3F21]"
              required
              disabled={cargando}
            >
              <option value="cycling">Cycling</option>
              <option value="funcional">Funcional</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={datos.terminosAceptados}
              onChange={(e) => setDatos({ ...datos, terminosAceptados: e.target.checked })}
              className="mt-1 h-4 w-4 text-[#AE3F21] focus:ring-[#AE3F21] border-gray-300 rounded"
              required
              disabled={cargando}
            />
            <label className="text-sm text-gray-600">
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
            disabled={cargando}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[#AE3F21] font-medium hover:underline">
            Inicia sesión aquí
          </Link>
        </div>
      </Card>
    </div>
  )
}