import { useStore } from '@/store/useStore'

export function ViewToggle() {
  const viewMode = useStore((s) => s.viewMode)
  const setViewMode = useStore((s) => s.setViewMode)

  return (
    <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      <button
        type="button"
        onClick={() => setViewMode('project')}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          viewMode === 'project'
            ? 'bg-violet-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
        }`}
      >
        프로젝트별
      </button>
      <button
        type="button"
        onClick={() => setViewMode('member')}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          viewMode === 'member'
            ? 'bg-violet-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
        }`}
      >
        인원별
      </button>
    </div>
  )
}
