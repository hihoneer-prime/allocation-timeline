import { useMemo } from 'react'
import { parseISO } from 'date-fns'
import type { TimelineCell } from '@/types/timeline'
import type { Allocation } from '@/types'

export function useMemberWeeklyTotal(
  memberId: string,
  allocations: Allocation[],
  cells: TimelineCell[]
): number[] {
  return useMemo(() => {
    const memberAllocs = allocations.filter((a) => a.memberId === memberId)
    return cells.map((cell) => {
      let total = 0
      const cellStart = cell.start
      const cellEnd = cell.end
      for (const alloc of memberAllocs) {
        for (const seg of alloc.segments) {
          const segStart = parseISO(seg.start)
          const segEnd = parseISO(seg.end)
          if (segStart <= cellEnd && segEnd >= cellStart) {
            total += seg.ratio
          }
        }
      }
      return Math.round(total * 100) / 100
    })
  }, [memberId, allocations, cells])
}
