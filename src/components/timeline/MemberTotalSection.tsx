import { useStore } from '@/store/useStore'
import { useTimeline } from '@/contexts/TimelineContext'
import { useMemberWeeklyTotal } from '@/hooks/useMemberWeeklyTotal'
import { TotalRow } from './TotalRow'
import { useTimelineColumn } from '@/contexts/TimelineColumnContext'
import { ROW_HEIGHT } from '@/constants'
import type { TimelineCell } from '@/types/timeline'

export function MemberTotalSection() {
  const { cells } = useTimeline()
  const members = useStore((s) => s.members)
  const allocations = useStore((s) => s.allocations)
  const column = useTimelineColumn()

  const membersWithAllocations = members.filter((m) =>
    allocations.some((a) => a.memberId === m.id)
  )
  const totalWidth =
    cells.length > 0 ? cells.reduce((sum, c) => sum + c.width, 0) : 0

  if (membersWithAllocations.length === 0) return null

  if (column === 'label') {
    return (
      <div className="flex flex-col border-t-2 border-slate-300 bg-slate-700">
        <div
          className="flex flex-shrink-0 border-b border-slate-600 border-r border-slate-600 bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-100"
          style={{ minHeight: ROW_HEIGHT }}
        >
          인원별 총계
        </div>
        {membersWithAllocations.map((m) => (
          <MemberTotalRow
            key={m.id}
            memberId={m.id}
            memberName={m.name}
            cells={cells}
            allocations={allocations}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col border-t-2 border-slate-300 bg-slate-100">
      <div
        className="flex flex-shrink-0 border-b border-slate-200"
        style={{ minHeight: ROW_HEIGHT, width: totalWidth }}
      />
      {membersWithAllocations.map((m) => (
        <MemberTotalRow
          key={m.id}
          memberId={m.id}
          memberName={m.name}
          cells={cells}
          allocations={allocations}
        />
      ))}
    </div>
  )
}

function MemberTotalRow({
  memberId,
  memberName,
  cells,
  allocations,
}: {
  memberId: string
  memberName: string
  cells: TimelineCell[]
  allocations: ReturnType<typeof useStore.getState>['allocations']
}) {
  const weeklyTotals = useMemberWeeklyTotal(memberId, allocations, cells)
  return (
    <TotalRow
      cells={cells}
      weeklyTotals={weeklyTotals}
      label={memberName}
    />
  )
}
