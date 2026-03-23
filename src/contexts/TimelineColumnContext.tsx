import { createContext, useContext } from 'react'

export type TimelineColumnMode = 'label' | 'cell'

const TimelineColumnContext = createContext<TimelineColumnMode>('cell')

export function TimelineColumnProvider({
  mode,
  children,
}: {
  mode: TimelineColumnMode
  children: React.ReactNode
}) {
  return (
    <TimelineColumnContext.Provider value={mode}>
      {children}
    </TimelineColumnContext.Provider>
  )
}

export function useTimelineColumn() {
  return useContext(TimelineColumnContext)
}
