export const ROLES = [
  'FE',
  'BE',
  '기획',
  'UI디자인',
  'DS',
  'SP',
  'BD',
  '운영',
] as const

export type RoleType = (typeof ROLES)[number]

export const ROLE_CHIP_COLORS: Record<string, { bg: string; text: string }> = {
  FE: { bg: 'bg-blue-200', text: 'text-blue-800' },
  BE: { bg: 'bg-violet-200', text: 'text-violet-800' },
  기획: { bg: 'bg-amber-200', text: 'text-amber-800' },
  UI디자인: { bg: 'bg-pink-200', text: 'text-pink-800' },
  DS: { bg: 'bg-cyan-200', text: 'text-cyan-800' },
  SP: { bg: 'bg-emerald-200', text: 'text-emerald-800' },
  BD: { bg: 'bg-orange-200', text: 'text-orange-800' },
  운영: { bg: 'bg-slate-200', text: 'text-slate-800' },
}

export const STORAGE_KEY = 'allocation-timeline-data'

export const WEEK_CELL_WIDTH = 48
export const ROW_HEIGHT = 36
export const HEADER_ROW_HEIGHT = 32
export const SUBHEADER_ROW_HEIGHT = 44
export const SIDEBAR_WIDTH = 220
export const SIDEBAR_COLLAPSED_WIDTH = 48
export const MONTHS_RANGE = 3 // display ±N months from current
export const TIMELINE_SPAN_YEARS = 1
export const DEFAULT_TIMELINE_START_YEAR = 2026

export const WORKLOAD_COLORS = {
  green: { bg: 'bg-emerald-200', text: 'text-emerald-800' },
  yellow: { bg: 'bg-amber-200', text: 'text-amber-800' },
  red: { bg: 'bg-red-200', text: 'text-red-800' },
} as const
