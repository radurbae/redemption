'use client';

import { useState, useTransition } from 'react';
import { setCheckin, clearCheckin } from '@/lib/actions/checkins';

interface CheckinButtonsProps {
    habitId: string;
    date: string;
    currentStatus: 'done' | 'skipped' | null;
}

export default function CheckinButtons({
    habitId,
    date,
    currentStatus,
}: CheckinButtonsProps) {
    const [isPending, startTransition] = useTransition();
    const [optimisticStatus, setOptimisticStatus] = useState(currentStatus);

    const handleDone = () => {
        setOptimisticStatus('done');
        startTransition(async () => {
            try {
                await setCheckin(habitId, date, 'done');
            } catch (error) {
                setOptimisticStatus(currentStatus);
                console.error('Failed to set checkin:', error);
            }
        });
    };

    const handleSkip = () => {
        setOptimisticStatus('skipped');
        startTransition(async () => {
            try {
                await setCheckin(habitId, date, 'skipped');
            } catch (error) {
                setOptimisticStatus(currentStatus);
                console.error('Failed to set checkin:', error);
            }
        });
    };

    const handleUndo = () => {
        setOptimisticStatus(null);
        startTransition(async () => {
            try {
                await clearCheckin(habitId, date);
            } catch (error) {
                setOptimisticStatus(currentStatus);
                console.error('Failed to clear checkin:', error);
            }
        });
    };

    return (
        <div className="flex gap-2">
            {optimisticStatus === null && (
                <>
                    <button
                        onClick={handleDone}
                        disabled={isPending}
                        className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors text-sm font-medium"
                        aria-label="Mark as done"
                    >
                        Done
                    </button>
                    <button
                        onClick={handleSkip}
                        disabled={isPending}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 transition-colors text-sm font-medium"
                        aria-label="Skip for today"
                    >
                        Skip
                    </button>
                </>
            )}

            {optimisticStatus === 'done' && (
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        Completed!
                    </span>
                    <button
                        onClick={handleUndo}
                        disabled={isPending}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 transition-colors text-sm"
                        aria-label="Undo check-in"
                    >
                        Undo
                    </button>
                </div>
            )}

            {optimisticStatus === 'skipped' && (
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                        Skipped
                    </span>
                    <button
                        onClick={handleUndo}
                        disabled={isPending}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 transition-colors text-sm"
                        aria-label="Undo skip"
                    >
                        Undo
                    </button>
                </div>
            )}
        </div>
    );
}
