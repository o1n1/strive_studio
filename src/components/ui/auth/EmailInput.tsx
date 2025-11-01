// src/components/ui/auth/EmailInput.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useValidateEmail } from '@/hooks/useValidateEmail'

interface EmailInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  required?: boolean
  validateDuplicate?: boolean
}

export function EmailInput({
  value,
  onChange,
  onBlur,
  disabled = false,
  required = true,
  validateDuplicate = true
}: EmailInputProps) {
  const validation = useValidateEmail(value, validateDuplicate)

  const showSuccess = validation.isValid && value.length > 0 && !validation.isChecking && validation.message
  const showError = !validation.isValid && value.length > 0 && !validation.isChecking
  const showLoading = validation.isChecking

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white/90 mb-1.5">
        Email {required && '*'}
      </label>
      
      <div className="relative">
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="tu@email.com"
          className={`
            w-full px-4 py-2.5 pr-12 rounded-lg border
            bg-white/10 text-white placeholder-white/40
            focus:outline-none focus:ring-2 transition-all
            ${showError ? 'border-red-500 focus:ring-red-500/50' : ''}
            ${showSuccess ? 'border-green-500 focus:ring-green-500/50' : 'border-white/20 focus:ring-[#FF6B35]'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />

        {/* Indicador de estado */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <AnimatePresence mode="wait">
            {showLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"
              />
            )}
            
            {showSuccess && (
              <motion.svg
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            )}

            {showError && (
              <motion.svg
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mensaje de validación */}
      <AnimatePresence>
        {validation.message && !validation.isChecking && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`text-xs mt-1 ml-1 ${
              validation.isValid ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {validation.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}