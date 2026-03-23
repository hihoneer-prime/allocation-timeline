import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { ROLES } from '@/constants'
import type { Member } from '@/types'

interface MemberFormProps {
  onClose: () => void
  member?: Member
}

export function MemberForm({ onClose, member }: MemberFormProps) {
  const [name, setName] = useState(member?.name ?? '')
  const [role, setRole] = useState<string>(member?.role ?? ROLES[0])
  const addMember = useStore((s) => s.addMember)
  const updateMember = useStore((s) => s.updateMember)

  useEffect(() => {
    if (member) {
      setName(member.name)
      setRole(member.role)
    }
  }, [member])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      if (member) {
        await updateMember(member.id, { name: name.trim(), role })
      } else {
        await addMember(name.trim(), role)
      }
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <h3 className="text-sm font-medium text-slate-800">
        {member ? '구성원 수정' : '구성원 추가'}
      </h3>
      <label className="text-sm font-medium text-slate-700">
        이름
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="홍길동"
          autoFocus
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        직군
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {member ? '적용' : '추가'}
        </button>
      </div>
    </form>
  )
}
