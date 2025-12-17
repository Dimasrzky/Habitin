import { supabase } from '@/config/supabase.config';
import {
    ChallengeError,
    ChallengeErrorCode,
    DailyQuest,
    DailyQuestCompletion,
    DailyQuestWithStatus,
    HealthFocus,
} from '@/types/challenge.types';
import { format, startOfDay } from 'date-fns';

// ========================================
// CONSTANTS
// ========================================

const DAILY_QUESTS_COUNT = 3; // Generate 3 quests per day

// ========================================
// HELPER: Set user context
// ========================================

const setUserContext = async (userId: string) => {
  const { error } = await supabase.rpc('set_config', {
    setting: 'app.current_user_id',
    value: userId,
  });
  
  if (error) {
    console.warn('Failed to set user context:', error);
  }
};

// ========================================
// GET: Generate Daily Quests for User
// ========================================

export const generateDailyQuests = async (
  userId: string,
  healthFocus: HealthFocus
): Promise<DailyQuestWithStatus[]> => {
  try {
    // 1. Fetch quest pool based on health focus
    const { data: questPool, error: fetchError } = await supabase
      .from('daily_quests')
      .select('*')
      .or(`health_focus.eq.${healthFocus},health_focus.eq.general`)
      .eq('is_active', true);

    if (fetchError) {
      throw new ChallengeError(
        'Failed to fetch quest pool',
        ChallengeErrorCode.DATABASE_ERROR,
        fetchError
      );
    }

    if (!questPool || questPool.length === 0) {
      return [];
    }

    // 2. Weighted random selection
    const selectedQuests = weightedRandomSelection(
      questPool,
      DAILY_QUESTS_COUNT
    );

    // 3. Get today's completions
    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
    
    await setUserContext(userId);
    
    const { data: completions } = await supabase
      .from('user_daily_quest_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('completion_date', today);

    // 4. Map completions to quests
    const completionMap = new Map(
      completions?.map(c => [c.quest_id, c]) || []
    );

    const questsWithStatus: DailyQuestWithStatus[] = selectedQuests.map(quest => ({
      ...quest,
      is_completed: completionMap.has(quest.id),
      completion: completionMap.get(quest.id),
    }));

    return questsWithStatus;
  } catch (error) {
    console.error('Error generating daily quests:', error);
    throw error;
  }
};

// ========================================
// HELPER: Weighted Random Selection
// ========================================

const weightedRandomSelection = (
  pool: DailyQuest[],
  count: number
): DailyQuest[] => {
  const selected: DailyQuest[] = [];
  const available = [...pool];

  // Calculate total weight
  const totalWeight = available.reduce((sum, quest) => sum + quest.weight, 0);

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    if (available.length === 0) break;

    let random = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let j = 0; j < available.length; j++) {
      random -= available[j].weight;
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }

    selected.push(available[selectedIndex]);
    available.splice(selectedIndex, 1);
  }

  return selected;
};

// ========================================
// GET: Today's Quests with Status
// ========================================

export const getTodayQuests = async (
  userId: string,
  healthFocus: HealthFocus
): Promise<DailyQuestWithStatus[]> => {
  return await generateDailyQuests(userId, healthFocus);
};

// ========================================
// POST: Complete Daily Quest
// ========================================

export const completeDailyQuest = async (
  userId: string,
  questId: string
): Promise<DailyQuestCompletion> => {
  try {
    await setUserContext(userId);

    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');

    // 1. Check if already completed today
    const { data: existing } = await supabase
      .from('user_daily_quest_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('quest_id', questId)
      .eq('completion_date', today)
      .maybeSingle();

    if (existing) {
      throw new ChallengeError(
        'Quest already completed today',
        ChallengeErrorCode.ALREADY_COMPLETED
      );
    }

    // 2. Get quest info
    const { data: quest, error: questError } = await supabase
      .from('daily_quests')
      .select('points_reward')
      .eq('id', questId)
      .single();

    if (questError || !quest) {
      throw new ChallengeError(
        'Quest not found',
        ChallengeErrorCode.NOT_FOUND,
        questError
      );
    }

    // 3. Insert completion
    const { data: completion, error: insertError } = await supabase
      .from('user_daily_quest_completions')
      .insert({
        user_id: userId,
        quest_id: questId,
        completion_date: today,
        points_earned: quest.points_reward,
      })
      .select()
      .single();

    if (insertError) {
      throw new ChallengeError(
        'Failed to complete quest',
        ChallengeErrorCode.DATABASE_ERROR,
        insertError
      );
    }

    // 4. Update user stats
    await updateUserStatsForQuest(userId, quest.points_reward);

    return completion;
  } catch (error) {
    console.error('Error completing daily quest:', error);
    throw error;
  }
};

// ========================================
// HELPER: Update User Stats for Quest
// ========================================

const updateUserStatsForQuest = async (
  userId: string,
  points: number
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_user_stats', {
      p_user_id: userId,
      p_points: points,
      p_is_daily_quest: true,
    });

    if (error) {
      console.error('Failed to update user stats:', error);
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

// ========================================
// GET: Check if Quests Need Reset
// ========================================

export const shouldResetQuests = async (
  userId: string
): Promise<boolean> => {
  try {
    const { data: stats } = await supabase
      .from('user_challenge_stats')
      .select('last_activity_date')
      .eq('user_id', userId)
      .maybeSingle();

    if (!stats || !stats.last_activity_date) {
      return true; // First time, need to generate
    }

    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
    return stats.last_activity_date !== today;
  } catch (error) {
    console.error('Error checking quest reset:', error);
    return true; // Default to reset on error
  }
};