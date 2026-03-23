# 투입바 드래그 동작 원인 분석

## 1. 우측 이동이 한 칸 이상 필요함 - 원인

### 현재 로직
- `useLeftEdge: true` → 기준점 = 바의 **왼쪽 끝** (dropLeft)
- `newStartCellIdx = getCellIndexForPixel(cells, anchorPx)`
- 우측: `offsetPx >= rightMinPx` (0.5 * cellWidth = 24px)
- 좌측: `offsetPx <= -leftMinPx` (-24px)

### 왜 우측은 한 칸 필요?
- 바가 baseLeft=0(셀0 시작)에 있을 때, 셀1로 가려면 anchorPx가 셀1 안에 있어야 함
- 셀1은 픽셀 48부터 시작 (cellWidth=48)
- 따라서 `dropLeft >= 48` → `offsetPx >= 48` 필요
- **경계를 넘으려면 최소 1칸(48px) 드래그가 필요** → rightMinPx(24)만으로는 부족

### 왜 좌측은 반 칸이면 됨?
- 바가 baseLeft=48(셀1 시작)에 있을 때, 셀0으로 가려면 anchorPx < 48
- `offsetPx <= -24`이면 dropLeft=24 → 셀0 안에 있음
- **반 칸(24px)만 드래그해도 이전 셀에 진입** → 정상 동작

### 해결 방향
- **우측 이동 시**: 바의 **중심점**으로 셀 판단
- 중심이 경계를 넘으면 이동 적용 → 반 칸 드래그로 1칸 이동 가능
- 좌측은 왼쪽 끝 유지 (이미 정상)

---

## 2. 리사이즈 좌우 동작 불일치 - 원인

### 현재 로직
- `DRAG_THRESHOLD_PX = 4` → 4px 미만이면 무시
- `pixelToDate()`로 픽셀→날짜 변환 후 즉시 적용
- 셀 경계/반 칸 기준 없음

### 문제
- 픽셀 단위 변환의 반올림/내림으로 좌우 동작이 다르게 보임
- `pixelToDate`의 `Math.floor` 등으로 경계 부근에서 불안정

### 해결 방향
- 리사이즈도 **반 칸 이상** 드래그 시에만 적용
- `getCellIndexForPixel`로 셀 단위 스냅 후 날짜 계산
- 좌우 모두 `|offsetPx| >= cellWidth/2`일 때만 기간 변경
