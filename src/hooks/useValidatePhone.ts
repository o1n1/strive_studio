// src/hooks/useValidatePhone.ts
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ValidationResult {
  isValid: boolean
  isChecking: boolean
  message: string
}

/**
 * Hook para validar teléfono en tiempo real
 * - Verifica formato (10 dígitos)
 * - Verifica que no exista en BD (debounced)
 */
export function useValidatePhone(phone: string, enabled: boolean = true) {
  const [result, setResult] = useState<ValidationResult>({
    isValid: true,
    isChecking: false,
    message: '',
  })

  const validatePhone = useCallback(
    async (phoneToValidate: string) => {
      // Limpiar formato (solo números)
      const cleanPhone = phoneToValidate.replace(/\D/g, '')

      // Validar formato (10 dígitos)
      if (cleanPhone.length !== 10) {
        setResult({
          isValid: false,
          isChecking: false,
          message: 'Debe ser un número de 10 dígitos',
        })
        return
      }

      // Verificar en BD
      setResult(prev => ({ ...prev, isChecking: true }))

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('telefono', cleanPhone)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setResult({
            isValid: false,
            isChecking: false,
            message: 'Este teléfono ya está registrado',
          })
        } else {
          setResult({
            isValid: true,
            isChecking: false,
            message: 'Teléfono disponible',
          })
        }
      } catch (error) {
        console.error('Error validando teléfono:', error)
        setResult({
          isValid: false,
          isChecking: false,
          message: 'Error al verificar teléfono',
        })
      }
    },
    []
  )

  useEffect(() => {
    if (!enabled || !phone || phone.length < 3) {
      setResult({ isValid: true, isChecking: false, message: '' })
      return
    }

    // Debounce de 500ms
    const timeoutId = setTimeout(() => {
      validatePhone(phone)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [phone, enabled, validatePhone])

  return result
}

/**
 * Formatea teléfono a formato MX: (XXX) XXX-XXXX
 */
export function formatPhoneMX(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
}