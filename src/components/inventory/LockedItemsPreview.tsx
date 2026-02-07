'use client';

import { Lock } from 'lucide-react';
import type { LootRarity } from '@/lib/types';

interface LockedItem {
    id: string;
    name: string;
    type: 'title' | 'badge' | 'theme';
    rarity: LootRarity;
    unlockCondition: string;
}

interface LockedItemsPreviewProps {
    items: LockedItem[];
}

const RARITY_COLORS: Record<LootRarity, string> = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
};

const TYPE_ICONS: Record<string, string> = {
    title: '📜',
    badge: '🛡️',
    theme: '🎨',
    frame: '🖼️',
};

export default function LockedItemsPreview({ items }: LockedItemsPreviewProps) {
    if (items.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--foreground-muted)' }}>
                🔒 Locked Items
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="card p-4 opacity-50 relative"
                        style={{ borderColor: `${RARITY_COLORS[item.rarity]}20` }}
                    >
                        {/* Ikon kunci */}
                        <div
                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: 'var(--background-secondary)' }}
                        >
                            <Lock className="w-3 h-3" style={{ color: 'var(--foreground-muted)' }} />
                        </div>

                        {/* Ikon */}
                        <span className="text-2xl mb-2 block opacity-50">
                            {TYPE_ICONS[item.type]}
                        </span>

                        {/* Nama */}
                        <h4
                            className="font-semibold text-sm mb-1"
                            style={{ color: RARITY_COLORS[item.rarity] }}
                        >
                            {item.name}
                        </h4>

                        {/* Syarat buka */}
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                            {item.unlockCondition}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export const DEFAULT_LOCKED_ITEMS: LockedItem[] = [
    {
        id: 'locked_1',
        name: 'Shadow Walker',
        type: 'title',
        rarity: 'epic',
        unlockCondition: 'Reach Rank A',
    },
    {
        id: 'locked_2',
        name: 'Nightmare Mode',
        type: 'theme',
        rarity: 'legendary',
        unlockCondition: 'Complete 100 quests',
    },
    {
        id: 'locked_3',
        name: 'Perfectionist',
        type: 'badge',
        rarity: 'rare',
        unlockCondition: '7-day streak',
    },
];
