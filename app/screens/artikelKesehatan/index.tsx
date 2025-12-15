// app/screens/artikelKesehatan/Index.tsx

import { useAuth } from '@/context/AuthContext';
import { generatePersonalizedArticles } from '@/services/article/articleOrchestrator';
import {
    getArticlesByCategory,
    getLatestArticles,
    getUserRecommendations,
    markArticleAsRead,
    searchArticles,
} from '@/services/article/articleService';
import type { Article, HealthPriority } from '@/types/news.types';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Filter Types
type FilterType = 'all' | 'diabetes' | 'cholesterol';

export default function ArticlesScreen() {
  const { user } = useAuth();
  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  // States
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [healthPriority, setHealthPriority] = useState<HealthPriority | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Animations
  const headerScale = useSharedValue(1);

  // Load initial data
  useEffect(() => {
    if (user?.uid) {
      loadRecommendations();
    }
  }, [user?.uid]);

  // Handler untuk secret debug access
  const handleHeaderTap = () => {
    setTapCount(prev => prev + 1);

    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }

    tapTimer.current = setTimeout(() => {
      if (tapCount + 1 >= 3) {
        // 3x tap detected!
        console.log('🧪 Opening debug tools...');
        router.push('/screens/debug/TestArticleServices');
      }
      setTapCount(0);
    }, 500);
  };

  // Load recommendations
  const loadRecommendations = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const result = await getUserRecommendations(user.uid);

      if (result.success && result.recommendations.length > 0) {
        setArticles(result.recommendations.map(r => r.articles));
      } else {
        // Fallback to latest articles
        const latest = await getLatestArticles(10);
        if (latest.success) {
          setArticles(latest.articles);
        }
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Handle Quick Access (Generate Personalized)
  const handleQuickAccess = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const result = await generatePersonalizedArticles(user.uid);

      if (result.success) {
        setArticles(result.articles || []);
        setHealthPriority(result.healthPriority || null);

        // Animate header
        headerScale.value = withSpring(1.05, {}, () => {
          headerScale.value = withSpring(1);
        });
      } else {
        alert('Gagal memuat artikel: ' + result.message);
      }
    } catch (error) {
      console.error('Error in handleQuickAccess:', error);
      alert('Terjadi kesalahan saat memuat artikel');
    } finally {
      setLoading(false);
    }
  };

  // Handle Filter
  const handleFilter = async (filter: FilterType) => {
    setSelectedFilter(filter);
    setLoading(true);

    try {
      if (filter === 'all') {
        await loadRecommendations();
      } else {
        const result = await getArticlesByCategory(filter, 10);
        if (result.success) {
          setArticles(result.articles);
        }
      }
    } catch (error) {
      console.error('Error filtering articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      loadRecommendations();
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchArticles(query, 10);
      if (result.success) {
        setArticles(result.articles);
      }
    } catch (error) {
      console.error('Error searching articles:', error);
    } finally {
      setIsSearching(false);
    }
  }, [loadRecommendations]);

  // Handle Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  // Handle Article Tap
  const handleArticleTap = async (article: Article) => {
    if (user?.uid) {
      await markArticleAsRead(user.uid, article.id);
    }

    router.push(`/screens/artikelKesehatan/${article.id}` as any);
  };

  // Animated Header Style
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: headerScale.value }],
    };
  });

  // Render Header
  const renderHeader = () => (
    <Animated.View style={[styles.header]} entering={FadeInDown.duration(600)}>
      <LinearGradient
        colors={['#abe8aaff', '#87d785ff', '#51be4eff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Title */}
        <Animated.View style={headerAnimatedStyle}>
          <Text style={styles.headerTitle}>Artikel Kesehatan</Text>
          <Text style={styles.headerSubtitle}>
            Edukasi untuk hidup lebih sehat
          </Text>
        </Animated.View>

        {/* Health Priority Banner */}
        {healthPriority && (
          <Animated.View entering={FadeInUp.delay(300).duration(600)}>
            <BlurView intensity={20} tint="light" style={styles.priorityBanner}>
              <View style={styles.priorityContent}>
                <View style={styles.priorityIcon}>
                  <Text style={styles.priorityEmoji}>
                    {healthPriority.focus === 'diabetes' ? '🩸' : 
                     healthPriority.focus === 'cholesterol' ? '💊' : '⚖️'}
                  </Text>
                </View>
                <View style={styles.priorityTextContainer}>
                  <Text style={styles.priorityLabel}>Fokus Kesehatan Anda</Text>
                  <Text style={styles.priorityFocus}>
                    {healthPriority.focus === 'diabetes' ? 'Diabetes' :
                     healthPriority.focus === 'cholesterol' ? 'Kolesterol' : 'Seimbang'}
                  </Text>
                  <Text style={styles.priorityReason}>{healthPriority.reason}</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Text>🔍</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari artikel kesehatan..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#4A90E2" style={styles.searchLoader} />
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <FilterChip
            label="Semua"
            icon="📋"
            active={selectedFilter === 'all'}
            onPress={() => handleFilter('all')}
          />
          <FilterChip
            label="Diabetes"
            icon="🩸"
            active={selectedFilter === 'diabetes'}
            onPress={() => handleFilter('diabetes')}
          />
          <FilterChip
            label="Kolesterol"
            icon="💊"
            active={selectedFilter === 'cholesterol'}
            onPress={() => handleFilter('cholesterol')}
          />
        </ScrollView>
      </LinearGradient>
    </Animated.View>
  );

  // Render Article Card
  const renderArticleCard = ({ item, index }: { item: Article; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(600)}
      style={styles.cardWrapper}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleArticleTap(item)}
        activeOpacity={0.9}
      >
        {/* Image */}
        <View style={styles.cardImageContainer}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={['#7adc82ff', '#357ABD']}
              style={styles.cardImagePlaceholder}
            >
              <Text style={styles.placeholderIcon}>📰</Text>
            </LinearGradient>
          )}

          {/* Category Badge Overlay */}
          <View style={styles.badgeOverlay}>
            {item.category?.slice(0, 2).map((cat: string, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.badge,
                  cat === 'diabetes' && styles.badgeDiabetes,
                  cat === 'cholesterol' && styles.badgeCholesterol,
                  cat === 'general' && styles.badgeGeneral,
                ]}
              >
                <Text style={styles.badgeText}>
                  {cat === 'diabetes' ? '🩸 Diabetes' : 
                   cat === 'cholesterol' ? '💊 Kolesterol' : '📋 Umum'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title_id}
          </Text>

          {/* Description */}
          <Text style={styles.cardDescription} numberOfLines={3}>
            {item.description_id}
          </Text>

          {/* Meta */}
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📰</Text>
              <Text style={styles.metaText} numberOfLines={1}>
                {item.source_name}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🕒</Text>
              <Text style={styles.metaText}>
                {new Date(item.published_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Read More Button */}
          <View style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Baca Selengkapnya</Text>
            <Text style={styles.readMoreIcon}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render Skeleton Loading
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: '80%' }]} />
            <View style={[styles.skeletonLine, { width: '60%', marginTop: 12 }]} />
          </View>
        </View>
      ))}
    </View>
  );

  // Render Empty State
  const renderEmptyState = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>Belum Ada Artikel</Text>
      <Text style={styles.emptyDescription}>
        Tekan tombol Quick Access untuk memuat artikel yang sesuai dengan kondisi kesehatan Anda
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleQuickAccess}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          style={styles.emptyButtonGradient}
        >
          <Text style={styles.emptyButtonText}>⚡ Muat Artikel</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />  
      {renderHeader()}

      {loading && articles.length === 0 ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={articles}
          renderItem={renderArticleCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4A90E2"
              colors={['#4A90E2']}
            />
          }
          ListEmptyComponent={renderEmptyState()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// Filter Chip Component
const FilterChip = ({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.filterChip, active && styles.filterChipActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {active ? (
      <LinearGradient
        colors={['#FFFFFF', '#F0F4F8']}
        style={styles.filterChipGradient}
      >
        <Text style={styles.filterChipIcon}>{icon}</Text>
        <Text style={styles.filterChipTextActive}>{label}</Text>
      </LinearGradient>
    ) : (
      <>
        <Text style={styles.filterChipIcon}>{icon}</Text>
        <Text style={styles.filterChipText}>{label}</Text>
      </>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000ff',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#000000ff',
    marginBottom: 20,
  },
  priorityBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  priorityContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  priorityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  priorityEmoji: {
    fontSize: 24,
  },
  priorityTextContainer: {
    flex: 1,
  },
  priorityLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  priorityFocus: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  priorityReason: {
    fontSize: 12,
    color: '#E0F2FE',
  },
  quickAccessButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickAccessGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  quickAccessEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  quickAccessText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C5F96',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  searchLoader: {
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChipActive: {
    backgroundColor: 'transparent',
  },
  filterChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  filterChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0F2FE',
  },
  filterChipTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C5F96',
  },
  listContent: {
    padding: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E2E8F0',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 60,
    opacity: 0.5,
  },
  badgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  badgeDiabetes: {
    backgroundColor: '#FEE2E2',
  },
  badgeCholesterol: {
    backgroundColor: '#FEF3C7',
  },
  badgeGeneral: {
    backgroundColor: '#DBEAFE',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 26,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 16,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    flex: 1,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A90E2',
    marginRight: 6,
  },
  readMoreIcon: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '700',
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  skeletonImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E2E8F0',
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});