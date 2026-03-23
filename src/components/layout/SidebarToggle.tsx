import { useStore } from '@/store/useStore'

/** 사이드바 접기/펼치기 토글 버튼 */
export function SidebarToggle() {
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useStore((s) => s.toggleSidebar)

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="flex flex-shrink-0 items-center justify-center rounded border border-slate-300 bg-white p-1.5 text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
      title={sidebarCollapsed ? '메뉴 펼치기' : '메뉴 접기'}
      aria-label={sidebarCollapsed ? '메뉴 펼치기' : '메뉴 접기'}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {sidebarCollapsed ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        )}
      </svg>
    </button>
  )
}
