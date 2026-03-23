import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import type { Member, Project, Allocation } from '@/types'
import { STORAGE_KEY } from '@/constants'

interface PersistedState {
  members?: Member[]
  projects?: Project[]
  allocations?: Allocation[]
}

export function useRehydrateStore() {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as unknown
      const state = (parsed && typeof parsed === 'object' && 'state' in parsed)
        ? (parsed as { state: PersistedState }).state
        : (parsed as PersistedState)
      if (state && Array.isArray(state.members) && Array.isArray(state.projects) && Array.isArray(state.allocations)) {
        useStore.getState().importData({
          members: state.members,
          projects: state.projects,
          allocations: state.allocations,
        })
      }
    } catch {
      // ignore
    }
  }, [])
}
