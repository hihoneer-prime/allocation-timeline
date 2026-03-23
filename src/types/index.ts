export interface Member {
  id: string
  name: string
  role: string
}

export interface Project {
  id: string
  name: string
  startDate: string // ISO date
  endDate: string // ISO date
}

export interface AllocationSegment {
  start: string // ISO date
  end: string // ISO date
  ratio: number // 0.01 ~ 1.0, 2 decimal places
}

export interface Allocation {
  id: string
  projectId: string
  memberId: string
  role: string // FE, BE, 기획, UI디자인 등
  startDate: string
  endDate: string
  segments: AllocationSegment[]
}

export type ViewMode = 'project' | 'member'
