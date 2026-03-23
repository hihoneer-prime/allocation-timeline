import { format } from 'date-fns'
import type { WeekInfo } from '@/utils/weekUtils'
import { SIDEBAR_WIDTH, WEEK_CELL_WIDTH } from '@/constants'

interface WeekHeaderProps {
  weeks: WeekInfo[]
}

export function WeekHeader({ weeks }: WeekHeaderProps) {
  const monthColSpans = useMonthSpans(weeks)

  return (
    <div className="flex border-b border-slate-200 bg-slate-50">
      <div className="flex-shrink-0 border-r border-slate-200" style={{ width: SIDEBAR_WIDTH }} />
      <div className="flex">
        {monthColSpans.map(({ monthKey, span }) => (
          <div
            key={monthKey}
            className="border-r border-slate-200 px-2 py-1 text-center text-sm font-medium text-slate-600"
            style={{ width: span * WEEK_CELL_WIDTH }}
          >
            {format(new Date(monthKey + '-01'), 'yyyy.M')}
          </div>
        ))}
      </div>
    </div>
  )
}

function useMonthSpans(weeks: WeekInfo[]) {
  const seen = new Set<string>()
  const result: { monthKey: string; span: number }[] = []
  for (const w of weeks) {
    if (!seen.has(w.monthKey)) {
      seen.add(w.monthKey)
      result.push({
        monthKey: w.monthKey,
        span: weeks.filter((x) => x.monthKey === w.monthKey).length,
      })
    }
  }
  return result
}

export function WeekSubHeader({ weeks }: WeekHeaderProps) {
  const now = new Date()
  const currentIdx = weeks.findIndex(
    (w) => now >= w.weekStart && now <= w.weekEnd
  )

  return (
    <div className="flex border-b border-slate-200 bg-slate-100/80">
      <div
        className="flex-shrink-0 border-r border-slate-200 px-2 py-1 text-xs text-slate-500"
        style={{ width: SIDEBAR_WIDTH }}
      >
        주차
      </div>
      <div className="flex">
        {weeks.map((w, i) => (
          <div
            key={w.weekIndex}
            className={`flex flex-col items-center border-r border-slate-200 py-1 ${i === currentIdx ? 'bg-amber-200/60' : ''}`}
            style={{ width: WEEK_CELL_WIDTH }}
          >
            <span className="text-xs font-medium text-slate-600">
              {w.weekLabel}
            </span>
            <span className="text-[10px] text-slate-400">
              ({w.dateRangeLabel})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
