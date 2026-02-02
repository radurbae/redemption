'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import HabitForm from '@/components/HabitForm';
import BottomSheet from '@/components/BottomSheet';
import { useToast } from '@/components/Toast';
import type { Habit } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { deleteHabit } from '@/lib/actions/habits';

export default function HabitDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [habit, setHabit] = useState<Habit | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteSheet, setShowDeleteSheet] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        async function fetchHabit() {
            const supabase = createClient();
            const { data } = await supabase
                .from('habits')
                .select('*')
                .eq('id', params.id)
                .single();

            if (data) {
                setHabit(data);
            }
            setIsLoading(false);
        }
        fetchHabit();
    }, [params.id]);

    const handleDelete = async () => {
        if (!habit) return;
        setIsDeleting(true);
        await deleteHabit(habit.id);
        showToast('Habit deleted', 'info');
        router.push('/');
    };

    if (isLoading) {
        return (
            <AppShell>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/2" />
                    <div className="card p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                </div>
            </AppShell>
        );
    }

    if (!habit) {
        return (
            <AppShell>
                <div className="card p-8 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        Habit not found
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                        This habit may have been deleted
                    </p>
                    <Link href="/" className="btn-primary inline-block">
                        Go Home
                    </Link>
                </div>
            </AppShell>
        );
    }

    if (isEditing) {
        return <HabitForm habit={habit} mode="edit" />;
    }

    return (
        <AppShell>
            {/* Back button */}
            <Link
                href="/"
                className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm font-medium mb-4"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{habit.title}</h1>
            <p className="text-gray-500 text-sm mb-6">
                {habit.schedule === 'weekdays' ? 'Weekdays only' : 'Every day'}
            </p>

            {/* 4 Laws breakdown */}
            <div className="space-y-4 mb-8">
                <div className="card p-4">
                    <p className="text-sm font-medium text-indigo-600 mb-1">Identity</p>
                    <p className="text-gray-900">I am a person who {habit.identity}</p>
                </div>

                {habit.obvious_cue && (
                    <div className="card p-4">
                        <p className="text-sm font-medium text-indigo-600 mb-1">Make it Obvious</p>
                        <p className="text-gray-900">{habit.obvious_cue}</p>
                    </div>
                )}

                {habit.attractive_bundle && (
                    <div className="card p-4">
                        <p className="text-sm font-medium text-indigo-600 mb-1">Make it Attractive</p>
                        <p className="text-gray-900">{habit.attractive_bundle}</p>
                    </div>
                )}

                <div className="card p-4">
                    <p className="text-sm font-medium text-indigo-600 mb-1">Make it Easy</p>
                    <p className="text-gray-900">{habit.easy_step}</p>
                </div>

                {habit.satisfying_reward && (
                    <div className="card p-4">
                        <p className="text-sm font-medium text-indigo-600 mb-1">Make it Satisfying</p>
                        <p className="text-gray-900">{habit.satisfying_reward}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors btn-press"
                >
                    Edit Habit
                </button>
                <button
                    onClick={() => setShowDeleteSheet(true)}
                    className="w-full py-3.5 text-red-600 font-medium"
                >
                    Delete Habit
                </button>
            </div>

            {/* Delete confirmation */}
            <BottomSheet
                isOpen={showDeleteSheet}
                onClose={() => setShowDeleteSheet(false)}
                title="Delete Habit?"
            >
                <p className="text-gray-600 mb-6">
                    This will permanently delete &ldquo;{habit.title}&rdquo; and all its check-in history. This action cannot be undone.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 btn-press"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                        onClick={() => setShowDeleteSheet(false)}
                        className="w-full py-4 text-gray-600 font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </BottomSheet>
        </AppShell>
    );
}
