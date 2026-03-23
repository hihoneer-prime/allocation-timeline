import type { Member } from '@/types'
import { ROLE_CHIP_COLORS } from '@/constants'

interface MemberChipProps {
  member: Member
  onRemove?: () => void
  onEdit?: () => void
  draggable?: boolean
  selected?: boolean
  onClick?: () => void
}

export function MemberChip({
  member,
  onRemove,
  onEdit,
  draggable = true,
  selected = false,
  onClick,
}: MemberChipProps) {
  const colors = ROLE_CHIP_COLORS[member.role] ?? ROLE_CHIP_COLORS['운영']

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable) return
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'member',
      memberId: member.id,
      memberName: member.name,
      role: member.role,
    }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <span
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={onClick}
      className={`inline-flex cursor-grab items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium hover:opacity-90 active:cursor-grabbing ${
        selected ? 'ring-2 ring-emerald-500 ring-offset-1' : ''
      } ${colors.bg} ${colors.text}`}
    >
      {member.name}
      <span className="opacity-80">({member.role})</span>
      {onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onEdit()
          }}
          className="ml-0.5 rounded-full p-0.5 opacity-70 hover:bg-slate-400 hover:text-white hover:opacity-100"
          title="수정"
        >
          ✎
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-slate-400 hover:text-white"
          title="삭제"
        >
          ×
        </button>
      )}
    </span>
  )
}
