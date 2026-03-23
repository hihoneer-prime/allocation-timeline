import { useStore } from '@/store/useStore'
import { TimelineGrid } from '@/components/timeline/TimelineGrid'
import { ProjectRow } from '@/components/timeline/ProjectRow'
import { MemberRow } from '@/components/timeline/MemberRow'
import { MemberTotalSection } from '@/components/timeline/MemberTotalSection'
import { MemberList } from '@/components/layout/MemberList'
import { ProjectList } from '@/components/layout/ProjectList'
import { ProjectSummary } from '@/components/layout/ProjectSummary'
import { ViewToggle } from '@/components/layout/ViewToggle'
import { ExportImport } from '@/components/layout/ExportImport'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'
import { AuthBar } from '@/components/auth/AuthBar'
import { isSupabaseConfigured } from '@/lib/env'
import { useMemo } from 'react'

function App() {
  const bootReady = useAppBootstrap()
  const viewMode = useStore((s) => s.viewMode)
  const projects = useStore((s) => s.projects)
  const members = useStore((s) => s.members)
  const allocations = useStore((s) => s.allocations)
  const selectedMemberFilterIds = useStore((s) => s.selectedMemberFilterIds)
  const selectedProjectFilterIds = useStore((s) => s.selectedProjectFilterIds)

  const selectedMemberFilterSet = useMemo(
    () => new Set(selectedMemberFilterIds),
    [selectedMemberFilterIds]
  )
  const selectedProjectFilterSet = useMemo(
    () => new Set(selectedProjectFilterIds),
    [selectedProjectFilterIds]
  )

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const projectMatch =
        selectedProjectFilterSet.size === 0 || selectedProjectFilterSet.has(project.id)
      if (!projectMatch) return false
      if (selectedMemberFilterSet.size === 0) return true
      return allocations.some(
        (a) => a.projectId === project.id && selectedMemberFilterSet.has(a.memberId)
      )
    })
  }, [projects, allocations, selectedProjectFilterSet, selectedMemberFilterSet])

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const memberMatch =
        selectedMemberFilterSet.size === 0 || selectedMemberFilterSet.has(member.id)
      if (!memberMatch) return false
      if (selectedProjectFilterSet.size === 0) return true
      return allocations.some(
        (a) => a.memberId === member.id && selectedProjectFilterSet.has(a.projectId)
      )
    })
  }, [members, allocations, selectedMemberFilterSet, selectedProjectFilterSet])

  if (isSupabaseConfigured() && !bootReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 text-slate-600">
        데이터 불러오는 중…
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-300 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">
          프로젝트 투입 인력 및 부하율 타임라인
        </h1>
        <div className="flex items-center gap-3">
          <AuthBar />
          <ViewToggle />
        </div>
      </header>
      <main className="flex-1 min-h-0">
        <TimelineGrid
          sidebarContent={
            <>
              <MemberList />
              <ProjectList />
              <ProjectSummary />
              <ExportImport />
            </>
          }
        >
          {viewMode === 'project' ? (
            <>
              {filteredProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  selectedMemberFilterSet={selectedMemberFilterSet}
                />
              ))}
              <MemberTotalSection />
            </>
          ) : (
            <>
              {filteredMembers.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  selectedProjectFilterSet={selectedProjectFilterSet}
                />
              ))}
              <MemberTotalSection />
            </>
          )}
        </TimelineGrid>
      </main>
    </div>
  )
}

export default App
