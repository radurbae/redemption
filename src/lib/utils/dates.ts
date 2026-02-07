import { format, parseISO, isToday, isYesterday, startOfDay, isSameDay } from 'date-fns';

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date | string): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'MMM d, yyyy');
}

export function formatMonthYear(date: Date): string {
    return format(date, 'MMMM yyyy');
}

export function getToday(): Date {
    return startOfDay(new Date());
}

export function getTodayString(): string {
    return formatDate(new Date());
}

export function getYesterdayString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDate(yesterday);
}

export const getYesterdayDate = getYesterdayString;

export function checkIsToday(date: Date | string): boolean {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isToday(d);
}

export function checkIsYesterday(date: Date | string): boolean {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isYesterday(d);
}

export function checkIsSameDay(date1: Date | string, date2: Date | string): boolean {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return isSameDay(d1, d2);
}

export function getDaysInRange(startDate: Date, endDate: Date): Date[] {
    const days: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return days;
}
