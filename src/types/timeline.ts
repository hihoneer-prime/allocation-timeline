export type TimelineScale = 'day' | 'week' | 'month' | 'quarter'

export interface TimelineCell {
  start: Date
  end: Date
  index: number
  width: number
  label: string
  subLabel?: string
  /** For week scale: month key; for month: month key; for quarter: Q1, Q2... */
  groupKey: string
}
