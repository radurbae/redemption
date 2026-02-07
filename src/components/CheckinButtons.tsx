'use client';

import { useState, useTransition } from 'react';
import { setCheckin, clearCheckin } from '@/lib/actions/checkins';
import { useToast } from './Toast';

interface CheckinButtonsProps {
    habitId: string;
    currentStatus: 'done' | 'skipped' | null;
    date: string;
}

export default function CheckinButtons({
    habitId,
    currentStatus,
    date
}: CheckinButtonsProps) {
    const [isPending, startTransition] = useTransition();
    const [optimisticStatus, setOptimisticStatus] = useState(currentStatus);
    const { showToast } = useToast();

    const handleDone = () => {
        setOptimisticStatus('done');
        startTransition(async () => {
            await setCheckin(habitId, date, 'done');
            showToast('Marked as done!', 'success');
        });
    };

    const handleSkip = () => {
        setOptimisticStatus('skipped');
        startTransition(async () => {
            await setCheckin(habitId, date, 'skipped');
        });
    };

    const handleUndo = () => {
        setOptimisticStatus(null);
        startTransition(async () => {
            await clearCheckin(habitId, date);
        });
    };

    if (!optimisticStatus) {
        return (
            <div className="flex items-center gap-2 w-full">
                <button
                    onClick={handleDone}
                    disabled={isPending}
                    className="btn-success flex-1"
                    aria-label="Mark as done"
                >
                    Done
                </button>
                <button
                    onClick={handleSkip}
                    disabled={isPending}
                    className="btn-skip"
                    aria-label="Skip for today"
                >
                    Skip
                </button>
            </div>
        );
    }

    if (optimisticStatus === 'done') {
        return (
            <div className="flex items-center gap-2 w-full">
                <span className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Done!
                </span>
                <button
                    onClick={handleUndo}
                    disabled={isPending}
                    className="px-4 py-3 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                    Undo
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 w-full">
            <span className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium">
                Skipped
            </span>
            <button
                onClick={handleUndo}
                disabled={isPending}
                className="px-4 py-3 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
                Undo
            </button>
        </div>
    );
}
