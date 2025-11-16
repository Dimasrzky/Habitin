import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// =====================================================
// TYPESCRIPT INTERFACES & TYPES
// =====================================================

type ChallengeCategory = 'physical' | 'nutrition' | 'lifestyle';
type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
type ChallengeStatus = 'available' | 'active' | 'completed';

interface DailyQuest {
    id: string;
    title: string;
    description: string;
    icon: string;
    progress: number;
    target: number;
    points: number;
    completed: boolean;
    resetTime: Date;
}

interface Challenge {
    id: string;
    title: string;
    description: string;
    category: ChallengeCategory;
    difficulty: ChallengeDifficulty;
    duration: number;
    status: ChallengeStatus;
    currentDay: number;
    totalDays: number;
    streak: number;
    completedDays: number;
    target: string;
    icon: string;
    totalPoints: number;
    dailyPoints: number;
    badgeId?: string;
    participantsCount: number;
    startDate?: Date;
}

interface FilterOption {
    id: string;
    label: string;
    value: ChallengeCategory | 'all';
    emoji: string;
}

// =====================================================
// MOCK DATA
// =====================================================

const MOCK_DAILY_QUESTS: DailyQuest[] = [
    {
        id: 'dq1',
        title: 'Minum 8 gelas air',
        description: 'Tetap terhidrasi sepanjang hari',
        icon: 'water',
        progress: 5,
        target: 8,
        points: 5,
        completed: false,
        resetTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 jam dari sekarang
    },
    {
        id: 'dq2',
        title: 'Jalan 3000 langkah',
        description: 'Tetap aktif bergerak',
        icon: 'footsteps',
        progress: 3000,
        target: 3000,
        points: 5,
        completed: true,
        resetTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
    {
        id: 'dq3',
        title: 'Baca artikel kesehatan',
        description: 'Pelajari tips kesehatan baru',
        icon: 'book',
        progress: 0,
        target: 1,
        points: 5,
        completed: false,
        resetTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
];

const MOCK_ACTIVE_CHALLENGES: Challenge[] = [
    {
        id: 'ac1',
        title: '30 Hari Lari 5KM',
        description: 'Lari minimal 5km setiap hari selama 30 hari',
        category: 'physical',
        difficulty: 'hard',
        duration: 30,
        status: 'active',
        currentDay: 7,
        totalDays: 30,
        streak: 7,
        completedDays: 7,
        target: 'Lari minimal 5km per hari',
        icon: 'bicycle',
        totalPoints: 300,
        dailyPoints: 10,
        badgeId: 'marathon_runner',
        participantsCount: 245,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'ac2',
        title: '21 Hari Makan Sayur',
        description: 'Konsumsi sayuran setiap makan',
        category: 'nutrition',
        difficulty: 'medium',
        duration: 21,
        status: 'active',
        currentDay: 3,
        totalDays: 21,
        streak: 3,
        completedDays: 3,
        target: 'Makan sayur setiap kali makan',
        icon: 'nutrition',
        totalPoints: 210,
        dailyPoints: 10,
        badgeId: 'veggie_lover',
        participantsCount: 189,
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
];

const MOCK_AVAILABLE_CHALLENGES: Challenge[] = [
    {
        id: 'ch1',
        title: '7 Hari Jalan 10K Langkah',
        description: 'Jalan minimal 10,000 langkah setiap hari selama seminggu',
        category: 'physical',
        difficulty: 'easy',
        duration: 7,
        status: 'available',
        currentDay: 0,
        totalDays: 7,
        streak: 0,
        completedDays: 0,
        target: 'Jalan 10,000 langkah per hari',
        icon: 'walk',
        totalPoints: 70,
        dailyPoints: 10,
        badgeId: 'step_master',
        participantsCount: 532,
    },
    {
        id: 'ch2',
        title: '30 Hari Minum Air Cukup',
        description: 'Minum minimal 8 gelas air setiap hari',
        category: 'nutrition',
        difficulty: 'easy',
        duration: 30,
        status: 'available',
        currentDay: 0,
        totalDays: 30,
        streak: 0,
        completedDays: 0,
        target: 'Minum 8 gelas air per hari',
        icon: 'water',
        totalPoints: 300,
        dailyPoints: 10,
        badgeId: 'hydration_hero',
        participantsCount: 678,
    },
    {
        id: 'ch3',
        title: '14 Hari Tidur Teratur',
        description: 'Tidur 7-8 jam setiap malam dengan jadwal konsisten',
        category: 'lifestyle',
        difficulty: 'medium',
        duration: 14,
        status: 'available',
        currentDay: 0,
        totalDays: 14,
        streak: 0,
        completedDays: 0,
        target: 'Tidur 7-8 jam per malam',
        icon: 'moon',
        totalPoints: 140,
        dailyPoints: 10,
        badgeId: 'sleep_champion',
        participantsCount: 312,
    },
    {
        id: 'ch4',
        title: '30 Hari Yoga Pagi',
        description: 'Lakukan yoga atau stretching selama 15 menit setiap pagi',
        category: 'physical',
        difficulty: 'medium',
        duration: 30,
        status: 'available',
        currentDay: 0,
        totalDays: 30,
        streak: 0,
        completedDays: 0,
        target: 'Yoga/stretching 15 menit setiap pagi',
        icon: 'fitness',
        totalPoints: 300,
        dailyPoints: 10,
        badgeId: 'zen_master',
        participantsCount: 421,
    },
    {
        id: 'ch5',
        title: '21 Hari Batasi Gula',
        description: 'Hindari makanan dan minuman tinggi gula',
        category: 'nutrition',
        difficulty: 'hard',
        duration: 21,
        status: 'available',
        currentDay: 0,
        totalDays: 21,
        streak: 0,
        completedDays: 0,
        target: 'Tidak konsumsi gula berlebih',
        icon: 'ban',
        totalPoints: 210,
        dailyPoints: 10,
        badgeId: 'sugar_warrior',
        participantsCount: 156,
    },
];

const FILTER_OPTIONS: FilterOption[] = [
    { id: '1', label: 'Semua', value: 'all', emoji: '📋' },
    { id: '2', label: 'Fisik', value: 'physical', emoji: '💪' },
    { id: '3', label: 'Nutrisi', value: 'nutrition', emoji: '🥗' },
    { id: '4', label: 'Gaya Hidup', value: 'lifestyle', emoji: '😴' },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getCategoryGradient = (category: ChallengeCategory): readonly [string, string] => {
    switch (category) {
        case 'physical':
            return ['#5DC493', '#4A9DB5'] as const; // Lebih deep

        case 'nutrition':
            return ['#9AC7AA', '#88C985'] as const; // Lebih bold

        case 'lifestyle':
            return ['#4A9DB5', '#5DC493'] as const; // Lebih vibrant

        default:
            return ['#9AC7AA', '#88C985'] as const;
    }
};

const getDifficultyStars = (difficulty: ChallengeDifficulty): number => {
    switch (difficulty) {
        case 'easy':
            return 1;
        case 'medium':
            return 2;
        case 'hard':
            return 3;
        default:
            return 1;
    }
};

const getDifficultyLabel = (difficulty: ChallengeDifficulty): string => {
    switch (difficulty) {
        case 'easy':
            return 'Mudah';
        case 'medium':
            return 'Sedang';
        case 'hard':
            return 'Sulit';
        default:
            return 'Mudah';
    }
};

const formatTimeRemaining = (resetTime: Date): string => {
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} jam ${minutes} menit`;
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function ChallengeHubScreen() {
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState<ChallengeCategory | 'all'>('all');
    const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(MOCK_DAILY_QUESTS);
    const [activeChallenges] = useState<Challenge[]>(MOCK_ACTIVE_CHALLENGES);
    const [availableChallenges] = useState<Challenge[]>(MOCK_AVAILABLE_CHALLENGES);
    const [refreshing, setRefreshing] = useState(false);
    const [totalBadges] = useState(12);

    // Filter available challenges based on selected category
    const filteredChallenges = selectedFilter === 'all'
        ? availableChallenges
        : availableChallenges.filter(c => c.category === selectedFilter);

    // Handle refresh
    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    };

    // Toggle quest completion
    const toggleQuestComplete = (questId: string) => {
        setDailyQuests(prev =>
            prev.map(quest =>
                quest.id === questId
                    ? { ...quest, completed: !quest.completed }
                    : quest
            )
        );
    };

    // Navigate to challenge detail
    const navigateToChallengeDetail = (challengeId: string) => {
        // TODO: Navigate to challenge detail screen
        // router.push(`/screens/challengeDetail?id=${challengeId}`);
        Alert.alert('Challenge Detail', `Navigating to challenge ${challengeId}`);
    };

    // Start a new challenge
    const startChallenge = (challengeId: string) => {
        Alert.alert(
            'Mulai Tantangan',
            'Yakin ingin memulai tantangan ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Mulai',
                    onPress: () => {
                        navigateToChallengeDetail(challengeId);
                    },
                },
            ]
        );
    };

    // =====================================================
    // RENDER DAILY QUEST CARD
    // =====================================================

    const renderDailyQuestCard = (quest: DailyQuest) => {
        const progressPercentage = (quest.progress / quest.target) * 100;

        return (
            <Pressable
                key={quest.id}
                onPress={() => toggleQuestComplete(quest.id)}
                className="flex-row items-center justify-between py-3 px-4 bg-white rounded-xl mb-2"
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
                {/* Left - Icon */}
                <View className="w-10 h-10 rounded-full bg-[#FFF9E6] items-center justify-center">
                    <Ionicons name={quest.icon as any} size={20} color="#FFD93D" />
                </View>

                {/* Middle - Quest Info */}
                <View className="flex-1 mx-3">
                    <Text className="text-sm font-semibold text-black">{quest.title}</Text>
                    {!quest.completed && (
                        <Text className="text-xs text-[#6B7280] mt-0.5">
                            {quest.progress}/{quest.target} {quest.progress >= quest.target ? '✓' : ''}
                        </Text>
                    )}
                    {quest.completed && (
                        <Text className="text-xs text-[#ABE7B2] font-medium mt-0.5">
                            Selesai! ✓
                        </Text>
                    )}
                </View>

                {/* Right - Points & Checkbox */}
                <View className="flex-row items-center gap-2">
                    <View className="px-2 py-1 bg-[#FFF9E6] rounded-full">
                        <Text className="text-xs font-medium text-[#FFD93D]">+{quest.points}</Text>
                    </View>
                    <View
                        className={`w-6 h-6 rounded border-2 items-center justify-center ${quest.completed ? 'bg-[#ABE7B2] border-[#ABE7B2]' : 'border-[#E5E7EB]'
                            }`}
                    >
                        {quest.completed && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                </View>
            </Pressable>
        );
    };

    // =====================================================
    // RENDER ACTIVE CHALLENGE CARD
    // =====================================================

    const renderActiveChallengeCard = (challenge: Challenge) => {
        const progress = (challenge.completedDays / challenge.totalDays) * 100;
        const gradient = getCategoryGradient(challenge.category);

        return (
            <Pressable
                key={challenge.id}
                onPress={() => navigateToChallengeDetail(challenge.id)}
                className="mr-3"
                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-40 h-48 rounded-2xl p-4"
                    style={{ elevation: 2 }}
                >
                    {/* Top Row - Icon & Streak */}
                    <View className="flex-row justify-between items-start mb-3">
                        <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center">
                            <Ionicons name={challenge.icon as any} size={22} color="white" />
                        </View>
                        <View className="flex-row items-center bg-white/30 px-2 py-1 rounded-full">
                            <Text className="text-base font-bold text-white mr-1">🔥</Text>
                            <Text className="text-sm font-bold text-white">{challenge.streak}</Text>
                        </View>
                    </View>

                    {/* Challenge Title */}
                    <Text className="text-sm font-bold text-white mb-2" numberOfLines={2}>
                        {challenge.title}
                    </Text>

                    {/* Progress Text */}
                    <Text className="text-xs text-white/80 mb-2">
                        Hari {challenge.currentDay}/{challenge.totalDays}
                    </Text>

                    {/* Progress Bar */}
                    <View className="w-full h-2 bg-white/30 rounded-full overflow-hidden mb-3">
                        <View
                            className="h-full bg-white rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </View>

                    {/* Next Task */}
                    <Text className="text-xs text-white/90" numberOfLines={2}>
                        {challenge.target}
                    </Text>
                </LinearGradient>
            </Pressable>
        );
    };

    // =====================================================
    // RENDER AVAILABLE CHALLENGE CARD
    // =====================================================

    const renderAvailableChallengeCard = ({ item: challenge }: { item: Challenge }) => {
        const gradient = getCategoryGradient(challenge.category);
        const difficultyStars = getDifficultyStars(challenge.difficulty);

        return (
            <Pressable
                onPress={() => navigateToChallengeDetail(challenge.id)}
                className="mb-3"
                style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
            >
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="flex-row items-center rounded-2xl p-4"
                    style={{ elevation: 1 }}
                >
                    {/* Left - Icon & Category */}
                    <View className="items-center mr-4">
                        <View className="w-14 h-14 rounded-full bg-white/30 items-center justify-center mb-2">
                            <Ionicons name={challenge.icon as any} size={28} color="white" />
                        </View>
                        <View className="px-2 py-0.5 bg-white/30 rounded-full">
                            <Text className="text-xs text-white font-medium">
                                {challenge.category === 'physical' && '💪'}
                                {challenge.category === 'nutrition' && '🥗'}
                                {challenge.category === 'lifestyle' && '😴'}
                            </Text>
                        </View>
                    </View>

                    {/* Middle - Challenge Info */}
                    <View className="flex-1 mr-3">
                        <Text className="text-base font-bold text-white mb-1">
                            {challenge.title}
                        </Text>

                        {/* Duration & Difficulty */}
                        <View className="flex-row items-center gap-2 mb-1">
                            <View className="px-2 py-0.5 bg-white/30 rounded-full">
                                <Text className="text-xs text-white">{challenge.duration} Hari</Text>
                            </View>
                            <View className="flex-row items-center">
                                {[...Array(difficultyStars)].map((_, i) => (
                                    <Ionicons key={i} name="star" size={10} color="white" />
                                ))}
                                <Text className="text-xs text-white/80 ml-1">
                                    {getDifficultyLabel(challenge.difficulty)}
                                </Text>
                            </View>
                        </View>

                        {/* Participants */}
                        <View className="flex-row items-center">
                            <Ionicons name="people" size={12} color="white" />
                            <Text className="text-xs text-white/80 ml-1">
                                {challenge.participantsCount} orang ikut
                            </Text>
                        </View>
                    </View>

                    {/* Right - Reward & Button */}
                    <View className="items-end">
                        <View className="items-center mb-2">
                            <Ionicons name="trophy" size={20} color="white" />
                            <Text className="text-xs font-semibold text-white mt-1">
                                +{challenge.totalPoints}
                            </Text>
                        </View>
                        <Pressable
                            onPress={() => startChallenge(challenge.id)}
                            className="px-3 py-1.5 bg-white rounded-full"
                            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                        >
                            <Text className="text-xs font-semibold text-black">Mulai</Text>
                        </Pressable>
                    </View>
                </LinearGradient>
            </Pressable>
        );
    };

    // =====================================================
    // RENDER EMPTY STATE
    // =====================================================

    const renderEmptyState = () => (
        <View className="items-center py-12 px-6">
            <View className="w-20 h-20 rounded-full bg-[#ECF4E8] items-center justify-center mb-4">
                <Ionicons name="flag-outline" size={40} color="#ABE7B2" />
            </View>
            <Text className="text-lg font-bold text-black mb-2 text-center">
                Belum ada tantangan aktif
            </Text>
            <Text className="text-sm text-[#6B7280] text-center mb-4">
                Pilih tantangan dan mulai petualangan kesehatanmu!
            </Text>
            <Pressable
                className="bg-[#ABE7B2] px-6 py-3 rounded-full"
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
                <Text className="text-sm font-semibold text-black">Jelajahi Tantangan</Text>
            </Pressable>
        </View>
    );

    // =====================================================
    // MAIN RENDER
    // =====================================================

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#ABE7B2"
                        colors={['#ABE7B2']}
                    />
                }
            >
                {/* HEADER */}
                <View className="px-4 pt-4 pb-3">
                    <View className="flex-row justify-between items-start">
                        <View>
                            <Text className="text-2xl font-bold text-black">Tantangan</Text>
                            <Text className="text-sm text-[#6B7280] mt-1">Raih badgemu!</Text>
                        </View>
                        <View className="flex-row items-center bg-[#FFF9E6] px-3 py-2 rounded-full">
                            <Ionicons name="trophy" size={20} color="#FFD93D" />
                            <Text className="text-sm font-bold text-black ml-1">{totalBadges}</Text>
                        </View>
                    </View>
                </View>

                {/* DAILY QUEST SECTION */}
                <View className="px-4 mb-4">
                    <View className="bg-[#FFF9E6] rounded-2xl p-4" style={{ elevation: 1 }}>
                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <Ionicons name="flash" size={20} color="#FFD93D" />
                                <Text className="text-base font-bold text-black ml-2">Quest Harian</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={14} color="#6B7280" />
                                <Text className="text-xs text-[#6B7280] ml-1">
                                    Reset dalam {formatTimeRemaining(dailyQuests[0].resetTime)}
                                </Text>
                            </View>
                        </View>

                        {dailyQuests.map(quest => renderDailyQuestCard(quest))}
                    </View>
                </View>

                {/* ACTIVE CHALLENGES SECTION */}
                <View className="mb-4">
                    <View className="flex-row justify-between items-center px-4 mb-3">
                        <View className="flex-row items-center">
                            <Text className="text-base font-bold text-black">Tantangan Aktif</Text>
                            <View className="ml-2 px-2 py-0.5 bg-[#ABE7B2] rounded-full">
                                <Text className="text-xs font-semibold text-black">
                                    {activeChallenges.length}
                                </Text>
                            </View>
                        </View>
                        {activeChallenges.length > 2 && (
                            <Pressable>
                                <Text className="text-sm text-[#ABE7B2] font-medium">Lihat Semua</Text>
                            </Pressable>
                        )}
                    </View>

                    {activeChallenges.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 16 }}
                        >
                            {activeChallenges.map(challenge => renderActiveChallengeCard(challenge))}
                        </ScrollView>
                    ) : (
                        renderEmptyState()
                    )}
                </View>

                {/* AVAILABLE CHALLENGES SECTION */}
                <View className="px-4 pb-6">
                    <Text className="text-base font-bold text-black mb-3">Tantangan Tersedia</Text>

                    {/* Category Filter Pills */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                        contentContainerStyle={{ gap: 8 }}
                    >
                        {FILTER_OPTIONS.map(filter => {
                            const isActive = selectedFilter === filter.value;
                            return (
                                <Pressable
                                    key={filter.id}
                                    onPress={() => setSelectedFilter(filter.value)}
                                    className={`px-4 py-2 rounded-full flex-row items-center ${isActive ? 'bg-[#ABE7B2]' : 'bg-white border border-[#E5E7EB]'
                                        }`}
                                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                                >
                                    <Text className="text-sm mr-1">{filter.emoji}</Text>
                                    <Text
                                        className={`text-sm font-medium ${isActive ? 'text-black' : 'text-[#6B7280]'
                                            }`}
                                    >
                                        {filter.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    {/* Challenge List */}
                    <FlatList
                        data={filteredChallenges}
                        renderItem={renderAvailableChallengeCard}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <View className="items-center py-8">
                                <Text className="text-sm text-[#6B7280]">
                                    Tidak ada tantangan di kategori ini
                                </Text>
                            </View>
                        }
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}