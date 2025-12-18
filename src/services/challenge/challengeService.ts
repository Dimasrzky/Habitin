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
import { getUserStats, updateStreakAfterActivity } from './streakService';

// ========================================
// CONSTANTS
// ========================================

const MAX_ACTIVE_CHALLENGES = 2;
const AVAILABLE_CHALLENGES_DISPLAY_LIMIT = 3; // Always show 3 available challenges

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
  category?: ChallengeCategory,
  userId?: string
): Promise<MasterChallenge[]> => {
  try {
    console.log('[Available Challenges] Fetching with healthFocus:', healthFocus, 'category:', category, 'userId:', userId);

    // Get user's active challenges to filter out
    let activeChallengeIds = new Set<string>();
    if (userId) {
      const { data: userChallenges, error: activeError } = await supabase
        .from('user_active_challenges')
        .select('challenge_id')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (activeError) {
        console.error('[Available Challenges] Error fetching active challenges:', activeError);
        // Don't throw - continue with empty set
      } else {
        activeChallengeIds = new Set(
          userChallenges?.map(uc => uc.challenge_id) || []
        );
        console.log('[Available Challenges] User has', activeChallengeIds.size, 'active challenges');
      }
    }

    // Build base query
    let query = supabase
      .from('master_challenges')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    // Filter by category if specified
    if (category) {
      query = query.eq('category', category);
    }

    // Fetch challenges based on health focus
    let availableChallenges: MasterChallenge[] = [];

    if (healthFocus) {
      // First, get challenges matching user's primary health focus + general
      const { data: primaryChallenges } = await query.or(
        `health_focus.eq.${healthFocus},health_focus.eq.general`
      );

      availableChallenges = (primaryChallenges || []).filter(
        challenge => !activeChallengeIds.has(challenge.id)
      );

      // If we have less than 3 challenges, fetch from other health focuses
      if (availableChallenges.length < AVAILABLE_CHALLENGES_DISPLAY_LIMIT) {
        const needed = AVAILABLE_CHALLENGES_DISPLAY_LIMIT - availableChallenges.length;

        // Get challenges from other health focuses (not general, not current focus)
        const allOtherFocuses: HealthFocus[] = ['diabetes', 'cholesterol'];
        const otherFocuses = allOtherFocuses.filter(f => f !== healthFocus);

        for (const focus of otherFocuses) {
          if (availableChallenges.length >= AVAILABLE_CHALLENGES_DISPLAY_LIMIT) break;

          // Build query for other health focuses, maintaining category filter
          let otherQuery = supabase
            .from('master_challenges')
            .select('*')
            .eq('is_active', true)
            .eq('health_focus', focus)
            .order('sort_order', { ascending: true })
            .limit(needed);

          // Important: Apply category filter if specified
          if (category) {
            otherQuery = otherQuery.eq('category', category);
          }

          const { data: otherChallenges } = await otherQuery;

          if (otherChallenges) {
            const filtered = otherChallenges.filter(
              challenge => !activeChallengeIds.has(challenge.id) &&
                          !availableChallenges.some(c => c.id === challenge.id)
            );
            availableChallenges.push(...filtered);
          }
        }
      }
    } else {
      // No health focus specified, get all challenges
      const { data, error } = await query;

      if (error) {
        throw new ChallengeError(
          'Failed to fetch challenges',
          ChallengeErrorCode.DATABASE_ERROR,
          error
        );
      }

      availableChallenges = (data || []).filter(
        challenge => !activeChallengeIds.has(challenge.id)
      );
    }

    // Limit to 3 displayed challenges for a curated experience
    const displayedChallenges = availableChallenges.slice(0, AVAILABLE_CHALLENGES_DISPLAY_LIMIT);

    console.log('[Available Challenges] Returning', displayedChallenges.length, 'challenges');
    return displayedChallenges;
  } catch (error) {
    console.error('[Available Challenges] Error fetching available challenges:', error);
    throw error;
  }
};

// ========================================
// HELPER: Check and Update Current Day
// ========================================

