import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getHabit, deleteHabit } from '@/lib/actions/habits';
import { getCheckinsForHabit } from '@/lib/actions/checkins';
import { calculateStreak } from '@/lib/utils/streak';
import NavBar from '@/components/NavBar';
import HabitForm from '@/components/HabitForm';
import type { Habit } from '@/lib/types';

interface HabitDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function HabitDetailPage({ params }: HabitDetailPageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const habit = await getHabit(id);

    if (!habit) {
        notFound();
    }

    const checkins = await getCheckinsForHabit(id);
    const streak = calculateStreak(habit as Habit, checkins);

    async function handleDelete() {
        'use server';
        await deleteHabit(id);
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <NavBar />

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Back link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{habit.title}</h1>
                        <p className="text-indigo-600 font-medium">&ldquo;{habit.identity}&rdquo;</p>
                    </div>

                    {streak > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                            <span>🔥</span>
                            <span>{streak} day streak</span>
                        </div>
                    )}
                </div>

                {/* Habit details card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">The 4 Laws</h2>

                    <div className="space-y-4">
                        {habit.obvious_cue && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-1">
                                    📍 Make it Obvious
                                </h3>
                                <p className="text-blue-800">{habit.obvious_cue}</p>
                            </div>
                        )}

                        {habit.attractive_bundle && (
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h3 className="text-sm font-medium text-purple-600 uppercase tracking-wide mb-1">
                                    ✨ Make it Attractive
                                </h3>
                                <p className="text-purple-800">{habit.attractive_bundle}</p>
                            </div>
                        )}

                        <div className="p-4 bg-green-50 rounded-lg">
                            <h3 className="text-sm font-medium text-green-600 uppercase tracking-wide mb-1">
                                ⏱️ Make it Easy (2-Minute Step)
                            </h3>
                            <p className="text-green-800">{habit.easy_step}</p>
                        </div>

                        {habit.satisfying_reward && (
                            <div className="p-4 bg-amber-50 rounded-lg">
                                <h3 className="text-sm font-medium text-amber-600 uppercase tracking-wide mb-1">
                                    🎉 Make it Satisfying
                                </h3>
                                <p className="text-amber-800">{habit.satisfying_reward}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                            Schedule: {habit.schedule === 'daily' ? '📅 Every day' : '📆 Weekdays only'}
                        </span>
                    </div>
                </div>

                {/* Edit form */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Habit</h2>
                    <HabitForm habit={habit as Habit} mode="edit" />
                </div>

                {/* Delete section */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
                    <p className="text-sm text-red-700 mb-4">
                        Deleting a habit will also remove all its check-in history. This action cannot be undone.
                    </p>
                    <form action={handleDelete}>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                            Delete Habit
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
