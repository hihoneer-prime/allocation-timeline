import { ROW_HEIGHT, SIDEBAR_WIDTH } from '@/constants'
import { useTimelineColumn } from '@/contexts/TimelineColumnContext'
import type { TimelineCell } from '@/types/timeline'

type LabelVariant = 'project' | 'member' | 'default'

interface TimelineRowProps {
  cells: TimelineCell[]
  label: string
  subLabel?: string
  onLabelClick?: () => void
  indent?: boolean
  labelVariant?: LabelVariant
  children?: React.ReactNode
}

const LABEL_STYLES: Record<LabelVariant, { bg: string; label: string; hover?: string }> = {
  project: {
    bg: 'bg-sky-100',
    label: 'text-base font-bold text-sky-900',
    hover: 'hover:bg-sky-200',
  },
  member: {
    bg: 'bg-slate-600',
    label: 'text-sm font-semibold text-slate-100',
    hover: 'hover:bg-slate-500',
  },
  default: {
    bg: 'bg-slate-50',
    label: 'text-sm font-medium text-slate-700',
    hover: 'hover:bg-slate-200',
  },
}

export function TimelineRow({
  cells,
  label,
  subLabel,
  onLabelClick,
  indent,
  labelVariant = 'default',
  children,
}: TimelineRowProps) {
  const column = useTimelineColumn()
  const totalWidth = cells.length > 0 ? cells.reduce((sum, c) => sum + c.width, 0) : 0
  const { bg, label: labelClass, hover } = LABEL_STYLES[labelVariant]

  if (column === 'label') {
    return (
      <div
        className={`flex flex-shrink-0 border-b border-slate-200 border-r border-slate-200 px-2 py-1 ${bg} ${onLabelClick ? `cursor-pointer ${hover ?? 'hover:bg-slate-200'}` : ''}`}
        style={{ minHeight: ROW_HEIGHT, width: SIDEBAR_WIDTH }}
        onClick={onLabelClick}
        role={onLabelClick ? 'button' : undefined}
      >
        <span className={`truncate ${labelClass} ${indent ? 'pl-4' : ''}`}>
          {label}
        </span>
        {subLabel && (
          <span className={`text-xs ${labelVariant === 'member' ? 'text-slate-300' : 'text-slate-400'}`}>
            {subLabel}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className="flex flex-shrink-0 border-b border-slate-100"
      style={{ minHeight: ROW_HEIGHT }}
    >
      <div
        className={`relative flex-shrink-0 ${labelVariant === 'project' ? 'bg-slate-100' : 'bg-slate-50'}`}
        style={{ width: totalWidth }}
      >
        {children}
      </div>
    </div>
  )
}
