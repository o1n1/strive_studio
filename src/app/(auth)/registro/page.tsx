// src/app/(auth)/registro/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SignaturePad } from '@/components/ui/SignaturePad'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import MultiStepForm from '@/components/ui/auth/MultiStepForm'
import StepIndicator from '@/components/ui/auth/StepIndicator'
import PasswordStrengthMeter from '@/components/ui/PasswordStrengthMeter'
import { createClient } from '@/lib/supabase/client'
import { useMultiStepForm } from '@/hooks/useMultiStepForm'
import type { TipoDisciplina } from '@/lib/types/enums'

type RegistroFormData = Record<string, string | boolean | string[]>

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrarTerminos, setMostrarTerminos] = useState(false)
  const [mostrarDeslinde, setMostrarDeslinde] = useState(false)
  const [firmaTerminos, setFirmaTerminos] = useState<string | null>(null)
  const [firmaDeslinde, setFirmaDeslinde] = useState<string | null>(null)

  const {
    currentStep,
    formData,
    isFirstStep,
    goToNextStep,
    goToPreviousStep,
    updateFormData,
  } = useMultiStepForm<RegistroFormData>({
    initialData: {
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      telefono: '',
      fechaNacimiento: '',
      genero: '',
      password: '',
      confirmPassword: '',
      disciplinaPreferida: 'cycling',
      horarioPreferido: '',
      fuenteAdquisicion: '', // NUEVO CAMPO
      codigoReferido: '',
      condicionesMedicas: '',
      nombreEmergencia: '',
      telefonoEmergencia: '',
      relacionEmergencia: '',
      terminosAceptados: false,
    },
    totalSteps: 5,
  })

  const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validarTelefono = (telefono: string) => /^[0-9]{10}$/.test(telefono)

  const validarStep1 = () => {
    if (!formData.nombre || formData.nombre.length < 2) {
      setError('El nombre es requerido')
      return false
    }
    if (!formData.apellidoPaterno || formData.apellidoPaterno.length < 2) {
      setError('El apellido paterno es requerido')
      return false
    }
    if (!formData.apellidoMaterno || formData.apellidoMaterno.length < 2) {
      setError('El apellido materno es requerido')
      return false
    }
    if (!validarEmail(formData.email as string)) {
      setError('Email inválido')
      return false
    }
    if (!validarTelefono(formData.telefono as string)) {
      setError('Teléfono debe ser exactamente 10 dígitos')
      return false
    }
    if ((formData.password as string).length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }
    if (!formData.fechaNacimiento) {
      setError('Ingresa tu fecha de nacimiento')
      return false
    }
    if (!formData.genero) {
      setError('Selecciona tu género')
      return false
    }
    return true
  }

  const validarStep2 = () => {
    if (!formData.horarioPreferido) {
      setError('Selecciona tu horario preferido')
      return false
    }
    if (!formData.fuenteAdquisicion) {
      setError('Selecciona cómo nos conociste')
      return false
    }
    return true
  }

  const validarStep3 = () => {
    if (!formData.nombreEmergencia) {
      setError('Ingresa un contacto de emergencia')
      return false
    }
    if (!validarTelefono(formData.telefonoEmergencia as string)) {
      setError('Teléfono de emergencia inválido (debe ser 10 dígitos)')
      return false
    }
    if (!formData.relacionEmergencia) {
      setError('Indica la relación con el contacto de emergencia')
      return false
    }
    return true
  }

  const validarStep4 = () => {
    if (!firmaTerminos || !firmaDeslinde) {
      setError('Debes firmar ambos documentos')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError(null)
    if (currentStep === 1 && !validarStep1()) return
    if (currentStep === 2 && !validarStep2()) return
    if (currentStep === 3 && !validarStep3()) return
    if (currentStep === 4 && !validarStep4()) return
    goToNextStep()
  }

  const handleSubmit = async () => {
    setCargando(true)
    setError(null)

    try {
      // 1. Crear usuario
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email as string,
        password: formData.password as string,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      const userId = authData.user.id
      const nombreCompleto = `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`

      // 2. Crear perfil
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: formData.email as string,
        nombre_completo: nombreCompleto,
        telefono: formData.telefono as string,
        genero: formData.genero as string,
        fecha_nacimiento: formData.fechaNacimiento as string,
        rol: 'cliente',
        terminos_aceptados_at: new Date().toISOString(),
        activo: true,
        onboarding_completo: true,
      })

      if (profileError) throw profileError

      // 3. Generar código de referido
      const codigoReferido = `${(formData.nombre as string).toUpperCase()}${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`

      // 4. Procesar condiciones médicas
      const condicionesMedicasArray = (formData.condicionesMedicas as string)
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0)

      // 5. Crear registro de cliente
      const { error: clienteError } = await supabase.from('clientes').upsert({
        id: userId,
        disciplina_preferida: formData.disciplinaPreferida as TipoDisciplina,
        horario_preferido: formData.horarioPreferido as string,
        fuente_adquisicion: formData.fuenteAdquisicion as string, // NUEVO CAMPO
        codigo_referido: codigoReferido,
        condiciones_medicas: condicionesMedicasArray.length > 0 ? condicionesMedicasArray : null,
        contacto_emergencia_nombre: formData.nombreEmergencia as string,
        contacto_emergencia_telefono: formData.telefonoEmergencia as string,
        contacto_emergencia_relacion: formData.relacionEmergencia as string,
        terminos_firmado_at: new Date().toISOString(),
        deslinde_medico_firmado: true,
        deslinde_medico_at: new Date().toISOString(),
        creditos_disponibles: 0,
        notificaciones_email: true,
        notificaciones_push: true,
        nivel_lealtad: 'bronze',
      })

      if (clienteError) throw clienteError

      // 6. Ir a pantalla de éxito
      goToNextStep()
      
      // CAMBIO: No redirect automático, usuario controla
    } catch (err) {
      console.error('Error en registro:', err)
      setError(err instanceof Error ? err.message : 'Error al registrar')
    } finally {
      setCargando(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if ((name === 'telefono' || name === 'telefonoEmergencia') && value.length > 0) {
      if (!/^\d*$/.test(value)) return
      if (value.length > 10) return
    }
    
    updateFormData({ [name]: value })
  }

  const stepLabels = ['Información', 'Preferencias', 'Salud', 'Términos', 'Bienvenida']

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="glassmorphism-premium rounded-3xl shadow-2xl border border-white/10 p-8 md:p-10">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center mb-6"
            >
              <h1
                className="text-4xl font-bold mb-2"
                style={{
                  background: 'linear-gradient(135deg, #E84A27 0%, #FF6B35 50%, #FF006E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                STRIVE
              </h1>
              <p className="text-white/70 text-sm">No limits, just power</p>
            </motion.div>

            {/* Step Indicator */}
            {currentStep < 5 && (
              <div className="mb-8">
                <StepIndicator
                  currentStep={currentStep}
                  totalSteps={5}
                  labels={stepLabels}
                  variant="numbered"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-shake"
              >
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Multi-Step Form */}
            <MultiStepForm currentStep={currentStep}>
              {/* STEP 1: Información Básica */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Nombre *</label>
                      <input
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Juan"
                        disabled={cargando}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Apellido Paterno *</label>
                      <input
                        name="apellidoPaterno"
                        value={formData.apellidoPaterno}
                        onChange={handleChange}
                        placeholder="García"
                        disabled={cargando}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Apellido Materno *</label>
                      <input
                        name="apellidoMaterno"
                        value={formData.apellidoMaterno}
                        onChange={handleChange}
                        placeholder="López"
                        disabled={cargando}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">Email *</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      disabled={cargando}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Teléfono * (10 dígitos)</label>
                      <input
                        name="telefono"
                        type="tel"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="1234567890"
                        disabled={cargando}
                        maxLength={10}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                      <p className="text-xs text-white/50 mt-1">{(formData.telefono as string).length}/10</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Fecha de Nacimiento *</label>
                      <input
                        name="fechaNacimiento"
                        type="date"
                        value={formData.fechaNacimiento}
                        onChange={handleChange}
                        disabled={cargando}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">Género *</label>
                    <select
                      name="genero"
                      value={formData.genero}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      disabled={cargando}
                    >
                      <option value="" className="bg-[#1A1814] text-white">Selecciona...</option>
                      <option value="masculino" className="bg-[#1A1814] text-white">Masculino</option>
                      <option value="femenino" className="bg-[#1A1814] text-white">Femenino</option>
                      <option value="otro" className="bg-[#1A1814] text-white">Otro</option>
                      <option value="prefiero_no_decir" className="bg-[#1A1814] text-white">Prefiero no decir</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Contraseña *</label>
                      <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 8 caracteres"
                        disabled={cargando}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                      <PasswordStrengthMeter password={formData.password as string} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Confirmar Contraseña *</label>
                      <input
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repite tu contraseña"
                        disabled={cargando}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Preferencias */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">
                      ¿Qué disciplina te interesa? *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {['cycling', 'funcional', 'ambas'].map((disc) => (
                        <label
                          key={disc}
                          className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.disciplinaPreferida === disc
                              ? 'border-[#FF6B35] bg-[#FF6B35]/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name="disciplinaPreferida"
                            value={disc}
                            checked={formData.disciplinaPreferida === disc}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <span className="text-white font-medium capitalize">
                            {disc === 'cycling' ? 'Cycling' : disc === 'funcional' ? 'Funcional' : 'Ambas'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">Horario Preferido *</label>
                    <select
                      name="horarioPreferido"
                      value={formData.horarioPreferido}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      disabled={cargando}
                    >
                      <option value="" className="bg-[#1A1814] text-white">Selecciona...</option>
                      <option value="manana" className="bg-[#1A1814] text-white">Mañana (6:00 - 12:00)</option>
                      <option value="tarde" className="bg-[#1A1814] text-white">Tarde (12:00 - 18:00)</option>
                      <option value="noche" className="bg-[#1A1814] text-white">Noche (18:00 - 22:00)</option>
                    </select>
                  </div>

                  {/* NUEVO CAMPO: Cómo nos conociste */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">¿Cómo nos conociste? *</label>
                    <select
                      name="fuenteAdquisicion"
                      value={formData.fuenteAdquisicion}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      disabled={cargando}
                    >
                      <option value="" className="bg-[#1A1814] text-white">Selecciona...</option>
                      <option value="redes_sociales" className="bg-[#1A1814] text-white">Redes Sociales (Instagram/Facebook)</option>
                      <option value="google" className="bg-[#1A1814] text-white">Búsqueda en Google</option>
                      <option value="recomendacion" className="bg-[#1A1814] text-white">Recomendación de amigo/familiar</option>
                      <option value="anuncio" className="bg-[#1A1814] text-white">Anuncio/Publicidad</option>
                      <option value="caminando" className="bg-[#1A1814] text-white">Pasaba por aquí</option>
                      <option value="otro" className="bg-[#1A1814] text-white">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">
                      Código de Referido (opcional)
                    </label>
                    <input
                      name="codigoReferido"
                      value={formData.codigoReferido}
                      onChange={handleChange}
                      placeholder="JUAN1234"
                      disabled={cargando}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    />
                    <p className="text-xs text-white/50 mt-1">Si alguien te recomendó, ingresa su código</p>
                  </div>
                </div>
              )}

              {/* STEP 3: Salud */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 mb-4">
                    <p className="text-sm text-white/80">
                      💡 Esta información nos ayuda a brindarte un mejor servicio y garantizar tu seguridad.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">
                      ¿Tienes condiciones médicas a considerar? (opcional)
                    </label>
                    <textarea
                      name="condicionesMedicas"
                      value={formData.condicionesMedicas}
                      onChange={handleChange}
                      placeholder="Diabetes, hipertensión, asma, etc."
                      disabled={cargando}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    />
                  </div>

                  <div className="mt-6">
                    <h3 className="text-white font-semibold mb-3">Contacto de Emergencia</h3>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Nombre Completo *</label>
                      <input
                        name="nombreEmergencia"
                        value={formData.nombreEmergencia}
                        onChange={handleChange}
                        placeholder="María García"
                        disabled={cargando}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-1.5">Teléfono * (10 dígitos)</label>
                        <input
                          name="telefonoEmergencia"
                          type="tel"
                          value={formData.telefonoEmergencia}
                          onChange={handleChange}
                          placeholder="1234567890"
                          disabled={cargando}
                          maxLength={10}
                          className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                        />
                        <p className="text-xs text-white/50 mt-1">{(formData.telefonoEmergencia as string).length}/10</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-1.5">Relación *</label>
                        <select
                          name="relacionEmergencia"
                          value={formData.relacionEmergencia}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                          disabled={cargando}
                        >
                          <option value="" className="bg-[#1A1814] text-white">Selecciona...</option>
                          <option value="familiar" className="bg-[#1A1814] text-white">Familiar</option>
                          <option value="amigo" className="bg-[#1A1814] text-white">Amigo/a</option>
                          <option value="pareja" className="bg-[#1A1814] text-white">Pareja</option>
                          <option value="otro" className="bg-[#1A1814] text-white">Otro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Términos */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <p className="text-white/90 text-sm mb-6">
                    Para completar tu registro, necesitamos que firmes digitalmente los siguientes documentos:
                  </p>

                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-white font-semibold mb-2">1. Términos y Condiciones</h3>
                    <p className="text-sm text-white/70 mb-3">Condiciones generales de uso del servicio</p>
                    <Button onClick={() => setMostrarTerminos(true)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      {firmaTerminos ? '✓ Firmado' : 'Firmar'}
                    </Button>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-white font-semibold mb-2">2. Responsabilidad de Actividad Física</h3>
                    <p className="text-sm text-white/70 mb-3">Confirmo estar en condiciones para realizar actividad física</p>
                    <Button onClick={() => setMostrarDeslinde(true)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      {firmaDeslinde ? '✓ Firmado' : 'Firmar'}
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 5: Éxito */}
              {currentStep === 5 && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>

                  <h2 className="text-3xl font-bold text-white mb-3">¡Cuenta Creada!</h2>
                  <p className="text-white/70 mb-8">
                    Tu cuenta ha sido creada exitosamente. Ahora necesitas verificar tu email para continuar.
                  </p>

                  <Button
                    onClick={() => router.push('/verificar-email')}
                    style={{ background: 'linear-gradient(135deg, #E84A27 0%, #FF6B35 100%)' }}
                    className="min-w-[200px]"
                  >
                    Verificar Email
                  </Button>
                </div>
              )}

              {/* Botones de navegación */}
              {currentStep < 5 && (
                <div className="flex gap-4 mt-8">
                  {!isFirstStep && (
                    <Button
                      onClick={goToPreviousStep}
                      variant="outline"
                      disabled={cargando}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      Anterior
                    </Button>
                  )}

                  {currentStep < 4 && (
                    <Button
                      onClick={handleNext}
                      disabled={cargando}
                      className="flex-1"
                      style={{ background: 'linear-gradient(135deg, #E84A27 0%, #FF6B35 100%)' }}
                    >
                      Siguiente
                    </Button>
                  )}

                  {currentStep === 4 && (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={cargando}
                      className="flex-1"
                      style={{ background: 'linear-gradient(135deg, #E84A27 0%, #FF6B35 100%)' }}
                    >
                      {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </Button>
                  )}
                </div>
              )}

              {currentStep < 5 && (
                <div className="mt-6 text-center text-sm">
                  <span className="text-white/60">¿Ya tienes cuenta? </span>
                  <Link href="/login" className="text-[#FF6B35] font-semibold hover:text-[#E84A27] transition-colors">
                    Inicia sesión aquí
                  </Link>
                </div>
              )}
            </MultiStepForm>
          </div>
        </motion.div>
      </div>

      {/* Modales de firmas */}
      <Modal isOpen={mostrarTerminos} onClose={() => setMostrarTerminos(false)} title="Términos y Condiciones" size="lg">
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-6">
          <p>Al utilizar STRIVE STUDIO, aceptas los siguientes términos...</p>
          <h3 className="font-semibold mt-4">1. Uso del Servicio</h3>
          <p>El servicio está diseñado para proporcionar clases de fitness...</p>
        </div>
        <SignaturePad
          onSave={(signature) => {
            setFirmaTerminos(signature)
            setMostrarTerminos(false)
          }}
        />
      </Modal>

      <Modal isOpen={mostrarDeslinde} onClose={() => setMostrarDeslinde(false)} title="Responsabilidad de Actividad Física" size="lg">
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-6">
          <p>Confirmo que estoy en condiciones físicas para realizar actividad física intensa...</p>
        </div>
        <SignaturePad
          onSave={(signature) => {
            setFirmaDeslinde(signature)
            setMostrarDeslinde(false)
          }}
        />
      </Modal>
    </AnimatedBackground>
  )
}