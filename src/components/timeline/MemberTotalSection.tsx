import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { useTimeline } from '@/contexts/TimelineContext'
import { useMemberWeeklyTotal } from '@/hooks/useMemberWeeklyTotal'
import { TotalRow } from './TotalRow'
import { useTimelineColumn } from '@/contexts/TimelineColumnContext'
import { ROW_HEIGHT } from '@/constants'
import type { TimelineCell } from '@/types/timeline'
import type { Allocation } from '@/types'

function totalSectionTitle(
  filterActive: boolean,
  membersForTotals: { role: string }[]
): string {
  if (!filterActive || membersForTotals.length === 0) return '인원별 총계'
  const roles = [...new Set(membersForTotals.map((m) => m.role))]
  if (roles.length === 1) return `[${roles[0]}] 직군 총계`
  return '선택 직군 총계'
}

export function MemberTotalSection() {
  const { cells } = useTimeline()
  const members = useStore((s) => s.members)
  const allocations = useStore((s) => s.allocations)
  const selectedMemberFilterIds = useStore((s) => s.selectedMemberFilterIds)
  const selectedProjectFilterIds = useStore((s) => s.selectedProjectFilterIds)
  const column = useTimelineColumn()

  const membersWithAllocations = useMemo(() => {
    const hasMemberFilter = selectedMemberFilterIds.length > 0
    const hasProjectFilter = selectedProjectFilterIds.length > 0
    const memberFilterSet = new Set(selectedMemberFilterIds)
    const projectFilterSet = new Set(selectedProjectFilterIds)

    const allocForPresence = hasProjectFilter
      ? allocations.filter((a) => projectFilterSet.has(a.projectId))
      : allocations

    let list = members.filter((m) =>
      allocForPresence.some((a) => a.memberId === m.id)
    )
    if (hasMemberFilter) {
      list = list.filter((m) => memberFilterSet.has(m.id))
    }
    return list
  }, [members, allocations, selectedMemberFilterIds, selectedProjectFilterIds])

  const allocationsForTotals = useMemo((): Allocation[] => {
    if (selectedProjectFilterIds.length === 0) return allocations
    const set = new Set(selectedProjectFilterIds)
    return allocations.filter((a) => set.has(a.projectId))
  }, [allocations, selectedProjectFilterIds])

  const filterActive =
    selectedMemberFilterIds.length > 0 || selectedProjectFilterIds.length > 0
  const heading = totalSectionTitle(filterActive, membersWithAllocations)

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
          {heading}
        </div>
        {membersWithAllocations.map((m) => (
          <MemberTotalRow
            key={m.id}
            memberId={m.id}
            memberName={m.name}
            cells={cells}
            allocations={allocationsForTotals}
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
          allocations={allocationsForTotals}
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
