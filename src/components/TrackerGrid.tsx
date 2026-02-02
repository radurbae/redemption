'use client';

import { useState, useTransition } from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isToday,
    addMonths,
    subMonths,
    isWeekend,
} from 'date-fns';
import type { Checkin, Habit } from '@/lib/types';
import { setCheckin, clearCheckin } from '@/lib/actions/checkins';
import Modal from './Modal';

interface TrackerGridProps {
    habit: Habit;
    checkins: Checkin[];
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
}

export default function TrackerGrid({
    habit,
    checkins,
    currentMonth,
    onMonthChange,
}: TrackerGridProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isPending, startTransition] = useTransition();

    // Create checkin map for quick lookup
    const checkinMap = new Map<string, 'done' | 'skipped'>();
    checkins.forEach((c) => {
        checkinMap.set(c.date, c.status);
    });

    // Get all days to display (including padding from prev/next months)
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDateStatus = (date: Date): 'done' | 'skipped' | null => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return checkinMap.get(dateStr) || null;
    };

    const handleDayClick = (date: Date) => {
        if (!isSameMonth(date, currentMonth)) return;
        // For weekday habits, don't allow clicking on weekends
        if (habit.schedule === 'weekdays' && isWeekend(date)) return;
        setSelectedDate(date);
    };

    const handleSetStatus = (status: 'done' | 'skipped') => {
        if (!selectedDate) return;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        startTransition(async () => {
            try {
                await setCheckin(habit.id, dateStr, status);
                setSelectedDate(null);
            } catch (error) {
                console.error('Failed to set checkin:', error);
            }
        });
    };

    const handleClear = () => {
        if (!selectedDate) return;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        startTransition(async () => {
            try {
                await clearCheckin(habit.id, dateStr);
                setSelectedDate(null);
            } catch (error) {
                console.error('Failed to clear checkin:', error);
            }
        });
    };

    const selectedDateStatus = selectedDate ? getDateStatus(selectedDate) : null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => onMonthChange(subMonths(currentMonth, 1))}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="Previous month"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <h3 className="text-lg font-semibold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>

                <button
                    onClick={() => onMonthChange(addMonths(currentMonth, 1))}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="Next month"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-500 py-1"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                    const status = getDateStatus(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isTodayDate = isToday(day);
                    const isWeekendDay = isWeekend(day);
                    const isDisabled = !isCurrentMonth || (habit.schedule === 'weekdays' && isWeekendDay);

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => handleDayClick(day)}
                            disabled={isDisabled}
                            className={`
                aspect-square rounded-md text-xs font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
                ${!isCurrentMonth ? 'text-gray-300 cursor-default' : ''}
                ${isCurrentMonth && !status && !isDisabled ? 'text-gray-700 hover:bg-gray-100' : ''}
                ${status === 'done' ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                ${status === 'skipped' ? 'bg-gray-300 text-gray-600 hover:bg-gray-400' : ''}
                ${isTodayDate && !status ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                ${isDisabled && isCurrentMonth ? 'text-gray-300 cursor-default' : ''}
              `}
                            aria-label={`${format(day, 'MMMM d, yyyy')}${status ? `, ${status}` : ''}`}
                        >
                            {format(day, 'd')}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-xs text-gray-600">Done</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gray-300" />
                    <span className="text-xs text-gray-600">Skipped</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded border-2 border-indigo-500" />
                    <span className="text-xs text-gray-600">Today</span>
                </div>
            </div>

            {/* Edit modal */}
            <Modal
                isOpen={selectedDate !== null}
                onClose={() => setSelectedDate(null)}
                title={selectedDate ? format(selectedDate, 'EEEE, MMMM d') : ''}
            >
                <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">
                        Set status for <strong>{habit.title}</strong>
                    </p>

                    <button
                        onClick={() => handleSetStatus('done')}
                        disabled={isPending}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${selectedDateStatus === 'done'
                            ? 'bg-green-500 text-white'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                            } disabled:opacity-50`}
                    >
                        Done
                    </button>

                    <button
                        onClick={() => handleSetStatus('skipped')}
                        disabled={isPending}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${selectedDateStatus === 'skipped'
                            ? 'bg-gray-400 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } disabled:opacity-50`}
                    >
                        Skipped
                    </button>

                    {selectedDateStatus && (
                        <button
                            onClick={handleClear}
                            disabled={isPending}
                            className="w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Clear Status
                        </button>
                    )}
                </div>
            </Modal>
        </div>
    );
}
