import { createContext, useContext, type RefObject } from 'react'

export const TimelineScrollContext = createContext<RefObject<HTMLDivElement | null> | null>(null)

export function useTimelineScroll() {
  return useContext(TimelineScrollContext)
}
