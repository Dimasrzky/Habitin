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
    if (!userId || !healthPriority) return;

    set({ dailyQuestsLoading: true, dailyQuestsError: null });

    try {
      const quests = await getTodayQuests(userId, healthPriority);
      set({ dailyQuests: quests, dailyQuestsLoading: false });
    } catch (e) {
      set({
        dailyQuestsLoading: false,
        dailyQuestsError: e instanceof Error ? e.message : 'Failed to load quests',
      });
    }
  },

  completeDailyQuestAction: async (questId) => {
    const { userId } = get();
    if (!userId) throw new Error('User not initialized');

    set(state => ({
      dailyQuests: state.dailyQuests.map(q =>
        q.id === questId ? { ...q, is_completed: true } : q
      ),
    }));

    await completeDailyQuest(userId, questId);
    await get().refreshStats();
    await get().loadDailyQuests();
  },

  loadAvailableChallenges: async () => {
    const { healthPriority, selectedCategory } = get();
    if (!healthPriority) return;

    set({ availableChallengesLoading: true });

    const category = selectedCategory === 'all' ? undefined : selectedCategory;
    const challenges = await getAvailableChallenges(healthPriority, category);

    set({
      availableChallenges: challenges,
      availableChallengesLoading: false,
    });
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
    get().loadAvailableChallenges();
  },

  loadActiveChallenges: async () => {
    const { userId } = get();
    if (!userId) return;

    set({ activeChallengesLoading: true });
    const challenges = await getActiveChallenges(userId);

    set({
      activeChallenges: challenges,
      activeChallengesLoading: false,
    });
  },

  startChallengeAction: async (masterChallengeId) => {
    const { userId } = get();
    if (!userId) throw new Error('User not initialized');

    const newChallenge = await startChallenge(userId, masterChallengeId);
    set(state => ({
      activeChallenges: [...state.activeChallenges, newChallenge],
    }));
  },

  completeTaskAction: async (activeChallengeId, taskId) => {
    const { userId } = get();
    if (!userId) throw new Error('User not initialized');

    const updated = await completeTaskInChallenge(userId, activeChallengeId, taskId);

    set(state => ({
      activeChallenges: state.activeChallenges.map(c =>
        c.id === activeChallengeId ? updated : c
      ),
    }));

    await get().refreshStats();
  },

  abandonChallengeAction: async (activeChallengeId) => {
    const { userId } = get();
    if (!userId) throw new Error('User not initialized');

    await abandonChallenge(userId, activeChallengeId);

    set(state => ({
      activeChallenges: state.activeChallenges.filter(c => c.id !== activeChallengeId),
    }));
  },

  loadUserStats: async () => {
    const { userId } = get();
    if (!userId) return;

    set({ statsLoading: true });
    const stats = await getUserStats(userId);
    set({ userStats: stats, statsLoading: false });
  },

  refreshStats: async () => {
    await get().loadUserStats();
  },
});

// ========================================
// EXPORT STORE
// ========================================

export const useChallengeStore = create<ChallengeStore>(challengeStoreCreator);
