import { subDays, isWeekend } from 'date-fns';
import type { Checkin, Habit } from '../types';
import { formatDate } from './dates';

export function calculateStreak(
    habit: Habit,
    checkins: Checkin[],
    today: Date = new Date()
): number {
    const checkinMap = new Map<string, 'done' | 'skipped'>();
    checkins.forEach(c => {
        checkinMap.set(c.date, c.status);
    });

    let streak = 0;
    let currentDate = today;
    const createdAtStr = habit.created_at
        ? formatDate(new Date(habit.created_at))
        : null;

    for (let i = 0; i < 365; i++) {
        const dateStr = formatDate(currentDate);
        if (createdAtStr && dateStr < createdAtStr) {
            break;
        }
        const status = checkinMap.get(dateStr);

        if (habit.schedule === 'weekdays' && isWeekend(currentDate)) {
            currentDate = subDays(currentDate, 1);
            continue;
        }

        if (status === 'done') {
            streak++;
            currentDate = subDays(currentDate, 1);
        } else {
            break;
        }
    }

    return streak;
}

export function getStreakDateRange(days: number = 60): { start: string; end: string } {
    const today = new Date();
    const startDate = subDays(today, days);

    return {
        start: formatDate(startDate),
        end: formatDate(today),
    };
}

export function shouldShowNeverMissTwiceWarning(
    habit: Habit,
    todayCheckin: Checkin | null,
    yesterdayCheckin: Checkin | null,
    today: Date = new Date()
): boolean {
    if (todayCheckin?.status === 'done') {
        return false;
    }

    const yesterday = subDays(today, 1);
    const createdAtStr = habit.created_at
        ? formatDate(new Date(habit.created_at))
        : null;
    if (createdAtStr && formatDate(yesterday) < createdAtStr) {
        return false;
    }
    if (habit.schedule === 'weekdays' && isWeekend(yesterday)) {
        return false;
    }

    return !yesterdayCheckin || yesterdayCheckin.status === 'skipped';
}
