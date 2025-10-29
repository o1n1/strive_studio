// src/lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database.types'

/**
 * Cliente de Supabase para componentes del lado del cliente (Client Components)
 * 
 * IMPORTANTE: Solo usar en componentes marcados con 'use client'
 * Para Server Components, usar createServerClient de server.ts
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Exportar instancia global para uso en hooks y componentes cliente
export const supabase = createClient()