import { useStore } from '@/store/useStore'
import { useMemberWeeklyTotal } from '@/hooks/useMemberWeeklyTotal'
import { AllocationBar } from './AllocationBar'
import type { TimelineCell } from '@/types/timeline'
import type { Allocation } from '@/types'

interface Props {
  allocation: Allocation
  memberName: string
  cells: TimelineCell[]
  tagLabel?: string
  siblingAllocations?: Allocation[]
}

export function AllocationBarWithTotal({
  allocation,
  memberName,
  cells,
  tagLabel,
  siblingAllocations = [],
}: Props) {
  const allAllocations = useStore((s) => s.allocations)
  const weeklyTotals = useMemberWeeklyTotal(
    allocation.memberId,
    allAllocations,
    cells
  )
  return (
    <AllocationBar
      allocation={allocation}
      memberName={memberName}
      cells={cells}
      weeklyTotals={weeklyTotals}
      tagLabel={tagLabel}
      siblingAllocations={siblingAllocations}
    />
  )
}
