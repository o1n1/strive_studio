// src/app/(auth)/layout.tsx
import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AE3F21] via-[#9C7A5E] to-[#1A1814] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">STRIVE</h1>
          <p className="text-white/80">Studio de Fitness</p>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  )
}