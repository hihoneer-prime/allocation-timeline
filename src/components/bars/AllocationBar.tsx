import { useState, useRef, useEffect } from 'react'
import { parseISO, addDays, differenceInDays, format } from 'date-fns'
import { getCellIndex } from '@/utils/timelineUtils'
import { adjustToNoOverlap } from '@/utils/allocationUtils'
import { formatRatio } from '@/utils/formatRatio'
import { ROW_HEIGHT } from '@/constants'
import { useStore } from '@/store/useStore'
import { getWorkloadBarClass } from '@/hooks/useWorkloadColor'
import { useTimelineScroll } from '@/contexts/TimelineScrollContext'
import type { TimelineCell } from '@/types/timeline'
import type { Allocation } from '@/types'
import { AllocationRatioDialog } from '@/components/dialogs/AllocationRatioDialog'

const SCROLL_ZONE = 60
const SCROLL_SPEED = 8

interface AllocationBarProps {
  allocation: Allocation
  memberName: string
  cells: TimelineCell[]
  weeklyTotals?: number[]
  tagLabel?: string
  siblingAllocations?: Allocation[]
}

type DragMode = 'move' | 'resize-left' | 'resize-right'

export function AllocationBar({
  allocation,
  memberName,
  cells,
  weeklyTotals = [],
  tagLabel,
  siblingAllocations = [],
}: AllocationBarProps) {
  const cellWidth = cells[0]?.width ?? 48
  const MIN_BAR_WIDTH = cellWidth
  const updateAllocation = useStore((s) => s.updateAllocation)
  const updateAllocationSegments = useStore((s) => s.updateAllocationSegments)
  const [showRatioDialog, setShowRatioDialog] = useState(false)
  const scrollRef = useTimelineScroll()
  const scrollIntervalRef = useRef<number | null>(null)
  const didDragRef = useRef(false)
  const hasMovedRef = useRef(false)

  const [dragState, setDragState] = useState<{
    mode: DragMode
    startX: number
    baseLeft: number
    baseWidth: number
  } | null>(null)
  const [dragOffsetPx, setDragOffsetPx] = useState(0)
  const dragStateRef = useRef<typeof dragState>(null)
  const dragOffsetRef = useRef(0)
  dragStateRef.current = dragState
  dragOffsetRef.current = dragOffsetPx

  useEffect(() => () => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current)
  }, [])

  const startIdx = getCellIndex(cells, parseISO(allocation.startDate))
  const endIdx = getCellIndex(cells, parseISO(allocation.endDate))

  if (startIdx < 0 || endIdx < 0 || startIdx > endIdx) return null

  const baseLeft = cells.slice(0, startIdx).reduce((s, c) => s + c.width, 0)
  const baseWidth = cells.slice(startIdx, endIdx + 1).reduce((s, c) => s + c.width, 0)

  const runAutoScroll = (clientX: number) => {
    const el = scrollRef?.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const scrollZoneLeft = rect.left + SCROLL_ZONE
    const scrollZoneRight = rect.right - SCROLL_ZONE
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
    if (clientX < scrollZoneLeft) {
      scrollIntervalRef.current = window.setInterval(() => {
        el.scrollLeft -= SCROLL_SPEED
      }, 16)
    } else if (clientX > scrollZoneRight) {
      scrollIntervalRef.current = window.setInterval(() => {
        el.scrollLeft += SCROLL_SPEED
      }, 16)
    }
  }

  const commitDrag = (mode: DragMode, offsetPx: number): boolean => {
    const origStart = allocation.startDate
    const origEnd = allocation.endDate
    const origDurationDays = Math.max(1, differenceInDays(parseISO(origEnd), parseISO(origStart)) + 1)

    if (mode === 'move') {
      /** 칸마다 경계: 0.5~1.5칸→1칸, 1.5~2.5칸→2칸. round(offsetPx/cellWidth) 사용 */
      const cellsToMove = Math.round(offsetPx / cellWidth)
      if (cellsToMove === 0) return false
      const newStartCellIdx = Math.max(0, Math.min(cells.length - 1, startIdx + cellsToMove))
      const barSpan = endIdx - startIdx + 1
      const newEndCellIdx = Math.min(cells.length - 1, newStartCellIdx + barSpan - 1)
      if (newEndCellIdx < newStartCellIdx) return false
      const newStart = format(cells[newStartCellIdx].start, 'yyyy-MM-dd')
      const newEnd = format(addDays(parseISO(newStart), origDurationDays - 1), 'yyyy-MM-dd')
      let finalStart = newStart
      let finalEnd = newEnd
      if (siblingAllocations.length > 0) {
        const adjusted = adjustToNoOverlap(newStart, newEnd, siblingAllocations, allocation.id)
        finalStart = adjusted.startDate
        finalEnd = adjusted.endDate
      }
      if (parseISO(finalStart) <= parseISO(finalEnd)) {
        void (async () => {
          try {
            await updateAllocation(allocation.id, {
              startDate: finalStart,
              endDate: finalEnd,
            })
            await updateAllocationSegments(allocation.id, [
              {
                start: finalStart,
                end: finalEnd,
                ratio: allocation.segments[0]?.ratio ?? 1,
              },
            ])
          } catch (err) {
            alert(err instanceof Error ? err.message : String(err))
          }
        })()
        return true
      }
      return false
    }

    /** 이동과 동일: 0.5~1.5칸→1칸, 1.5~2.5칸→2칸 */
    const resizeMinPx = cellWidth / 2
    if (Math.abs(offsetPx) < resizeMinPx) return false

    const cellsDelta = Math.round(offsetPx / cellWidth)
    if (cellsDelta === 0) return false

    let newStart: string
    let newEnd: string
    if (mode === 'resize-left') {
      const newStartCellIdx = Math.max(0, Math.min(endIdx, startIdx + cellsDelta))
      newStart = format(cells[newStartCellIdx].start, 'yyyy-MM-dd')
      newEnd = origEnd
    } else {
      const newEndCellIdx = Math.max(startIdx, Math.min(cells.length - 1, endIdx + cellsDelta))
      newStart = origStart
      newEnd = format(cells[newEndCellIdx].end, 'yyyy-MM-dd')
    }

    if (siblingAllocations.length > 0) {
      const adjusted = adjustToNoOverlap(newStart, newEnd, siblingAllocations, allocation.id)
      newStart = adjusted.startDate
      newEnd = adjusted.endDate
    }

    const datesChanged = newStart !== origStart || newEnd !== origEnd
    if (datesChanged && parseISO(newStart) <= parseISO(newEnd)) {
      void (async () => {
        try {
          await updateAllocation(allocation.id, {
            startDate: newStart,
            endDate: newEnd,
          })
          await updateAllocationSegments(allocation.id, [
            {
              start: newStart,
              end: newEnd,
              ratio: allocation.segments[0]?.ratio ?? 1,
            },
          ])
        } catch (err) {
          alert(err instanceof Error ? err.message : String(err))
        }
      })()
      return true
    }
    return false
  }

  const singleRatio =
    allocation.segments.length === 1 ? allocation.segments[0].ratio : null

  const maxTotalInRange =
    weeklyTotals.length > 0
      ? Math.max(
          ...weeklyTotals.slice(
            Math.max(0, startIdx),
            Math.min(weeklyTotals.length, endIdx + 1)
          ),
          0
        )
      : 0
  const barClass = getWorkloadBarClass(maxTotalInRange)

  let displayLeft = baseLeft
  let displayWidth = baseWidth
  if (dragState) {
    const offset = dragOffsetPx
    if (dragState.mode === 'move') {
      displayLeft = Math.max(0, baseLeft + offset)
    } else if (dragState.mode === 'resize-left') {
      const clamped = Math.max(-baseWidth + MIN_BAR_WIDTH, Math.min(baseWidth - MIN_BAR_WIDTH, offset))
      displayLeft = baseLeft + clamped
      displayWidth = baseWidth - clamped
    } else {
      const clamped = Math.max(MIN_BAR_WIDTH - baseWidth, offset)
      displayWidth = baseWidth + clamped
    }
  }

  const setupDrag = (mode: DragMode, startX: number) => {
    setDragState({ mode, startX, baseLeft, baseWidth })
    setDragOffsetPx(0)
    hasMovedRef.current = false
  }

  const handleMouseMove = (e: MouseEvent) => {
    hasMovedRef.current = true
    const state = dragStateRef.current
    if (!state) return
    const offset = e.clientX - state.startX
    dragOffsetRef.current = offset
    setDragOffsetPx(offset)
    runAutoScroll(e.clientX)
  }

  const handleMouseUp = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
    const state = dragStateRef.current
    if (state) {
      const committed = commitDrag(state.mode, dragOffsetRef.current)
      didDragRef.current = hasMovedRef.current || committed
      setDragState(null)
    }
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  const attachDragListeners = () => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <>
      <div
        className={`absolute top-1 bottom-1 flex cursor-move select-none items-center rounded hover:opacity-90 ${barClass} ${dragState ? 'z-30' : ''}`}
        style={{
          left: displayLeft + 2,
          width: displayWidth - 4,
          minHeight: ROW_HEIGHT - 16,
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-resize]')) return
          if (dragState) return
          if (didDragRef.current) {
            didDragRef.current = false
            return
          }
          setShowRatioDialog(true)
        }}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('[data-resize]')) return
          if (e.button !== 0) return
          setupDrag('move', e.clientX)
          attachDragListeners()
        }}
      >
        <div
          data-resize="left"
          className="absolute left-0 top-0 h-full w-2 cursor-ew-resize hover:bg-blue-500/50"
          onMouseDown={(e) => {
            e.stopPropagation()
            setupDrag('resize-left', e.clientX)
            attachDragListeners()
          }}
        />
        {tagLabel && (
          <span
            className="absolute left-1 top-0.5 z-10 max-w-[80px] select-none truncate rounded bg-slate-800/90 px-1.5 py-0.5 text-[10px] font-medium text-white shadow"
            title={tagLabel}
          >
            {tagLabel}
          </span>
        )}
        <div className="flex flex-1 select-none items-center justify-center gap-1 px-2 text-xs font-medium">
          {singleRatio !== null ? (
            <span title={memberName + ' (' + allocation.role + ')'}>
              {formatRatio(singleRatio)}
            </span>
          ) : (
            allocation.segments.map((seg, i) => {
              const r = formatRatio(seg.ratio)
              return (
                <span
                  key={i}
                  className="flex-1 truncate text-center"
                  title={r}
                >
                  {r}
                </span>
              )
            })
          )}
        </div>
        <div
          data-resize="right"
          className="absolute right-0 top-0 h-full w-2 cursor-ew-resize hover:bg-blue-500/50"
          onMouseDown={(e) => {
            e.stopPropagation()
            setupDrag('resize-right', e.clientX)
            attachDragListeners()
          }}
        />
      </div>
      {showRatioDialog && (
        <AllocationRatioDialog
          allocation={allocation}
          onClose={() => setShowRatioDialog(false)}
        />
      )}
    </>
  )
}
