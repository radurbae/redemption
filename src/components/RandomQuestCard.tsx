'use client';

import { Check, Sparkles } from 'lucide-react';
import type { DailyQuest, QuestCategory } from '@/lib/types';
import { QUEST_CATEGORY_ICONS, QUEST_CATEGORY_COLORS } from '@/lib/types';

interface RandomQuestCardProps {
    dailyQuest: DailyQuest;
    onComplete: () => void;
    isLoading?: boolean;
}

const DIFFICULTY_STYLES = {
    easy: { label: 'Easy', color: '#22c55e' },
    normal: { label: 'Normal', color: '#f59e0b' },
    hard: { label: 'Hard', color: '#ef4444' },
};

export default function RandomQuestCard({ dailyQuest, onComplete, isLoading }: RandomQuestCardProps) {
    const quest = dailyQuest.quest;
    if (!quest) return null;

    const categoryIcon = QUEST_CATEGORY_ICONS[quest.category as QuestCategory] || '📋';
    const categoryColor = QUEST_CATEGORY_COLORS[quest.category as QuestCategory] || '#6b7280';
    const difficultyStyle = DIFFICULTY_STYLES[quest.difficulty] || DIFFICULTY_STYLES.normal;

    return (
        <div
            className={`card p-4 transition-all ${dailyQuest.completed ? 'opacity-60' : ''}`}
            style={{
                borderColor: dailyQuest.completed ? 'var(--success)' : `${categoryColor}30`,
                borderWidth: '1px',
            }}
        >
            {/* Bagian atas */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{categoryIcon}</span>
                    <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                        style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                    >
                        {quest.category}
                    </span>
                    <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${difficultyStyle.color}20`, color: difficultyStyle.color }}
                    >
                        {difficultyStyle.label}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-indigo-400">+{quest.xp_reward} XP</span>
                    <span className="text-yellow-500">+{quest.gold_reward} 🪙</span>
                </div>
            </div>

            {/* Judul & deskripsi quest */}
            <h3
                className={`font-semibold text-base mb-1 ${dailyQuest.completed ? 'line-through' : ''}`}
                style={{ color: dailyQuest.completed ? 'var(--foreground-muted)' : 'var(--foreground)' }}
            >
                {quest.title}
            </h3>
            {quest.description && (
                <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
                    {quest.description}
                </p>
            )}

            {/* Tombol aksi */}
            {dailyQuest.completed ? (
                <div className="flex items-center gap-2 text-green-500 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Completed</span>
                </div>
            ) : (
                <button
                    onClick={onComplete}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 btn-press"
                >
                    {isLoading ? (
                        <span className="animate-pulse">Completing...</span>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            Complete Quest
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
