'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../supabase/server';
import type { HabitFormData } from '../types';

export async function createHabit(formData: HabitFormData) {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error('Not authenticated');
    }

    const { error } = await supabase.from('habits').insert({
        user_id: user.id,
        title: formData.title,
        identity: formData.identity,
        obvious_cue: formData.obvious_cue || null,
        attractive_bundle: formData.attractive_bundle || null,
        easy_step: formData.easy_step,
        satisfying_reward: formData.satisfying_reward || null,
        schedule: formData.schedule,
    });

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/');
    redirect('/');
}

export async function updateHabit(habitId: string, formData: HabitFormData) {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error('Not authenticated');
    }

    const { error } = await supabase
        .from('habits')
        .update({
            title: formData.title,
            identity: formData.identity,
            obvious_cue: formData.obvious_cue || null,
            attractive_bundle: formData.attractive_bundle || null,
            easy_step: formData.easy_step,
            satisfying_reward: formData.satisfying_reward || null,
            schedule: formData.schedule,
        })
        .eq('id', habitId)
        .eq('user_id', user.id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/');
    revalidatePath(`/habits/${habitId}`);
    redirect(`/habits/${habitId}`);
}

export async function deleteHabit(habitId: string) {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error('Not authenticated');
    }

    const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', user.id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/');
    redirect('/');
}

export async function getHabits() {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return [];
    }

    const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching habits:', error);
        return [];
    }

    return data;
}

export async function getHabit(habitId: string) {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return null;
    }

    const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching habit:', error);
        return null;
    }

    return data;
}
