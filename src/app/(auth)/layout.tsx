// src/app/(auth)/layout.tsx
import React from 'react'

/**
 * Layout para páginas de autenticación
 * Sin estilos visuales - cada página maneja su propio diseño
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}