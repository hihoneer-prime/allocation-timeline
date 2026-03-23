import { useStore } from '@/store/useStore'
import { useTimeline } from '@/contexts/TimelineContext'
import type { TimelineScale } from '@/types/timeline'
import { TIMELINE_SPAN_YEARS } from '@/constants'

const SCALE_LABELS: Record<TimelineScale, string> = {
  day: '일',
  week: '주',
  month: '월',
  quarter: '분기',
}

export function TimelineToolbar() {
  const scale = useStore((s) => s.timelineScale)
  const setScale = useStore((s) => s.setTimelineScale)
  const timelineStartYear = useStore((s) => s.timelineStartYear)
  const setTimelineStartYear = useStore((s) => s.setTimelineStartYear)
  const setScrollToTodayRequested = useStore((s) => s.setScrollToTodayRequested)
  const shiftTimelineYear = useStore((s) => s.shiftTimelineYear)
  const { scrollToToday, scrollToStart, scrollToEnd } = useTimeline()

  const handleTodayClick = () => {
    const currentYear = new Date().getFullYear()
    if (timelineStartYear !== currentYear) {
      setTimelineStartYear(currentYear)
      setScrollToTodayRequested(true)
    } else {
      scrollToToday()
    }
  }

  const endYear = timelineStartYear + TIMELINE_SPAN_YEARS - 1
  const rangeLabel = `${timelineStartYear}년 1월 1일 ~ ${endYear}년 12월 31일`

  return (
    <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-slate-300 bg-white px-4 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded border border-slate-300 bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => shiftTimelineYear(-1)}
            className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            title="이전 년도"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-2 text-xs text-slate-600">년</span>
          <button
            type="button"
            onClick={() => shiftTimelineYear(1)}
            className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            title="다음 년도"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-0.5 rounded border border-slate-300 bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={scrollToStart}
            className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            title="처음으로"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleTodayClick}
            className="rounded px-1.5 py-0.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={scrollToEnd}
            className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            title="끝으로"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100 p-0.5">
          {(['day', 'week', 'month', 'quarter'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                scale === s
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {SCALE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 text-center text-sm font-medium text-slate-700">
        {rangeLabel}
      </div>
    </div>
  )
}
