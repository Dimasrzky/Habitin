// ========================================
// CHALLENGE TYPES
// ========================================

export type HealthFocus = 'diabetes' | 'cholesterol' | 'general';
export type ChallengeCategory = 'physical' | 'nutrition' | 'lifestyle';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'abandoned';

// ========================================
// TASK STRUCTURE
// ========================================

export interface ChallengeTask {
  id: string;
  text: string;
  icon: string;
  points: number;
}

// ========================================
// COLOR GRADIENT
// ========================================

export interface ColorGradient {
  start: string;
  end: string;
}

// ========================================
// MASTER CHALLENGE (dari database)
// ========================================

export interface MasterChallenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  health_focus: HealthFocus;
  duration_days: number;
  difficulty: ChallengeDifficulty;
  daily_tasks: ChallengeTask[];
  total_points: number;
  badge_emoji: string;
  icon_emoji: string;
  color_gradient: ColorGradient;
  participants_count: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ========================================
// DAILY PROGRESS STRUCTURE
// ========================================

export interface DayProgress {
  date: string; // ISO date string (YYYY-MM-DD)
  completed_tasks: string[]; // Array of task IDs
  completed_at: string | null; // ISO datetime string or null
  is_complete: boolean;
}

export interface DailyProgressMap {
  [dayKey: string]: DayProgress; // Key format: "day_1", "day_2", etc.
}

// ========================================
// USER ACTIVE CHALLENGE
// ========================================

export interface UserActiveChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: ChallengeStatus;
  current_day: number;
  daily_progress: DailyProgressMap;
  current_streak: number;
  longest_streak: number;
  started_at: string;
  last_activity_at: string;
  completed_at: string | null;
  
  // Populated dari join dengan master_challenges
  challenge?: MasterChallenge;
}

// ========================================
// DAILY QUEST
// ========================================

export interface DailyQuest {
  id: string;
  quest_type: string;
  health_focus: HealthFocus;
  title: string;
  description: string;
  icon_emoji: string;
  target_value: number | null;
  target_unit: string | null;
  points_reward: number;
  is_active: boolean;
  weight: number;
  created_at: string;
}

// ========================================
// DAILY QUEST COMPLETION
// ========================================

export interface DailyQuestCompletion {
  id: string;
  user_id: string;
  quest_id: string;
  completion_date: string; // Date string (YYYY-MM-DD)
  completed_at: string;
  points_earned: number;
}

// ========================================
// USER WITH COMPLETION STATUS (for UI)
// ========================================

export interface DailyQuestWithStatus extends DailyQuest {
  is_completed: boolean;
  completion?: DailyQuestCompletion;
}

// ========================================
// USER CHALLENGE STATS
// ========================================

export interface Badge {
  badge_id: string;
  earned_at: string;
  emoji: string;
  title?: string;
}

export interface UserChallengeStats {
  user_id: string;
  total_points: number;
  total_challenges_completed: number;
  total_daily_quests_completed: number;
  current_fire_streak: number;
  longest_fire_streak: number;
  last_activity_date: string | null; // Date string (YYYY-MM-DD)
  badges_earned: Badge[];
  created_at: string;
  updated_at: string;
}

// ========================================
// FRONTEND-SPECIFIC TYPES
// ========================================

// Filter category untuk UI
export type ChallengeCategoryFilter = 'all' | ChallengeCategory;

// Challenge card dengan progress info
export interface ChallengeCardData extends MasterChallenge {
  isActive?: boolean;
  progress?: {
    completed_days: number;
    total_days: number;
    percentage: number;
  };
}

// Summary untuk dashboard
export interface ChallengeSummary {
  activeChallenges: number;
  completedChallenges: number;
  totalPoints: number;
  currentStreak: number;
  dailyQuestsCompleted: number;
  dailyQuestsTotal: number;
}

// Request/Response types untuk services
export interface StartChallengeRequest {
  user_id: string;
  challenge_id: string;
}

export interface CompleteDailyQuestRequest {
  user_id: string;
  quest_id: string;
  points_earned: number;
}

export interface CompleteTaskRequest {
  user_id: string;
  challenge_id: string;
  task_id: string;
  day_number: number;
}

// ========================================
// ERROR TYPES
// ========================================

export class ChallengeError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ChallengeError';
  }
}

export enum ChallengeErrorCode {
  MAX_ACTIVE_REACHED = 'MAX_ACTIVE_REACHED',
  ALREADY_ACTIVE = 'ALREADY_ACTIVE',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_COMPLETED = 'ALREADY_COMPLETED',
  INVALID_DAY = 'INVALID_DAY',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
}