'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import BottomSheet from '@/components/BottomSheet';
import { TrackerGridSkeleton, StatsSkeleton } from '@/components/Skeletons';
import { useToast } from '@/components/Toast';
import type { Habit, Checkin } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { setCheckin, clearCheckin } from '@/lib/actions/checkins';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    getDay,
    addMonths,
    subMonths,
    isFuture,
    isToday as isDateToday
} from 'date-fns';

export default function TrackerPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const { showToast } = useToast();

    const fetchCheckins = useCallback(async (habitId: string) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

        const { data } = await supabase
            .from('checkins')
            .select('*')
            .eq('user_id', user.id)
            .eq('habit_id', habitId)
            .gte('date', start)
            .lte('date', end);

        if (data) setCheckins(data);
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
            fetchCheckins(selectedHabitId);
        }
    }, [selectedHabitId, fetchCheckins]);

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const startDay = getDay(startOfMonth(currentMonth));
    const emptyDays = Array(startDay).fill(null);

    const getStatusForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return checkins.find(c => c.date === dateStr)?.status || null;
    };

    const handleDayClick = (date: Date) => {
        if (isFuture(date)) return;
        setSelectedDate(format(date, 'yyyy-MM-dd'));
    };

    const handleSetStatus = async (status: 'done' | 'skipped') => {
        if (!selectedHabitId || !selectedDate) return;
        setIsPending(true);
        await setCheckin(selectedHabitId, selectedDate, status);
        await fetchCheckins(selectedHabitId);
        setIsPending(false);
        setSelectedDate(null);
        showToast(status === 'done' ? 'Marked as done!' : 'Marked as skipped');
    };

    const handleClear = async () => {
        if (!selectedHabitId || !selectedDate) return;
        setIsPending(true);
        await clearCheckin(selectedHabitId, selectedDate);
        await fetchCheckins(selectedHabitId);
        setIsPending(false);
        setSelectedDate(null);
    };

    const selectedDateStatus = selectedDate
        ? checkins.find(c => c.date === selectedDate)?.status || null
        : null;

    const doneCount = checkins.filter(c => c.status === 'done').length;
    const skippedCount = checkins.filter(c => c.status === 'skipped').length;

    return (
        <AppShell>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Tracker</h1>

            {isLoading ? (
                <>
                    <div className="card p-4 mb-6">
                        <div className="skeleton h-10 w-full rounded-xl" />
                    </div>
                    <TrackerGridSkeleton />
                    <div className="mt-6">
                        <StatsSkeleton />
                    </div>
                </>
            ) : habits.length === 0 ? (
                <div className="card p-8 text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        No habits to track
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Create your first habit to see your progress
                    </p>
                    <Link href="/new" className="btn-primary inline-block">
                        Create Habit
                    </Link>
                </div>
            ) : (
                <>
                    {/* Habit selector */}
                    <div className="card p-4 mb-6">
                        <select
                            value={selectedHabitId || ''}
                            onChange={(e) => setSelectedHabitId(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500"
                        >
                            {habits.map((habit) => (
                                <option key={habit.id} value={habit.id}>
                                    {habit.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Calendar */}
                    <div className="card p-4 mb-6">
                        {/* Month navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Previous month"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="font-semibold text-gray-900">
                                {format(currentMonth, 'MMMM yyyy')}
                            </h2>
                            <button
                                onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                                className="p-2 -mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Next month"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {emptyDays.map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square" />
                            ))}
                            {days.map((date) => {
                                const status = getStatusForDate(date);
                                const isToday = isDateToday(date);
                                const future = isFuture(date);

                                return (
                                    <button
                                        key={date.toISOString()}
                                        onClick={() => handleDayClick(date)}
                                        disabled={future}
                                        className={`
                      aspect-square rounded-lg text-sm font-medium transition-all
                      flex items-center justify-center min-h-[32px]
                      ${future ? 'text-gray-300 cursor-not-allowed' : 'hover:ring-2 hover:ring-indigo-200'}
                      ${isToday ? 'ring-2 ring-indigo-500' : ''}
                      ${status === 'done' ? 'bg-green-500 text-white' : ''}
                      ${status === 'skipped' ? 'bg-gray-300 text-white' : ''}
                      ${!status && !future ? 'bg-gray-50 text-gray-700' : ''}
                    `}
                                        aria-label={`${format(date, 'MMMM d')}, ${status || 'not tracked'}`}
                                    >
                                        {format(date, 'd')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="card p-4">
                            <p className="text-sm text-gray-500 mb-1">Done</p>
                            <p className="text-2xl font-bold text-green-600">{doneCount}</p>
                        </div>
                        <div className="card p-4">
                            <p className="text-sm text-gray-500 mb-1">Skipped</p>
                            <p className="text-2xl font-bold text-gray-500">{skippedCount}</p>
                        </div>
                    </div>
                </>
            )}

            {/* Bottom sheet for day editing */}
            <BottomSheet
                isOpen={!!selectedDate}
                onClose={() => setSelectedDate(null)}
                title={selectedDate ? format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d') : ''}
            >
                <div className="space-y-3">
                    <button
                        onClick={() => handleSetStatus('done')}
                        disabled={isPending}
                        className={`w-full py-4 rounded-xl font-semibold transition-all btn-press ${selectedDateStatus === 'done'
                                ? 'bg-green-500 text-white'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                    >
                        Done
                    </button>
                    <button
                        onClick={() => handleSetStatus('skipped')}
                        disabled={isPending}
                        className={`w-full py-4 rounded-xl font-semibold transition-all btn-press ${selectedDateStatus === 'skipped'
                                ? 'bg-gray-400 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Skipped
                    </button>
                    {selectedDateStatus && (
                        <button
                            onClick={handleClear}
                            disabled={isPending}
                            className="w-full py-4 text-gray-500 font-medium"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </BottomSheet>
        </AppShell>
    );
}
