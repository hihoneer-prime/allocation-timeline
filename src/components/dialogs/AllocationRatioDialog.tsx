import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { ROLES } from '@/constants'
import type { Allocation } from '@/types'

interface AllocationRatioDialogProps {
  allocation: Allocation
  onClose: () => void
}

export function AllocationRatioDialog({
  allocation,
  onClose,
}: AllocationRatioDialogProps) {
  const [ratio, setRatio] = useState(
    allocation.segments[0]?.ratio ?? 1
  )
  const [role, setRole] = useState(allocation.role)
  const [startDate, setStartDate] = useState(allocation.startDate)
  const [endDate, setEndDate] = useState(allocation.endDate)

  useEffect(() => {
    setRatio(allocation.segments[0]?.ratio ?? 1)
    setRole(allocation.role)
    setStartDate(allocation.startDate)
    setEndDate(allocation.endDate)
  }, [])
  const updateAllocationSegments = useStore((s) => s.updateAllocationSegments)
  const updateAllocation = useStore((s) => s.updateAllocation)
  const removeAllocation = useStore((s) => s.removeAllocation)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const clamped = Math.max(0.01, Math.min(1, Math.round(ratio * 100) / 100))
    const sortedStart = startDate <= endDate ? startDate : endDate
    const sortedEnd = startDate <= endDate ? endDate : startDate
    try {
      await updateAllocationSegments(allocation.id, [
        {
          start: sortedStart,
          end: sortedEnd,
          ratio: clamped,
        },
      ])
      await updateAllocation(allocation.id, {
        role,
        startDate: sortedStart,
        endDate: sortedEnd,
      })
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err))
    }
  }

  const handleDelete = () => {
    if (!confirm('이 투입을 삭제하시겠습니까?')) return
    void removeAllocation(allocation.id)
      .then(() => onClose())
      .catch((err) => alert(err instanceof Error ? err.message : String(err)))
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
          투입 설정
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm text-slate-600">
            역할
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            투입 기간
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
              />
              <span className="text-slate-400">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
          </label>
          <label className="text-sm text-slate-600">
            투입 비율 (0.01 ~ 1.0)
            <input
              type="number"
              min={0.01}
              max={1}
              step={0.01}
              value={ratio}
              onChange={(e) => setRatio(parseFloat(e.target.value) || 0)}
              className="ml-2 w-20 rounded border border-slate-300 px-2 py-1 text-sm"
            />
          </label>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              삭제
            </button>
            <div className="flex gap-2">
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
          </div>
        </form>
      </div>
    </div>
  )
}
