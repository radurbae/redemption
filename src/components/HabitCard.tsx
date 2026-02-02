import Link from 'next/link';
import type { Habit, Checkin } from '@/lib/types';
import { shouldShowNeverMissTwiceWarning } from '@/lib/utils/streak';
import CheckinButtons from './CheckinButtons';

interface HabitCardProps {
    habit: Habit;
    todayDate: string;
    todayCheckin: Checkin | null;
    yesterdayCheckin: Checkin | null;
    streak: number;
}

export default function HabitCard({
    habit,
    todayDate,
    todayCheckin,
    yesterdayCheckin,
    streak,
}: HabitCardProps) {
    const showWarning = shouldShowNeverMissTwiceWarning(
        habit,
        todayCheckin,
        yesterdayCheckin
    );

    return (
        <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            {/* Never miss twice warning */}
            {showWarning && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <span className="text-amber-500" aria-hidden="true">⚠️</span>
                    <p className="text-sm text-amber-700">
                        <strong>Never miss twice!</strong> You missed yesterday. Get back on track today.
                    </p>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <Link
                        href={`/habits/${habit.id}`}
                        className="group"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                            {habit.title}
                        </h3>
                    </Link>
                    <p className="text-sm text-indigo-600 font-medium mt-0.5">
                        &ldquo;{habit.identity}&rdquo;
                    </p>
                </div>

                {/* Streak badge */}
                {streak > 0 && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium shrink-0">
                        <span aria-hidden="true">🔥</span>
                        <span>{streak} day{streak !== 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {/* Environment cue - prominent display */}
            {habit.obvious_cue && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
                        📍 Environment Cue
                    </p>
                    <p className="text-sm text-blue-800">{habit.obvious_cue}</p>
                </div>
            )}

            {/* 2-minute step */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                    ⏱️ 2-Minute Step
                </p>
                <p className="text-sm text-gray-700 font-medium">{habit.easy_step}</p>
            </div>

            {/* Check-in buttons */}
            <CheckinButtons
                habitId={habit.id}
                date={todayDate}
                currentStatus={todayCheckin?.status || null}
            />

            {/* Schedule indicator */}
            <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                    {habit.schedule === 'daily' ? '📅 Every day' : '📆 Weekdays only'}
                </span>
            </div>
        </article>
    );
}
