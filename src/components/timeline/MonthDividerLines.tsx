import { getDay } from 'date-fns'
import type { TimelineCell, TimelineScale } from '@/types/timeline'

interface ScaleDividerLinesProps {
  cells: TimelineCell[]
  scale: TimelineScale
}

/** 셀 영역만 렌더되므로 0 기준 좌표 */
export function MonthDividerLines({ cells, scale }: ScaleDividerLinesProps) {
  if (cells.length === 0) return null

  const dividers: { left: number }[] = []
  let offset = 0

  if (scale === 'day') {
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i]
      const dayOfWeek = getDay(c.start)
      const isMonday = dayOfWeek === 1
      if (i > 0 && isMonday) {
        dividers.push({ left: offset })
      }
      offset += c.width
    }
  } else {
    let lastGroupKey = ''
    for (const c of cells) {
      if (lastGroupKey && c.groupKey !== lastGroupKey) {
        dividers.push({ left: offset })
      }
      offset += c.width
      lastGroupKey = c.groupKey
    }
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {dividers.map(({ left }, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px bg-slate-200/80"
          style={{ left }}
        />
      ))}
    </div>
  )
}
