import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { useTimeline } from '@/contexts/TimelineContext'
import { TimelineRow } from './TimelineRow'
import { ROW_HEIGHT } from '@/constants'
import { MemberDropZone } from './MemberDropZone'
import { AllocationBarWithTotal } from '@/components/bars/AllocationBarWithTotal'
import { TotalRow } from './TotalRow'
import { useMemberWeeklyTotal } from '@/hooks/useMemberWeeklyTotal'
import type { Member } from '@/types'

interface MemberRowProps {
  member: Member
}

export function MemberRow({ member }: MemberRowProps) {
  const { cells } = useTimeline()
  const allocations = useStore((s) => s.allocations)
  const projects = useStore((s) => s.projects)
  const memberAllocations = useMemo(
    () => allocations.filter((a) => a.memberId === member.id),
    [allocations, member.id]
  )
  const allocationsByProject = useMemo(() => {
    const map = new Map<string, typeof memberAllocations>()
    for (const alloc of memberAllocations) {
      const list = map.get(alloc.projectId) ?? []
      list.push(alloc)
      map.set(alloc.projectId, list)
    }
    return map
  }, [memberAllocations])
  const addAllocation = useStore((s) => s.addAllocation)
  const weeklyTotals = useMemberWeeklyTotal(member.id, memberAllocations, cells)

  return (
    <>
      <div className="border-b border-slate-200">
        <TimelineRow
          cells={cells}
          label={member.name}
          subLabel={member.role}
          labelVariant="member"
        >
          <MemberDropZone
            memberId={member.id}
            cells={cells}
            onDrop={(projectId, mid, role, startDate, endDate) =>
              void addAllocation(projectId, mid, role, startDate, endDate).catch((err) =>
                alert(err instanceof Error ? err.message : String(err))
              )
            }
          >
            <div className="relative h-full" style={{ minHeight: ROW_HEIGHT }} />
          </MemberDropZone>
        </TimelineRow>
        {Array.from(allocationsByProject.entries()).map(([projectId, allocs]) => {
          const project = projects.find((p) => p.id === projectId)
          return (
            <TimelineRow
              key={projectId}
              cells={cells}
              label={project?.name ?? '?'}
              subLabel="프로젝트"
              indent
              labelVariant="project"
            >
                <div className="relative h-full" style={{ minHeight: ROW_HEIGHT }}>
                {allocs.map((alloc) => (
                  <AllocationBarWithTotal
                    key={alloc.id}
                    allocation={alloc}
                    memberName={`${project?.name ?? '?'} (${alloc.role})`}
                    cells={cells}
                    tagLabel={project?.name}
                    siblingAllocations={allocs}
                  />
                ))}
              </div>
            </TimelineRow>
          )
        })}
      </div>
      <TotalRow
        cells={cells}
        weeklyTotals={weeklyTotals}
        label={`${member.name} 총계`}
      />
    </>
  )
}
