import { useRef } from 'react'
import { useStore } from '@/store/useStore'

export function ExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `allocation-timeline-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.members && data.projects && data.allocations) {
          importData(data)
        }
      } catch {
        alert('파일 형식이 올바르지 않습니다.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleCopyShare = async () => {
    const data = exportData()
    const str = JSON.stringify(data)
    const encoded = btoa(unescape(encodeURIComponent(str)))
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`
    try {
      await navigator.clipboard.writeText(url)
      alert('URL이 클립보드에 복사되었습니다.')
    } catch {
      alert('복사에 실패했습니다.')
    }
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border-t border-slate-200">
      <button
        type="button"
        onClick={handleExport}
        className="rounded bg-slate-600 px-2 py-1 text-xs text-white hover:bg-slate-700"
      >
        내보내기
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
      >
        불러오기
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
      <button
        type="button"
        onClick={handleCopyShare}
        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
      >
        URL 복사
      </button>
    </div>
  )
}
