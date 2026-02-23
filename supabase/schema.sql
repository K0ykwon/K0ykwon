-- Run this in Supabase Dashboard > SQL Editor

create table if not exists public.posts (
  id          uuid        default gen_random_uuid() primary key,
  title       text        not null,
  slug        text        not null unique,
  content     text        not null default '',
  description text        not null default '',
  category    text        not null check (category in ('dev-log', 'problem-solving', 'paper-review', 'etc')),
  published   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.posts enable row level security;

-- Anyone can read (filter published=true in app code)
create policy "Allow read"
  on public.posts for select
  using (true);

-- Allow all writes (app-level auth enforces security via /blog/admin)
create policy "Allow insert"
  on public.posts for insert
  with check (true);

create policy "Allow update"
  on public.posts for update
  using (true) with check (true);

create policy "Allow delete"
  on public.posts for delete
  using (true);

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on public.posts
  for each row execute function update_updated_at();

-- ── Timeline ──────────────────────────────────────────────────────────────────

create table if not exists public.timeline (
  id          uuid        default gen_random_uuid() primary key,
  start_date  text        not null,
  end_date    text        not null default 'Present',
  title       text        not null,
  description text        not null default '',
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.timeline enable row level security;

create policy "timeline_read"   on public.timeline for select using (true);
create policy "timeline_insert" on public.timeline for insert with check (true);
create policy "timeline_update" on public.timeline for update using (true) with check (true);
create policy "timeline_delete" on public.timeline for delete using (true);
