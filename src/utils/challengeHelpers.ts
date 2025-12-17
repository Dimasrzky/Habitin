import {
    DailyProgressMap,
    MasterChallenge,
    UserActiveChallenge
} from '@/types/challenge.types';
import { differenceInDays, format, parseISO } from 'date-fns';

// ========================================
// PROGRESS CALCULATIONS
// ========================================

/**
 * Calculate total completed days in a challenge
 */
export const getCompletedDaysCount = (dailyProgress: DailyProgressMap): number => {
  return Object.values(dailyProgress).filter(day => day.is_complete).length;
};

/**
 * Calculate completion percentage
 */
export const getCompletionPercentage = (
  challenge: UserActiveChallenge
): number => {
  const masterChallenge = challenge.challenge as MasterChallenge;
  const completedDays = getCompletedDaysCount(challenge.daily_progress);
  return Math.round((completedDays / masterChallenge.duration_days) * 100);
};

/**
 * Check if today's tasks are all complete
 */
export const isTodayComplete = (challenge: UserActiveChallenge): boolean => {
  const currentDay = challenge.current_day;
  const dayKey = `day_${currentDay}`;
  return challenge.daily_progress[dayKey]?.is_complete || false;
};

/**
 * Get tasks completion status for current day
 */
export const getCurrentDayTasksStatus = (
  challenge: UserActiveChallenge
): { completed: number; total: number } => {
  const masterChallenge = challenge.challenge as MasterChallenge;
  const currentDay = challenge.current_day;
  const dayKey = `day_${currentDay}`;
  
  const completedTasks = challenge.daily_progress[dayKey]?.completed_tasks || [];
  const totalTasks = masterChallenge.daily_tasks.length;
  
  return {
    completed: completedTasks.length,
    total: totalTasks,
  };
};

/**
 * Check if specific task is completed today
 */
export const isTaskCompleted = (
  challenge: UserActiveChallenge,
  taskId: string
): boolean => {
  const currentDay = challenge.current_day;
  const dayKey = `day_${currentDay}`;
  const completedTasks = challenge.daily_progress[dayKey]?.completed_tasks || [];
  return completedTasks.includes(taskId);
};

// ========================================
// DATE & TIME HELPERS
// ========================================

/**
 * Get days remaining in challenge
 */
export const getDaysRemaining = (challenge: UserActiveChallenge): number => {
  const masterChallenge = challenge.challenge as MasterChallenge;
  return masterChallenge.duration_days - challenge.current_day + 1;
};

/**
 * Get days since challenge started
 */
export const getDaysSinceStart = (challenge: UserActiveChallenge): number => {
  const startDate = parseISO(challenge.started_at);
  return differenceInDays(new Date(), startDate) + 1;
};

/**
 * Format date for display
 */
export const formatChallengeDate = (dateString: string): string => {
  return format(parseISO(dateString), 'dd MMM yyyy');
};

/**
 * Format time for display
 */
export const formatChallengeTime = (dateString: string): string => {
  return format(parseISO(dateString), 'HH:mm');
};

