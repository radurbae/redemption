'use client';

import { Check } from 'lucide-react';
import type { Loot } from '@/lib/types';
import { getRarityColor } from '@/lib/utils/rewards';

interface ItemCardProps {
    item: Loot;
    isEquipped: boolean;
    onEquip: () => void;
    onClick: () => void;
}

const TYPE_ICONS: Record<string, string> = {
    title: '📜',
    badge: '🛡️',
    theme: '🎨',
    frame: '🖼️',
};

const RARITY_GLOW: Record<string, string> = {
    common: 'rgba(156, 163, 175, 0.2)',
    rare: 'rgba(59, 130, 246, 0.25)',
    epic: 'rgba(168, 85, 247, 0.3)',
    legendary: 'rgba(245, 158, 11, 0.35)',
};

export default function ItemCard({ item, isEquipped, onEquip, onClick }: ItemCardProps) {
    const rarityColor = getRarityColor(item.rarity);

    return (
        <button
            onClick={onClick}
            className="card p-4 text-left w-full transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
            style={{
                borderColor: isEquipped ? 'var(--primary)' : `${rarityColor}30`,
                boxShadow: isEquipped
                    ? `0 0 20px ${RARITY_GLOW[item.rarity]}, 0 0 40px ${RARITY_GLOW[item.rarity]}`
                    : `0 0 15px ${RARITY_GLOW[item.rarity]}`,
            }}
        >
            {/* Badge yang kepake */}
            {isEquipped && (
                <div
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--primary)' }}
                >
                    <Check className="w-3.5 h-3.5 text-white" />
                </div>
            )}

            {/* Overlay glow rarity */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at top left, ${rarityColor}10 0%, transparent 50%)`,
                }}
            />

            {/* Ikon dengan glow */}
            <div className="relative mb-3">
                <span
                    className="text-3xl block"
                    style={{
                        filter: `drop-shadow(0 0 8px ${rarityColor}60)`,
                    }}
                >
                    {TYPE_ICONS[item.type]}
                </span>
            </div>

            {/* Nama */}
            <h4
                className="font-bold text-sm mb-1"
                style={{ color: rarityColor }}
            >
                {item.name}
            </h4>

            {/* Tingkat langka + tipe */}
            <p className="text-xs capitalize mb-3" style={{ color: 'var(--foreground-muted)' }}>
                {item.rarity} {item.type}
            </p>

            {/* Tombol equip */}
            {!isEquipped ? (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEquip();
                    }}
                    className="w-full py-2 text-xs font-semibold rounded-lg transition-colors"
                    style={{
                        background: `${rarityColor}20`,
                        color: rarityColor,
                    }}
                >
                    Equip
                </button>
            ) : (
                <div
                    className="w-full py-2 text-xs font-semibold rounded-lg text-center"
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                    }}
                >
                    Equipped
                </div>
            )}
        </button>
    );
}
