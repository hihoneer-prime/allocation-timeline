import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/AuthContext'

interface LoginDialogProps {
  onClose: () => void
}

export function LoginDialog({ onClose }: LoginDialogProps) {
  const { signInWithPassword, signUpWithPassword } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!email.trim() || !password) {
      setMessage('이메일과 비밀번호를 입력하세요.')
      return
    }
    setBusy(true)
    try {
      const fn = mode === 'signin' ? signInWithPassword : signUpWithPassword
      const { error } = await fn(email.trim(), password)
      if (error) {
        setMessage(error.message)
        return
      }
      if (mode === 'signup') {
        setMessage('가입 확인 메일을 확인하거나, 대시보드에서 이메일 확인을 끈 경우 바로 로그인됩니다.')
        setMode('signin')
      } else {
        onClose()
      }
    } finally {
      setBusy(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          {mode === 'signin' ? '로그인' : '회원가입'}
        </h2>
        <p className="mb-3 text-xs text-slate-500">
          데이터 수정은 로그인 후 가능합니다. 누구나 타임라인을 볼 수 있습니다.
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-2">
          <input
            type="email"
            autoComplete="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          {message && <p className="text-xs text-amber-700">{message}</p>}
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {busy ? '처리 중…' : mode === 'signin' ? '로그인' : '가입'}
            </button>
            <button type="button" onClick={onClose} className="rounded px-3 text-sm text-slate-600">
              닫기
            </button>
          </div>
          <button
            type="button"
            className="text-xs text-violet-600 hover:underline"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setMessage(null)
            }}
          >
            {mode === 'signin' ? '계정이 없으면 회원가입' : '이미 계정이 있으면 로그인'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  )
}
