'use client';

import { Gift, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface LootProgressCardProps {
    questsCompleted: number;
    questsForNextLoot: number;
    level: number;
}

export default function LootProgressCard({
    questsCompleted,
    questsForNextLoot,
    level,
}: LootProgressCardProps) {
    const progress = Math.min(100, Math.round((questsCompleted / questsForNextLoot) * 100));
    const remaining = Math.max(0, questsForNextLoot - questsCompleted);
    const isReady = remaining === 0;

    return (
        <div
            className="card p-5 mb-6 relative overflow-hidden"
            style={{
                background: isReady
                    ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 146, 60, 0.1))'
                    : 'linear-gradient(135deg, var(--background-secondary), var(--card-bg))',
                boxShadow: isReady ? '0 0 30px rgba(251, 191, 36, 0.2)' : undefined,
                borderColor: isReady ? 'rgba(251, 191, 36, 0.3)' : undefined,
            }}
        >
            {/* Glow overlay when ready */}
            {isReady && (
                <div
                    className="absolute inset-0 pointer-events-none animate-pulse"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.1) 0%, transparent 60%)',
                    }}
                />
            )}

            <div className="flex items-start gap-4 relative">
                {/* Icon */}
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                        background: isReady
                            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                            : 'linear-gradient(135deg, var(--primary), #a855f7)',
                        boxShadow: isReady
                            ? '0 0 20px rgba(251, 191, 36, 0.4)'
                            : '0 0 15px rgba(129, 140, 248, 0.3)',
                    }}
                >
                    {isReady ? (
                        <Star className="w-7 h-7 text-white animate-pulse" />
                    ) : (
                        <Gift className="w-7 h-7 text-white" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold" style={{ color: 'var(--foreground)' }}>
                            {isReady ? '🎉 Loot Ready!' : 'Next Loot Drop'}
                        </h3>
                        <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                                background: 'var(--background-secondary)',
                                color: 'var(--foreground-muted)',
                            }}
                        >
                            Lv.{level}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                        className="h-3 rounded-full overflow-hidden mb-2"
                        style={{ background: 'rgba(0, 0, 0, 0.3)' }}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                                background: isReady
                                    ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                                    : 'linear-gradient(90deg, var(--primary), #a855f7)',
                                boxShadow: isReady
                                    ? '0 0 10px rgba(251, 191, 36, 0.5)'
                                    : '0 0 8px rgba(129, 140, 248, 0.4)',
                            }}
                        />
                    </div>

                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                        {isReady ? (
                            'Complete your next quest to claim!'
                        ) : (
                            <>{remaining} quest{remaining !== 1 ? 's' : ''} until next drop</>
                        )}
                    </p>
                </div>
            </div>

            {/* CTA */}
            {isReady && (
                <Link
                    href="/quests"
                    className="mt-4 w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    style={{
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        color: '#1a1a1a',
                    }}
                >
                    Claim Loot <ChevronRight className="w-4 h-4" />
                </Link>
            )}
        </div>
    );
}
