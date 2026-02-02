-- =====================================================
-- 1% Better - Atomic Habits Tracker
-- Supabase Database Migration
-- =====================================================

-- Enable UUID extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Habits table
-- Stores user habits with the 4 Laws of Behavior Change fields
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  identity text not null,
  obvious_cue text,
  attractive_bundle text,
  easy_step text not null,
  satisfying_reward text,
  schedule text not null check (schedule in ('daily', 'weekdays')),
  created_at timestamptz default now()
);

-- Checkins table
-- Stores daily check-ins for each habit
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  date date not null,
  status text not null check (status in ('done', 'skipped')),
  created_at timestamptz default now(),
  unique (user_id, habit_id, date)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Habits indexes
create index habits_user_id_idx on public.habits(user_id);

-- Checkins indexes
create index checkins_user_habit_idx on public.checkins(user_id, habit_id);
create index checkins_date_idx on public.checkins(date);
create index checkins_habit_date_idx on public.checkins(habit_id, date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
alter table public.habits enable row level security;
alter table public.checkins enable row level security;

-- =====================================================
-- HABITS POLICIES
-- =====================================================

-- Users can view their own habits
create policy "Users can view own habits"
  on public.habits for select
  using (auth.uid() = user_id);

-- Users can create their own habits
create policy "Users can create own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

-- Users can update their own habits
create policy "Users can update own habits"
  on public.habits for update
  using (auth.uid() = user_id);

-- Users can delete their own habits
create policy "Users can delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- =====================================================
-- CHECKINS POLICIES
-- =====================================================

-- Users can view their own checkins
create policy "Users can view own checkins"
  on public.checkins for select
  using (auth.uid() = user_id);

-- Users can create checkins for their own habits
create policy "Users can create own checkins"
  on public.checkins for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.habits
      where habits.id = habit_id
      and habits.user_id = auth.uid()
    )
  );

-- Users can update their own checkins
create policy "Users can update own checkins"
  on public.checkins for update
  using (auth.uid() = user_id);

-- Users can delete their own checkins
create policy "Users can delete own checkins"
  on public.checkins for delete
  using (auth.uid() = user_id);
