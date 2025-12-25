// app/screens/trackerRutin/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Types
interface HabitLog {
  id: string;
  date: string;
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  target: number; // times per week
  logs: HabitLog[];
  streak: number; // consecutive days
  category: 'health' | 'exercise' | 'nutrition' | 'mindfulness';
}

interface WeekDay {
  date: string;
  day: string;
  dayNumber: number;
  isToday: boolean;
}

// Mock data - replace with actual service later
const MOCK_HABITS: Habit[] = [
  {
    id: '1',
    name: 'Minum Air 8 Gelas',
    icon: 'water-outline',
    color: '#3B82F6',
    target: 7,
    logs: [],
    streak: 5,
    category: 'health',
  },
  {
    id: '2',
    name: 'Olahraga 30 Menit',
    icon: 'fitness-outline',
    color: '#EF4444',
    target: 5,
    logs: [],
    streak: 3,
    category: 'exercise',
  },
  {
    id: '3',
    name: 'Makan Sayur',
    icon: 'nutrition-outline',
    color: '#10B981',
    target: 7,
    logs: [],
    streak: 7,
    category: 'nutrition',
  },
  {
    id: '4',
    name: 'Tidur 8 Jam',
    icon: 'moon-outline',
    color: '#8B5CF6',
    target: 7,
    logs: [],
    streak: 4,
    category: 'mindfulness',
  },
  {
    id: '5',
    name: 'Meditasi',
    icon: 'leaf-outline',
    color: '#F59E0B',
    target: 5,
    logs: [],
    streak: 2,
    category: 'mindfulness',
  },
];

