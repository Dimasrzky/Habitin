import { useChallengeStore } from '@/stores/useChallengeStore';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const StreakCounter: React.FC = () => {
  const activeChallenges = useChallengeStore((state) => state.activeChallenges);
  const dailyQuests = useChallengeStore((state) => state.dailyQuests);

  // Get max streak from active challenges
  const maxStreak = activeChallenges.reduce((max, challenge) => {
    return Math.max(max, challenge.current_streak || 0);
  }, 0);

  // Check if user has activity today (completed any daily quest OR completed current day task in any challenge)
  const hasActivityToday = React.useMemo(() => {
    // Check daily quests
    const hasCompletedQuest = dailyQuests.some(quest => quest.is_completed);
    if (hasCompletedQuest) return true;

    // Check active challenges - if current day is complete
    const today = new Date().toISOString().split('T')[0];
    const hasCompletedChallengeTask = activeChallenges.some(challenge => {
      const currentDayKey = `day_${challenge.current_day}`;
      const currentDayData = challenge.daily_progress[currentDayKey];

      if (!currentDayData?.is_complete) return false;

      // Check if completed today
      const completedDate = currentDayData.completed_at
        ? new Date(currentDayData.completed_at).toISOString().split('T')[0]
        : null;

      return completedDate === today;
    });

    return hasCompletedChallengeTask;
  }, [dailyQuests, activeChallenges]);

  if (maxStreak === 0) {
    return null;
  }

  const isActive = hasActivityToday && maxStreak > 0;

  return (
    <View style={[
      styles.container,
      { backgroundColor: isActive ? '#FFF9E6' : 'rgba(255, 255, 255, 0.3)' }
    ]}>
      <Text style={[styles.emoji, { opacity: isActive ? 1 : 0.4 }]}>
        🔥
      </Text>
      <Text style={[
        styles.count,
        { color: isActive ? '#D97706' : 'rgba(255, 255, 255, 0.7)' }
      ]}>
        {maxStreak}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  emoji: {
    fontSize: 16,
  },
  count: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
});