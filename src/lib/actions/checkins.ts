'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import type { Checkin } from '../types';
import { getStreakDateRange } from '../utils/streak';

export async function setCheckin(
    habitId: string,
    date: string,
    status: 'done' | 'skipped'
) {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error('Not authenticated');
    }

    // Upsert the checkin
    const { error } = await supabase
        .from('checkins')
        .upsert(
            {
                user_id: user.id,
                habit_id: habitId,
                date: date,
                status: status,
            },
            {
                onConflict: 'user_id,habit_id,date',
            }
        );

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/');
    revalidatePath('/tracker');
}

export async function clearCheckin(habitId: string, date: string) {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error('Not authenticated');
    }

    const { error } = await supabase
        .from('checkins')
        .delete()
        .eq('user_id', user.id)
        .eq('habit_id', habitId)
        .eq('date', date);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/');
    revalidatePath('/tracker');
}

export async function getCheckinsForHabit(habitId: string): Promise<Checkin[]> {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return [];
    }

    const { start, end } = getStreakDateRange(60);

    const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('habit_id', habitId)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching checkins:', error);
        return [];
    }

    return data;
}

export async function getCheckinsForMonth(
    habitId: string,
    year: number,
    month: number
): Promise<Checkin[]> {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return [];
    }

    // Get first and last day of month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('habit_id', habitId)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: true });

    if (error) {
        console.error('Error fetching checkins:', error);
        return [];
    }

    return data;
}

export async function getTodayAndYesterdayCheckins(
    habitIds: string[],
    today: string,
    yesterday: string
): Promise<Map<string, { today: Checkin | null; yesterday: Checkin | null }>> {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user || habitIds.length === 0) {
        return new Map();
    }

    const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .in('habit_id', habitIds)
        .in('date', [today, yesterday]);

    if (error) {
        console.error('Error fetching checkins:', error);
        return new Map();
    }

    const result = new Map<string, { today: Checkin | null; yesterday: Checkin | null }>();

    habitIds.forEach(id => {
        result.set(id, { today: null, yesterday: null });
    });

    data.forEach(checkin => {
        const existing = result.get(checkin.habit_id)!;
        if (checkin.date === today) {
            existing.today = checkin;
        } else if (checkin.date === yesterday) {
            existing.yesterday = checkin;
        }
    });

    return result;
}

export async function getAllCheckinsForStreak(
    habitIds: string[]
): Promise<Map<string, Checkin[]>> {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user || habitIds.length === 0) {
        return new Map();
    }

    const { start, end } = getStreakDateRange(60);

    const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .in('habit_id', habitIds)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching checkins:', error);
        return new Map();
    }

    const result = new Map<string, Checkin[]>();

    habitIds.forEach(id => {
        result.set(id, []);
    });

    data.forEach(checkin => {
        const existing = result.get(checkin.habit_id)!;
        existing.push(checkin);
    });

    return result;
}
