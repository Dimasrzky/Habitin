import { useChallengeInit } from '@/hooks/useChallengeInit';
import { useChallenges } from '@/hooks/useChallenges';
import { useDailyQuests } from '@/hooks/useDailyQuests';
import { useRealtimeChallenge } from '@/hooks/useRealtimeChallenge';
import { useChallengeStore } from '@/stores/useChallengeStore';
import { formatTimeRemaining } from '@/utils/challengeHelpers';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActiveChallengeCard } from '../../components/challenges/ActiveChallengeCard';
import { CategoryFilter } from '../../components/challenges/CategoryFilter';
import { ChallengeCard } from '../../components/challenges/ChallengeCard';
import { DailyQuestCard } from '../../components/challenges/DailyQuestCard';
import { EmptyLabState } from '../../components/challenges/EmptyLabState';
import { StreakCounter } from '../../components/challenges/StreakCounter';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getResetTime = (): Date => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function ChallengeHubScreen() {
  // Hooks
  const router = useRouter();
  const { isLoading: initLoading, isInitialized } = useChallengeInit();
  const {
    dailyQuests,
    loading: questsLoading,
    completedCount,
    totalCount,
    completeQuest,
    isQuestCompleting,
    refresh: refreshQuests,
  } = useDailyQuests();

  const {
    availableChallenges,
    availableLoading,
    selectedCategory,
    setCategory,
    activeChallenges,
    activeLoading,
    startChallenge,
    isStartingChallenge,
    refreshAvailable,
    refreshActive,
  } = useChallenges();

  // Store state
  const hasUploadedLab = useChallengeStore((state) => state.hasUploadedLab);
  const userStats = useChallengeStore((state) => state.userStats);

  // Local state
  const [refreshing, setRefreshing] = React.useState(false);

  // Realtime updates - auto refresh when challenge data changes
  const handleRealtimeUpdate = React.useCallback(() => {
    console.log('🔔 Challenge update detected, refreshing...');
    // Refresh all challenge-related data silently (no loading state)
    Promise.all([
      refreshQuests(),
      refreshAvailable(),
      refreshActive(),
    ]).catch(err => console.error('Error in realtime refresh:', err));
  }, [refreshQuests, refreshAvailable, refreshActive]);

  useRealtimeChallenge({
    onChallengeUpdate: handleRealtimeUpdate,
    enabled: isInitialized && hasUploadedLab,
  });

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshQuests(),
        refreshAvailable(),
        refreshActive(),
      ]);
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle quest completion
  const handleCompleteQuest = async (questId: string) => {
    try {
      await completeQuest(questId);
      Alert.alert('Berhasil! 🎉', 'Quest selesai. Kamu mendapat poin!', [
        { text: 'OK' },
      ]);
    } catch (error) {
      console.error('Error completing quest:', error);
      Alert.alert('Gagal', 'Tidak dapat menyelesaikan quest. Coba lagi.', [
        { text: 'OK' },
      ]);
    }
  };

  // Navigate to challenge detail
  const navigateToChallengeDetail = (challengeId: string, isActive: boolean = false) => {
    if (isActive) {
      // Navigate to active challenge detail with checklist
      router.push({
        pathname: '/screens/gameChallange/challangeDetail',
        params: { challengeId }
      });
    } else {
      // Navigate to preview/info screen for available challenges
      // TODO: Create preview screen or show info modal
      Alert.alert('Challenge Info', 'Klik tombol "Mulai" untuk memulai tantangan ini');
    }
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (initLoading || !isInitialized) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={['top']}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-sm text-[#6B7280] mt-4">
            Memuat tantangan...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // EMPTY LAB STATE
  // =====================================================

  if (!hasUploadedLab) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={['top']}>
        <EmptyLabState />
      </SafeAreaView>
    );
  }

  // =====================================================
  // RENDER EMPTY ACTIVE CHALLENGES
  // =====================================================

  const renderEmptyActiveState = () => (
    <View className="items-center py-12 px-8 mx-5">
      <View className="w-24 h-24 rounded-full bg-[#D1FAE5] items-center justify-center mb-4">
        <Ionicons name="flag-outline" size={48} color="#10B981" />
      </View>
      <Text className="text-xl font-bold text-[#065F46] mb-2 text-center">
        Belum Ada Tantangan Aktif
      </Text>
      <Text className="text-sm text-[#059669] text-center leading-5">
        Mulai tantanganmu sekarang dan raih pencapaian kesehatan yang lebih baik! 💪
      </Text>
    </View>
  );

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <SafeAreaView className="flex-1 bg-[#F0F9F4]" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#34D399"
            colors={['#34D399']}
          />
        }
      >
        {/* HEADER */}
        <View className="px-5 pt-6 pb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-[#065F46] mb-1">Tantangan</Text>
              <Text className="text-sm text-[#059669]">
                Raih pencapaian kesehatanmu!
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <StreakCounter />
              <View className="flex-row items-center bg-white px-3 py-2 rounded-xl shadow-sm">
                <Ionicons name="trophy" size={18} color="#f6ba15ff" />
                <Text className="text-sm font-bold text-[#065F46] ml-1">
                  {userStats?.total_points || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* DAILY QUEST SECTION */}
        <View className="px-5 mb-6">
          <View className="bg-white rounded-3xl p-5 shadow-sm" style={{ elevation: 2, shadowColor: '#10B981', shadowOpacity: 0.1, shadowRadius: 12 }}>
            {/* Header */}
            <View className="flex-row justify-between items-start mb-5">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <View className="w-9 h-9 bg-[#D1FAE5] rounded-xl items-center justify-center mr-3">
                    <Ionicons name="flash" size={20} color="#10B981" />
                  </View>
                  <Text className="text-xl font-bold text-[#065F46]">
                    Quest Harian
                  </Text>
                </View>
                <Text className="text-xs text-[#6B7280] ml-12">
                  Selesaikan quest untuk bonus poin
                </Text>
              </View>
              <View className="bg-[#FEF3C7] px-3 py-1.5 rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color="#D97706" />
                  <Text className="text-xs text-[#D97706] ml-1 font-semibold">
                    {formatTimeRemaining(getResetTime())}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quest List */}
            {questsLoading ? (
              <View className="py-8">
                <ActivityIndicator size="small" color="#10B981" />
              </View>
            ) : dailyQuests.length > 0 ? (
              <>
                <View className="space-y-3">
                  {dailyQuests.map((quest) => (
                    <DailyQuestCard
                      key={quest.id}
                      quest={quest}
                      onComplete={handleCompleteQuest}
                      isCompleting={isQuestCompleting(quest.id)}
                    />
                  ))}
                </View>
                {/* Quest Progress Summary */}
                <View className="mt-5 pt-4 border-t border-[#E5E7EB]">
                  <View className="flex-row items-center justify-between px-2">
                    <Text className="text-sm text-[#6B7280] font-medium">
                      Progress Hari Ini
                    </Text>
                    <View className="flex-row items-center">
                      <View className={`w-2 h-2 rounded-full mr-2 ${completedCount === totalCount ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'}`} />
                      <Text className="text-sm font-bold text-[#065F46]">
                        {completedCount}/{totalCount}
                      </Text>
                    </View>
                  </View>
                  {/* Progress Bar */}
                  <View style={{
                    marginTop: 12,
                    height: 8,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}>
                    <View
                      style={{
                        height: '100%',
                        backgroundColor: '#10B981',
                        borderRadius: 4,
                        width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                      }}
                    />
                  </View>
                </View>
              </>
            ) : (
              <View className="py-8 items-center">
                <View className="w-16 h-16 bg-[#F3F4F6] rounded-full items-center justify-center mb-3">
                  <Ionicons name="calendar-outline" size={28} color="#9CA3AF" />
                </View>
                <Text className="text-sm text-[#9CA3AF] text-center">
                  Tidak ada quest hari ini
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ACTIVE CHALLENGES SECTION */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-5 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="trophy" size={24} color="#10B981" />
              <Text className="text-xl font-bold text-[#065F46] ml-2">
                Tantangan Aktif
              </Text>
              <View className="ml-3 px-2.5 py-1 bg-[#10B981] rounded-full">
                <Text className="text-xs font-bold text-white">
                  {activeChallenges.length}
                </Text>
              </View>
            </View>
          </View>

          {activeLoading ? (
            <View className="py-8">
              <ActivityIndicator size="small" color="#10B981" />
            </View>
          ) : activeChallenges.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {activeChallenges.map((challenge) => (
                <ActiveChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onPress={() => navigateToChallengeDetail(challenge.id, true)}
                />
              ))}
            </ScrollView>
          ) : (
            renderEmptyActiveState()
          )}
        </View>

        {/* AVAILABLE CHALLENGES SECTION */}
        <View className="px-5 pb-8">
          <View className="flex-row items-center mb-4">
            <Ionicons name="grid" size={24} color="#10B981" />
            <Text className="text-xl font-bold text-[#065F46] ml-2">
              Tantangan Tersedia
            </Text>
          </View>

          {/* Category Filter */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setCategory}
          />

          {/* Challenge List */}
          {availableLoading ? (
            <View className="py-8">
              <ActivityIndicator size="small" color="#10B981" />
            </View>
          ) : (
            <FlatList
              data={availableChallenges}
              renderItem={({ item }) => (
                <ChallengeCard
                  challenge={item}
                  onPress={() => navigateToChallengeDetail(item.id)}
                  onStartPress={() => startChallenge(item.id)}
                  isStarting={isStartingChallenge(item.id)}
                />
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View className="items-center py-12">
                  <View className="w-20 h-20 bg-[#D1FAE5] rounded-full items-center justify-center mb-4">
                    <Ionicons name="search-outline" size={36} color="#10B981" />
                  </View>
                  <Text className="text-base font-semibold text-[#065F46] mb-2">
                    Tidak Ada Tantangan
                  </Text>
                  <Text className="text-sm text-[#059669] text-center px-8">
                    Tidak ada tantangan di kategori ini saat ini
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}