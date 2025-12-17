import { DailyQuestWithStatus } from '@/types/challenge.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface DailyQuestCardProps {
  quest: DailyQuestWithStatus;
  onComplete: (questId: string) => void;
  isCompleting?: boolean;
}

export const DailyQuestCard: React.FC<DailyQuestCardProps> = ({
  quest,
  onComplete,
  isCompleting = false,
}) => {
  const handlePress = () => {
    if (!quest.is_completed && !isCompleting) {
      onComplete(quest.id);
    }
  };

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <TouchableOpacity
        style={[styles.container, quest.is_completed && styles.containerCompleted]}
        onPress={handlePress}
        disabled={quest.is_completed || isCompleting}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{quest.icon_emoji}</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, quest.is_completed && styles.titleCompleted]}>
            {quest.title}
          </Text>

          {quest.target_value && quest.target_unit && (
            <Text style={styles.target}>
              {quest.target_value} {quest.target_unit}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>+{quest.points_reward}</Text>
            </View>
          </View>
        </View>

        <View style={styles.checkboxContainer}>
          {isCompleting ? (
            <View style={styles.checkboxLoading}>
              <Text>⏳</Text>
            </View>
          ) : quest.is_completed ? (
            <View style={styles.checkboxChecked}>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            </View>
          ) : (
            <View style={styles.checkboxUnchecked} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  containerCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  titleCompleted: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  target: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  checkboxContainer: {
    marginLeft: 12,
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLoading: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});