const checkAndAdvanceDay = async (challenge: UserActiveChallenge): Promise<UserActiveChallenge> => {
  const masterChallenge = challenge.challenge as MasterChallenge;
  const currentDayKey = `day_${challenge.current_day}`;
  const currentDayData = challenge.daily_progress[currentDayKey];

  // Check if current day is complete
  const isDayComplete = currentDayData?.is_complete || false;

  console.log('=== Check Advance Day ===');
  console.log('Challenge:', masterChallenge.title);
  console.log('Current Day:', challenge.current_day);
  console.log('Is Day Complete:', isDayComplete);
  console.log('Completed At:', currentDayData?.completed_at);

  // If day is complete, check if we should advance
  if (isDayComplete) {
    const completedAt = currentDayData.completed_at;
    if (!completedAt) {
      console.log('Day complete but no completed_at timestamp');
      return challenge;
    }

    // Get dates in local timezone
    const completedDate = new Date(completedAt);
    const now = new Date();

    // Extract date parts (YYYY-MM-DD) for comparison
    const completedDateStr = completedDate.toISOString().split('T')[0];
    const todayDateStr = now.toISOString().split('T')[0];

    console.log('Completed Date:', completedDateStr);
    console.log('Today Date:', todayDateStr);
    console.log('Is Different Day:', completedDateStr !== todayDateStr);

    // Check if it's a different calendar day (not same day)
    const isDifferentDay = completedDateStr !== todayDateStr;

    if (!isDifferentDay) {
      console.log('Not advancing - still the same calendar day');
      return challenge;
    }

    // If already at max days, don't advance
    if (challenge.current_day >= masterChallenge.duration_days) {
      console.log('Not advancing - already at max days');
      return challenge;
    }

    // Advance to next day (streak maintained)
    const newDay = challenge.current_day + 1;

    console.log('ADVANCING to Day:', newDay);

    const dailyProgress = { ...challenge.daily_progress };
    const nextDayKey = `day_${newDay}`;

    if (!dailyProgress[nextDayKey]) {
      dailyProgress[nextDayKey] = {
        date: todayDateStr,
        completed_tasks: [],
        completed_at: null,
        is_complete: false,
      };
    } else {
      dailyProgress[nextDayKey].date = todayDateStr;
    }

    const { data: updatedChallenge, error } = await supabase
      .from('user_active_challenges')
      .update({
        current_day: newDay,
        daily_progress: dailyProgress,
        last_activity_at: now.toISOString(),
      })
      .eq('id', challenge.id)
      .select(`
        *,
        challenge:master_challenges (*)
      `)
      .single();

    if (error) {
      console.error('Failed to advance day:', error);
      return challenge;
    }

    console.log('Day advanced successfully to:', newDay);
    return updatedChallenge;
  } else {
    // Day is NOT complete - check if we should reset streak
    const lastActivityAt = challenge.last_activity_at || challenge.started_at;
    const lastActivityDate = new Date(lastActivityAt);
    const now = new Date();

    const lastActivityDateStr = lastActivityDate.toISOString().split('T')[0];

    const daysSinceActivity = Math.floor(
      (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    console.log('Day NOT complete.');
    console.log('Last Activity Date:', lastActivityDateStr);
    console.log('Days Since Activity:', daysSinceActivity);

    // If more than 1 day since last activity and day not complete, reset streak
    if (daysSinceActivity >= 1 && challenge.current_streak > 0) {
      console.log('Resetting streak due to inactivity (missed a day)');

      const { data: updatedChallenge, error } = await supabase
        .from('user_active_challenges')
        .update({
          current_streak: 0,
          last_activity_at: now.toISOString(),
        })
        .eq('id', challenge.id)
        .select(`
          *,
          challenge:master_challenges (*)
        `)
        .single();

      if (error) {
        console.error('Failed to reset streak:', error);
        return challenge;
      }

      return updatedChallenge;
    }

    return challenge;
  }
};

// ========================================
// GET: User's Active Challenges
// ========================================

export const getActiveChallenges = async (
  userId: string
): Promise<UserActiveChallenge[]> => {
  try {
    console.log('[Active Challenges] Fetching for user:', userId);
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
      console.error('[Active Challenges] Database error:', error);
      throw new ChallengeError(
        'Failed to fetch active challenges',
        ChallengeErrorCode.DATABASE_ERROR,
        error
      );
    }

    console.log('[Active Challenges] Found:', data?.length || 0, 'challenges');

    // Check and advance day for each challenge if needed
    const challenges = data || [];
    const updatedChallenges = await Promise.all(
      challenges.map(challenge => checkAndAdvanceDay(challenge))
    );

    console.log('[Active Challenges] Returning:', updatedChallenges.length, 'challenges');
    return updatedChallenges;
  } catch (error) {
    console.error('[Active Challenges] Error fetching active challenges:', error);
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

    // Check and advance day if needed
    if (data && data.status === 'active') {
      const updatedChallenge = await checkAndAdvanceDay(data);
      return updatedChallenge;
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
    // Get current stats
    const stats = await getUserStats(userId);

    // Update points
    const { error } = await supabase
      .from('user_challenge_stats')
      .update({
        total_points: stats.total_points + Math.floor(points),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to update user stats:', error);
    }

    // Update streak
    await updateStreakAfterActivity(userId);
  } catch (error) {
    console.error('Error updating user stats:', error);
    // Don't throw - stats update failure shouldn't block challenge progress
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