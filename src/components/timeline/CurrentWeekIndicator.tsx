import { getWeekIndex } from '@/utils/weekUtils'
import { WEEK_CELL_WIDTH } from '@/constants'
import type { WeekInfo } from '@/utils/weekUtils'

interface CurrentWeekIndicatorProps {
  weeks: WeekInfo[]
}

export function CurrentWeekIndicator({ weeks }: CurrentWeekIndicatorProps) {
  const idx = getWeekIndex(weeks, new Date())
  if (idx < 0) return null

  const left = idx * WEEK_CELL_WIDTH

  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-0 bg-amber-100/40"
      style={{
        left,
        width: WEEK_CELL_WIDTH,
      }}
      title="현재 주"
    />
  )
}
