import { ROW_HEIGHT, SIDEBAR_WIDTH } from '@/constants'
import { getWorkloadColorClass } from '@/hooks/useWorkloadColor'
import { formatRatio } from '@/utils/formatRatio'
import { useTimelineColumn } from '@/contexts/TimelineColumnContext'
import type { TimelineCell } from '@/types/timeline'

interface TotalRowProps {
  cells: TimelineCell[]
  weeklyTotals: number[]
  label: string
}

export function TotalRow({ cells, weeklyTotals, label }: TotalRowProps) {
  const column = useTimelineColumn()

  if (column === 'label') {
    return (
      <div
        className="flex flex-shrink-0 border-b border-slate-200 border-r border-slate-200 bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-100"
        style={{ minHeight: ROW_HEIGHT, width: SIDEBAR_WIDTH }}
      >
        {label}
      </div>
    )
  }

  return (
    <div
      className="flex flex-shrink-0 border-b border-slate-200 bg-slate-100"
      style={{ minHeight: ROW_HEIGHT }}
    >
      {cells.map((c, i) => {
        const total = weeklyTotals[i] ?? 0
        const colorClass = getWorkloadColorClass(total)
        return (
          <div
            key={c.index}
            className={`flex items-center justify-center border-r border-slate-200 py-1 text-xs font-medium ${colorClass}`}
            style={{ width: c.width }}
          >
            {total > 0 ? formatRatio(total) : ''}
          </div>
        )
      })}
    </div>
  )
}
