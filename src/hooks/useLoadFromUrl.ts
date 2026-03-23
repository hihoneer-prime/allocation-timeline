import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

export function useLoadFromUrl() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const dataParam = params.get('data')
    if (dataParam) {
      try {
        const str = decodeURIComponent(escape(atob(dataParam)))
        const data = JSON.parse(str)
        if (data.members && data.projects && data.allocations) {
          useStore.getState().importData(data)
          window.history.replaceState({}, '', window.location.pathname)
        }
      } catch {
        // ignore invalid data
      }
    }
  }, [])
}
