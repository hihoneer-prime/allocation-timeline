import { useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { TimelineScrollContext } from '@/contexts/TimelineScrollContext'
import { TimelineProvider, useTimeline } from '@/contexts/TimelineContext'
import { TimelineColumnProvider } from '@/contexts/TimelineColumnContext'
import { TimelineToolbar } from './TimelineToolbar'
import { TimelineHeader, TimelineSubHeader } from './TimelineHeader'
import { CurrentTimeIndicator } from './CurrentTimeIndicator'
import { MonthDividerLines } from './MonthDividerLines'
import { SidebarToggle } from '@/components/layout/SidebarToggle'
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/constants'
import { getCellIndex } from '@/utils/timelineUtils'

interface TimelineGridProps {
  sidebarContent?: React.ReactNode
  children: React.ReactNode
}

/**
 * 라벨/셀 영역 분리 구조
 * - 사이드바: 메뉴 (고정)
 * - 타임라인: 단일 세로 스크롤 컨테이너에 [라벨 | 셀] 배치 (동기화 불필요)
 * - 셀 영역만 가로 스크롤
 */
function TimelineGridInner({
  sidebarContent,
  children,
}: TimelineGridProps) {
  const { cells, scale, scrollRef } = useTimeline()
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed)
  const hasScrolledRef = useRef(false)

  const totalWidth = cells.length > 0 ? cells.reduce((sum, c) => sum + c.width, 0) : 0
  const cellWidth = cells[0]?.width ?? 48

  useEffect(() => {
    if (hasScrolledRef.current) return
    const el = scrollRef.current
    if (!el) return
    const currentIdx = getCellIndex(cells, new Date())
    if (currentIdx < 0) return
    hasScrolledRef.current = true
    requestAnimationFrame(() => {
      el.scrollLeft = Math.max(0, currentIdx * cellWidth - 80)
    })
  }, [cells, cellWidth, scrollRef])

  return (
    <TimelineScrollContext.Provider value={scrollRef}>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex flex-1 min-h-0">
          {/* 영역1: 사이드바 (접기/펼치기) */}
          <div
            className="flex flex-shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-200 ease-in-out"
            style={{
              width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            }}
          >
            <div className="flex flex-shrink-0 items-center justify-end border-b border-slate-200 p-2">
              <SidebarToggle />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
            )}
          </div>

          {/* 영역2+3: 세로 스크롤 공통, 셀만 가로 스크롤 (헤더+본문 동일 컨테이너로 줌 시 정렬 유지) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="flex">
              <div
                className="flex flex-shrink-0 flex-col border-r border-slate-200 bg-slate-50"
                style={{ width: SIDEBAR_WIDTH }}
              >
                <TimelineColumnProvider mode="label">
                  <TimelineHeader cells={cells} />
                  <TimelineSubHeader cells={cells} />
                  {children}
                </TimelineColumnProvider>
              </div>
              <div
                ref={scrollRef}
                className="relative min-w-0 flex-1 overflow-x-auto overflow-y-hidden"
              >
                <div
                  className="flex flex-col"
                  style={{ minWidth: totalWidth, width: totalWidth }}
                >
                  <div className="sticky top-0 z-10 flex flex-shrink-0 flex-col bg-white">
                    <TimelineColumnProvider mode="cell">
                      <TimelineHeader cells={cells} />
                      <TimelineSubHeader cells={cells} />
                    </TimelineColumnProvider>
                  </div>
                  <TimelineColumnProvider mode="cell">
                    <MonthDividerLines cells={cells} scale={scale} />
                    <CurrentTimeIndicator cells={cells} />
                    {children}
                  </TimelineColumnProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TimelineScrollContext.Provider>
  )
}

export function TimelineGrid({
  sidebarContent,
  children,
}: TimelineGridProps) {
  const cellScrollRef = useRef<HTMLDivElement | null>(null)
  const scale = useStore((s) => s.timelineScale)
  const timelineStartYear = useStore((s) => s.timelineStartYear)

  return (
    <div className="flex h-full flex-col">
      <TimelineProvider
        scale={scale}
        timelineStartYear={timelineStartYear}
        scrollRef={cellScrollRef}
      >
        <TimelineToolbar />
        <TimelineGridInner sidebarContent={sidebarContent}>
          {children}
        </TimelineGridInner>
      </TimelineProvider>
    </div>
  )
}

export type { TimelineCell } from '@/types/timeline'
