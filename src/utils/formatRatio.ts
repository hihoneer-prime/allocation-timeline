/**
 * Format ratio for display. Hides trailing zeros.
 * 1 -> "1", 0.5 -> "0.5", 0.25 -> "0.25"
 */
export function formatRatio(ratio: number): string {
  if (Number.isInteger(ratio)) return String(ratio)
  const s = ratio.toFixed(2)
  if (s.endsWith('0')) {
    return s.replace(/\.?0+$/, '')
  }
  return s
}
