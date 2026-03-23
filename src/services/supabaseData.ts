import type { Member, Project, Allocation, AllocationSegment } from '@/types'
import { getSupabase } from '@/lib/supabase'

type MemberRow = {
  id: string
  name: string
  role: string
}

type ProjectRow = {
  id: string
  name: string
  start_date: string
  end_date: string
}

type AllocationRow = {
  id: string
  project_id: string
  member_id: string
  role: string
  start_date: string
  end_date: string
  segments: AllocationSegment[]
}

function rowToMember(r: MemberRow): Member {
  return { id: r.id, name: r.name, role: r.role }
}

function rowToProject(r: ProjectRow): Project {
  return {
    id: r.id,
    name: r.name,
    startDate: r.start_date,
    endDate: r.end_date,
  }
}

function rowToAllocation(r: AllocationRow): Allocation {
  const segments = Array.isArray(r.segments) ? r.segments : []
  return {
    id: r.id,
    projectId: r.project_id,
    memberId: r.member_id,
    role: r.role,
    startDate: r.start_date,
    endDate: r.end_date,
    segments,
  }
}

export async function fetchWorkspaceData(): Promise<{
  members: Member[]
  projects: Project[]
  allocations: Allocation[]
}> {
  const sb = getSupabase()
  const [mRes, pRes, aRes] = await Promise.all([
    sb.from('members').select('*').order('name'),
    sb.from('projects').select('*').order('name'),
    sb.from('allocations').select('*'),
  ])
  if (mRes.error) throw mRes.error
  if (pRes.error) throw pRes.error
  if (aRes.error) throw aRes.error

  return {
    members: (mRes.data as MemberRow[]).map(rowToMember),
    projects: (pRes.data as ProjectRow[]).map(rowToProject),
    allocations: (aRes.data as AllocationRow[]).map(rowToAllocation),
  }
}

export async function insertMember(id: string, name: string, role: string): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb.from('members').insert({ id, name, role })
  if (error) throw error
}

export async function updateMemberRow(
  id: string,
  patch: { name?: string; role?: string }
): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb.from('members').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteMemberRow(id: string): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb.from('members').delete().eq('id', id)
  if (error) throw error
}

export async function insertProject(
  id: string,
  name: string,
  startDate: string,
  endDate: string
): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb
    .from('projects')
    .insert({ id, name, start_date: startDate, end_date: endDate })
  if (error) throw error
}

export async function updateProjectRow(
  id: string,
  patch: { name?: string; start_date?: string; end_date?: string }
): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb.from('projects').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteProjectRow(id: string): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function insertAllocationRow(a: Allocation): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb.from('allocations').insert({
    id: a.id,
    project_id: a.projectId,
    member_id: a.memberId,
    role: a.role,
    start_date: a.startDate,
    end_date: a.endDate,
    segments: a.segments,
  })
  if (error) throw error
}

export async function updateAllocationRow(
  id: string,
  patch: {
    role?: string
    start_date?: string
    end_date?: string
    segments?: AllocationSegment[]
  }
): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb.from('allocations').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteAllocationRow(id: string): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb.from('allocations').delete().eq('id', id)
  if (error) throw error
}

const NIL_UUID = '00000000-0000-0000-0000-000000000000'

/** 기존 원격 데이터 전부 삭제 후 JSON과 동일 구조로 재삽입 (불러오기용) */
export async function replaceEntireWorkspace(data: {
  members: Member[]
  projects: Project[]
  allocations: Allocation[]
}): Promise<void> {
  const sb = getSupabase()
  const { error: ea } = await sb.from('allocations').delete().neq('id', NIL_UUID)
  if (ea) throw ea
  const { error: ep } = await sb.from('projects').delete().neq('id', NIL_UUID)
  if (ep) throw ep
  const { error: em } = await sb.from('members').delete().neq('id', NIL_UUID)
  if (em) throw em

  if (data.members.length > 0) {
    const { error } = await sb
      .from('members')
      .insert(data.members.map((m) => ({ id: m.id, name: m.name, role: m.role })))
    if (error) throw error
  }
  if (data.projects.length > 0) {
    const { error } = await sb.from('projects').insert(
      data.projects.map((p) => ({
        id: p.id,
        name: p.name,
        start_date: p.startDate,
        end_date: p.endDate,
      }))
    )
    if (error) throw error
  }
  if (data.allocations.length > 0) {
    const { error } = await sb.from('allocations').insert(
      data.allocations.map((a) => ({
        id: a.id,
        project_id: a.projectId,
        member_id: a.memberId,
        role: a.role,
        start_date: a.startDate,
        end_date: a.endDate,
        segments: a.segments,
      }))
    )
    if (error) throw error
  }
}
