'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sword, ChevronRight } from 'lucide-react';
import AppShell from '@/components/AppShell';
import BottomSheet from '@/components/BottomSheet';
import LootProgressCard from '@/components/inventory/LootProgressCard';
import LockedItemsPreview, { DEFAULT_LOCKED_ITEMS } from '@/components/inventory/LockedItemsPreview';
import ItemCard from '@/components/inventory/ItemCard';
import EquippedSection from '@/components/inventory/EquippedSection';
import type { Loot, LootType, PlayerProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { getRarityColor } from '@/lib/utils/rewards';

export default function InventoryPage() {
    const [loot, setLoot] = useState<Loot[]>([]);
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [filter, setFilter] = useState<LootType | 'all'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<Loot | null>(null);
    const [questsCompleted, setQuestsCompleted] = useState(0);

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const [{ data: lootData }, { data: profileData }, { count: questCount }] = await Promise.all([
            supabase.from('loot').select('*').eq('user_id', user.id).order('unlocked_at', { ascending: false }),
            supabase.from('player_profile').select('*').eq('user_id', user.id).single(),
            supabase.from('daily_quests').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true),
        ]);

        setLoot(lootData || []);
        setProfile(profileData);
        setQuestsCompleted(questCount || 0);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEquip = async (item: Loot) => {
        if (!profile) return;

        const supabase = createClient();
        const field = item.type === 'title' ? 'equipped_title' :
            item.type === 'badge' ? 'equipped_badge' : 'equipped_theme';

        const { error } = await supabase
            .from('player_profile')
            .update({ [field]: item.name })
            .eq('user_id', profile.user_id);

        if (!error) {
            setProfile({ ...profile, [field]: item.name });
            setSelectedItem(null);
        }
    };

    const handleUnequip = async (type: 'title' | 'badge' | 'theme') => {
        if (!profile) return;

        const supabase = createClient();
        const field = type === 'title' ? 'equipped_title' :
            type === 'badge' ? 'equipped_badge' : 'equipped_theme';

        const { error } = await supabase
            .from('player_profile')
            .update({ [field]: null })
            .eq('user_id', profile.user_id);

        if (!error) {
            setProfile({ ...profile, [field]: null });
            setSelectedItem(null);
        }
    };

    const filteredLoot = filter === 'all'
        ? loot
        : loot.filter(l => l.type === filter);

    const filterButtons: { value: LootType | 'all'; label: string; icon: string }[] = [
        { value: 'all', label: 'All', icon: '📦' },
        { value: 'title', label: 'Titles', icon: '📜' },
        { value: 'badge', label: 'Badges', icon: '🛡️' },
        { value: 'theme', label: 'Themes', icon: '🎨' },
    ];

    // Calculate loot progress (every 10 quests)
    const questsForNextLoot = 10;
    const questsTowardNext = questsCompleted % questsForNextLoot;

    if (isLoading) {
        return (
            <AppShell>
                <div className="max-w-md md:max-w-4xl mx-auto">
                    <div className="skeleton h-8 w-32 mb-6" />
                    <div className="skeleton h-32 w-full mb-6" />
                    <div className="skeleton h-10 w-full mb-4" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-40" />)}
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="max-w-md md:max-w-4xl mx-auto">
                {/* Header */}
                <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                    Inventory
                </h1>

                {/* Loot Progress */}
                <LootProgressCard
                    questsCompleted={questsTowardNext}
                    questsForNextLoot={questsForNextLoot}
                    level={profile?.level || 1}
                />

                {/* Equipped Section */}
                <EquippedSection profile={profile} />

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {filterButtons.map(btn => (
                        <button
                            key={btn.value}
                            onClick={() => setFilter(btn.value)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${filter === btn.value ? 'scale-105' : ''
                                }`}
                            style={{
                                background: filter === btn.value
                                    ? 'var(--primary)'
                                    : 'var(--background-secondary)',
                                color: filter === btn.value
                                    ? 'white'
                                    : 'var(--foreground-muted)',
                                boxShadow: filter === btn.value
                                    ? '0 0 15px rgba(129, 140, 248, 0.3)'
                                    : undefined,
                            }}
                        >
                            <span>{btn.icon}</span>
                            {btn.label}
                        </button>
                    ))}
                </div>

                {/* Loot Grid */}
                {filteredLoot.length === 0 ? (
                    <div
                        className="card p-8 text-center"
                        style={{
                            background: 'linear-gradient(135deg, var(--background-secondary), var(--card-bg))',
                        }}
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                            style={{ background: 'var(--primary)', opacity: 0.2 }}
                        >
                            <Sword className="w-8 h-8" style={{ color: 'var(--primary)' }} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                            {filter === 'all' ? 'No loot yet' : `No ${filter}s yet`}
                        </h3>
                        <p className="text-sm mb-6" style={{ color: 'var(--foreground-muted)' }}>
                            Complete quests to earn epic loot drops!
                        </p>
                        <Link
                            href="/quests"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                            style={{ background: 'var(--primary)', color: 'white' }}
                        >
                            Start Quest <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        {filteredLoot.map(item => {
                            const isEquipped =
                                (item.type === 'title' && profile?.equipped_title === item.name) ||
                                (item.type === 'badge' && profile?.equipped_badge === item.name) ||
                                (item.type === 'theme' && profile?.equipped_theme === item.name);

                            return (
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    isEquipped={isEquipped}
                                    onEquip={() => handleEquip(item)}
                                    onClick={() => setSelectedItem(item)}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Locked Items Preview */}
                <LockedItemsPreview items={DEFAULT_LOCKED_ITEMS} />

                {/* Item Detail Bottom Sheet */}
                <BottomSheet
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    title={selectedItem?.name || ''}
                >
                    {selectedItem && (
                        <div className="space-y-4">
                            {/* Item icon */}
                            <div className="text-center">
                                <span
                                    className="text-6xl inline-block mb-2"
                                    style={{ filter: `drop-shadow(0 0 20px ${getRarityColor(selectedItem.rarity)}60)` }}
                                >
                                    {selectedItem.type === 'title' && '📜'}
                                    {selectedItem.type === 'badge' && '🛡️'}
                                    {selectedItem.type === 'theme' && '🎨'}
                                    {selectedItem.type === 'frame' && '🖼️'}
                                </span>
                                <p
                                    className="text-sm font-medium capitalize"
                                    style={{ color: getRarityColor(selectedItem.rarity) }}
                                >
                                    {selectedItem.rarity} {selectedItem.type}
                                </p>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-center" style={{ color: 'var(--foreground-muted)' }}>
                                A rare item earned through your dedication.
                            </p>

                            {/* Actions */}
                            {(() => {
                                const isEquipped =
                                    (selectedItem.type === 'title' && profile?.equipped_title === selectedItem.name) ||
                                    (selectedItem.type === 'badge' && profile?.equipped_badge === selectedItem.name) ||
                                    (selectedItem.type === 'theme' && profile?.equipped_theme === selectedItem.name);

                                return isEquipped ? (
                                    <button
                                        onClick={() => handleUnequip(selectedItem.type as 'title' | 'badge' | 'theme')}
                                        className="w-full py-4 rounded-xl font-semibold transition-all"
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#ef4444',
                                        }}
                                    >
                                        Unequip
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleEquip(selectedItem)}
                                        className="w-full py-4 rounded-xl font-semibold transition-all"
                                        style={{
                                            background: 'var(--primary)',
                                            color: 'white',
                                        }}
                                    >
                                        Equip
                                    </button>
                                );
                            })()}
                        </div>
                    )}
                </BottomSheet>
            </div>
        </AppShell>
    );
}
