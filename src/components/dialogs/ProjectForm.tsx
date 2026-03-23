import { useState } from 'react'
import { useStore } from '@/store/useStore'

interface ProjectFormProps {
  onClose: () => void
}

export function ProjectForm({ onClose }: ProjectFormProps) {
  const [name, setName] = useState('')
  const addProject = useStore((s) => s.addProject)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      try {
        addProject(name.trim())
      } finally {
        onClose()
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <label className="text-sm font-medium text-slate-700">
        프로젝트 이름
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="예: AEGD 2025 RE 관리 시스템"
          autoFocus
        />
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
          추가
        </button>
      </div>
    </form>
  )
}
