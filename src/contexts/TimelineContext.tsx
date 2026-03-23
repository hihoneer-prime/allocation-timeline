import { createContext, useContext, useMemo, useEffect } from 'react'
import { startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns'
import { getTimelineCells, getCellIndex } from '@/utils/timelineUtils'
import type { TimelineScale, TimelineCell } from '@/types/timeline'
import { TIMELINE_SPAN_YEARS } from '@/constants'
import { useStore } from '@/store/useStore'

interface TimelineContextValue {
  cells: TimelineCell[]
  scale: TimelineScale
  timelineStartYear: number
  scrollRef: React.RefObject<HTMLDivElement | null>
  scrollToToday: () => void
  scrollToStart: () => void
  scrollToEnd: () => void
}

const TimelineContext = createContext<TimelineContextValue | null>(null)

export function useTimeline() {
  const ctx = useContext(TimelineContext)
  if (!ctx) throw new Error('useTimeline must be used within TimelineProvider')
  return ctx
}

export function useTimelineOptional() {
  return useContext(TimelineContext)
}

interface TimelineProviderProps {
  scale: TimelineScale
  timelineStartYear: number
  scrollRef: React.RefObject<HTMLDivElement | null>
  children: React.ReactNode
}

export function TimelineProvider({ scale, timelineStartYear, scrollRef, children }: TimelineProviderProps) {
  const cells = useMemo(() => {
    const start = startOfYear(new Date(timelineStartYear, 0, 1))
    const end = endOfYear(new Date(timelineStartYear + TIMELINE_SPAN_YEARS - 1, 0, 1))
    if (scale === 'day') {
      return getTimelineCells(scale, start, end)
    }
    if (scale === 'week') {
      const weekStart = startOfWeek(start, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(end, { weekStartsOn: 1 })
      return getTimelineCells(scale, weekStart, weekEnd)
    }
    if (scale === 'month') {
      return getTimelineCells(scale, start, end)
    }
    return getTimelineCells(scale, start, end)
  }, [scale, timelineStartYear])

  const scrollToTodayRequested = useStore((s) => s.scrollToTodayRequested)
  const setScrollToTodayRequested = useStore((s) => s.setScrollToTodayRequested)

  const performScrollToToday = () => {
    const el = scrollRef.current
    if (!el) return
    const idx = getCellIndex(cells, new Date())
    if (idx < 0) return
    const cellWidth = cells[0]?.width ?? 48
    el.scrollLeft = Math.max(0, idx * cellWidth - 80)
  }

  const scrollToToday = () => {
    performScrollToToday()
  }

  useEffect(() => {
    if (!scrollToTodayRequested) return
    const idx = getCellIndex(cells, new Date())
    if (idx < 0) return
    setScrollToTodayRequested(false)
    requestAnimationFrame(() => {
      const el = scrollRef.current
      if (!el) return
      const cellWidth = cells[0]?.width ?? 48
      el.scrollLeft = Math.max(0, idx * cellWidth - 80)
    })
  }, [cells, scrollToTodayRequested, setScrollToTodayRequested])

  const scrollToStart = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = 0
  }

  const scrollToEnd = () => {
    const el = scrollRef.current
    if (!el) return
    const cellWidth = cells[0]?.width ?? 48
    el.scrollLeft = cells.length * cellWidth - el.clientWidth
  }

  const value = useMemo(
    () => ({
      cells,
      scale,
      timelineStartYear,
      scrollRef,
      scrollToToday,
      scrollToEnd,
      scrollToStart,
    }),
    [cells, scale, timelineStartYear, scrollRef]
  )

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  )
}
