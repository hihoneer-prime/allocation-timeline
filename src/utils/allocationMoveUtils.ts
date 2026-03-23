import type { TimelineScale } from '@/types/timeline'

export interface MoveConfig {
  /** Use bar left edge (true) or center (false) for cell determination */
  useLeftEdge: boolean
  /** Min drag fraction for right move (0-1 of cell width) */
  rightMinFraction: number
  /** Min drag fraction for left move (0-1 of cell width) */
  leftMinFraction: number
}

const MOVE_CONFIG: Record<TimelineScale, MoveConfig> = {
  day: { useLeftEdge: true, rightMinFraction: 0.5, leftMinFraction: 0.5 },
  week: { useLeftEdge: true, rightMinFraction: 0.5, leftMinFraction: 0.5 },
  month: { useLeftEdge: true, rightMinFraction: 0.5, leftMinFraction: 0.5 },
  quarter: { useLeftEdge: true, rightMinFraction: 0.5, leftMinFraction: 0.5 },
}

export function getMoveConfig(scale: TimelineScale): MoveConfig {
  return MOVE_CONFIG[scale]
}

/**
 * 우측 이동: 바 중심 사용 (반 칸 드래그로 1칸 이동)
 * 좌측 이동: 바 왼쪽 끝 사용 (반 칸 드래그로 1칸 이동)
 */
export function getAnchorPixel(
  dropLeft: number,
  baseWidth: number,
  offsetPx: number
): number {
  const movingRight = offsetPx > 0
  if (movingRight) return dropLeft + baseWidth / 2
  return dropLeft
}
