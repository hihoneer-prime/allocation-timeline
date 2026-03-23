import { useRef, useState } from 'react'
import { addMonths } from 'date-fns'
import { format } from 'date-fns'
import type { TimelineCell } from '@/types/timeline'

interface DropZoneProps {
  cells: TimelineCell[]
  projectId: string
  onDrop: (projectId: string, memberId: string, role: string, startDate: string, endDate: string) => void
  children: React.ReactNode
}

export function DropZone({ cells, projectId, onDrop, children }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
      if (data.type !== 'member' || !data.memberId || !data.role) return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

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

      onDrop(projectId, data.memberId, data.role, startDate, endDate)
    } catch {
      // ignore invalid drop data
    }
  }

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative h-full min-h-[32px] ${isDragOver ? 'bg-emerald-100/50' : ''}`}
    >
      {children}
    </div>
  )
}
