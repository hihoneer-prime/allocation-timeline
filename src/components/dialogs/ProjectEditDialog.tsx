import { useState } from 'react'
import { useStore } from '@/store/useStore'
import type { Project } from '@/types'

interface ProjectEditDialogProps {
  project: Project
  onClose: () => void
}

export function ProjectEditDialog({ project, onClose }: ProjectEditDialogProps) {
  const [name, setName] = useState(project.name)
  const [startDate, setStartDate] = useState(project.startDate)
  const [endDate, setEndDate] = useState(project.endDate)
  const updateProject = useStore((s) => s.updateProject)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProject(project.id, { name, startDate, endDate })
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="rounded-lg bg-white p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-sm font-medium text-slate-800">
          프로젝트 수정
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm text-slate-600">
            이름
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="ml-2 w-48 rounded border border-slate-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm text-slate-600">
            시작일
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm text-slate-600">
            종료일
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm"
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
              className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
            >
              적용
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
