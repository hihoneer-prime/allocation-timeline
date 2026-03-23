import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { useTimeline } from '@/contexts/TimelineContext'
import { TimelineRow } from './TimelineRow'
import { ROW_HEIGHT } from '@/constants'
import { DropZone } from './DropZone'
import { ProjectStartMarker, ProjectEndMarker } from '@/components/bars/ProjectMarker'
import { AllocationBarWithTotal } from '@/components/bars/AllocationBarWithTotal'
import { ProjectEditDialog } from '@/components/dialogs/ProjectEditDialog'
import type { Project } from '@/types'

interface ProjectRowProps {
  project: Project
}

export function ProjectRow({ project }: ProjectRowProps) {
  const { cells } = useTimeline()
  const [showEdit, setShowEdit] = useState(false)
  const updateProject = useStore((s) => s.updateProject)
  const allocations = useStore((s) => s.allocations)
  const members = useStore((s) => s.members)
  const projectAllocations = useMemo(
    () => allocations.filter((a) => a.projectId === project.id),
    [allocations, project.id]
  )
  const addAllocation = useStore((s) => s.addAllocation)

  const allocationsByMember = useMemo(() => {
    const map = new Map<string, typeof projectAllocations>()
    for (const alloc of projectAllocations) {
      const list = map.get(alloc.memberId) ?? []
      list.push(alloc)
      map.set(alloc.memberId, list)
    }
    return map
  }, [projectAllocations])

  const handleDrop = (
    _projectId: string,
    memberId: string,
    role: string,
    startDate: string,
    endDate: string
  ) => {
    addAllocation(project.id, memberId, role, startDate, endDate)
  }

  return (
    <>
      <div className="flex flex-shrink-0 flex-col border-b border-slate-200">
        <TimelineRow
          cells={cells}
          label={project.name}
          subLabel="프로젝트"
          onLabelClick={() => setShowEdit(true)}
          labelVariant="project"
        >
          <DropZone cells={cells} projectId={project.id} onDrop={handleDrop}>
            <ProjectStartMarker
              project={project}
              cells={cells}
              onStartChange={(date) => updateProject(project.id, { startDate: date })}
            />
            <ProjectEndMarker
              project={project}
              cells={cells}
              onEndChange={(date) => updateProject(project.id, { endDate: date })}
            />
          </DropZone>
        </TimelineRow>
        {Array.from(allocationsByMember.entries()).map(([memberId, allocs]) => {
          const member = members.find((m) => m.id === memberId)
          const primaryRole = allocs[0]?.role ?? '?'
          return (
            <TimelineRow
              key={memberId}
              cells={cells}
              label={member?.name ?? '?'}
              subLabel={primaryRole}
              indent
              labelVariant="member"
            >
              <div className="relative h-full" style={{ minHeight: ROW_HEIGHT }}>
                {allocs.map((alloc) => (
                  <AllocationBarWithTotal
                    key={alloc.id}
                    allocation={alloc}
                    memberName={member?.name ?? '?'}
                    cells={cells}
                    tagLabel={member?.name}
                    siblingAllocations={allocs}
                  />
                ))}
              </div>
            </TimelineRow>
          )
        })}
      </div>
      {showEdit && (
        <ProjectEditDialog
          project={project}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  )
}
