// src/hooks/useValidateEmail.ts
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ValidationResult {
  isValid: boolean
  isChecking: boolean
  message: string
}

/**
 * Hook para validar email en tiempo real
 * - Verifica formato
 * - Verifica que no exista en BD (debounced)
 */
export function useValidateEmail(email: string, enabled: boolean = true) {
  const [result, setResult] = useState<ValidationResult>({
    isValid: true,
    isChecking: false,
    message: '',
  })

  const validateEmail = useCallback(
    async (emailToValidate: string) => {
      // Validar formato
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailToValidate)) {
        setResult({
          isValid: false,
          isChecking: false,
          message: 'Formato de email inválido',
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
          .eq('email', emailToValidate)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setResult({
            isValid: false,
            isChecking: false,
            message: 'Este email ya está registrado',
          })
        } else {
          setResult({
            isValid: true,
            isChecking: false,
            message: 'Email disponible',
          })
        }
      } catch (error) {
        console.error('Error validando email:', error)
        setResult({
          isValid: false,
          isChecking: false,
          message: 'Error al verificar email',
        })
      }
    },
    []
  )

  useEffect(() => {
    if (!enabled || !email || email.length < 3) {
      setResult({ isValid: true, isChecking: false, message: '' })
      return
    }

    // Debounce de 500ms
    const timeoutId = setTimeout(() => {
      validateEmail(email)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [email, enabled, validateEmail])

  return result
}
