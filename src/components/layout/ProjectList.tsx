import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '@/store/useStore'
import { ProjectForm } from '@/components/dialogs/ProjectForm'
import { ProjectEditDialog } from '@/components/dialogs/ProjectEditDialog'
import { ProjectChip } from '@/components/layout/ProjectChip'
import type { Project } from '@/types'

export function ProjectList() {
  const projects = useStore((s) => s.projects)
  const selectedProjectId = useStore((s) => s.selectedProjectId)
  const setSelectedProjectId = useStore((s) => s.setSelectedProjectId)
  const removeProject = useStore((s) => s.removeProject)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  return (
    <div className="p-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">프로젝트</span>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700"
        >
          + 추가
        </button>
      </div>
      {showForm &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30"
            onClick={() => setShowForm(false)}
          >
            <div
              className="rounded-lg bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <ProjectForm onClose={() => setShowForm(false)} />
            </div>
          </div>,
          document.body
        )}
      {editingProject &&
        createPortal(
          <ProjectEditDialog
            project={editingProject}
            onClose={() => setEditingProject(null)}
          />,
          document.body
        )}
      <ul className="space-y-1">
        {projects.map((p) => (
          <li
            key={p.id}
            className={`group flex cursor-pointer items-center justify-between gap-1 rounded px-2 py-1 text-sm hover:bg-slate-100 ${
              selectedProjectId === p.id ? 'bg-emerald-100' : ''
            }`}
            onClick={() => setSelectedProjectId(selectedProjectId === p.id ? null : p.id)}
          >
            <ProjectChip project={p} className="min-w-0 flex-1 text-left" />
            <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingProject(p)
                }}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                title="수정"
              >
                ✎
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  void removeProject(p.id)
                    .then(() => {
                      if (selectedProjectId === p.id) setSelectedProjectId(null)
                    })
                    .catch((err) => alert(err instanceof Error ? err.message : String(err)))
                }}
                className="rounded p-0.5 text-slate-400 hover:text-red-600"
                title="삭제"
              >
                ×
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
