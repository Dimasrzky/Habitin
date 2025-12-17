import { useChallengeStore } from '@/stores/useChallengeStore';
import { ChallengeCategoryFilter } from '@/types/challenge.types';
import { useState } from 'react';
import { Alert } from 'react-native';

/**
 * Hook untuk manage challenges (available & active)
 */
export const useChallenges = () => {
  const [startingChallengeId, setStartingChallengeId] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  // Available Challenges
  const availableChallenges = useChallengeStore((state) => state.availableChallenges);
  const availableLoading = useChallengeStore((state) => state.availableChallengesLoading);
  const selectedCategory = useChallengeStore((state) => state.selectedCategory);
  const setCategory = useChallengeStore((state) => state.setCategory);

  // Active Challenges
  const activeChallenges = useChallengeStore((state) => state.activeChallenges);
  const activeLoading = useChallengeStore((state) => state.activeChallengesLoading);

  // Actions
  const startChallenge = useChallengeStore((state) => state.startChallengeAction);
  const completeTask = useChallengeStore((state) => state.completeTaskAction);
  const abandonChallenge = useChallengeStore((state) => state.abandonChallengeAction);

  // Refresh
  const loadAvailable = useChallengeStore((state) => state.loadAvailableChallenges);
  const loadActive = useChallengeStore((state) => state.loadActiveChallenges);

  const handleStartChallenge = async (masterChallengeId: string) => {
    // Check if already at max
    if (activeChallenges.length >= 2) {
      Alert.alert(
        'Batas Tercapai',
        'Kamu hanya bisa memiliki maksimal 2 tantangan aktif. Selesaikan atau tinggalkan salah satu tantangan terlebih dahulu.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Confirm start
    Alert.alert(
      'Mulai Tantangan',
      'Apakah kamu yakin ingin memulai tantangan ini?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Yakin',
          onPress: async () => {
            try {
              setStartingChallengeId(masterChallengeId);
              await startChallenge(masterChallengeId);
              Alert.alert('Berhasil!', 'Tantangan dimulai. Semangat!', [{ text: 'OK' }]);
            } catch (err) {
              console.error('Error starting challenge:', err);
              Alert.alert('Gagal', 'Tidak dapat memulai tantangan. Coba lagi.', [{ text: 'OK' }]);
            } finally {
              setStartingChallengeId(null);
            }
          },
        },
      ]
    );
  };

  const handleCompleteTask = async (activeChallengeId: string, taskId: string) => {
    try {
      setCompletingTaskId(taskId);
      await completeTask(activeChallengeId, taskId);
    } catch (err) {
      console.error('Error completing task:', err);
      Alert.alert('Gagal', 'Tidak dapat menyelesaikan task. Coba lagi.', [{ text: 'OK' }]);
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleAbandonChallenge = (activeChallengeId: string, title: string) => {
    Alert.alert(
      'Tinggalkan Tantangan',
      `Apakah kamu yakin ingin meninggalkan "${title}"? Progress kamu akan hilang.`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Tinggalkan',
          style: 'destructive',
          onPress: async () => {
            try {
              await abandonChallenge(activeChallengeId);
              Alert.alert('Berhasil', 'Tantangan telah ditinggalkan.', [{ text: 'OK' }]);
            } catch (err) {
              console.error('Error abandoning challenge:', err);
              Alert.alert('Gagal', 'Tidak dapat meninggalkan tantangan. Coba lagi.', [{ text: 'OK' }]);
            }
          },
        },
      ]
    );
  };

  const handleCategoryChange = (category: ChallengeCategoryFilter) => {
    setCategory(category);
  };

  const isStartingChallenge = (challengeId: string) => {
    return startingChallengeId === challengeId;
  };

  const isCompletingTask = (taskId: string) => {
    return completingTaskId === taskId;
  };

  return {
    // Available
    availableChallenges,
    availableLoading,
    selectedCategory,
    setCategory: handleCategoryChange,

    // Active
    activeChallenges,
    activeLoading,

    // Actions
    startChallenge: handleStartChallenge,
    completeTask: handleCompleteTask,
    abandonChallenge: handleAbandonChallenge,

    // Loading states
    isStartingChallenge,
    isCompletingTask,

    // Refresh
    refreshAvailable: loadAvailable,
    refreshActive: loadActive,
  };
};