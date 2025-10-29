// src/app/(dashboard)/cliente/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function ClienteDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1814] mb-2">
          ¡Bienvenido a STRIVE!
        </h1>
        <p className="text-gray-600">
          Tu viaje fitness comienza aquí
        </p>
      </div>

      {/* Créditos y Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Créditos Disponibles</p>
              <p className="text-5xl font-bold text-[#AE3F21]">8</p>
              <p className="text-xs text-gray-500 mt-2">Expiran: 15 días</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Clases Completadas</p>
              <p className="text-5xl font-bold text-[#AE3F21]">12</p>
              <p className="text-xs text-gray-500 mt-2">Este mes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Racha Actual</p>
              <p className="text-5xl font-bold text-[#AE3F21]">5</p>
              <p className="text-xs text-gray-500 mt-2">días 🔥</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Reservar Clase</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/cliente/reservar">
              <Button variant="primary" size="lg" className="w-full mb-4">
                Ver Clases Disponibles
              </Button>
            </Link>
            <div className="text-sm text-gray-600 space-y-2">
              <p>🚴 Cycling de alto impacto</p>
              <p>💪 Funcional para todo el cuerpo</p>
              <p>📅 Elige tu horario preferido</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comprar Paquete</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/cliente/paquetes">
              <Button variant="secondary" size="lg" className="w-full mb-4">
                Ver Paquetes
              </Button>
            </Link>
            <div className="text-sm text-gray-600 space-y-2">
              <p>💳 Diferentes opciones de créditos</p>
              <p>🎁 Promociones especiales</p>
              <p>⚡ Activación inmediata</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mis Próximas Clases */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Próximas Clases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#AE3F21]/10 to-transparent rounded-lg border-l-4 border-[#AE3F21]">
              <div>
                <p className="font-semibold text-[#1A1814] mb-1">
                  Cycling - Salón A
                </p>
                <p className="text-sm text-gray-600">
                  Hoy, 18:00 - 18:50
                </p>
                <p className="text-sm text-gray-600">
                  Coach: María González
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[#AE3F21]">
                  Bici #12
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Ver Detalles
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-[#1A1814] mb-1">
                  Funcional - Salón B
                </p>
                <p className="text-sm text-gray-600">
                  Mañana, 07:00 - 07:50
                </p>
                <p className="text-sm text-gray-600">
                  Coach: Carlos Ruiz
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">
                  Tapete #5
                </p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Cancelar
                </Button>
              </div>
            </div>

            <div className="text-center py-4">
              <Link
                href="/cliente/reservas"
                className="text-sm text-[#AE3F21] hover:underline"
              >
                Ver todas mis reservas →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas y Notificaciones */}
      <div className="mt-8">
        <Card padding="md" shadow="sm">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1A1814] mb-1">
                Consejo del día
              </p>
              <p className="text-sm text-gray-600">
                Recuerda llegar 10 minutos antes de tu clase para hacer check-in 
                y prepararte adecuadamente. ¡Aprovecha al máximo tu entrenamiento!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}