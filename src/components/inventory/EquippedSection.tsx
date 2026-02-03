'use client';

import type { PlayerProfile } from '@/lib/types';

interface EquippedSectionProps {
    profile: PlayerProfile | null;
}

export default function EquippedSection({ profile }: EquippedSectionProps) {
    if (!profile) return null;

    const equipped = [
        { type: 'Title', value: profile.equipped_title, icon: '📜' },
        { type: 'Badge', value: profile.equipped_badge, icon: '🛡️' },
        { type: 'Theme', value: profile.equipped_theme, icon: '🎨' },
    ].filter(e => e.value);

    if (equipped.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--foreground-muted)' }}>
                ⚔️ Equipped
            </h3>
            <div className="flex flex-wrap gap-2">
                {equipped.map((item) => (
                    <div
                        key={item.type}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{
                            background: 'var(--background-secondary)',
                            border: '1px solid var(--border-color)',
                        }}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                                {item.type}
                            </p>
                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                {item.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
