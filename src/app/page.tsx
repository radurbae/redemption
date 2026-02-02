import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getHabits } from '@/lib/actions/habits';
import { getTodayAndYesterdayCheckins, getAllCheckinsForStreak } from '@/lib/actions/checkins';
import { filterHabitsForDate } from '@/lib/utils/schedule';
import { calculateStreak } from '@/lib/utils/streak';
import { getTodayString, getYesterdayString, formatDisplayDate } from '@/lib/utils/dates';
import NavBar from '@/components/NavBar';
import HabitCard from '@/components/HabitCard';
import type { Habit, HabitWithCheckin } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const today = new Date();
  const todayStr = getTodayString();
  const yesterdayStr = getYesterdayString();

  // Fetch all habits
  const allHabits = await getHabits();

  // Filter habits for today based on schedule
  const todaysHabits = filterHabitsForDate(allHabits as Habit[], today);

  // Get habit IDs
  const habitIds = todaysHabits.map(h => h.id);

  // Fetch checkins for today and yesterday
  const checkinMap = await getTodayAndYesterdayCheckins(habitIds, todayStr, yesterdayStr);

  // Fetch all checkins for streak calculation
  const streakCheckinsMap = await getAllCheckinsForStreak(habitIds);

  // Build HabitWithCheckin array
  const habitsWithCheckins: HabitWithCheckin[] = todaysHabits.map(habit => {
    const checkinData = checkinMap.get(habit.id) || { today: null, yesterday: null };
    const streakCheckins = streakCheckinsMap.get(habit.id) || [];
    const streak = calculateStreak(habit as Habit, streakCheckins, today);

    return {
      ...(habit as Habit),
      todayCheckin: checkinData.today,
      yesterdayCheckin: checkinData.yesterday,
      streak,
    };
  });

  // Calculate overall stats
  const completedToday = habitsWithCheckins.filter(h => h.todayCheckin?.status === 'done').length;
  const totalToday = habitsWithCheckins.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Today&apos;s Habits
          </h1>
          <p className="text-gray-600">{formatDisplayDate(today)}</p>
        </div>

        {/* Progress summary */}
        {totalToday > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Daily Progress</p>
                <p className="text-lg font-semibold text-gray-900">
                  {completedToday} of {totalToday} completed
                </p>
              </div>
              <div className="w-16 h-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeDasharray={`${(completedToday / totalToday) * 100} 100`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Habits list or empty state */}
        {habitsWithCheckins.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-4">🌱</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {allHabits.length === 0
                ? 'Start your journey'
                : 'No habits scheduled for today'}
            </h2>
            <p className="text-gray-600 mb-6">
              {allHabits.length === 0
                ? 'Create your first habit using the 4 Laws of Behavior Change'
                : 'Your weekday habits will appear here on Monday through Friday'}
            </p>
            {allHabits.length === 0 && (
              <Link
                href="/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Your First Habit
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {habitsWithCheckins.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayDate={todayStr}
                todayCheckin={habit.todayCheckin}
                yesterdayCheckin={habit.yesterdayCheckin}
                streak={habit.streak}
              />
            ))}
          </div>
        )}

        {/* Atomic Habits tip */}
        <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl">
          <h3 className="font-semibold text-indigo-900 mb-2">💡 Remember</h3>
          <p className="text-sm text-indigo-800">
            Improvement is not about doing more things. It&apos;s about getting 1% better every day.
            Small habits don&apos;t add up—they compound.
          </p>
        </div>
      </main>
    </div>
  );
}
