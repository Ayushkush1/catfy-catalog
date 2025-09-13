import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { getSupabaseConfig } from '@/lib/env'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!client) {
    const { url, anonKey } = getSupabaseConfig()
    client = createBrowserClient<Database>(url, anonKey)
  }
  return client
}