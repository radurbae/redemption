'use client';

import Link from 'next/link';
import type { Habit, Checkin } from '@/lib/types';
import CheckinButtons from './CheckinButtons';

interface HabitCardProps {
    habit: Habit;
    checkin: Checkin | null;
    streak: number;
    showNeverMissTwice: boolean;
    today: string;
}

export default function HabitCard({
    habit,
    checkin,
    streak,
    showNeverMissTwice,
    today
}: HabitCardProps) {
    return (
        <div className="card overflow-hidden">
            {/* Banner peringatan */}
            {showNeverMissTwice && !checkin && (
                <div className="bg-amber-50 border-b border-amber-100 px-4 py-2">
                    <p className="text-amber-700 text-sm font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>Never miss twice! You missed yesterday.</span>
                    </p>
                </div>
            )}

            <div className="p-4">
                {/* Bagian atas */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <Link
                            href={`/habits/${habit.id}`}
                            className="block group"
                        >
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                                {habit.title}
                            </h3>
                        </Link>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {habit.schedule === 'weekdays' ? 'Weekdays only' : 'Every day'}
                        </p>
                    </div>

                    {/* Badge streak */}
                    {streak > 0 && (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-sm font-medium">
                            <span>🔥</span>
                            <span>{streak}</span>
                        </div>
                    )}
                </div>

                {/* Pengingat langkah gampang */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    <span className="text-gray-400">Start with: </span>
                    {habit.easy_step}
                </p>

                {/* Aksi */}
                <div className="flex items-center gap-2">
                    <CheckinButtons
                        habitId={habit.id}
                        currentStatus={checkin?.status || null}
                        date={today}
                    />
                </div>
            </div>
        </div>
    );
}
