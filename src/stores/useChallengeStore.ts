import type { StateCreator } from 'zustand';
import { create } from 'zustand';

import {
    ChallengeCategoryFilter,
    DailyQuestWithStatus,
    HealthFocus,
    MasterChallenge,
    UserActiveChallenge,
    UserChallengeStats,
} from '@/types/challenge.types';

import {
    abandonChallenge,
    completeTaskInChallenge,
    getActiveChallenges,
    getAvailableChallenges,
    startChallenge,
} from '@/services/challenge/challengeService';

import {
    completeDailyQuest,
    getTodayQuests,
} from '@/services/challenge/dailyQuestService';

import {
    getUserStats,
} from '@/services/challenge/streakService';

// ========================================
// MUTEX/LOCK PATTERN (Outside Zustand)
// ========================================

// Global locks to prevent concurrent requests (not in Zustand state)
const requestLocks = {
  dailyQuests: null as Promise<void> | null,
  availableChallenges: null as Promise<void> | null,
  activeChallenges: null as Promise<void> | null,
};

// Track last successful fetch time to enforce minimum delay between requests
const lastFetchTime = {
  dailyQuests: 0,
  availableChallenges: 0,
  activeChallenges: 0,
};

const MIN_FETCH_INTERVAL = 500; // Minimum 500ms between fetches

