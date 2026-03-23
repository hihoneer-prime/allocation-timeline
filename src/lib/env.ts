/** Vite 빌드 시 주입. 미설정 시 로컬 전용(기존 localStorage) 동작 */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return Boolean(url && key && String(url).startsWith('http'))
}
