// src/app/(auth)/registro/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SignaturePad } from '@/components/ui/SignaturePad'
import { createClient } from '@/lib/supabase/client'
import type { TipoDisciplina } from '@/lib/types/enums'

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()

  const [datos, setDatos] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombreCompleto: '',
    telefono: '',
    genero: '',
    fechaNacimiento: '',
    disciplinaPreferida: 'cycling' as TipoDisciplina,
    terminosAceptados: false,
  })

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para modales
  const [mostrarTerminos, setMostrarTerminos] = useState(false)
  const [mostrarDeslinde, setMostrarDeslinde] = useState(false)

  // Estados para firmas
  const [firmaTerminos, setFirmaTerminos] = useState<string | null>(null)
  const [firmaDeslinde, setFirmaDeslinde] = useState<string | null>(null)

  // Validaciones en tiempo real
  const [validaciones, setValidaciones] = useState({
    email: { valido: true, mensaje: '' },
    password: { valido: true, mensaje: '' },
    confirmPassword: { valido: true, mensaje: '' },
    telefono: { valido: true, mensaje: '' },
  })

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validarTelefono = (telefono: string) => {
    const regex = /^[0-9]{10}$/
    return regex.test(telefono)
  }

  const calcularFuerzaPassword = (password: string) => {
    let fuerza = 0
    if (password.length >= 6) fuerza++
    if (password.length >= 10) fuerza++
    if (/[A-Z]/.test(password)) fuerza++
    if (/[0-9]/.test(password)) fuerza++
    if (/[^A-Za-z0-9]/.test(password)) fuerza++
    return fuerza
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setDatos({
      ...datos,
      [name]: type === 'checkbox' ? checked : value,
    })

    // Validaciones en tiempo real
    if (name === 'email') {
      setValidaciones({
        ...validaciones,
        email: {
          valido: validarEmail(value),
          mensaje: validarEmail(value) ? '' : 'Email inválido',
        },
      })
    }

    if (name === 'telefono') {
      setValidaciones({
        ...validaciones,
        telefono: {
          valido: validarTelefono(value),
          mensaje: validarTelefono(value) ? '' : 'Debe ser 10 dígitos',
        },
      })
    }

    if (name === 'password') {
      setValidaciones({
        ...validaciones,
        password: {
          valido: value.length >= 6,
          mensaje: value.length < 6 ? 'Mínimo 6 caracteres' : '',
        },
      })
    }

    if (name === 'confirmPassword') {
      setValidaciones({
        ...validaciones,
        confirmPassword: {
          valido: value === datos.password,
          mensaje: value === datos.password ? '' : 'Las contraseñas no coinciden',
        },
      })
    }
  }

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (datos.password !== datos.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (!datos.terminosAceptados) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    if (!firmaTerminos) {
      setError('Debes firmar los términos y condiciones')
      return
    }

    setCargando(true)

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: datos.email,
        password: datos.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      const userId = authData.user.id

      // 2. Upsert perfil
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: userId,
          email: datos.email,
          nombre_completo: datos.nombreCompleto,
          telefono: datos.telefono,
          genero: datos.genero,
          fecha_nacimiento: datos.fechaNacimiento,
          rol: 'cliente',
          terminos_aceptados_at: new Date().toISOString(),
          activo: true,
          onboarding_completo: true,
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )

      if (profileError) throw new Error(`Error al crear perfil: ${profileError.message}`)

      // 3. Generar código de referido
      const codigoReferido = `${datos.nombreCompleto.split(' ')[0].toUpperCase()}${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`

      // 4. Crear registro de cliente
      const { error: clienteError } = await supabase.from('clientes').upsert(
        {
          id: userId,
          disciplina_preferida: datos.disciplinaPreferida,
          codigo_referido: codigoReferido,
          terminos_firmado_at: new Date().toISOString(),
          deslinde_medico_firmado: firmaDeslinde ? true : false,
          deslinde_medico_at: firmaDeslinde ? new Date().toISOString() : null,
          creditos_disponibles: 0,
          notificaciones_email: true,
          notificaciones_push: true,
          nivel_lealtad: 'bronze',
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )

      if (clienteError) throw new Error(`Error al crear registro de cliente: ${clienteError.message}`)

      // 5. Guardar firmas en Storage (simulado - aquí deberías subirlas realmente)
      // TODO: Implementar subida real a Supabase Storage
      console.log('Firmas guardadas:', { firmaTerminos, firmaDeslinde })

      // 6. Redirigir al dashboard
      router.push('/cliente')
    } catch (err) {
      console.error('Error en registro:', err)
      setError(err instanceof Error ? err.message : 'Error al registrar usuario. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const fuerza = calcularFuerzaPassword(datos.password)
  const colorFuerza = fuerza <= 1 ? 'bg-red-500' : fuerza === 3 ? 'bg-yellow-500' : 'bg-green-500'
  const textoFuerza = fuerza <= 1 ? 'Débil' : fuerza === 3 ? 'Media' : 'Fuerte'

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#AE3F21]/10 via-[#9C7A5E]/10 to-[#1A1814]/10 animate-gradient"></div>

      {/* Círculos decorativos */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#AE3F21]/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#9C7A5E]/20 rounded-full blur-3xl animate-float-delayed"></div>

      {/* Card de registro */}
      <div className="relative z-10 w-full max-w-2xl mx-4 animate-scaleIn">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#AE3F21] to-[#9C7A5E] bg-clip-text text-transparent mb-2">
              Únete a STRIVE
            </h1>
            <p className="text-gray-600">Crea tu cuenta y comienza tu transformación</p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slideIn">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={manejarRegistro} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre Completo *"
                name="nombreCompleto"
                value={datos.nombreCompleto}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                required
                disabled={cargando}
              />

              <Input
                label="Email *"
                name="email"
                type="email"
                value={datos.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                disabled={cargando}
                error={!validaciones.email.valido ? validaciones.email.mensaje : undefined}
              />

              <Input
                label="Teléfono *"
                name="telefono"
                value={datos.telefono}
                onChange={handleChange}
                placeholder="1234567890"
                required
                disabled={cargando}
                error={!validaciones.telefono.valido ? validaciones.telefono.mensaje : undefined}
              />

              <div>
                <label className="block text-sm font-medium text-[#1A1814] mb-1.5">Género *</label>
                <select
                  name="genero"
                  value={datos.genero}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-[#1A1814] focus:outline-none focus:ring-2 focus:ring-[#AE3F21]"
                  required
                  disabled={cargando}
                >
                  <option value="">Selecciona...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <Input
                label="Fecha de Nacimiento *"
                name="fechaNacimiento"
                type="date"
                value={datos.fechaNacimiento}
                onChange={handleChange}
                required
                disabled={cargando}
              />

              <div>
                <label className="block text-sm font-medium text-[#1A1814] mb-1.5">Disciplina Preferida *</label>
                <select
                  name="disciplinaPreferida"
                  value={datos.disciplinaPreferida}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-[#1A1814] focus:outline-none focus:ring-2 focus:ring-[#AE3F21]"
                  required
                  disabled={cargando}
                >
                  <option value="cycling">Cycling</option>
                  <option value="funcional">Funcional</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Contraseña *"
                  name="password"
                  type="password"
                  value={datos.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={cargando}
                />
                {datos.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorFuerza} transition-all duration-300`}
                          style={{ width: `${(fuerza / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">{textoFuerza}</span>
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Confirmar Contraseña *"
                name="confirmPassword"
                type="password"
                value={datos.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                required
                disabled={cargando}
                error={!validaciones.confirmPassword.valido ? validaciones.confirmPassword.mensaje : undefined}
              />
            </div>

            {/* Términos y condiciones */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="terminosAceptados"
                  checked={datos.terminosAceptados}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-[#AE3F21] focus:ring-[#AE3F21] border-gray-300 rounded"
                  required
                  disabled={cargando}
                />
                <label className="text-sm text-gray-600">
                  Acepto los{' '}
                  <button
                    type="button"
                    onClick={() => setMostrarTerminos(true)}
                    className="text-[#AE3F21] hover:underline font-medium"
                  >
                    términos y condiciones
                  </button>
                  {' '}y la{' '}
                  <Link href="/privacidad" className="text-[#AE3F21] hover:underline font-medium">
                    política de privacidad
                  </Link>
                </label>
              </div>

              {firmaTerminos && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Términos firmados
                </div>
              )}

              <button
                type="button"
                onClick={() => setMostrarDeslinde(true)}
                className="text-sm text-[#AE3F21] hover:underline font-medium"
              >
                Firmar deslinde médico (opcional)
              </button>

              {firmaDeslinde && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Deslinde médico firmado
                </div>
              )}
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
                  Creando cuenta...
                </span>
              ) : (
                'Crear Cuenta'
              )}
            </Button>
          </form>

          {/* Link a login */}
          <div className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#AE3F21] font-semibold hover:text-[#8E3219] transition-colors">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>

      {/* Modal de Términos */}
      <Modal
        isOpen={mostrarTerminos}
        onClose={() => setMostrarTerminos(false)}
        title="Términos y Condiciones"
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          <p className="text-gray-700">
            Al utilizar los servicios de STRIVE STUDIO, aceptas los siguientes términos y condiciones...
          </p>
          <h3 className="font-semibold text-gray-900 mt-4">1. Uso del Servicio</h3>
          <p className="text-gray-700">
            El servicio de STRIVE STUDIO está diseñado para proporcionar clases de indoor cycling y funcional...
          </p>
          <h3 className="font-semibold text-gray-900 mt-4">2. Responsabilidades del Usuario</h3>
          <p className="text-gray-700">
            El usuario se compromete a utilizar el servicio de manera responsable...
          </p>
          <h3 className="font-semibold text-gray-900 mt-4">3. Cancelaciones y Reembolsos</h3>
          <p className="text-gray-700">
            Las cancelaciones deben realizarse con al menos 2 horas de anticipación...
          </p>
        </div>

        <div className="mt-6">
          <SignaturePad
            onSave={(signature) => {
              setFirmaTerminos(signature)
              setMostrarTerminos(false)
            }}
          />
        </div>
      </Modal>

      {/* Modal de Deslinde Médico */}
      <Modal
        isOpen={mostrarDeslinde}
        onClose={() => setMostrarDeslinde(false)}
        title="Deslinde Médico"
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          <p className="text-gray-700">
            Declaro que me encuentro en buen estado de salud y que no tengo condiciones médicas que me impidan realizar actividad física intensa...
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Si tienes alguna condición médica, consulta con tu médico antes de iniciar cualquier programa de ejercicio.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <SignaturePad
            onSave={(signature) => {
              setFirmaDeslinde(signature)
              setMostrarDeslinde(false)
            }}
          />
        </div>
      </Modal>

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