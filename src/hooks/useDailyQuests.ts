import { useChallengeStore } from '@/stores/useChallengeStore';
import { useState } from 'react';

/**
 * Hook untuk manage daily quests
 */
export const useDailyQuests = () => {
  const [completingQuestId, setCompletingQuestId] = useState<string | null>(null);

  const dailyQuests = useChallengeStore((state) => state.dailyQuests);
  const loading = useChallengeStore((state) => state.dailyQuestsLoading);
  const error = useChallengeStore((state) => state.dailyQuestsError);
  const completeDailyQuest = useChallengeStore((state) => state.completeDailyQuestAction);
  const loadDailyQuests = useChallengeStore((state) => state.loadDailyQuests);

  const handleCompleteQuest = async (questId: string) => {
    try {
      setCompletingQuestId(questId);
      await completeDailyQuest(questId);
    } catch (err) {
      console.error('Error completing quest:', err);
      throw err;
    } finally {
      setCompletingQuestId(null);
    }
  };

  const getCompletedCount = () => {
    return dailyQuests.filter((q) => q.is_completed).length;
  };

  const getTotalCount = () => {
    return dailyQuests.length;
  };

  const isQuestCompleting = (questId: string) => {
    return completingQuestId === questId;
  };

  return {
    dailyQuests,
    loading,
    error,
    completedCount: getCompletedCount(),
    totalCount: getTotalCount(),
    completeQuest: handleCompleteQuest,
    isQuestCompleting,
    refresh: loadDailyQuests,
  };
};