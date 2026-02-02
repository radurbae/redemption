'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import TrackerGrid from '@/components/TrackerGrid';
import type { Habit, Checkin } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

export default function TrackerPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [checkinsByHabit, setCheckinsByHabit] = useState<Map<string, Checkin[]>>(new Map());
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);

    const fetchCheckinsForMonth = useCallback(async (habitId: string) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        const { data } = await supabase
            .from('checkins')
            .select('*')
            .eq('user_id', user.id)
            .eq('habit_id', habitId)
            .gte('date', startStr)
            .lte('date', endStr)
            .order('date', { ascending: true });

        if (data) {
            setCheckinsByHabit(prev => {
                const newMap = new Map(prev);
                newMap.set(habitId, data);
                return newMap;
            });
        }
    }, [currentMonth]);

    useEffect(() => {
        async function fetchHabits() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data } = await supabase
                .from('habits')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (data && data.length > 0) {
                setHabits(data);
                setSelectedHabitId(data[0].id);
            }
            setIsLoading(false);
        }

        fetchHabits();
    }, []);

    useEffect(() => {
        if (selectedHabitId) {
            fetchCheckinsForMonth(selectedHabitId);
        }
    }, [selectedHabitId, fetchCheckinsForMonth]);

    const selectedHabit = habits.find(h => h.id === selectedHabitId);
    const selectedCheckins = selectedHabitId ? checkinsByHabit.get(selectedHabitId) || [] : [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
                <NavBar />
                <main className="max-w-4xl mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
                        <div className="h-64 bg-gray-200 rounded" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <NavBar />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Habit Tracker</h1>

                {habits.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="text-5xl mb-4">📊</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            No habits to track yet
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Create your first habit to start tracking your progress
                        </p>
                        <Link
                            href="/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Create Your First Habit
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <label
                                htmlFor="habit-select"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Select Habit
                            </label>
                            <select
                                id="habit-select"
                                value={selectedHabitId || ''}
                                onChange={(e) => setSelectedHabitId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                            >
                                {habits.map((habit) => (
                                    <option key={habit.id} value={habit.id}>
                                        {habit.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedHabit && (
                            <TrackerGrid
                                habit={selectedHabit}
                                checkins={selectedCheckins}
                                currentMonth={currentMonth}
                                onMonthChange={setCurrentMonth}
                            />
                        )}

                        {selectedHabit && (
                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                    <p className="text-sm text-gray-500 mb-1">Done this month</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {selectedCheckins.filter(c => c.status === 'done').length}
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                    <p className="text-sm text-gray-500 mb-1">Skipped this month</p>
                                    <p className="text-2xl font-bold text-gray-500">
                                        {selectedCheckins.filter(c => c.status === 'skipped').length}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
