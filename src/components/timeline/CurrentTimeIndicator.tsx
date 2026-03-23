import { startOfDay } from 'date-fns'
import { getCellIndex, getDatePositionPrecise } from '@/utils/timelineUtils'
import type { TimelineCell } from '@/types/timeline'

interface CurrentTimeIndicatorProps {
  cells: TimelineCell[]
}

/** 셀 영역만 렌더되므로 0 기준 좌표 */
export function CurrentTimeIndicator({ cells }: CurrentTimeIndicatorProps) {
  const now = startOfDay(new Date())
  const idx = getCellIndex(cells, now)
  if (idx < 0) return null

  const cell = cells[idx]
  const cellLeftOffset = cells.slice(0, idx).reduce((sum, c) => sum + c.width, 0)
  const lineLeftOffset = getDatePositionPrecise(cells, now)
  const lineLeft = lineLeftOffset >= 0 ? lineLeftOffset : cellLeftOffset

  return (
    <>
      <div
        className="pointer-events-none absolute inset-y-0 z-0 border-l-2 border-violet-600 bg-violet-100/50"
        style={{ left: cellLeftOffset, width: cell.width }}
        title="오늘"
      />
      <div
        className="pointer-events-none absolute inset-y-0 z-[1] w-0.5 bg-violet-600"
        style={{ left: lineLeft }}
        title="오늘"
      />
    </>
  )
}
