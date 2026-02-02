'use client';

import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import HabitCard from '@/components/HabitCard';
import { HabitCardSkeleton, ProgressSkeleton } from '@/components/Skeletons';
import Link from 'next/link';
import type { Habit, Checkin } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatDate, getYesterdayDate } from '@/lib/utils/dates';
import { shouldShowHabitOnDate } from '@/lib/utils/schedule';
import { calculateStreak, shouldShowNeverMissTwiceWarning } from '@/lib/utils/streak';

interface HabitWithCheckin extends Habit {
  checkin: Checkin | null;
  streak: number;
  showNeverMissTwice: boolean;
}

export default function TodayPage() {
  const [habits, setHabits] = useState<HabitWithCheckin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = formatDate(new Date());
  const yesterday = getYesterdayDate();

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Fetch habits
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (!habitsData) {
      setIsLoading(false);
      return;
    }

    // Filter to today's schedule
    const todayHabits = habitsData.filter(h => shouldShowHabitOnDate(h, today));

    // Fetch checkins for today and yesterday
    const { data: checkinsData } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', user.id)
      .in('date', [today, yesterday]);

    // Fetch all checkins for streak calculation
    const { data: allCheckinsData } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', formatDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)))
      .order('date', { ascending: false });

    const checkins = checkinsData || [];
    const allCheckins = allCheckinsData || [];

    const enrichedHabits: HabitWithCheckin[] = todayHabits.map(habit => {
      const todayCheckin = checkins.find(c => c.habit_id === habit.id && c.date === today) || null;
      const yesterdayCheckin = checkins.find(c => c.habit_id === habit.id && c.date === yesterday) || null;
      const habitCheckins = allCheckins.filter(c => c.habit_id === habit.id);
      const streak = calculateStreak(habit, habitCheckins);
      const showNeverMissTwice = shouldShowNeverMissTwiceWarning(habit, todayCheckin, yesterdayCheckin);

      return {
        ...habit,
        checkin: todayCheckin,
        streak,
        showNeverMissTwice,
      };
    });

    setHabits(enrichedHabits);
    setIsLoading(false);
  }, [today, yesterday]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const completedCount = habits.filter(h => h.checkin?.status === 'done').length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today</h1>
        <p className="text-gray-500 text-sm">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Progress */}
      {isLoading ? (
        <ProgressSkeleton />
      ) : totalCount > 0 ? (
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Progress
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : null}

      {/* Habits list */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <HabitCardSkeleton />
            <HabitCardSkeleton />
            <HabitCardSkeleton />
          </>
        ) : habits.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No habits for today
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Create your first habit to start tracking
            </p>
            <Link href="/new" className="btn-primary inline-block">
              Create Habit
            </Link>
          </div>
        ) : (
          habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              checkin={habit.checkin}
              streak={habit.streak}
              showNeverMissTwice={habit.showNeverMissTwice}
              today={today}
            />
          ))
        )}
      </div>
    </AppShell>
  );
}
