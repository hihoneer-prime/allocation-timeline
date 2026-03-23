import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addMonths, format } from 'date-fns'
import type { Member, Project, Allocation, AllocationSegment } from '@/types'
import type { TimelineScale } from '@/types/timeline'
import { STORAGE_KEY, DEFAULT_TIMELINE_START_YEAR } from '@/constants'
import { adjustToNoOverlap } from '@/utils/allocationUtils'

function generateId(): string {
  return crypto.randomUUID()
}

function defaultProjectDates(): { startDate: string; endDate: string } {
  const now = new Date()
  return {
    startDate: format(now, 'yyyy-MM-dd'),
    endDate: format(addMonths(now, 1), 'yyyy-MM-dd'),
  }
}

export interface AppState {
  members: Member[]
  projects: Project[]
  allocations: Allocation[]
  viewMode: 'project' | 'member'
  selectedProjectId: string | null
  timelineScale: TimelineScale
  timelineStartYear: number
  scrollToTodayRequested: boolean
  sidebarCollapsed: boolean

  addMember: (name: string, role: string) => void
  updateMember: (id: string, updates: Partial<Member>) => void
  removeMember: (id: string) => void

  addProject: (name: string) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void

  addAllocation: (
    projectId: string,
    memberId: string,
    role: string,
    startDate: string,
    endDate: string
  ) => void
  updateAllocation: (id: string, updates: Partial<Allocation>) => void
  updateAllocationSegments: (id: string, segments: AllocationSegment[]) => void
  removeAllocation: (id: string) => void

  setViewMode: (mode: 'project' | 'member') => void
  setSelectedProjectId: (id: string | null) => void
  setTimelineScale: (scale: TimelineScale) => void
  setTimelineStartYear: (year: number) => void
  shiftTimelineYear: (delta: number) => void
  setScrollToTodayRequested: (v: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void

  importData: (data: {
    members: Member[]
    projects: Project[]
    allocations: Allocation[]
  }) => void
  exportData: () => {
    members: Member[]
    projects: Project[]
    allocations: Allocation[]
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      members: [],
      projects: [],
      allocations: [],
      viewMode: 'project',
      selectedProjectId: null,
      timelineScale: 'week',
      timelineStartYear: DEFAULT_TIMELINE_START_YEAR,
      scrollToTodayRequested: false,
      sidebarCollapsed: false,

      addMember: (name, role) =>
        set((state) => ({
          members: [
            ...state.members,
            { id: generateId(), name, role },
          ],
        })),

      updateMember: (id, updates) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          allocations: state.allocations.filter((a) => a.memberId !== id),
        })),

      addProject: (name) => {
        const { startDate, endDate } = defaultProjectDates()
        set((state) => ({
          projects: [
            ...state.projects,
            { id: generateId(), name, startDate, endDate },
          ],
        }))
      },

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          allocations: state.allocations.filter((a) => a.projectId !== id),
        })),

      addAllocation: (projectId, memberId, role, startDate, endDate) =>
        set((state) => {
          const existing = state.allocations.filter(
            (a) => a.projectId === projectId && a.memberId === memberId
          )
          const { startDate: adjStart, endDate: adjEnd } = adjustToNoOverlap(
            startDate,
            endDate,
            existing
          )
          return {
            allocations: [
              ...state.allocations,
              {
                id: generateId(),
                projectId,
                memberId,
                role,
                startDate: adjStart,
                endDate: adjEnd,
                segments: [{ start: adjStart, end: adjEnd, ratio: 1 }],
              },
            ],
          }
        }),

      updateAllocation: (id, updates) =>
        set((state) => ({
          allocations: state.allocations.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      updateAllocationSegments: (id, segments) =>
        set((state) => ({
          allocations: state.allocations.map((a) =>
            a.id === id ? { ...a, segments } : a
          ),
        })),

      removeAllocation: (id) =>
        set((state) => ({
          allocations: state.allocations.filter((a) => a.id !== id),
        })),

      setViewMode: (viewMode) => set({ viewMode }),
      setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
      setTimelineScale: (timelineScale) => set({ timelineScale }),
      setTimelineStartYear: (timelineStartYear) => set({ timelineStartYear }),
      shiftTimelineYear: (delta) =>
        set((s) => ({ timelineStartYear: s.timelineStartYear + delta })),
      setScrollToTodayRequested: (scrollToTodayRequested) =>
        set({ scrollToTodayRequested }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      importData: (data) =>
        set({
          members: data.members,
          projects: data.projects,
          allocations: data.allocations,
        }),

      exportData: () => {
        const state = get()
        return {
          members: state.members,
          projects: state.projects,
          allocations: state.allocations,
        }
      },
    }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
      partialize: (s) => ({
        members: s.members,
        projects: s.projects,
        allocations: s.allocations,
      }),
      merge: (persistedState, currentState) => {
        const p = persistedState as Partial<AppState> | undefined
        if (!p || typeof p !== 'object') return currentState
        return {
          ...currentState,
          members: Array.isArray(p.members) ? p.members : currentState.members,
          projects: Array.isArray(p.projects) ? p.projects : currentState.projects,
          allocations: Array.isArray(p.allocations) ? p.allocations : currentState.allocations,
          selectedProjectId: null,
        }
      },
    }
  )
)
