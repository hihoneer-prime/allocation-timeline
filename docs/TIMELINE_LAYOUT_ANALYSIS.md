# 타임라인 레이아웃 분석 및 수정 방안

## 직전 수정으로 인한 문제 요약

### 1. 숨기기 버튼이 2개였던 이유
- **원인**: `TimelineGrid`에서 **헤더 행**과 **본문 행** 각각에 토글 버튼을 배치
- 헤더: `sticky top-0` 블록 내부에 토글
- 본문: 사이드바 컨테이너 내부에 토글
- 결과: 좌측에 토글 버튼이 위·아래 두 군데 노출

### 2. 레이아웃 깨짐 원인
- **contentMinWidth 산정 오류**: `sidebarWidth + SIDEBAR_WIDTH + totalWidth`로 계산
  - `sidebarWidth`가 collapse 상태에 따라 40 / 260으로 변경
  - 기존 일관된 `SIDEBAR_WIDTH + totalWidth` 구조를 깨뜨림
- **labelColumnLeft 오프셋**: `TimelineRow`, `TotalRow`, `TimelineHeader`에 `left: labelColumnLeft` 적용
  - `labelColumnLeft`가 `sidebarWidth`에 의존
  - 프로젝트/구성원 라벨이 기간 열과 어긋나고, 일부는 타임라인 그리드 위에 겹침
- **이중 고정 영역**: 사이드바(토글+메뉴)와 라벨 열을 별도 sticky로 관리
  - sticky 좌표·너비 계산이 복잡해지며 정렬 오류 발생

### 3. "기간" 열과 스크롤 방식
- **기존 구조**: `[사이드바 SIDEBAR_WIDTH | 타임라인 totalWidth]`
- 타임라인 내부 행: `[라벨 SIDEBAR_WIDTH | 셀 totalWidth]`
- 라벨에 `sticky left-0`만 사용 → 사이드바와 **같은 위치(0 ~ 220px)**에 겹침
- 사용자는 “라벨 열 전체가 현재 위치에 고정”되길 원함

## Revert 완료 상태

다음 사항을 원복함:
- `TimelineGrid`: 단일 사이드바, collapse/토글 제거
- `TimelineRow`, `TotalRow`, `TimelineHeader`: `useSidebarLayout` 제거, `sticky left-0` 복원
- `SidebarLayoutContext.tsx` 삭제
- `SIDEBAR_COLLAPSED_WIDTH` 상수 제거

## 올바른 수정 방안

### 방안 A: 구조 유지, 최소 수정 (권장)

1. **스크롤 구조 명확화**
   - `minWidth`: `2 * SIDEBAR_WIDTH + totalWidth` (사이드바 + 라벨 열 + 셀 영역)
   - 헤더 placeholder: `2 * SIDEBAR_WIDTH`로 라벨 열까지 포함

2. **라벨 열 고정**
   - `sticky left: SIDEBAR_WIDTH` 사용 (사이드바 오른쪽에 고정)
   - 별도 Context 없이 상수 `SIDEBAR_WIDTH`만 사용

3. **사이드 메뉴 접기 (선택)**
   - 접힌 상태에서만 `labelColumnLeft`를 40px로 두고 적용
   - Zustand 등으로 `sidebarCollapsed` 관리
   - 토글 버튼은 **본문 사이드바 한 곳**에만 배치

### 방안 B: 영역 분리 구조 (적용 완료)

1. **구조 분리 (라벨/셀 완전 분리)**
   - **사이드바**: 메뉴 (MemberList, ProjectList 등), 220px 고정.
   - **라벨 영역**: 기간/프로젝트/구성원명. 220px 고정, 가로 스크롤 없음. `bg-slate-50` 사이드바 스타일.
   - **셀 영역**: 타임라인 그리드만 가로/세로 스크롤.
   - 라벨·셀 세로 스크롤 동기화 (scrollTop sync).

2. **레이아웃**
   ```
   [사이드바] | [라벨 영역 - 고정] | [셀 영역 - 스크롤]
   ```

3. **유지된 동작**
   - `AllocationBar`: `scrollRef`는 셀 영역에 연결.
   - 투입바 이동·리사이즈 로직 그대로 사용.

### 방안 C: 2단 스크롤 컨테이너

1. **외부 스크롤**: 사이드바 + 라벨 열 (고정)
2. **내부 스크롤**: 셀 영역만 가로 스크롤
3. **장점**: 고정·스크롤 영역 분리가 명확
4. **단점**: 스크롤 UX가 달라지고, 세로 스크롤 연동 처리가 필요

## 권장 적용 순서

1. **1단계**: 방안 A의 1·2번만 적용 (라벨 열 `left: SIDEBAR_WIDTH`로 고정)
2. **2단계**: 동작 확인 후, 필요 시 사이드 메뉴 접기 기능 추가
3. **3단계**: 지속적인 정렬 문제 시 방안 B 검토
