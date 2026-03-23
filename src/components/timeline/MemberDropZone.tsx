import { useState } from 'react'
import { addMonths } from 'date-fns'
import { format } from 'date-fns'
import { parseISO, isWithinInterval } from 'date-fns'
import { useStore } from '@/store/useStore'
import type { TimelineCell } from '@/types/timeline'

interface MemberDropZoneProps {
  memberId: string
  /** 프로젝트 칩 드롭 시 사용할 직군(해당 구성원의 직군) */
  memberRole: string
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
  memberRole,
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
      const data = JSON.parse(e.dataTransfer.getData('application/json')) as {
        type?: string
        memberId?: string
        role?: string
        projectId?: string
      }

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

      // 좌측 메뉴에서 프로젝트 칩 드래그 → 이 구성원 행에 투입
      if (data.type === 'project' && data.projectId) {
        onDrop(data.projectId, memberId, memberRole, startDate, endDate)
        return
      }

      // 구성원 칩 드래그(본인 행): 기간에 맞는 프로젝트 자동 선택
      if (data.type !== 'member' || data.memberId !== memberId || !data.role) return

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
