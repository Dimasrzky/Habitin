import { MasterChallenge } from '@/types/challenge.types';
import { getDifficultyLabel } from '@/utils/challengeHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ChallengeCardProps {
  challenge: MasterChallenge;
  onPress: () => void;
  onStartPress: () => void;
  isStarting?: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onPress,
  onStartPress,
  isStarting = false,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
    >
      <View style={styles.container}>
        {/* Left - Icon */}
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>{challenge.icon_emoji}</Text>
          </View>
        </View>

        {/* Middle - Challenge Info */}
        <View style={styles.middleSection}>
          <Text style={styles.title} numberOfLines={2}>
            {challenge.title}
          </Text>

          {/* Duration & Difficulty */}
          <View style={styles.infoRow}>
            <View style={styles.infoBadge}>
              <Ionicons name="time-outline" size={12} color="#059669" />
              <Text style={styles.infoBadgeText}>
                {challenge.duration_days} Hari
              </Text>
            </View>
            <View style={styles.infoBadge}>
              <Ionicons name="bar-chart-outline" size={12} color="#059669" />
              <Text style={styles.infoBadgeText}>
                {getDifficultyLabel(challenge.difficulty)}
              </Text>
            </View>
          </View>

          {/* Participants & Points */}
          <View style={styles.bottomRow}>
            <View style={styles.participantsRow}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.participantsText}>
                {challenge.participants_count} peserta
              </Text>
            </View>
            <View style={styles.pointsBadge}>
              <Ionicons name="trophy" size={14} color="#FFD93D" />
              <Text style={styles.pointsText}>
                +{challenge.total_points}
              </Text>
            </View>
          </View>
        </View>

        {/* Right - Button */}
        <View style={styles.rightSection}>
          <Pressable
            onPress={onStartPress}
            style={({ pressed }) => [
              styles.startButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            disabled={isStarting}
          >
            <Text style={styles.startButtonText}>
              {isStarting ? '...' : 'Mulai'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    minHeight: 120,
  },
  leftSection: {
    marginRight: 12,
    flexShrink: 0,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 28,
  },
  middleSection: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
    maxWidth: '60%',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0F9F4',
    borderRadius: 8,
    gap: 4,
  },
  infoBadgeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    right: 40,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 0,
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#10B981',
    borderRadius: 12,
    minWidth: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
});