import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  addDays,
  isWithinInterval,
  parseISO,
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
} from 'date-fns'
import { getWeekOfMonth } from '@/utils/weekOfMonthUtils'
import { WEEK_CELL_WIDTH } from '@/constants'

const MONTHS_RANGE = 3

export interface WeekInfo {
  weekStart: Date
  weekEnd: Date
  weekIndex: number
  monthKey: string
  weekLabel: string
  dateRangeLabel: string
}

export function getWeeksInRange(startDate: Date, endDate: Date): WeekInfo[] {
  const weeks: WeekInfo[] = []
  let current = startOfWeek(startDate, { weekStartsOn: 1 })
  const end = endOfWeek(endDate, { weekStartsOn: 1 })
  let weekIndex = 0

  while (current <= end) {
    const weekEnd = endOfWeek(current, { weekStartsOn: 1 })
    const { monthKey, weekNumber } = getWeekOfMonth(current)
    weeks.push({
      weekStart: current,
      weekEnd,
      weekIndex: weekIndex++,
      monthKey,
      weekLabel: `${weekNumber}주`,
      dateRangeLabel: `${format(current, 'd')}~${format(weekEnd, 'd')}`,
    })
    current = addWeeks(current, 1)
  }

  return weeks
}

export function getWeekIndex(weeks: WeekInfo[], date: Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date
  for (let i = 0; i < weeks.length; i++) {
    if (
      isWithinInterval(d, {
        start: weeks[i].weekStart,
        end: weeks[i].weekEnd,
      })
    ) {
      return i
    }
  }
  return -1
}

/** Get pixel position (left edge) for a date (can be outside weeks range - clamped) */
export function getDatePosition(weeks: WeekInfo[], date: Date | string): number {
  const d = typeof date === 'string' ? parseISO(date) : date
  const idx = getWeekIndex(weeks, d)
  if (idx >= 0) return idx * WEEK_CELL_WIDTH
  if (weeks.length === 0) return 0
  const first = weeks[0].weekStart
  if (d < first) return 0
  return weeks.length * WEEK_CELL_WIDTH
}

/** Get pixel position (right edge) for end date */
export function getEndDatePosition(weeks: WeekInfo[], date: Date | string): number {
  const d = typeof date === 'string' ? parseISO(date) : date
  const idx = getWeekIndex(weeks, d)
  if (idx >= 0) return (idx + 1) * WEEK_CELL_WIDTH
  if (weeks.length === 0) return WEEK_CELL_WIDTH
  const first = weeks[0].weekStart
  if (d < first) return 0
  return weeks.length * WEEK_CELL_WIDTH
}

/** Convert pixel position (from timeline left) to date string */
export function pixelToDate(weeks: WeekInfo[], pixelLeft: number): string {
  if (weeks.length === 0) return format(new Date(), 'yyyy-MM-dd')
  const daysFromStart = (pixelLeft / WEEK_CELL_WIDTH) * 7
  const d = addDays(weeks[0].weekStart, daysFromStart)
  return format(d, 'yyyy-MM-dd')
}

export function dateToWeekKey(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const start = startOfWeek(d, { weekStartsOn: 1 })
  return format(start, 'yyyy-MM-dd')
}

export function getDisplayRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = startOfMonth(addMonths(now, -MONTHS_RANGE))
  const end = endOfMonth(addMonths(now, MONTHS_RANGE))
  return { start, end }
}
