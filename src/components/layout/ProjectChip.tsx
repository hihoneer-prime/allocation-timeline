import type { Project } from '@/types'

interface ProjectChipProps {
  project: Project
  draggable?: boolean
  className?: string
}

/**
 * 인원별 뷰에서 타임라인으로 드래그할 때 사용 (프로젝트 식별 payload)
 */
export function ProjectChip({
  project,
  draggable = true,
  className = '',
}: ProjectChipProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable) return
    e.stopPropagation()
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'project',
        projectId: project.id,
        projectName: project.name,
      })
    )
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <span
      draggable={draggable}
      onDragStart={handleDragStart}
      className={`cursor-grab truncate active:cursor-grabbing ${className}`}
      title="타임라인으로 드래그하여 투입 추가"
    >
      {project.name}
    </span>
  )
}
