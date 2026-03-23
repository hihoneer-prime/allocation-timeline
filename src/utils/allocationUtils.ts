import { parseISO, addDays, differenceInDays, format } from 'date-fns'
import type { Allocation } from '@/types'

function overlaps(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const aS = parseISO(aStart)
  const aE = parseISO(aEnd)
  const bS = parseISO(bStart)
  const bE = parseISO(bEnd)
  return aS <= bE && aE >= bS
}

/**
 * Adjust (start, end) to not overlap with existing allocations.
 * If overlapping, shifts the block to be adjacent (right after) the overlapping one.
 */
export function adjustToNoOverlap(
  startDate: string,
  endDate: string,
  existing: Allocation[],
  excludeId?: string
): { startDate: string; endDate: string } {
  const others = existing.filter((a) => a.id !== excludeId)
  let start = startDate
  let end = endDate
  const durationDays = Math.max(1, differenceInDays(parseISO(end), parseISO(start)))

  let changed = true
  while (changed) {
    changed = false
    for (const o of others) {
      if (overlaps(start, end, o.startDate, o.endDate)) {
        const oEnd = parseISO(o.endDate)
        start = format(addDays(oEnd, 1), 'yyyy-MM-dd')
        end = format(addDays(parseISO(start), durationDays - 1), 'yyyy-MM-dd')
        changed = true
        break
      }
    }
  }

  return { startDate: start, endDate: end }
}
