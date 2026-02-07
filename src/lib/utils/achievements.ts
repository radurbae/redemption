import { createClient } from '@/lib/supabase/client';
import type { Item, AchievementStats } from '@/lib/types';


interface UnlockResult {
    achievement: string;
    items: Item[];
}

export async function checkAchievements(userId: string): Promise<UnlockResult[]> {
    const supabase = createClient();
    const results: UnlockResult[] = [];

    const stats = await getAchievementStats(userId);

    const { data: existing } = await supabase
        .from('achievements')
        .select('key')
        .eq('user_id', userId);

    const unlockedKeys = new Set((existing || []).map(a => a.key));

    const { data: allItems } = await supabase
        .from('items')
        .select('*');

    const itemsByUnlockKey = new Map<string, Item[]>();
    (allItems || []).forEach(item => {
        if (item.unlock_key) {
            if (!itemsByUnlockKey.has(item.unlock_key)) {
                itemsByUnlockKey.set(item.unlock_key, []);
            }
            itemsByUnlockKey.get(item.unlock_key)!.push(item);
        }
    });

    const definitions: Record<string, { name: string; check: (s: AchievementStats) => boolean }> = {
        first_quest: { name: 'First Quest', check: (s) => s.totalQuests >= 1 },
        streak_7: { name: '7-Day Streak', check: (s) => s.currentStreak >= 7 },
        streak_14: { name: '14-Day Streak', check: (s) => s.currentStreak >= 14 },
        streak_30: { name: '30-Day Streak', check: (s) => s.currentStreak >= 30 },
        quests_30: { name: '30 Quests', check: (s) => s.totalQuests >= 30 },
        quests_50: { name: '50 Quests', check: (s) => s.totalQuests >= 50 },
        quests_100: { name: '100 Quests', check: (s) => s.totalQuests >= 100 },
        focus_15: { name: 'Focus 15', check: (s) => s.focusQuests >= 15 },
        focus_20: { name: 'Focus 20', check: (s) => s.focusQuests >= 20 },
        focus_30: { name: 'Focus 30', check: (s) => s.focusQuests >= 30 },
        learning_20: { name: 'Learning 20', check: (s) => s.learningQuests >= 20 },
        learning_30: { name: 'Learning 30', check: (s) => s.learningQuests >= 30 },
        learning_50: { name: 'Learning 50', check: (s) => s.learningQuests >= 50 },
        wellness_20: { name: 'Wellness 20', check: (s) => s.wellnessQuests >= 20 },
        comeback: { name: 'Comeback', check: (s) => s.comebackCount >= 1 },
        level_5: { name: 'Level 5', check: (s) => s.level >= 5 },
        rank_a: { name: 'Rank A', check: (s) => s.rank === 'A' || s.rank === 'S' || s.rank === 'SS' },
        morning_10: { name: 'Morning 10', check: (s) => s.morningCount >= 10 },
        night_10: { name: 'Night 10', check: (s) => s.nightCount >= 10 },
        perfect_week: { name: 'Perfect Week', check: (s) => s.perfectWeeks >= 1 },
        no_skip_30: { name: 'No Skip 30', check: (s) => s.daysWithoutSkip >= 30 },
    };

    for (const [key, def] of Object.entries(definitions)) {
        if (unlockedKeys.has(key)) continue;

        if (!def.check(stats)) continue;

        await supabase.from('achievements').insert({
            user_id: userId,
            key,
        });

        const itemsToGrant = itemsByUnlockKey.get(key) || [];

        for (const item of itemsToGrant) {
            const { data: existingItem } = await supabase
                .from('user_items')
                .select('id')
                .eq('user_id', userId)
                .eq('item_id', item.id)
                .single();

            if (!existingItem) {
                await supabase.from('user_items').insert({
                    user_id: userId,
                    item_id: item.id,
                    equipped: false,
                });
            }
        }

        results.push({
            achievement: key,
            items: itemsToGrant,
        });
    }

    return results;
}

export async function getAchievementStats(userId: string): Promise<AchievementStats> {
    const supabase = createClient();

    const { data: profile } = await supabase
        .from('player_profile')
        .select('level, rank')
        .eq('user_id', userId)
        .single();

    const { count: totalQuests } = await supabase
        .from('daily_quests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true);

    const { data: questsWithCategory } = await supabase
        .from('daily_quests')
        .select('quest:quest_pool(category)')
        .eq('user_id', userId)
        .eq('completed', true);

    let focusQuests = 0;
    let learningQuests = 0;
    let wellnessQuests = 0;

    (questsWithCategory || []).forEach((q) => {
        const quest = q.quest as unknown as { category: string } | null;
        const category = quest?.category;
        if (category === 'productivity' || category === 'fitness') focusQuests++;
        if (category === 'learning') learningQuests++;
        if (category === 'wellness') wellnessQuests++;
    });

    const { data: checkins } = await supabase
        .from('checkins')
        .select('date, status')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(60);

    let currentStreak = 0;

    const sortedDates = (checkins || [])
        .filter(c => c.status === 'done')
        .map(c => c.date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (sortedDates.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (sortedDates[0] === today || sortedDates[0] === yesterday) {
            currentStreak = 1;
            for (let i = 1; i < sortedDates.length; i++) {
                const prev = new Date(sortedDates[i - 1]);
                const curr = new Date(sortedDates[i]);
                const diff = (prev.getTime() - curr.getTime()) / 86400000;
                if (diff <= 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
    }

    let comebackCount = 0;
    const allCheckins = (checkins || []).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    for (let i = 1; i < allCheckins.length; i++) {
        if (allCheckins[i - 1].status === 'skipped' && allCheckins[i].status === 'done') {
            comebackCount++;
        }
    }

    return {
        totalQuests: totalQuests || 0,
        currentStreak,
        focusQuests,
        learningQuests,
        wellnessQuests,
        comebackCount,
        level: profile?.level || 1,
        rank: profile?.rank || 'E',
        morningCount: 0, // TODO: hitung sesi pagi/malam
        nightCount: 0,   // TODO: hitung sesi pagi/malam
        perfectWeeks: 0, // TODO: hitung minggu sempurna
        daysWithoutSkip: 0, // TODO: hitung hari tanpa skip
    };
}

export async function grantStarterItems(userId: string): Promise<void> {
    const supabase = createClient();

    const { data: defaultTheme } = await supabase
        .from('items')
        .select('id')
        .eq('name', 'Default Dark')
        .single();

    if (defaultTheme) {
        await supabase.from('user_items').upsert({
            user_id: userId,
            item_id: defaultTheme.id,
            equipped: true,
        }, { onConflict: 'user_id,item_id' });
    }
}
