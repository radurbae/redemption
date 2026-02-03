-- =====================================================
-- Random Quest System
-- =====================================================

-- Quest pool: predefined quests that can be assigned randomly
create table public.quest_pool (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (category in ('wellness', 'productivity', 'social', 'learning', 'fitness', 'creativity')),
  difficulty text not null default 'normal' check (difficulty in ('easy', 'normal', 'hard')),
  xp_reward int not null default 15,
  gold_reward int not null default 8,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- Daily quests: quests assigned to users each day
create table public.daily_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  quest_id uuid references public.quest_pool(id) on delete cascade not null,
  date date not null default current_date,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, quest_id, date)
);

-- Indexes
create index daily_quests_user_date_idx on public.daily_quests(user_id, date);
create index quest_pool_category_idx on public.quest_pool(category);

-- Enable RLS
alter table public.quest_pool enable row level security;
alter table public.daily_quests enable row level security;

-- Quest pool is readable by everyone (it's shared content)
create policy "Quest pool is viewable by authenticated users"
  on public.quest_pool for select
  to authenticated
  using (is_active = true);

-- Daily quests policies
create policy "Users can view own daily quests"
  on public.daily_quests for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily quests"
  on public.daily_quests for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily quests"
  on public.daily_quests for update
  using (auth.uid() = user_id);

-- =====================================================
-- Seed Quest Pool with sample quests
-- =====================================================
insert into public.quest_pool (title, description, category, difficulty, xp_reward, gold_reward) values
-- Wellness
('Drink 8 glasses of water', 'Stay hydrated throughout the day', 'wellness', 'easy', 10, 5),
('Take a 10-minute walk', 'Get some fresh air and move your body', 'wellness', 'easy', 10, 5),
('Meditate for 5 minutes', 'Clear your mind with a short meditation', 'wellness', 'easy', 10, 5),
('Get 7+ hours of sleep', 'Prioritize rest for better performance', 'wellness', 'normal', 15, 8),
('No phone for 1 hour before bed', 'Improve your sleep quality', 'wellness', 'hard', 20, 12),
('Stretch for 10 minutes', 'Keep your body flexible', 'wellness', 'easy', 10, 5),

-- Productivity
('Complete your most important task first', 'Eat that frog!', 'productivity', 'normal', 15, 8),
('No social media until noon', 'Focus on deep work in the morning', 'productivity', 'hard', 20, 12),
('Clear your inbox to zero', 'Achieve inbox zen', 'productivity', 'normal', 15, 8),
('Plan tomorrow before bed', 'Set yourself up for success', 'productivity', 'easy', 10, 5),
('Use Pomodoro technique (4 sessions)', 'Work in focused bursts', 'productivity', 'normal', 15, 8),
('Declutter your workspace', 'A clean space is a clear mind', 'productivity', 'easy', 10, 5),

-- Social
('Send a thank you message', 'Express gratitude to someone', 'social', 'easy', 10, 5),
('Have a meaningful conversation', 'Connect deeply with someone', 'social', 'normal', 15, 8),
('Help someone today', 'Make a positive impact', 'social', 'normal', 15, 8),
('Call a friend or family member', 'Nurture your relationships', 'social', 'easy', 10, 5),
('Give a genuine compliment', 'Brighten someone''s day', 'social', 'easy', 10, 5),

-- Learning
('Read for 20 minutes', 'Expand your knowledge', 'learning', 'normal', 15, 8),
('Learn one new word', 'Grow your vocabulary', 'learning', 'easy', 10, 5),
('Watch an educational video', 'Learn something new', 'learning', 'easy', 10, 5),
('Practice a skill for 30 minutes', 'Deliberate practice makes perfect', 'learning', 'normal', 15, 8),
('Teach someone something', 'Solidify your knowledge by teaching', 'learning', 'hard', 20, 12),

-- Fitness
('Do 20 push-ups', 'Build upper body strength', 'fitness', 'normal', 15, 8),
('Do 30 squats', 'Strengthen your legs', 'fitness', 'normal', 15, 8),
('Hold a plank for 1 minute', 'Core strength challenge', 'fitness', 'hard', 20, 12),
('Take 10,000 steps', 'Get moving throughout the day', 'fitness', 'hard', 20, 12),
('Do 10 minutes of cardio', 'Get your heart pumping', 'fitness', 'normal', 15, 8),

-- Creativity
('Write in a journal', 'Reflect on your day', 'creativity', 'easy', 10, 5),
('Doodle or sketch something', 'Express yourself visually', 'creativity', 'easy', 10, 5),
('Listen to a new music genre', 'Expand your musical horizons', 'creativity', 'easy', 10, 5),
('Try a new recipe', 'Get creative in the kitchen', 'creativity', 'normal', 15, 8),
('Take a photo of something beautiful', 'Notice beauty around you', 'creativity', 'easy', 10, 5);
