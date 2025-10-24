import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { getSupabaseConfig } from '@/lib/env'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseConfig()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Service role client for admin operations
export function createServiceRoleClient() {
  const { url, serviceRoleKey } = getSupabaseConfig()

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createServerClient<Database>(url, serviceRoleKey, {
    cookies: {
      get() {
        return undefined
      },
      set() {
        // no-op
      },
      remove() {
        // no-op
      },
    },
  })
}

// Legacy export for backward compatibility
export const createClient = createServerSupabaseClient