// Helper: Wait for minimum interval
const waitForMinInterval = async (key: keyof typeof lastFetchTime) => {
  const elapsed = Date.now() - lastFetchTime[key];
  if (elapsed < MIN_FETCH_INTERVAL) {
    const waitTime = MIN_FETCH_INTERVAL - elapsed;
    console.log(`[Store] Waiting ${waitTime}ms before next ${key} fetch`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
};

// Helper: Retry with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  initialDelay = 300
): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`[Store] Retry ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

// ========================================
// STORE INTERFACE
// ========================================

interface ChallengeStore {
  userId: string | null;
  healthPriority: HealthFocus | null;
  hasUploadedLab: boolean;

  dailyQuests: DailyQuestWithStatus[];
  dailyQuestsLoading: boolean;
  dailyQuestsError: string | null;

  availableChallenges: MasterChallenge[];
  availableChallengesLoading: boolean;
  availableChallengesError: string | null;
  selectedCategory: ChallengeCategoryFilter;

  activeChallenges: UserActiveChallenge[];
  activeChallengesLoading: boolean;
  activeChallengesError: string | null;

  userStats: UserChallengeStats | null;
  statsLoading: boolean;

  isInitialized: boolean;

  initialize: (
    userId: string,
    healthPriority: HealthFocus,
    hasUploadedLab: boolean
  ) => Promise<void>;

  reset: () => void;

  loadDailyQuests: () => Promise<void>;
  completeDailyQuestAction: (questId: string) => Promise<void>;

  loadAvailableChallenges: () => Promise<void>;
  setCategory: (category: ChallengeCategoryFilter) => void;

  loadActiveChallenges: () => Promise<void>;
  startChallengeAction: (masterChallengeId: string) => Promise<void>;
  completeTaskAction: (activeChallengeId: string, taskId: string) => Promise<void>;
  abandonChallengeAction: (activeChallengeId: string) => Promise<void>;

  loadUserStats: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

// ========================================
// STORE CREATOR (TYPED)
// ========================================

const challengeStoreCreator: StateCreator<ChallengeStore> = (set, get) => ({
  userId: null,
  healthPriority: null,
  hasUploadedLab: false,

  dailyQuests: [],
  dailyQuestsLoading: false,
  dailyQuestsError: null,

  availableChallenges: [],
  availableChallengesLoading: false,
  availableChallengesError: null,
  selectedCategory: 'all',

  activeChallenges: [],
  activeChallengesLoading: false,
  activeChallengesError: null,

  userStats: null,
  statsLoading: false,

  isInitialized: false,

  initialize: async (userId, healthPriority, hasUploadedLab) => {
    set({ userId, healthPriority, hasUploadedLab, isInitialized: false });

    if (!hasUploadedLab) {
      set({ isInitialized: true });
      return;
    }

    await Promise.all([
      get().loadUserStats(),
      get().loadDailyQuests(),
      get().loadActiveChallenges(),
      get().loadAvailableChallenges(),
    ]);

    set({ isInitialized: true });
  },

  reset: () => {
    set({
      userId: null,
      healthPriority: null,
      hasUploadedLab: false,
      dailyQuests: [],
      availableChallenges: [],
      activeChallenges: [],
      userStats: null,
      isInitialized: false,
      selectedCategory: 'all',
    });
  },

  loadDailyQuests: async () => {
    const { userId, healthPriority } = get();
    if (!userId || !healthPriority) {
      console.log('[Store] loadDailyQuests: No userId or healthPriority');
      return;
    }

    // Use global lock to prevent concurrent requests
    if (requestLocks.dailyQuests) {
      console.log('[Store] loadDailyQuests: Already loading, reusing existing request');
      return requestLocks.dailyQuests;
    }

    console.log('[Store] loadDailyQuests: Starting...');
    set({ dailyQuestsLoading: true, dailyQuestsError: null });

    // SET LOCK IMMEDIATELY before any await
    const promise = (async () => {
      try {
        // Wait for minimum interval between fetches
        await waitForMinInterval('dailyQuests');

        // Retry with exponential backoff on failure
        const quests = await retryWithBackoff(
          () => getTodayQuests(userId, healthPriority)
        );
        console.log('[Store] loadDailyQuests: Loaded', quests.length, 'quests');
        set({ dailyQuests: quests, dailyQuestsLoading: false });
        lastFetchTime.dailyQuests = Date.now();
      } catch (e) {
        console.error('[Store] loadDailyQuests: Error', e);
        set({
          dailyQuestsLoading: false,
          dailyQuestsError: e instanceof Error ? e.message : 'Failed to load quests',
        });
      } finally {
        // Always clear lock when done
        requestLocks.dailyQuests = null;
      }
    })();

    requestLocks.dailyQuests = promise;
    return promise;
  },

  completeDailyQuestAction: async (questId) => {
    const { userId } = get();
    if (!userId) throw new Error('User not initialized');

    // Store previous state for rollback on error
    const previousQuests = get().dailyQuests;

    try {
      // Optimistic update
      set(state => ({
        dailyQuests: state.dailyQuests.map(q =>
          q.id === questId ? { ...q, is_completed: true } : q
        ),
      }));

      // Complete quest in backend
      await completeDailyQuest(userId, questId);

      // Longer delay to ensure database commit and replication complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh stats to update points
      await get().refreshStats();

      // Clear existing lock and last fetch time to force fresh load
      requestLocks.dailyQuests = null;
      lastFetchTime.dailyQuests = 0;

      // Reload quests to get fresh data from server
      await get().loadDailyQuests();
    } catch (error) {
      console.error('Error completing daily quest:', error);
      // Rollback optimistic update on error
      set({ dailyQuests: previousQuests });
      throw error;
    }
  },

  loadAvailableChallenges: async () => {
    const { userId, healthPriority, selectedCategory } = get();
    if (!healthPriority) {
      console.log('[Store] loadAvailableChallenges: No healthPriority');
      return;
    }

    // Use global lock to prevent concurrent requests
    if (requestLocks.availableChallenges) {
      console.log('[Store] loadAvailableChallenges: Already loading, reusing existing request');
      return requestLocks.availableChallenges;
    }

    console.log('[Store] loadAvailableChallenges: Starting with category', selectedCategory);
    set({ availableChallengesLoading: true, availableChallengesError: null });

    // SET LOCK IMMEDIATELY before any await
    const promise = (async () => {
      try {
        // Wait for minimum interval between fetches
        await waitForMinInterval('availableChallenges');

        const category = selectedCategory === 'all' ? undefined : selectedCategory;
        // Retry with exponential backoff on failure
        const challenges = await retryWithBackoff(
          () => getAvailableChallenges(healthPriority, category, userId || undefined)
        );

        console.log('[Store] loadAvailableChallenges: Loaded', challenges.length, 'challenges');
        set({
          availableChallenges: challenges,
          availableChallengesLoading: false,
        });
        lastFetchTime.availableChallenges = Date.now();
      } catch (e) {
        console.error('[Store] loadAvailableChallenges: Error', e);
        set({
          availableChallengesLoading: false,
          availableChallengesError: e instanceof Error ? e.message : 'Failed to load challenges',
        });
        // Don't clear existing data on error - preserve what we have
      } finally {
        // Always clear lock when done
        requestLocks.availableChallenges = null;
      }
    })();

    requestLocks.availableChallenges = promise;
    return promise;
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
    // Clear lock to allow fresh load with new category
    requestLocks.availableChallenges = null;
    get().loadAvailableChallenges();
  },

  loadActiveChallenges: async () => {
    const { userId } = get();
    if (!userId) {
      console.log('[Store] loadActiveChallenges: No userId');
      return;
    }

    // Use global lock to prevent concurrent requests
    if (requestLocks.activeChallenges) {
      console.log('[Store] loadActiveChallenges: Already loading, reusing existing request');
      return requestLocks.activeChallenges;
    }

    console.log('[Store] loadActiveChallenges: Starting...');
    set({ activeChallengesLoading: true, activeChallengesError: null });

    // SET LOCK IMMEDIATELY before any await
    const promise = (async () => {
      try {
        // Wait for minimum interval between fetches
        await waitForMinInterval('activeChallenges');

        // Retry with exponential backoff on failure
        const challenges = await retryWithBackoff(
          () => getActiveChallenges(userId)
        );

        console.log('[Store] loadActiveChallenges: Loaded', challenges.length, 'challenges');
        set({
          activeChallenges: challenges,
          activeChallengesLoading: false,
        });
        lastFetchTime.activeChallenges = Date.now();
      } catch (e) {
        console.error('[Store] loadActiveChallenges: Error', e);
        set({
          activeChallengesLoading: false,
          activeChallengesError: e instanceof Error ? e.message : 'Failed to load challenges',
        });
        // Don't clear existing data on error - preserve what we have
      } finally {
        // Always clear lock when done
        requestLocks.activeChallenges = null;
      }
    })();

    requestLocks.activeChallenges = promise;
    return promise;
  },

  startChallengeAction: async (masterChallengeId) => {
    const { userId } = get();
    if (!userId) throw new Error('User not initialized');

    try {
      const newChallenge = await startChallenge(userId, masterChallengeId);
      set(state => ({
        activeChallenges: [...state.activeChallenges, newChallenge],
      }));

      // Reload available challenges to remove the started challenge from the list
      await get().loadAvailableChallenges();
    } catch (error) {
      console.error('Error starting challenge:', error);
      throw error;
    }
  },

  completeTaskAction: async (activeChallengeId, taskId) => {
    const { userId } = get();
    if (!userId) throw new Error('User not initialized');

    // Store previous state for rollback on error
    const previousChallenges = get().activeChallenges;

    try {
      const updated = await completeTaskInChallenge(userId, activeChallengeId, taskId);

      set(state => ({
        activeChallenges: state.activeChallenges.map(c =>
          c.id === activeChallengeId ? updated : c
        ),
      }));

      await get().refreshStats();
    } catch (error) {
      console.error('Error completing task:', error);
      // Rollback on error
      set({ activeChallenges: previousChallenges });
      throw error;
    }
  },

  abandonChallengeAction: async (activeChallengeId) => {
    const { userId } = get();
    if (!userId) throw new Error('User not initialized');

    // Store previous state for rollback on error
    const previousChallenges = get().activeChallenges;

    try {
      await abandonChallenge(userId, activeChallengeId);

      set(state => ({
        activeChallenges: state.activeChallenges.filter(c => c.id !== activeChallengeId),
      }));

      // Reload available challenges so abandoned challenge can appear again
      await get().loadAvailableChallenges();
    } catch (error) {
      console.error('Error abandoning challenge:', error);
      // Rollback on error
      set({ activeChallenges: previousChallenges });
      throw error;
    }
  },

  loadUserStats: async () => {
    const { userId } = get();
    if (!userId) return;

    set({ statsLoading: true });

    try {
      const stats = await getUserStats(userId);
      set({ userStats: stats, statsLoading: false });
    } catch (e) {
      console.error('Error loading user stats:', e);
      set({ statsLoading: false });
      // Don't clear existing stats on error
    }
  },

  refreshStats: async () => {
    await get().loadUserStats();
  },
});

// ========================================
// EXPORT STORE
// ========================================

export const useChallengeStore = create<ChallengeStore>(challengeStoreCreator);
