import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '@/lib/env'

let session: Session | null = null

export function setGlobalAuthSession(s: Session | null): void {
  session = s
}

export function getGlobalAuthSession(): Session | null {
  return session
}

/** Supabase 사용 중인데 로그인 안 됐으면 throw */
export function assertWriteAllowed(): void {
  if (isSupabaseConfigured() && !session) {
    throw new Error('데이터를 수정하려면 로그인하세요.')
  }
}
