// app/screens/Profile/AllBadges.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  earned: boolean;
  earnedDate?: string;
  category: 'streak' | 'challenge' | 'health' | 'community';
}

const ALL_BADGES: Badge[] = [
  {
    id: '1',
    name: '7-Day Streak',
    description: 'Login selama 7 hari berturut-turut',
    icon: 'flame',
    earned: true,
    earnedDate: '15 Jan 2025',
    category: 'streak',
  },
  {
    id: '2',
    name: 'First Check',
    description: 'Melakukan pengecekan kesehatan pertama',
    icon: 'checkmark-circle',
    earned: true,
    earnedDate: '10 Jan 2025',
    category: 'health',
  },
  {
    id: '3',
    name: 'Challenge Master',
    description: 'Menyelesaikan 10 tantangan',
    icon: 'trophy',
    earned: true,
    earnedDate: '20 Jan 2025',
    category: 'challenge',
  },
  {
    id: '4',
    name: 'Community Star',
    description: 'Mendapat 100 likes di komunitas',
    icon: 'star',
    earned: false,
    category: 'community',
  },
  {
    id: '5',
    name: 'Healthy Habit',
    description: 'Mencatat aktivitas sehat 30 hari',
    icon: 'leaf',
    earned: false,
    category: 'health',
  },
  {
    id: '6',
    name: '30-Day Streak',
    description: 'Login selama 30 hari berturut-turut',
    icon: 'rocket',
    earned: false,
    category: 'streak',
  },
  {
    id: '7',
    name: 'Helpful Member',
    description: 'Membantu 50 anggota komunitas',
    icon: 'heart',
    earned: false,
    category: 'community',
  },
  {
    id: '8',
    name: 'Perfect Week',
    description: 'Menyelesaikan semua tugas mingguan',
    icon: 'ribbon',
    earned: false,
    category: 'challenge',
  },
];

const CATEGORY_NAMES = {
  streak: 'Konsistensi',
  challenge: 'Tantangan',
  health: 'Kesehatan',
  community: 'Komunitas',
};

const CATEGORY_COLORS = {
  streak: '#FFD580',
  challenge: '#ABE7B2',
  health: '#93BFC7',
  community: '#FFB8D0',
};

export default function AllBadges() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const filteredBadges = selectedCategory === 'all' 
    ? ALL_BADGES 
    : ALL_BADGES.filter(badge => badge.category === selectedCategory);

  const earnedCount = ALL_BADGES.filter(b => b.earned).length;
  const totalCount = ALL_BADGES.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Semua Badge</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {earnedCount} dari {totalCount} badge terkumpul
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(earnedCount / totalCount) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'all' && styles.categoryButtonActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
            Semua
          </Text>
        </TouchableOpacity>
        {Object.entries(CATEGORY_NAMES).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[styles.categoryButton, selectedCategory === key && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(key)}
          >
            <Text style={[styles.categoryText, selectedCategory === key && styles.categoryTextActive]}>
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Badges Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badgesGrid}>
          {filteredBadges.map((badge) => (
            <View key={badge.id} style={styles.badgeCard}>
              <View 
                style={[
                  styles.badgeIcon,
                  { backgroundColor: badge.earned ? CATEGORY_COLORS[badge.category] : '#F3F4F6' }
                ]}
              >
                <Ionicons
                  name={badge.icon}
                  size={40}
                  color={badge.earned ? '#1F2937' : '#9CA3AF'}
                />
              </View>
              <Text style={[styles.badgeName, !badge.earned && styles.badgeNameInactive]}>
                {badge.name}
              </Text>
              <Text style={styles.badgeDescription}>
                {badge.description}
              </Text>
              {badge.earned && badge.earnedDate && (
                <Text style={styles.earnedDate}>
                  Diperoleh: {badge.earnedDate}
                </Text>
              )}
              {!badge.earned && (
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={12} color="#9CA3AF" />
                  <Text style={styles.lockedText}>Terkunci</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 30,
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
  statsContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ABE7B2',
    borderRadius: 4,
  },
  categoryScroll: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  categoryButtonActive: {
    backgroundColor: '#ABE7B2',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeNameInactive: {
    color: '#9CA3AF',
  },
  badgeDescription: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 8,
  },
  earnedDate: {
    fontSize: 10,
    color: '#ABE7B2',
    fontWeight: '500',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockedText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});