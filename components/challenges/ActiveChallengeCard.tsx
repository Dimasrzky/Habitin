import { MasterChallenge, UserActiveChallenge } from '@/types/challenge.types';
import { getCompletionPercentage } from '@/utils/challengeHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ActiveChallengeCardProps {
  challenge: UserActiveChallenge;
  onPress: () => void;
}

export const ActiveChallengeCard: React.FC<ActiveChallengeCardProps> = ({
  challenge,
  onPress,
}) => {
  const masterChallenge = challenge.challenge as MasterChallenge;
  const progress = getCompletionPercentage(challenge);
  const completedDays = Object.values(challenge.daily_progress).filter(d => d.is_complete).length;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.95 : 1 },
      ]}
    >
      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>{masterChallenge.icon_emoji}</Text>
        </View>

        {/* Challenge Title */}
        <Text style={styles.title} numberOfLines={2}>
          {masterChallenge.title}
        </Text>

        {/* Progress Info */}
        <View style={styles.progressInfo}>
          <View style={styles.dayInfo}>
            <Ionicons name="calendar-outline" size={14} color="#059669" />
            <Text style={styles.dayText}>
              Hari {challenge.current_day}/{masterChallenge.duration_days}
            </Text>
          </View>
          <Text style={styles.percentText}>{Math.round(progress)}%</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        {/* Completed Days Badge */}
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#10B981" />
          <Text style={styles.completedText}>
            {completedDays} hari selesai
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  card: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    elevation: 1,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconEmoji: {
    fontSize: 26,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 10,
    lineHeight: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  percentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#F0F9F4',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  completedText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
});
