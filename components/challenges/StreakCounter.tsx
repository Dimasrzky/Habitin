import { useChallengeStore } from '@/stores/useChallengeStore';
import { getStreakEmoji } from '@/utils/challengeHelpers';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const StreakCounter: React.FC = () => {
  const userStats = useChallengeStore((state) => state.userStats);
  const currentStreak = userStats?.current_fire_streak || 0;

  if (currentStreak === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{getStreakEmoji(currentStreak)}</Text>
      <Text style={styles.count}>{currentStreak}</Text>
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