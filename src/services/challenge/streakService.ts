import { supabase } from '@/config/supabase.config';
import { ChallengeError, ChallengeErrorCode, UserChallengeStats } from '@/types/challenge.types';
import { format, startOfDay, subDays } from 'date-fns';

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
// GET: User Challenge Stats
// ========================================

export const getUserStats = async (userId: string): Promise<UserChallengeStats> => {
  try {
    await setUserContext(userId);

    const { data, error } = await supabase
      .from('user_challenge_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new ChallengeError(
        'Failed to fetch user stats',
        ChallengeErrorCode.DATABASE_ERROR,
        error
      );
    }

    // If no stats exist, create initial record
    if (!data) {
      return await initializeUserStats(userId);
    }

    return data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

// ========================================
// POST: Initialize User Stats
// ========================================

const initializeUserStats = async (userId: string): Promise<UserChallengeStats> => {
  try {
    // First, try to insert new stats
    const { data, error } = await supabase
      .from('user_challenge_stats')
      .insert({
        user_id: userId,
        total_points: 0,
        total_challenges_completed: 0,
        total_daily_quests_completed: 0,
        current_fire_streak: 0,
        longest_fire_streak: 0,
        last_activity_date: null,
        badges_earned: [],
      })
      .select()
      .single();

    if (error) {
      // If insert fails (maybe already exists due to race condition), try to fetch
      console.warn('Failed to initialize user stats, attempting to fetch existing:', error);

      const { data: existingData, error: fetchError } = await supabase
        .from('user_challenge_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError || !existingData) {
        throw new ChallengeError(
          'Failed to initialize user stats',
          ChallengeErrorCode.DATABASE_ERROR,
          fetchError || error
        );
      }

      return existingData;
    }

    return data;
  } catch (error) {
    console.error('Error initializing user stats:', error);
    throw error;
  }
};

// ========================================
// UPDATE: Streak after Activity
// ========================================

export const updateStreakAfterActivity = async (userId: string): Promise<UserChallengeStats> => {
  try {
    await setUserContext(userId);

    // 1. Get current stats
    const stats = await getUserStats(userId);

    // 2. Get today's date
    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const yesterday = format(subDays(startOfDay(new Date()), 1), 'yyyy-MM-dd');

    // 3. Check if already active today
    if (stats.last_activity_date === today) {
      // Already active today, no streak change
      return stats;
    }

    // 4. Calculate new streak
    let newStreak = 1;

    if (stats.last_activity_date === yesterday) {
      // Valid continuation - activity yesterday
      newStreak = stats.current_fire_streak + 1;
    } else if (stats.last_activity_date && stats.last_activity_date < yesterday) {
      // Streak broken - more than 1 day gap
      newStreak = 1;
    }

    // 5. Update stats
    const { data: updatedStats, error: updateError } = await supabase
      .from('user_challenge_stats')
      .update({
        current_fire_streak: newStreak,
        longest_fire_streak: Math.max(newStreak, stats.longest_fire_streak),
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      throw new ChallengeError(
        'Failed to update streak',
        ChallengeErrorCode.DATABASE_ERROR,
        updateError
      );
    }

    return updatedStats;
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
};

// ========================================
// CHECK: Is Streak Valid
// ========================================

export const isStreakValid = async (userId: string): Promise<boolean> => {
  try {
    const stats = await getUserStats(userId);

    if (!stats.last_activity_date) {
      return false;
    }

    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const yesterday = format(subDays(startOfDay(new Date()), 1), 'yyyy-MM-dd');

    // Streak is valid if last activity was today or yesterday
    return stats.last_activity_date === today || stats.last_activity_date === yesterday;
  } catch (error) {
    console.error('Error checking streak validity:', error);
    return false;
  }
};

// ========================================
// UPDATE: Stats after Challenge Completion
// ========================================

export const updateStatsAfterChallengeComplete = async (
  userId: string,
  totalPoints: number
): Promise<void> => {
  try {
    await setUserContext(userId);

    const stats = await getUserStats(userId);

    const { error } = await supabase
      .from('user_challenge_stats')
      .update({
        total_points: stats.total_points + totalPoints,
        total_challenges_completed: stats.total_challenges_completed + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw new ChallengeError(
        'Failed to update stats after challenge completion',
        ChallengeErrorCode.DATABASE_ERROR,
        error
      );
    }
  } catch (error) {
    console.error('Error updating stats after challenge completion:', error);
    throw error;
  }
};

// ========================================
// UPDATE: Stats after Daily Quest
// ========================================

export const updateStatsAfterDailyQuest = async (
  userId: string,
  points: number
): Promise<void> => {
  try {
    await setUserContext(userId);

    const stats = await getUserStats(userId);

    const { error } = await supabase
      .from('user_challenge_stats')
      .update({
        total_points: stats.total_points + points,
        total_daily_quests_completed: stats.total_daily_quests_completed + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw new ChallengeError(
        'Failed to update stats after daily quest',
        ChallengeErrorCode.DATABASE_ERROR,
        error
      );
    }

    // Also update streak
    await updateStreakAfterActivity(userId);
  } catch (error) {
    console.error('Error updating stats after daily quest:', error);
    throw error;
  }
};

// ========================================
// ADD: Badge to User
// ========================================

export const addBadgeToUser = async (
  userId: string,
  badgeId: string,
  emoji: string,
  title: string
): Promise<void> => {
  try {
    await setUserContext(userId);

    const stats = await getUserStats(userId);

    // Check if badge already earned
    const hasBadge = stats.badges_earned.some(b => b.badge_id === badgeId);
    if (hasBadge) {
      return; // Already has this badge
    }

    const newBadge = {
      badge_id: badgeId,
      earned_at: new Date().toISOString(),
      emoji,
      title,
    };

    const updatedBadges = [...stats.badges_earned, newBadge];

    const { error } = await supabase
      .from('user_challenge_stats')
      .update({
        badges_earned: updatedBadges,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw new ChallengeError(
        'Failed to add badge',
        ChallengeErrorCode.DATABASE_ERROR,
        error
      );
    }
  } catch (error) {
    console.error('Error adding badge:', error);
    throw error;
  }
};