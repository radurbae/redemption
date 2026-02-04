import { isWeekend, parseISO } from 'date-fns';
import type { Habit } from '../types';
import { isOnOrAfterHabitCreated } from '@/lib/trackerDates';

/**
 * Check if a habit should be shown on a given date based on its schedule
 */
export function shouldShowHabitOnDate(habit: Habit, date: Date | string): boolean {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isOnOrAfterHabitCreated(d, habit)) {
        return false;
    }

    if (habit.schedule === 'daily') {
        return true;
    }

    // weekdays: Monday to Friday (not weekend)
    return !isWeekend(d);
}

/**
 * Filter habits that should be shown today based on their schedule
 */
export function filterHabitsForDate(habits: Habit[], date: Date | string): Habit[] {
    return habits.filter(habit => shouldShowHabitOnDate(habit, date));
}

/**
 * Check if a date is a weekend day
 */
export function isWeekendDay(date: Date | string): boolean {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isWeekend(d);
}
