-- =====================================================
-- 1% Better - Tasks Table for To Do
-- Supabase Database Migration
-- =====================================================

-- Tasks table (daily to-do items)
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  completed boolean not null default false,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- Index for fast date queries
create index tasks_user_date_idx on public.tasks(user_id, date);

-- Enable RLS
alter table public.tasks enable row level security;

-- RLS policies
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can create own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);
