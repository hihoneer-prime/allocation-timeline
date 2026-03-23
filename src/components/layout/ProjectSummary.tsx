import { useMemo } from 'react'
import { parseISO, differenceInDays } from 'date-fns'
import { useStore } from '@/store/useStore'
import { formatRatio } from '@/utils/formatRatio'

export function ProjectSummary() {
  const selectedProjectId = useStore((s) => s.selectedProjectId)
  const projects = useStore((s) => s.projects)
  const allocations = useStore((s) => s.allocations)
  const members = useStore((s) => s.members)

  const summary = useMemo(() => {
    if (!selectedProjectId) return null
    const project = projects.find((p) => p.id === selectedProjectId)
    if (!project) return null

    const projectAllocs = allocations.filter((a) => a.projectId === selectedProjectId)
    const memberIds = [...new Set(projectAllocs.map((a) => a.memberId))]

    let totalPersonWeeks = 0
    const byMember: { memberId: string; name: string; role: string; weeks: number }[] = []

    for (const memberId of memberIds) {
      const member = members.find((m) => m.id === memberId)
      const memberAllocs = projectAllocs.filter((a) => a.memberId === memberId)
      let personWeeks = 0
      for (const a of memberAllocs) {
        for (const seg of a.segments) {
          const days = differenceInDays(parseISO(seg.end), parseISO(seg.start)) + 1
          const weeks = days / 7
          personWeeks += weeks * seg.ratio
        }
      }
      totalPersonWeeks += personWeeks
      byMember.push({
        memberId,
        name: member?.name ?? '?',
        role: memberAllocs[0]?.role ?? member?.role ?? '?',
        weeks: Math.round(personWeeks * 100) / 100,
      })
    }

    const projectDays = differenceInDays(parseISO(project.endDate), parseISO(project.startDate)) + 1
    const projectWeeks = projectDays / 7

    return {
      project,
      totalPersonWeeks: Math.round(totalPersonWeeks * 100) / 100,
      memberCount: memberIds.length,
      projectWeeks: Math.round(projectWeeks * 100) / 100,
      byMember: byMember.sort((a, b) => b.weeks - a.weeks),
    }
  }, [selectedProjectId, projects, allocations, members])

  if (!summary) return null

  const { project, totalPersonWeeks, memberCount, projectWeeks, byMember } = summary

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-3">
      <h3 className="mb-2 text-sm font-semibold text-slate-800">
        {project.name} 공수 요약
      </h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-600">총 인력</span>
          <span className="font-medium">{memberCount}명</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">프로젝트 기간</span>
          <span className="font-medium">{projectWeeks}주</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">총 투입 공수</span>
          <span className="font-medium text-emerald-700">{totalPersonWeeks} 인주</span>
        </div>
        {byMember.length > 0 && (
          <div className="mt-2 border-t border-slate-200 pt-2">
            <span className="text-slate-600">인원별</span>
            <ul className="mt-1 space-y-0.5">
              {byMember.map((m) => (
                <li key={m.memberId} className="flex justify-between">
                  <span>{m.name} ({m.role})</span>
                  <span>{formatRatio(m.weeks)} 인주</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