export default function TrackerRutinScreen() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>(MOCK_HABITS);
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeWeek();
  }, []);

  const initializeWeek = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);

    // Set to Monday (1) as start of week
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    startOfWeek.setDate(today.getDate() + diff);

    const week: WeekDay[] = [];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const dateString = date.toISOString().split('T')[0];
      const isToday = dateString === today.toISOString().split('T')[0];

      week.push({
        date: dateString,
        day: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        isToday,
      });
    }

    setWeekDays(week);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Fetch habits data here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const toggleHabit = (habitId: string, date: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const existingLog = habit.logs.find(log => log.date === date);

        let newLogs;
        if (existingLog) {
          // Toggle existing log
          newLogs = habit.logs.map(log =>
            log.date === date ? { ...log, completed: !log.completed } : log
          );
        } else {
          // Add new log
          newLogs = [...habit.logs, {
            id: `${habitId}-${date}`,
            date,
            completed: true,
          }];
        }

        return { ...habit, logs: newLogs };
      }
      return habit;
    }));
  };

  const getHabitStatusForDate = (habit: Habit, date: string): boolean => {
    const log = habit.logs.find(log => log.date === date);
    return log?.completed || false;
  };

  const getWeeklyCompletion = (habit: Habit): number => {
    const completedThisWeek = weekDays.filter(day =>
      getHabitStatusForDate(habit, day.date)
    ).length;
    return Math.round((completedThisWeek / habit.target) * 100);
  };

  const getOverallStats = () => {
    const totalHabits = habits.length;
    const completedToday = habits.filter(habit =>
      getHabitStatusForDate(habit, selectedDate)
    ).length;

    const totalWeeklyTargets = habits.reduce((sum, h) => sum + h.target, 0);
    const completedWeekly = habits.reduce((sum, habit) => {
      return sum + weekDays.filter(day => getHabitStatusForDate(habit, day.date)).length;
    }, 0);

    const avgStreak = Math.round(
      habits.reduce((sum, h) => sum + h.streak, 0) / totalHabits
    );

    return {
      completedToday,
      totalHabits,
      weeklyProgress: Math.round((completedWeekly / totalWeeklyTargets) * 100),
      avgStreak,
    };
  };

  const stats = getOverallStats();

  const renderWeekCalendar = () => (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <Ionicons name="calendar-outline" size={20} color="#1F2937" />
        <Text style={styles.calendarTitle}>Minggu Ini</Text>
      </View>
      <View style={styles.daysContainer}>
        {weekDays.map((day) => {
          const completedCount = habits.filter(h =>
            getHabitStatusForDate(h, day.date)
          ).length;
          const isSelected = day.date === selectedDate;

          return (
            <Pressable
              key={day.date}
              style={({ pressed }) => [
                styles.dayItem,
                day.isToday && styles.dayItemToday,
                isSelected && styles.dayItemSelected,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => setSelectedDate(day.date)}
            >
              <Text style={[
                styles.dayName,
                day.isToday && styles.dayNameToday,
                isSelected && styles.dayNameSelected,
              ]}>
                {day.day}
              </Text>
              <Text style={[
                styles.dayNumber,
                day.isToday && styles.dayNumberToday,
                isSelected && styles.dayNumberSelected,
              ]}>
                {day.dayNumber}
              </Text>
              {completedCount > 0 && (
                <View style={[
                  styles.completionDot,
                  { backgroundColor: completedCount === habits.length ? '#10B981' : '#F59E0B' }
                ]} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderStatsOverview = () => (
    <View style={styles.statsOverview}>
      <View style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: '#DBEAFE' }]}>
          <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
        </View>
        <Text style={styles.statValue}>{stats.completedToday}/{stats.totalHabits}</Text>
        <Text style={styles.statLabel}>Hari Ini</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: '#D1FAE5' }]}>
          <Ionicons name="trending-up" size={24} color="#10B981" />
        </View>
        <Text style={styles.statValue}>{stats.weeklyProgress}%</Text>
        <Text style={styles.statLabel}>Progress</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="flame" size={24} color="#F59E0B" />
        </View>
        <Text style={styles.statValue}>{stats.avgStreak}</Text>
        <Text style={styles.statLabel}>Rata² Streak</Text>
      </View>
    </View>
  );

  const renderProgressBar = (percentage: number) => {
    const getColor = (pct: number) => {
      if (pct >= 80) return '#10B981';
      if (pct >= 50) return '#F59E0B';
      return '#EF4444';
    };

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: getColor(percentage),
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{percentage}%</Text>
      </View>
    );
  };

  const renderHabitCard = (habit: Habit) => {
    const isCompleted = getHabitStatusForDate(habit, selectedDate);
    const weeklyProgress = getWeeklyCompletion(habit);
    const completedCount = weekDays.filter(day =>
      getHabitStatusForDate(habit, day.date)
    ).length;

    return (
      <View key={habit.id} style={styles.habitCard}>
        {/* Habit Header */}
        <View style={styles.habitHeader}>
          <View style={styles.habitInfo}>
            <View style={[styles.habitIconContainer, { backgroundColor: `${habit.color}20` }]}>
              <Ionicons name={habit.icon} size={24} color={habit.color} />
            </View>
            <View style={styles.habitTextContainer}>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitTarget}>
                {completedCount}/{habit.target} kali minggu ini
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.checkButton,
              isCompleted && { backgroundColor: habit.color },
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => toggleHabit(habit.id, selectedDate)}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            )}
          </Pressable>
        </View>

        {/* Weekly Progress */}
        {renderProgressBar(weeklyProgress)}

        {/* Week Mini Calendar */}
        <View style={styles.miniCalendar}>
          {weekDays.map((day) => {
            const completed = getHabitStatusForDate(habit, day.date);
            return (
              <View key={day.date} style={styles.miniDay}>
                <View style={[
                  styles.miniDayDot,
                  completed && { backgroundColor: habit.color },
                  !completed && styles.miniDayDotEmpty,
                ]} />
              </View>
            );
          })}
        </View>

        {/* Streak Badge */}
        {habit.streak > 0 && (
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={14} color="#F59E0B" />
            <Text style={styles.streakText}>{habit.streak} hari berturut-turut</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCategorySection = (category: Habit['category'], title: string, icon: keyof typeof Ionicons.glyphMap) => {
    const categoryHabits = habits.filter(h => h.category === category);

    if (categoryHabits.length === 0) return null;

    return (
      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Ionicons name={icon} size={20} color="#ABE7B2" />
          <Text style={styles.categoryTitle}>{title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{categoryHabits.length}</Text>
          </View>
        </View>
        {categoryHabits.map(renderHabitCard)}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Tracker Rutin</Text>
        <Pressable
          onPress={() => {
            // TODO: Add new habit
            console.log('Add new habit');
          }}
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="add-circle" size={24} color="#ABE7B2" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ABE7B2']}
          />
        }
      >
        {/* Stats Overview */}
        {renderStatsOverview()}

        {/* Week Calendar */}
        {renderWeekCalendar()}

        {/* Habits by Category */}
        {renderCategorySection('health', 'Kesehatan', 'heart-outline')}
        {renderCategorySection('exercise', 'Olahraga', 'fitness-outline')}
        {renderCategorySection('nutrition', 'Nutrisi', 'nutrition-outline')}
        {renderCategorySection('mindfulness', 'Mindfulness', 'leaf-outline')}

        {/* Empty State */}
        {habits.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="list-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Kebiasaan</Text>
            <Text style={styles.emptySubtitle}>
              Mulai tambahkan kebiasaan sehat Anda untuk tracking
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.emptyButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => console.log('Add habit')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Tambah Kebiasaan</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  statsOverview: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 2,
    position: 'relative',
  },
  dayItemToday: {
    backgroundColor: '#FEF3C7',
  },
  dayItemSelected: {
    backgroundColor: '#ABE7B2',
  },
  dayName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  dayNameToday: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  dayNameSelected: {
    color: '#1F2937',
    fontWeight: '600',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  dayNumberToday: {
    color: '#F59E0B',
  },
  dayNumberSelected: {
    color: '#1F2937',
  },
  completionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 4,
  },
  categorySection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  habitTextContainer: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  habitTarget: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 40,
    textAlign: 'right',
  },
  miniCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  miniDay: {
    flex: 1,
    alignItems: 'center',
  },
  miniDayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miniDayDotEmpty: {
    backgroundColor: '#E5E7EB',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ABE7B2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
