import { isWeekend, parseISO } from 'date-fns';
import type { Habit } from '../types';
import { isOnOrAfterHabitCreated } from '@/lib/trackerDates';

export function shouldShowHabitOnDate(habit: Habit, date: Date | string): boolean {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isOnOrAfterHabitCreated(d, habit)) {
        return false;
    }

    if (habit.schedule === 'daily') {
        return true;
    }

    return !isWeekend(d);
}

export function filterHabitsForDate(habits: Habit[], date: Date | string): Habit[] {
    return habits.filter(habit => shouldShowHabitOnDate(habit, date));
}

export function isWeekendDay(date: Date | string): boolean {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isWeekend(d);
}
