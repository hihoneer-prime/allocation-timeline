import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addMonths, format } from 'date-fns'
import type { Member, Project, Allocation, AllocationSegment } from '@/types'
import type { TimelineScale } from '@/types/timeline'
import { STORAGE_KEY, DEFAULT_TIMELINE_START_YEAR } from '@/constants'
import { adjustToNoOverlap } from '@/utils/allocationUtils'
import { isSupabaseConfigured } from '@/lib/env'
import { assertWriteAllowed } from '@/lib/authSession'
import * as remote from '@/services/supabaseData'

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
  selectedMemberFilterIds: string[]
  selectedProjectFilterIds: string[]
  timelineScale: TimelineScale
  timelineStartYear: number
  scrollToTodayRequested: boolean
  sidebarCollapsed: boolean

  addMember: (name: string, role: string) => Promise<void>
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>
  removeMember: (id: string) => Promise<void>

  addProject: (name: string) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  removeProject: (id: string) => Promise<void>

  addAllocation: (
    projectId: string,
    memberId: string,
    role: string,
    startDate: string,
    endDate: string
  ) => Promise<void>
  updateAllocation: (id: string, updates: Partial<Allocation>) => Promise<void>
  updateAllocationSegments: (id: string, segments: AllocationSegment[]) => Promise<void>
  /** 드래그 종료 등: 날짜+세그먼트를 한 번에 반영(리렌더·원격 호출 1회) */
  updateAllocationDatesAndSegments: (
    id: string,
    startDate: string,
    endDate: string,
    segments: AllocationSegment[]
  ) => Promise<void>
  removeAllocation: (id: string) => Promise<void>

  setViewMode: (mode: 'project' | 'member') => void
  setSelectedProjectId: (id: string | null) => void
  toggleMemberFilter: (id: string) => void
  toggleProjectFilter: (id: string) => void
  clearAllTimelineFilters: () => void
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
  }) => Promise<void>
  /** URL 공유 등: 메모리만 갱신(원격 저장 없음, 로그인 불필요) */
  applyImportedDataToMemory: (data: {
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

function partializeState(s: AppState) {
  const ui = {
    viewMode: s.viewMode,
    timelineScale: s.timelineScale,
    timelineStartYear: s.timelineStartYear,
    sidebarCollapsed: s.sidebarCollapsed,
    selectedMemberFilterIds: s.selectedMemberFilterIds,
    selectedProjectFilterIds: s.selectedProjectFilterIds,
  }
  if (!isSupabaseConfigured()) {
    return {
      ...ui,
      members: s.members,
      projects: s.projects,
      allocations: s.allocations,
    }
  }
  return ui
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      members: [],
      projects: [],
      allocations: [],
      viewMode: 'project',
      selectedProjectId: null,
      selectedMemberFilterIds: [],
      selectedProjectFilterIds: [],
      timelineScale: 'week',
      timelineStartYear: DEFAULT_TIMELINE_START_YEAR,
      scrollToTodayRequested: false,
      sidebarCollapsed: false,

      addMember: async (name, role) => {
        assertWriteAllowed()
        const id = generateId()
        if (isSupabaseConfigured()) {
          await remote.insertMember(id, name, role)
        }
        set((state) => ({
          members: [...state.members, { id, name, role }],
        }))
      },

      updateMember: async (id, updates) => {
        assertWriteAllowed()
        if (isSupabaseConfigured()) {
          await remote.updateMemberRow(id, {
            ...(updates.name !== undefined ? { name: updates.name } : {}),
            ...(updates.role !== undefined ? { role: updates.role } : {}),
          })
        }
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }))
      },

      removeMember: async (id) => {
        assertWriteAllowed()
        if (isSupabaseConfigured()) {
          await remote.deleteMemberRow(id)
        }
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          allocations: state.allocations.filter((a) => a.memberId !== id),
          selectedMemberFilterIds: state.selectedMemberFilterIds.filter((mid) => mid !== id),
        }))
      },

      addProject: async (name) => {
        assertWriteAllowed()
        const { startDate, endDate } = defaultProjectDates()
        const id = generateId()
        if (isSupabaseConfigured()) {
          await remote.insertProject(id, name, startDate, endDate)
        }
        set((state) => ({
          projects: [...state.projects, { id, name, startDate, endDate }],
        }))
      },

      updateProject: async (id, updates) => {
        assertWriteAllowed()
        if (isSupabaseConfigured()) {
          const row: {
            name?: string
            start_date?: string
            end_date?: string
          } = {}
          if (updates.name !== undefined) row.name = updates.name
          if (updates.startDate !== undefined) row.start_date = updates.startDate
          if (updates.endDate !== undefined) row.end_date = updates.endDate
          if (Object.keys(row).length > 0) {
            await remote.updateProjectRow(id, row)
          }
        }
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }))
      },

      removeProject: async (id) => {
        assertWriteAllowed()
        if (isSupabaseConfigured()) {
          await remote.deleteProjectRow(id)
        }
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          allocations: state.allocations.filter((a) => a.projectId !== id),
          selectedProjectFilterIds: state.selectedProjectFilterIds.filter((pid) => pid !== id),
          selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
        }))
      },

      addAllocation: async (projectId, memberId, role, startDate, endDate) => {
        assertWriteAllowed()
        const state = get()
        const existing = state.allocations.filter(
          (a) => a.projectId === projectId && a.memberId === memberId
        )
        const { startDate: adjStart, endDate: adjEnd } = adjustToNoOverlap(
          startDate,
          endDate,
          existing
        )
        const alloc: Allocation = {
          id: generateId(),
          projectId,
          memberId,
          role,
          startDate: adjStart,
          endDate: adjEnd,
          segments: [{ start: adjStart, end: adjEnd, ratio: 1 }],
        }
        if (isSupabaseConfigured()) {
          await remote.insertAllocationRow(alloc)
        }
        set((s) => ({
          allocations: [...s.allocations, alloc],
        }))
      },

      updateAllocation: async (id, updates) => {
        assertWriteAllowed()
        if (isSupabaseConfigured()) {
          const row: {
            role?: string
            start_date?: string
            end_date?: string
            segments?: AllocationSegment[]
          } = {}
          if (updates.role !== undefined) row.role = updates.role
          if (updates.startDate !== undefined) row.start_date = updates.startDate
          if (updates.endDate !== undefined) row.end_date = updates.endDate
          if (updates.segments !== undefined) row.segments = updates.segments
          if (Object.keys(row).length > 0) {
            await remote.updateAllocationRow(id, row)
          }
        }
        set((state) => ({
          allocations: state.allocations.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }))
      },

      updateAllocationSegments: async (id, segments) => {
        assertWriteAllowed()
        if (isSupabaseConfigured()) {
          await remote.updateAllocationRow(id, { segments })
        }
        set((state) => ({
          allocations: state.allocations.map((a) =>
            a.id === id ? { ...a, segments } : a
          ),
        }))
      },

      updateAllocationDatesAndSegments: async (id, startDate, endDate, segments) => {
        assertWriteAllowed()
        if (isSupabaseConfigured()) {
          await remote.updateAllocationRow(id, {
            start_date: startDate,
            end_date: endDate,
            segments,
          })
        }
        set((state) => ({
          allocations: state.allocations.map((a) =>
            a.id === id ? { ...a, startDate, endDate, segments } : a
          ),
        }))
      },

      removeAllocation: async (id) => {
        assertWriteAllowed()
        if (isSupabaseConfigured()) {
          await remote.deleteAllocationRow(id)
        }
        set((state) => ({
          allocations: state.allocations.filter((a) => a.id !== id),
        }))
      },

      setViewMode: (viewMode) => set({ viewMode }),
      setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
      toggleMemberFilter: (id) =>
        set((state) => ({
          selectedMemberFilterIds: state.selectedMemberFilterIds.includes(id)
            ? state.selectedMemberFilterIds.filter((mid) => mid !== id)
            : [...state.selectedMemberFilterIds, id],
        })),
      toggleProjectFilter: (id) =>
        set((state) => ({
          selectedProjectFilterIds: state.selectedProjectFilterIds.includes(id)
            ? state.selectedProjectFilterIds.filter((pid) => pid !== id)
            : [...state.selectedProjectFilterIds, id],
        })),
      clearAllTimelineFilters: () =>
        set({
          selectedMemberFilterIds: [],
          selectedProjectFilterIds: [],
        }),
      setTimelineScale: (timelineScale) => set({ timelineScale }),
      setTimelineStartYear: (timelineStartYear) => set({ timelineStartYear }),
      shiftTimelineYear: (delta) =>
        set((s) => ({ timelineStartYear: s.timelineStartYear + delta })),
      setScrollToTodayRequested: (scrollToTodayRequested) =>
        set({ scrollToTodayRequested }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      importData: async (data) => {
        assertWriteAllowed()
        if (isSupabaseConfigured()) {
          await remote.replaceEntireWorkspace({
            members: data.members,
            projects: data.projects,
            allocations: data.allocations,
          })
        }
        set({
          members: data.members,
          projects: data.projects,
          allocations: data.allocations,
        })
      },

      applyImportedDataToMemory: (data) => {
        set({
          members: data.members,
          projects: data.projects,
          allocations: data.allocations,
        })
      },

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
      partialize: (s) => partializeState(s),
      merge: (persistedState, currentState) => {
        const p = persistedState as Partial<AppState> | undefined
        if (!p || typeof p !== 'object') return currentState
        return {
          ...currentState,
          ...(Array.isArray(p.members) ? { members: p.members } : {}),
          ...(Array.isArray(p.projects) ? { projects: p.projects } : {}),
          ...(Array.isArray(p.allocations) ? { allocations: p.allocations } : {}),
          ...(p.viewMode ? { viewMode: p.viewMode } : {}),
          ...(p.timelineScale ? { timelineScale: p.timelineScale } : {}),
          ...(typeof p.timelineStartYear === 'number'
            ? { timelineStartYear: p.timelineStartYear }
            : {}),
          ...(typeof p.sidebarCollapsed === 'boolean'
            ? { sidebarCollapsed: p.sidebarCollapsed }
            : {}),
          ...(Array.isArray(p.selectedMemberFilterIds)
            ? { selectedMemberFilterIds: p.selectedMemberFilterIds }
            : {}),
          ...(Array.isArray(p.selectedProjectFilterIds)
            ? { selectedProjectFilterIds: p.selectedProjectFilterIds }
            : {}),
          selectedProjectId: null,
        }
      },
    }
  )
)
