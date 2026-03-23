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

function App() {
  const bootReady = useAppBootstrap()
  const viewMode = useStore((s) => s.viewMode)
  const projects = useStore((s) => s.projects)
  const members = useStore((s) => s.members)

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
              {projects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
              <MemberTotalSection />
            </>
          ) : (
            <>
              {members.map((member) => (
                <MemberRow key={member.id} member={member} />
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
