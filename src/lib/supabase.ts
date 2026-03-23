import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '@/lib/env'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase 환경 변수가 없습니다.')
  }
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL as string
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
    client = createClient(url, key)
  }
  return client
}
