import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import type { Member, Project, Allocation } from '@/types'
import { STORAGE_KEY } from '@/constants'
import { isSupabaseConfigured } from '@/lib/env'
import * as remote from '@/services/supabaseData'

interface PersistedState {
  members?: Member[]
  projects?: Project[]
  allocations?: Allocation[]
}

function parseUrlPayload(): {
  members: Member[]
  projects: Project[]
  allocations: Allocation[]
} | null {
  const params = new URLSearchParams(window.location.search)
  const dataParam = params.get('data')
  if (!dataParam) return null
  try {
    const str = decodeURIComponent(escape(atob(dataParam)))
    const data = JSON.parse(str) as unknown
    if (
      data &&
      typeof data === 'object' &&
      'members' in data &&
      'projects' in data &&
      'allocations' in data
    ) {
      const d = data as {
        members: Member[]
        projects: Project[]
        allocations: Allocation[]
      }
      if (
        Array.isArray(d.members) &&
        Array.isArray(d.projects) &&
        Array.isArray(d.allocations)
      ) {
        return d
      }
    }
  } catch {
    // ignore
  }
  return null
}

/**
 * 초기 데이터: URL 공유 > Supabase 조회 > localStorage (Supabase 미사용 시)
 */
export function useAppBootstrap(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function boot() {
      const urlData = parseUrlPayload()
      if (urlData) {
        useStore.getState().applyImportedDataToMemory(urlData)
        window.history.replaceState({}, '', window.location.pathname)
        if (!cancelled) setReady(true)
        return
      }

      if (isSupabaseConfigured()) {
        try {
          const data = await remote.fetchWorkspaceData()
          if (!cancelled) {
            useStore.getState().applyImportedDataToMemory(data)
          }
        } catch (e) {
          console.error('[allocation-timeline] Supabase 로드 실패', e)
        }
        if (!cancelled) setReady(true)
        return
      }

      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as unknown
          const state = parsed && typeof parsed === 'object' && 'state' in parsed
            ? (parsed as { state: PersistedState }).state
            : (parsed as PersistedState)
          if (
            state &&
            Array.isArray(state.members) &&
            Array.isArray(state.projects) &&
            Array.isArray(state.allocations)
          ) {
            useStore.getState().applyImportedDataToMemory({
              members: state.members,
              projects: state.projects,
              allocations: state.allocations,
            })
          }
        } catch {
          // ignore
        }
      }
      if (!cancelled) setReady(true)
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [])

  return ready
}
