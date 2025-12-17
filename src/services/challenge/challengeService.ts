import { supabase } from '@/config/supabase.config';
import {
    ChallengeCategory,
    ChallengeError,
    ChallengeErrorCode,
    DailyProgressMap,
    HealthFocus,
    MasterChallenge,
    UserActiveChallenge,
} from '@/types/challenge.types';

// ========================================
// CONSTANTS
// ========================================

const MAX_ACTIVE_CHALLENGES = 2;

// ========================================
// HELPER: Set user context untuk RLS
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
// GET: Available Challenges
// ========================================

export const getAvailableChallenges = async (
  healthFocus?: HealthFocus,
  category?: ChallengeCategory
): Promise<MasterChallenge[]> => {
  try {
    let query = supabase
      .from('master_challenges')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    // Filter by health focus
    if (healthFocus) {
      query = query.or(`health_focus.eq.${healthFocus},health_focus.eq.general`);
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw new ChallengeError(
        'Failed to fetch challenges',
        ChallengeErrorCode.DATABASE_ERROR,
        error
      );
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching available challenges:', error);
    throw error;
  }
};

// ========================================
// GET: User's Active Challenges
// ========================================

export const getActiveChallenges = async (
  userId: string
): Promise<UserActiveChallenge[]> => {
  try {
    await setUserContext(userId);

    const { data, error } = await supabase
      .from('user_active_challenges')
      .select(`
        *,
        challenge:master_challenges (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('started_at', { ascending: false });

    if (error) {
      throw new ChallengeError(
        'Failed to fetch active challenges',
        ChallengeErrorCode.DATABASE_ERROR,
        error
      );
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching active challenges:', error);
    throw error;
  }
};

// ========================================
// GET: Single Active Challenge Detail
// ========================================

export const getChallengeDetail = async (
  userId: string,
  challengeId: string
): Promise<UserActiveChallenge | null> => {
  try {
    await setUserContext(userId);

    const { data, error } = await supabase
      .from('user_active_challenges')
      .select(`
        *,
        challenge:master_challenges (*)
      `)
      .eq('user_id', userId)
      .eq('id', challengeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new ChallengeError(
        'Failed to fetch challenge detail',
        ChallengeErrorCode.DATABASE_ERROR,
        error
      );
    }

    return data;
  } catch (error) {
    console.error('Error fetching challenge detail:', error);
    throw error;
  }
};

// ========================================
// POST: Start New Challenge
// ========================================

export const startChallenge = async (
  userId: string,
  masterChallengeId: string
): Promise<UserActiveChallenge> => {
  try {
    await setUserContext(userId);

    // 1. Check if already at max active challenges
    const { data: activeChallenges, error: countError } = await supabase
      .from('user_active_challenges')
      .select('id', { count: 'exact', head: false })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (countError) {
      throw new ChallengeError(
        'Failed to check active challenges count',
        ChallengeErrorCode.DATABASE_ERROR,
        countError
      );
    }

    if (activeChallenges && activeChallenges.length >= MAX_ACTIVE_CHALLENGES) {
      throw new ChallengeError(
        `Kamu hanya bisa memiliki maksimal ${MAX_ACTIVE_CHALLENGES} tantangan aktif`,
        ChallengeErrorCode.MAX_ACTIVE_REACHED
      );
    }

    // 2. Check if already active for this challenge
    const { data: existingChallenge } = await supabase
      .from('user_active_challenges')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', masterChallengeId)
      .eq('status', 'active')
      .maybeSingle();

    if (existingChallenge) {
      throw new ChallengeError(
        'Kamu sudah mengikuti tantangan ini',
        ChallengeErrorCode.ALREADY_ACTIVE
      );
    }

    // 3. Get master challenge info
    const { data: masterChallenge, error: fetchError } = await supabase
      .from('master_challenges')
      .select('*')
      .eq('id', masterChallengeId)
      .single();

    if (fetchError || !masterChallenge) {
      throw new ChallengeError(
        'Challenge not found',
        ChallengeErrorCode.NOT_FOUND,
        fetchError
      );
    }

    // 4. Initialize daily progress for all days
    const initialProgress: DailyProgressMap = {};
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 1; i <= masterChallenge.duration_days; i++) {
      const dayKey = `day_${i}`;
      initialProgress[dayKey] = {
        date: today, // Will be updated dynamically
        completed_tasks: [],
        completed_at: null,
        is_complete: false,
      };
    }

    // 5. Insert new active challenge
    const { data: newChallenge, error: insertError } = await supabase
      .from('user_active_challenges')
      .insert({
        user_id: userId,
        challenge_id: masterChallengeId,
        status: 'active',
        current_day: 1,
        daily_progress: initialProgress,
        current_streak: 0,
        longest_streak: 0,
      })
      .select(`
        *,
        challenge:master_challenges (*)
      `)
      .single();

    if (insertError) {
      throw new ChallengeError(
        'Failed to start challenge',
        ChallengeErrorCode.DATABASE_ERROR,
        insertError
      );
    }

    return newChallenge;
  } catch (error) {
    console.error('Error starting challenge:', error);
    throw error;
  }
};

// ========================================
// PUT: Complete Task in Active Challenge
// ========================================

export const completeTaskInChallenge = async (
  userId: string,
  activeChallengeId: string,
  taskId: string
): Promise<UserActiveChallenge> => {
  try {
    await setUserContext(userId);

    // 1. Get current challenge state
    const { data: challenge, error: fetchError } = await supabase
      .from('user_active_challenges')
      .select(`
        *,
        challenge:master_challenges (*)
      `)
      .eq('id', activeChallengeId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !challenge) {
      throw new ChallengeError(
        'Challenge not found',
        ChallengeErrorCode.NOT_FOUND,
        fetchError
      );
    }

    if (challenge.status !== 'active') {
      throw new ChallengeError(
        'Challenge is not active',
        ChallengeErrorCode.ALREADY_COMPLETED
      );
    }

    // 2. Update daily progress
    const currentDay = challenge.current_day;
    const dayKey = `day_${currentDay}`;
    const dailyProgress = { ...challenge.daily_progress };
    const today = new Date().toISOString().split('T')[0];

    if (!dailyProgress[dayKey]) {
      dailyProgress[dayKey] = {
        date: today,
        completed_tasks: [],
        completed_at: null,
        is_complete: false,
      };
    }

    const dayData = dailyProgress[dayKey];
    
    // Add task if not already completed
    if (!dayData.completed_tasks.includes(taskId)) {
      dayData.completed_tasks.push(taskId);
    }

    // Check if all tasks for today are complete
    const masterChallenge = challenge.challenge as MasterChallenge;
    const totalTasks = masterChallenge.daily_tasks.length;
    const isAllTasksComplete = dayData.completed_tasks.length >= totalTasks;

    if (isAllTasksComplete && !dayData.is_complete) {
      dayData.is_complete = true;
      dayData.completed_at = new Date().toISOString();
    }

    dailyProgress[dayKey] = dayData;

    // 3. Calculate streak
    const newStreak = calculateStreak(dailyProgress, currentDay);

    // 4. Check if challenge is fully completed
    const allDaysComplete = Object.keys(dailyProgress)
      .filter(key => key.startsWith('day_'))
      .every(key => dailyProgress[key].is_complete);

    const newStatus = allDaysComplete ? 'completed' : 'active';
    const completedAt = allDaysComplete ? new Date().toISOString() : null;

    // 5. Update in database
    const { data: updatedChallenge, error: updateError } = await supabase
      .from('user_active_challenges')
      .update({
        daily_progress: dailyProgress,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, challenge.longest_streak),
        status: newStatus,
        completed_at: completedAt,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', activeChallengeId)
      .select(`
        *,
        challenge:master_challenges (*)
      `)
      .single();

    if (updateError) {
      throw new ChallengeError(
        'Failed to update challenge progress',
        ChallengeErrorCode.DATABASE_ERROR,
        updateError
      );
    }

    // 6. Update user stats if day is complete
    if (isAllTasksComplete) {
      await updateUserStatsForChallengeProgress(userId, masterChallenge.total_points / masterChallenge.duration_days);
    }

    return updatedChallenge;
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};

// ========================================
// HELPER: Calculate Streak
// ========================================

const calculateStreak = (
  dailyProgress: DailyProgressMap,
  currentDay: number
): number => {
  let streak = 0;
  
  for (let i = currentDay; i >= 1; i--) {
    const dayKey = `day_${i}`;
    if (dailyProgress[dayKey]?.is_complete) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// ========================================
// HELPER: Update User Stats
// ========================================

const updateUserStatsForChallengeProgress = async (
  userId: string,
  points: number
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_user_stats', {
      p_user_id: userId,
      p_points: Math.floor(points),
      p_is_daily_quest: false,
    });

    if (error) {
      console.error('Failed to update user stats:', error);
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

// ========================================
// DELETE: Abandon Challenge
// ========================================

export const abandonChallenge = async (
  userId: string,
  activeChallengeId: string
): Promise<void> => {
  try {
    await setUserContext(userId);

    const { error } = await supabase
      .from('user_active_challenges')
      .update({
        status: 'abandoned',
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', activeChallengeId)
      .eq('user_id', userId);

    if (error) {
      throw new ChallengeError(
        'Failed to abandon challenge',
        ChallengeErrorCode.DATABASE_ERROR,
        error
      );
    }
  } catch (error) {
    console.error('Error abandoning challenge:', error);
    throw error;
  }
};