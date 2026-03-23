import { useState } from 'react'
import { addMonths } from 'date-fns'
import { format } from 'date-fns'
import { parseISO, isWithinInterval } from 'date-fns'
import { useStore } from '@/store/useStore'
import type { TimelineCell } from '@/types/timeline'

interface MemberDropZoneProps {
  memberId: string
  cells: TimelineCell[]
  onDrop: (
    projectId: string,
    memberId: string,
    role: string,
    startDate: string,
    endDate: string
  ) => void
  children: React.ReactNode
}

export function MemberDropZone({
  memberId,
  cells,
  onDrop,
  children,
}: MemberDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const projects = useStore((s) => s.projects)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      if (data.type !== 'member' || data.memberId !== memberId) return

      const target = e.currentTarget
      const rect = target.getBoundingClientRect()
      const x = e.clientX - rect.left
      let offset = 0
      let cellIndex = 0
      for (let i = 0; i < cells.length; i++) {
        if (offset + cells[i].width > x) {
          cellIndex = i
          break
        }
        offset += cells[i].width
        cellIndex = i
      }
      const cell = cells[Math.min(cellIndex, cells.length - 1)]
      if (!cell) return
      const startDate = format(cell.start, 'yyyy-MM-dd')
      const endDate = format(addMonths(cell.start, 1), 'yyyy-MM-dd')

      const dropDate = cell.start
      const project = projects.find(
        (p) =>
          isWithinInterval(dropDate, {
            start: parseISO(p.startDate),
            end: parseISO(p.endDate),
          })
      )
      const projectId = project?.id ?? projects[0]?.id
      if (projectId) {
        onDrop(projectId, data.memberId, data.role, startDate, endDate)
      }
    } catch {
      // ignore
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative h-full min-h-[32px] ${isDragOver ? 'bg-emerald-100/50' : ''}`}
    >
      {children}
    </div>
  )
}
