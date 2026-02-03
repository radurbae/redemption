import { createClient } from '@/lib/supabase/client';
import type { DailyQuest } from '@/lib/types';
import { formatDate } from './dates';

const QUESTS_PER_DAY = 3;

/**
 * Get today's random quests for the current user.
 * If no quests exist for today, generate new ones.
 */
export async function getDailyQuests(): Promise<DailyQuest[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const today = formatDate(new Date());

    // Check if user already has quests for today
    const { data: existingQuests } = await supabase
        .from('daily_quests')
        .select(`
      *,
      quest:quest_pool(*)
    `)
        .eq('user_id', user.id)
        .eq('date', today);

    if (existingQuests && existingQuests.length > 0) {
        return existingQuests;
    }

    // Generate new quests for today
    return await generateDailyQuests(user.id, today);
}

/**
 * Generate random quests for a user for a specific date.
 */
async function generateDailyQuests(userId: string, date: string): Promise<DailyQuest[]> {
    const supabase = createClient();

    // Get all active quests from the pool
    const { data: questPool } = await supabase
        .from('quest_pool')
        .select('*')
        .eq('is_active', true);

    if (!questPool || questPool.length === 0) return [];

    // Shuffle and pick random quests
    const shuffled = [...questPool].sort(() => Math.random() - 0.5);
    const selectedQuests = shuffled.slice(0, QUESTS_PER_DAY);

    // Insert daily quests
    const questsToInsert = selectedQuests.map(quest => ({
        user_id: userId,
        quest_id: quest.id,
        date,
    }));

    const { data: insertedQuests, error } = await supabase
        .from('daily_quests')
        .insert(questsToInsert)
        .select(`
      *,
      quest:quest_pool(*)
    `);

    if (error) {
        console.error('Error generating daily quests:', error);
        return [];
    }

    return insertedQuests || [];
}

/**
 * Complete a daily quest and award rewards.
 */
export async function completeDailyQuest(questId: string): Promise<{ xp: number; gold: number } | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Get the quest details
    const { data: dailyQuest } = await supabase
        .from('daily_quests')
        .select(`
      *,
      quest:quest_pool(*)
    `)
        .eq('id', questId)
        .eq('user_id', user.id)
        .single();

    if (!dailyQuest || dailyQuest.completed) return null;

    const quest = dailyQuest.quest;
    if (!quest) return null;

    // Mark as completed
    await supabase
        .from('daily_quests')
        .update({
            completed: true,
            completed_at: new Date().toISOString()
        })
        .eq('id', questId);

    // Award XP and Gold
    const { data: profile } = await supabase
        .from('player_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (profile) {
        const newXp = profile.xp + quest.xp_reward;
        const newGold = profile.gold + quest.gold_reward;

        // Calculate new level
        let level = profile.level;
        let xpForNext = 50 + level * 25;
        while (newXp >= xpForNext) {
            level++;
            xpForNext = 50 + level * 25;
        }

        await supabase
            .from('player_profile')
            .update({ xp: newXp, gold: newGold, level })
            .eq('user_id', user.id);

        // Record in ledger
        await supabase.from('reward_ledger').insert({
            user_id: user.id,
            habit_id: questId,
            date: formatDate(new Date()),
            xp_delta: quest.xp_reward,
            gold_delta: quest.gold_reward,
            reason: 'random_quest',
        });
    }

    return { xp: quest.xp_reward, gold: quest.gold_reward };
}

/**
 * Refresh daily quests (admin/debug function).
 */
export async function refreshDailyQuests(): Promise<DailyQuest[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const today = formatDate(new Date());

    // Delete existing quests for today
    await supabase
        .from('daily_quests')
        .delete()
        .eq('user_id', user.id)
        .eq('date', today);

    // Generate new ones
    return await generateDailyQuests(user.id, today);
}
