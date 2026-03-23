import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  addDays,
  addMonths,
  addQuarters,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  isWithinInterval,
  parseISO,
  format,
  differenceInDays,
} from 'date-fns'
import { getWeekOfMonth } from '@/utils/weekOfMonthUtils'
import type { TimelineScale, TimelineCell } from '@/types/timeline'

const CELL_WIDTHS: Record<TimelineScale, number> = {
  day: 28,
  week: 48,
  month: 96,
  quarter: 140,
}

export function getCellWidth(scale: TimelineScale): number {
  return CELL_WIDTHS[scale]
}

export function getTimelineCells(
  scale: TimelineScale,
  startDate: Date,
  endDate: Date
): TimelineCell[] {
  const cells: TimelineCell[] = []
  const width = CELL_WIDTHS[scale]

  if (scale === 'day') {
    let current = new Date(startDate)
    current.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    let i = 0
    while (current <= end) {
      const dayEnd = new Date(current)
      dayEnd.setHours(23, 59, 59, 999)
      cells.push({
        start: new Date(current),
        end: dayEnd,
        index: i++,
        width,
        label: format(current, 'd'),
        subLabel: format(current, 'EEE'),
        groupKey: format(current, 'yyyy-MM'),
      })
      current = addDays(current, 1)
    }
  } else if (scale === 'week') {
    let current = startOfWeek(startDate, { weekStartsOn: 1 })
    const end = endOfWeek(endDate, { weekStartsOn: 1 })
    let i = 0
    while (current <= end) {
      const weekEnd = endOfWeek(current, { weekStartsOn: 1 })
      const { monthKey, weekNumber } = getWeekOfMonth(current)
      cells.push({
        start: new Date(current),
        end: weekEnd,
        index: i++,
        width,
        label: `${weekNumber}주`,
        subLabel: `${format(current, 'd')}~${format(weekEnd, 'd')}`,
        groupKey: monthKey,
      })
      current = addWeeks(current, 1)
    }
  } else if (scale === 'month') {
    let current = startOfMonth(startDate)
    const end = endOfMonth(endDate)
    let i = 0
    while (current <= end) {
      const monthEnd = endOfMonth(current)
      cells.push({
        start: new Date(current),
        end: monthEnd,
        index: i++,
        width,
        label: format(current, 'M월'),
        subLabel: format(current, 'yyyy'),
        groupKey: format(current, 'yyyy-MM'),
      })
      current = addMonths(current, 1)
    }
  } else {
    let current = startOfQuarter(startDate)
    const end = endOfQuarter(endDate)
    let i = 0
    while (current <= end) {
      const quarterEnd = endOfQuarter(current)
      const q = Math.floor(current.getMonth() / 3) + 1
      cells.push({
        start: new Date(current),
        end: quarterEnd,
        index: i++,
        width,
        label: `Q${q}`,
        subLabel: format(current, 'yyyy'),
        groupKey: `${format(current, 'yyyy')}-Q${q}`,
      })
      current = addQuarters(current, 1)
    }
  }

  return cells
}

export function getCellIndex(cells: TimelineCell[], date: Date | string): number {
  const d = typeof date === 'string' ? parseISO(date) : date
  for (let i = 0; i < cells.length; i++) {
    if (isWithinInterval(d, { start: cells[i].start, end: cells[i].end })) {
      return i
    }
  }
  return -1
}

export function getDatePosition(cells: TimelineCell[], date: Date | string): number {
  const idx = getCellIndex(cells, date)
  if (idx >= 0) return cells.slice(0, idx).reduce((s, c) => s + c.width, 0)
  if (cells.length === 0) return 0
  const first = cells[0].start
  const d = typeof date === 'string' ? parseISO(date) : date
  if (d < first) return 0
  return cells.reduce((s, c) => s + c.width, 0)
}

/**
 * 날짜가 셀 내 어디에 있는지 픽셀 위치 반환 (해당 날짜의 시작 시점)
 * 셀을 daysInCell 등분하여 날짜 시작점에 선을 그림
 */
export function getDatePositionPrecise(cells: TimelineCell[], date: Date | string): number {
  const idx = getCellIndex(cells, date)
  if (idx < 0) return -1
  const cell = cells[idx]
  const cellStartPx = cells.slice(0, idx).reduce((s, c) => s + c.width, 0)
  const d = typeof date === 'string' ? parseISO(date) : date
  const daysInCell = Math.max(1, differenceInDays(cell.end, cell.start) + 1)
  const daysFromStart = differenceInDays(d, cell.start)
  const progress =
    daysInCell > 1 ? Math.min(1, Math.max(0, daysFromStart / daysInCell)) : 0
  return cellStartPx + cell.width * progress
}

export function getEndDatePosition(cells: TimelineCell[], date: Date | string): number {
  const idx = getCellIndex(cells, date)
  if (idx >= 0) return cells.slice(0, idx + 1).reduce((s, c) => s + c.width, 0)
  if (cells.length === 0) return cells[0]?.width ?? 48
  const first = cells[0].start
  const d = typeof date === 'string' ? parseISO(date) : date
  if (d < first) return 0
  return cells.reduce((s, c) => s + c.width, 0)
}

export function getCellIndexForPixel(cells: TimelineCell[], pixelLeft: number): number {
  if (cells.length === 0) return 0
  let offset = 0
  for (let i = 0; i < cells.length; i++) {
    if (offset + cells[i].width >= pixelLeft) return i
    offset += cells[i].width
  }
  return cells.length - 1
}

export function pixelToDate(cells: TimelineCell[], pixelLeft: number): string {
  if (cells.length === 0) return format(new Date(), 'yyyy-MM-dd')
  let offset = 0
  let cellIndex = 0
  for (let i = 0; i < cells.length; i++) {
    if (offset + cells[i].width >= pixelLeft) {
      cellIndex = i
      break
    }
    offset += cells[i].width
    cellIndex = i
  }
  const cell = cells[Math.min(cellIndex, cells.length - 1)]
  const offsetPx = pixelLeft - offset
  const daysInCell = Math.max(1, differenceInDays(cell.end, cell.start) + 1)
  const rawDaysOffset = (offsetPx / cell.width) * daysInCell
  const daysOffset = Math.min(daysInCell - 1, Math.floor(rawDaysOffset))
  const d = addDays(cell.start, daysOffset)
  return format(d, 'yyyy-MM-dd')
}
