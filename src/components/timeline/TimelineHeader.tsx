import type { TimelineCell } from '@/types/timeline'
import { useTimelineColumn } from '@/contexts/TimelineColumnContext'
import { HEADER_ROW_HEIGHT, SUBHEADER_ROW_HEIGHT } from '@/constants'
import { formatGroupKey } from '@/utils/headerLabelUtils'

interface TimelineHeaderProps {
  cells: TimelineCell[]
}

export function TimelineHeader({ cells }: TimelineHeaderProps) {
  const column = useTimelineColumn()
  const groupSpans = getGroupSpans(cells)

  if (column === 'label') {
    return (
      <div
        className="flex flex-shrink-0 border-b border-slate-300 bg-slate-100"
        style={{ minHeight: HEADER_ROW_HEIGHT }}
      />
    )
  }

  return (
    <div
      className="flex flex-shrink-0 border-b border-slate-300 bg-slate-100"
      style={{ minHeight: HEADER_ROW_HEIGHT }}
    >
      {groupSpans.map(({ groupKey, span, firstCell }) => (
        <div
          key={groupKey}
          className="border-r border-slate-300 px-2 py-1 text-center text-sm font-semibold text-slate-800"
          style={{ width: span * (firstCell?.width ?? 48) }}
        >
          {formatGroupKey(groupKey)}
        </div>
      ))}
    </div>
  )
}

export function TimelineSubHeader({ cells }: TimelineHeaderProps) {
  const column = useTimelineColumn()
  const now = new Date()
  const currentIdx = cells.findIndex(
    (c) => now.getTime() >= c.start.getTime() && now.getTime() <= c.end.getTime()
  )
  if (column === 'label') {
    return (
      <div
        className="flex flex-shrink-0 border-b border-slate-300 border-r border-slate-300 bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700"
        style={{ minHeight: SUBHEADER_ROW_HEIGHT }}
      >
        기간
      </div>
    )
  }

  return (
    <div
      className="flex flex-shrink-0 border-b border-slate-300 bg-slate-200"
      style={{ minHeight: SUBHEADER_ROW_HEIGHT }}
    >
      {cells.map((c, i) => (
        <div
          key={c.index}
          className={`flex flex-col items-center justify-center border-r border-slate-300 py-1 ${
            i === currentIdx ? 'bg-violet-200/90' : ''
          }`}
          style={{ width: c.width }}
        >
          <span className="text-xs font-semibold text-slate-800">
            {c.label}
          </span>
          {c.subLabel && (
            <span className="text-[10px] text-slate-600">
              ({c.subLabel})
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function getGroupSpans(cells: TimelineCell[]) {
  const seen = new Set<string>()
  const result: { groupKey: string; span: number; firstCell: TimelineCell }[] = []
  for (const c of cells) {
    if (!seen.has(c.groupKey)) {
      seen.add(c.groupKey)
      const span = cells.filter((x) => x.groupKey === c.groupKey).length
      result.push({ groupKey: c.groupKey, span, firstCell: c })
    }
  }
  return result
}