export const formatTimeRemaining = (resetTime: Date): string => {
  const now = new Date();
  const diff = resetTime.getTime() - now.getTime();
  
  if (diff <= 0) {
    return '0 jam 0 menit';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours} jam ${minutes} menit`;
};

// ========================================
// STREAK HELPERS
// ========================================

/**
 * Get streak emoji based on count
 */
export const getStreakEmoji = (streak: number): string => {
  if (streak >= 30) return '🔥🔥🔥';
  if (streak >= 14) return '🔥🔥';
  if (streak >= 7) return '🔥';
  return '🔥';
};

/**
 * Get streak message
 */
export const getStreakMessage = (streak: number): string => {
  if (streak === 0) return 'Mulai streak hari ini!';
  if (streak === 1) return 'Streak dimulai!';
  if (streak >= 30) return 'Luar biasa! Streak 1 bulan!';
  if (streak >= 14) return 'Hebat! Streak 2 minggu!';
  if (streak >= 7) return 'Bagus! Streak 1 minggu!';
  return `Streak ${streak} hari!`;
};

// ========================================
// DIFFICULTY HELPERS
// ========================================

/**
 * Get difficulty color
 */
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return '#22C55E'; // Green
    case 'medium':
      return '#F59E0B'; // Orange
    case 'hard':
      return '#EF4444'; // Red
    default:
      return '#6B7280'; // Gray
  }
};

/**
 * Get difficulty label in Indonesian
 */
export const getDifficultyLabel = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return 'Mudah';
    case 'medium':
      return 'Sedang';
    case 'hard':
      return 'Sulit';
    default:
      return 'Unknown';
  }
};

// ========================================
// CATEGORY HELPERS
// ========================================

/**
 * Get category icon
 */
export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'physical':
      return '💪';
    case 'nutrition':
      return '🥗';
    case 'lifestyle':
      return '🌟';
    default:
      return '📋';
  }
};

/**
 * Get category label in Indonesian
 */
export const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'physical':
      return 'Fisik';
    case 'nutrition':
      return 'Nutrisi';
    case 'lifestyle':
      return 'Gaya Hidup';
    case 'all':
      return 'Semua';
    default:
      return 'Unknown';
  }
};

// ========================================
// POINTS & REWARDS
// ========================================

/**
 * Calculate total points earned so far
 */
export const getEarnedPoints = (challenge: UserActiveChallenge): number => {
  const masterChallenge = challenge.challenge as MasterChallenge;
  const completedDays = getCompletedDaysCount(challenge.daily_progress);
  const pointsPerDay = masterChallenge.total_points / masterChallenge.duration_days;
  return Math.floor(completedDays * pointsPerDay);
};

/**
 * Calculate potential points (if completed)
 */
export const getPotentialPoints = (challenge: UserActiveChallenge): number => {
  const masterChallenge = challenge.challenge as MasterChallenge;
  return masterChallenge.total_points;
};

/**
 * Format points with suffix
 */
export const formatPoints = (points: number): string => {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
};

// ========================================
// VALIDATION HELPERS
// ========================================

/**
 * Check if can start new challenge
 */
export const canStartNewChallenge = (activeChallengesCount: number): boolean => {
  return activeChallengesCount < 2;
};

/**
 * Get remaining challenge slots
 */
export const getRemainingSlots = (activeChallengesCount: number): number => {
  return Math.max(0, 2 - activeChallengesCount);
};

/**
 * Check if challenge is completable today
 */
export const canCompleteToday = (challenge: UserActiveChallenge): boolean => {
  const currentDay = challenge.current_day;
  const dayKey = `day_${currentDay}`;
  return !challenge.daily_progress[dayKey]?.is_complete;
};

// ========================================
// SORTING HELPERS
// ========================================

/**
 * Sort challenges by priority (diabetes/cholesterol first, then general)
 */
export const sortChallengesByPriority = (
  challenges: MasterChallenge[],
  healthPriority: 'diabetes' | 'cholesterol'
): MasterChallenge[] => {
  return [...challenges].sort((a, b) => {
    // Priority challenges first
    if (a.health_focus === healthPriority && b.health_focus !== healthPriority) {
      return -1;
    }
    if (a.health_focus !== healthPriority && b.health_focus === healthPriority) {
      return 1;
    }
    
    // Then by sort_order
    return a.sort_order - b.sort_order;
  });
};

/**
 * Sort active challenges by progress (most complete first)
 */
export const sortActiveChallengesByProgress = (
  challenges: UserActiveChallenge[]
): UserActiveChallenge[] => {
  return [...challenges].sort((a, b) => {
    const progressA = getCompletionPercentage(a);
    const progressB = getCompletionPercentage(b);
    return progressB - progressA;
  });
};