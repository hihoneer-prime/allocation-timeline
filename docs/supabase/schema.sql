-- allocation-timeline: Supabase SQL 에디터에서 한 번 실행
-- 공개 읽기 + 로그인 사용자만 쓰기

create extension if not exists "uuid-ossp";

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz default now()
);

create table if not exists public.allocations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  role text not null,
  start_date date not null,
  end_date date not null,
  segments jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.members enable row level security;
alter table public.projects enable row level security;
alter table public.allocations enable row level security;

-- 익명(비로그인) 읽기
create policy "members_select_anon"
  on public.members for select
  using (true);

create policy "projects_select_anon"
  on public.projects for select
  using (true);

create policy "allocations_select_anon"
  on public.allocations for select
  using (true);

-- 인증된 사용자만 쓰기
create policy "members_write_auth"
  on public.members for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "projects_write_auth"
  on public.projects for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "allocations_write_auth"
  on public.allocations for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
