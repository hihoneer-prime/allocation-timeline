import { useState } from 'react'
import { isSupabaseConfigured } from '@/lib/env'
import { useAuth } from '@/contexts/AuthContext'
import { LoginDialog } from '@/components/auth/LoginDialog'

export function AuthBar() {
  const [open, setOpen] = useState(false)
  const { user, loading, signOut } = useAuth()

  if (!isSupabaseConfigured()) {
    return (
      <span className="text-xs text-slate-400" title="VITE_SUPABASE_* 미설정 시 로컬 전용">
        로컬 저장
      </span>
    )
  }

  if (loading) {
    return <span className="text-xs text-slate-500">인증 확인 중…</span>
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="max-w-[140px] truncate text-xs text-slate-600" title={user.email}>
          {user.email}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-700"
      >
        로그인
      </button>
      {open && <LoginDialog onClose={() => setOpen(false)} />}
    </>
  )
}
