import {
  startOfWeek,
  addDays,
  format,
  differenceInDays,
} from 'date-fns'

/** date-fns: 0=Sun, 1=Mon, ..., 3=Wed, ..., 6=Sat */
const WEDNESDAY = 3

/**
 * 해당 월의 첫 번째 수요일 반환
 * 예: 2026년 6월 1일이 월요일이면 첫 수요일은 6월 3일
 */
function getFirstWednesdayOfMonth(year: number, month: number): Date {
  for (let d = 1; d <= 7; d++) {
    const date = new Date(year, month, d)
    if (date.getDay() === WEDNESDAY) return date
  }
  throw new Error(`No Wednesday in month ${year}-${month + 1}`)
}

/**
 * 주차 계산 결과 (첫 수요일 규칙)
 * - 주는 해당 주의 수요일이 속한 월에 귀속
 * - 해당 월의 첫 수요일이 있는 주가 1주
 * 예: 5월 31일이 화요일이면 5월 30~31일, 6월 1~2일이 포함된 주는 6월 1주
 */
export interface WeekOfMonthInfo {
  /** yyyy-MM */
  monthKey: string
  /** 1~5 (1부터 시작, 0주 없음) */
  weekNumber: number
}

/**
 * 해당 주(월요일 시작)의 월·주차 반환
 * @param weekStartMonday - 주의 시작일(월요일)
 */
export function getWeekOfMonth(weekStartMonday: Date): WeekOfMonthInfo {
  const wednesday = addDays(weekStartMonday, 2)
  const year = wednesday.getFullYear()
  const month = wednesday.getMonth()

  const firstWed = getFirstWednesdayOfMonth(year, month)
  const firstWedWeekStart = startOfWeek(firstWed, { weekStartsOn: 1 })

  const daysDiff = differenceInDays(weekStartMonday, firstWedWeekStart)
  const weekNumber = Math.max(1, 1 + Math.floor(daysDiff / 7))

  return {
    monthKey: format(wednesday, 'yyyy-MM'),
    weekNumber,
  }
}
