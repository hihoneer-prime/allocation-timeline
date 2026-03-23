/**
 * groupKey를 상단 연월 헤더 표시용 문자열로 변환
 * - yyyy-MM: "2026.4"
 * - yyyy-Qn: "2026 Q2"
 */
export function formatGroupKey(groupKey: string): string {
  const qMatch = groupKey.match(/^(\d{4})-Q(\d)$/)
  if (qMatch) {
    return `${qMatch[1]} Q${qMatch[2]}`
  }
  const monthMatch = groupKey.match(/^(\d{4})-(\d{1,2})$/)
  if (monthMatch) {
    const year = monthMatch[1]
    const month = parseInt(monthMatch[2], 10)
    return `${year}.${month}`
  }
  return groupKey
}
