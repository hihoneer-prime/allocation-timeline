import { useRef } from 'react'
import { parseISO, format, addDays, differenceInDays } from 'date-fns'
import { getDatePosition, getEndDatePosition } from '@/utils/timelineUtils'
import type { TimelineCell } from '@/types/timeline'
import type { Project } from '@/types'

interface ProjectMarkerProps {
  project: Project
  cells: TimelineCell[]
  onStartChange: (date: string) => void
  onEndChange: (date: string) => void
}

export function ProjectStartMarker({
  project,
  cells,
  onStartChange,
}: Omit<ProjectMarkerProps, 'onEndChange'>) {
  const left = getDatePosition(cells, project.startDate)
  const isDraggingRef = useRef(false)
  const dragStartX = useRef(0)
  const initialDate = useRef(project.startDate)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDraggingRef.current = true
    dragStartX.current = e.clientX
    initialDate.current = project.startDate
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return
    const delta = e.clientX - dragStartX.current
    const cellWidth = cells[0]?.width ?? 48
    const daysPerCell = cells[0] ? differenceInDays(cells[0].end, cells[0].start) + 1 : 7
    const daysDelta = Math.round((delta / cellWidth) * daysPerCell)
    if (daysDelta !== 0) {
      const newDate = format(
        addDays(parseISO(initialDate.current), daysDelta),
        'yyyy-MM-dd'
      )
      onStartChange(newDate)
      dragStartX.current = e.clientX
      initialDate.current = newDate
    }
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  const setupListeners = () => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 cursor-ew-resize bg-emerald-500 hover:bg-emerald-600 z-10"
      style={{ left }}
      onMouseDown={(e) => {
        handleMouseDown(e)
        setupListeners()
      }}
      title={`시작: ${project.startDate}`}
    />
  )
}

export function ProjectEndMarker({
  project,
  cells,
  onEndChange,
}: Omit<ProjectMarkerProps, 'onStartChange'>) {
  const left = getEndDatePosition(cells, project.endDate)
  const isDraggingRef = useRef(false)
  const dragStartX = useRef(0)
  const initialDate = useRef(project.endDate)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDraggingRef.current = true
    dragStartX.current = e.clientX
    initialDate.current = project.endDate
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return
    const delta = e.clientX - dragStartX.current
    const cellWidth = cells[0]?.width ?? 48
    const daysPerCell = cells[0] ? differenceInDays(cells[0].end, cells[0].start) + 1 : 7
    const daysDelta = Math.round((delta / cellWidth) * daysPerCell)
    if (daysDelta !== 0) {
      const newDate = format(
        addDays(parseISO(initialDate.current), daysDelta),
        'yyyy-MM-dd'
      )
      onEndChange(newDate)
      dragStartX.current = e.clientX
      initialDate.current = newDate
    }
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 cursor-ew-resize bg-red-500 hover:bg-red-600 z-10"
      style={{ left }}
      onMouseDown={(e) => {
        handleMouseDown(e)
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
      }}
      title={`종료: ${project.endDate}`}
    />
  )
}
