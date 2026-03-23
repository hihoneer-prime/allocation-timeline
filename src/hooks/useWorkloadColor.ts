/**
 * Returns Tailwind classes for workload (total allocation ratio) display.
 * 1.0 and below: green
 * 1.0 ~ 1.5: yellow
 * 1.5+: red
 */
export function getWorkloadColorClass(total: number): string {
  if (total <= 1) return 'text-emerald-700 bg-emerald-100'
  if (total <= 1.5) return 'text-amber-700 bg-amber-100'
  return 'text-red-700 bg-red-100'
}

/** Bar background + text for overload states */
export function getWorkloadBarClass(total: number): string {
  if (total <= 1) return 'bg-blue-200/90 text-slate-800'
  if (total <= 1.5) return 'bg-amber-200/90 text-amber-900'
  return 'bg-red-200/90 text-red-900'
}
