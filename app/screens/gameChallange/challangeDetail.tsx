import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Share,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// =====================================================
// TYPESCRIPT INTERFACES & TYPES
// =====================================================

type ChallengeCategory = 'physical' | 'nutrition' | 'lifestyle';
type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
type DayStatus = 'completed' | 'today' | 'future' | 'missed';

interface ChallengeDay {
    day: number;
    date: Date;
    status: DayStatus;
    completed: boolean;
    hasReward: boolean;
    rewardClaimed?: boolean;
}

interface ChallengeDetail {
    id: string;
    title: string;
    description: string;
    category: ChallengeCategory;
    difficulty: ChallengeDifficulty;
    duration: number;
    currentDay: number;
    totalDays: number;
    streak: number;
    completedDays: number;
    target: string;
    icon: string;
    totalPoints: number;
    dailyPoints: number;
    badgeName: string;
    participantsCount: number;
    days: ChallengeDay[];
    rules: string[];
    tips: string[];
    isActive: boolean;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getCategoryGradient = (category: ChallengeCategory): readonly [string, string] => {
    switch (category) {
        case 'physical':
            return ['#ABE7B2', '#93BFC7'] as const;
        case 'nutrition':
            return ['#ECF4E8', '#CBF3BB'] as const;
        case 'lifestyle':
            return ['#93BFC7', '#ABE7B2'] as const;
        default:
            return ['#ECF4E8', '#CBF3BB'] as const;
    }
};

const getCategoryAccent = (category: ChallengeCategory): string => {
    switch (category) {
        case 'physical':
            return '#ABE7B2';
        case 'nutrition':
            return '#CBF3BB';
        case 'lifestyle':
            return '#93BFC7';
        default:
            return '#ABE7B2';
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

// Generate mock challenge days
const generateChallengeDays = (totalDays: number, currentDay: number): ChallengeDay[] => {
    const days: ChallengeDay[] = [];
    const rewardDays = [7, 15, 23]; // Random reward days

    for (let i = 1; i <= totalDays; i++) {
        let status: DayStatus;
        if (i < currentDay) {
            status = 'completed';
        } else if (i === currentDay) {
            status = 'today';
        } else {
            status = 'future';
        }

        days.push({
            day: i,
            date: new Date(Date.now() + (i - currentDay) * 24 * 60 * 60 * 1000),
            status,
            completed: i < currentDay,
            hasReward: rewardDays.includes(i),
            rewardClaimed: i < currentDay && rewardDays.includes(i),
        });
    }

    return days;
};

// =====================================================
// MOCK DATA
// =====================================================

const MOCK_CHALLENGE: ChallengeDetail = {
    id: 'ac1',
    title: '30 Hari Lari 5KM',
    description: 'Lari minimal 5km setiap hari selama 30 hari untuk meningkatkan stamina dan kesehatan jantung',
    category: 'physical',
    difficulty: 'hard',
    duration: 30,
    currentDay: 7,
    totalDays: 30,
    streak: 7,
    completedDays: 7,
    target: 'Lari minimal 5km per hari',
    icon: 'bicycle',
    totalPoints: 300,
    dailyPoints: 10,
    badgeName: 'Marathon Runner Badge',
    participantsCount: 245,
    days: generateChallengeDays(30, 7),
    rules: [
        'Lari minimal 5km setiap hari',
        'Tidak boleh skip lebih dari 2 hari berturut-turut',
        'Catat progress di tracker rutin',
        'Jangan lupa pemanasan dan pendinginan',
    ],
    tips: [
        'Mulai dengan kecepatan yang nyaman',
        'Tingkatkan jarak secara bertahap',
        'Jaga hidrasi sebelum, saat, dan setelah lari',
        'Gunakan sepatu lari yang tepat',
        'Dengarkan tubuhmu, istirahat jika perlu',
    ],
    isActive: true,
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function ChallengeDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [challenge, setChallenge] = useState<ChallengeDetail>(MOCK_CHALLENGE);
    const [showRulesExpanded, setShowRulesExpanded] = useState(false);
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [todayMarkedComplete, setTodayMarkedComplete] = useState(false);

    const progress = (challenge.completedDays / challenge.totalDays) * 100;
    const remainingDays = challenge.totalDays - challenge.currentDay + 1;
    const totalEarnedPoints = challenge.completedDays * challenge.dailyPoints;
    const gradient = getCategoryGradient(challenge.category);
    const accentColor = getCategoryAccent(challenge.category);

    // Handle mark today as complete
    const handleMarkComplete = () => {
        Alert.alert(
            'Tandai Selesai',
            `Sudah ${challenge.target.toLowerCase()} hari ini?`,
            [
                { text: 'Belum', style: 'cancel' },
                {
                    text: 'Sudah!',
                    onPress: () => {
                        // Update challenge state
                        setChallenge(prev => ({
                            ...prev,
                            completedDays: prev.completedDays + 1,
                            currentDay: prev.currentDay + 1,
                            streak: prev.streak + 1,
                            days: prev.days.map(day =>
                                day.day === prev.currentDay
                                    ? { ...day, status: 'completed', completed: true }
                                    : day.day === prev.currentDay + 1
                                        ? { ...day, status: 'today' }
                                        : day
                            ),
                        }));

                        setTodayMarkedComplete(true);

                        // Check if today has reward
                        const today = challenge.days.find(d => d.day === challenge.currentDay);
                        if (today?.hasReward) {
                            setTimeout(() => {
                                setShowRewardModal(true);
                            }, 500);
                        }

                        // TODO: Integration with Tracker
                        // Auto-update from tracker data
                    },
                },
            ]
        );
    };

    // Handle share achievement
    const handleShare = async () => {
        try {
            await Share.share({
                message: `🎉 Saya sudah menyelesaikan ${challenge.completedDays} hari dari ${challenge.title}! Streak ${challenge.streak} hari 🔥\n\nYuk ikutan tantangan kesehatan di Habitin!`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    // Handle start challenge
    const handleStartChallenge = () => {
        Alert.alert(
            'Mulai Tantangan',
            `Siap memulai ${challenge.title}?`,
            [
                { text: 'Nanti Dulu', style: 'cancel' },
                {
                    text: 'Mulai Sekarang!',
                    onPress: () => {
                        setChallenge(prev => ({
                            ...prev,
                            isActive: true,
                            currentDay: 1,
                            days: prev.days.map(day =>
                                day.day === 1 ? { ...day, status: 'today' } : day
                            ),
                        }));
                    },
                },
            ]
        );
    };

    // =====================================================
    // RENDER CIRCULAR PROGRESS
    // =====================================================

    const renderCircularProgress = () => {
        const size = 120;
        const strokeWidth = 10;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const progressOffset = circumference - (progress / 100) * circumference;

        return (
            <View className="items-center justify-center" style={{ width: size, height: size }}>
                <svg width={size} height={size}>
                    {/* Background Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#E5E7EB"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={accentColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={progressOffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </svg>
                <View className="absolute items-center justify-center">
                    <Text className="text-3xl font-bold text-black">
                        {challenge.currentDay}
                    </Text>
                    <Text className="text-sm text-[#6B7280]">/{challenge.totalDays}</Text>
                </View>
            </View>
        );
    };

    // =====================================================
    // RENDER CALENDAR GRID
    // =====================================================

    const renderCalendarGrid = () => {
        const rows: ChallengeDay[][] = [];
        for (let i = 0; i < challenge.days.length; i += 7) {
            rows.push(challenge.days.slice(i, i + 7));
        }

        return (
            <View className="bg-white rounded-2xl p-4" style={{ elevation: 1 }}>
                <Text className="text-base font-bold text-black mb-4">Checklist Harian</Text>

                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-row justify-between mb-2">
                        {row.map((day) => {
                            let bgColor = '#E5E7EB'; // future (gray)
                            let textColor = '#6B7280';
                            let borderColor = 'transparent';
                            let icon: string | null = null;

                            if (day.status === 'completed') {
                                bgColor = '#ABE7B2'; // completed (green)
                                textColor = 'white';
                                icon = 'checkmark';
                            } else if (day.status === 'today') {
                                bgColor = 'white';
                                textColor = accentColor;
                                borderColor = accentColor;
                            } else if (day.status === 'missed') {
                                bgColor = '#FF6B6B'; // missed (red)
                                textColor = 'white';
                                icon = 'close';
                            }

                            return (
                                <Pressable
                                    key={day.day}
                                    className="items-center justify-center rounded-xl relative"
                                    style={{
                                        width: 42,
                                        height: 42,
                                        backgroundColor: bgColor,
                                        borderWidth: borderColor !== 'transparent' ? 2 : 0,
                                        borderColor: borderColor,
                                    }}
                                >
                                    {/* Reward Badge */}
                                    {day.hasReward && !day.completed && (
                                        <View className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFD93D] rounded-full items-center justify-center">
                                            <Ionicons name="gift" size={10} color="white" />
                                        </View>
                                    )}

                                    {icon ? (
                                        <Ionicons name={icon as any} size={20} color={textColor} />
                                    ) : (
                                        <Text className="text-sm font-semibold" style={{ color: textColor }}>
                                            {day.day}
                                        </Text>
                                    )}

                                    {/* Reward Claimed Indicator */}
                                    {day.hasReward && day.rewardClaimed && (
                                        <View className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFD93D] rounded-full items-center justify-center">
                                            <Ionicons name="star" size={10} color="white" />
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                ))}
            </View>
        );
    };

    // =====================================================
    // RENDER REWARD MODAL
    // =====================================================

    const renderRewardModal = () => (
        <Modal
            visible={showRewardModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowRewardModal(false)}
        >
            <View className="flex-1 bg-black/50 items-center justify-center px-6">
                <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center">
                    <View className="w-20 h-20 bg-[#FFF9E6] rounded-full items-center justify-center mb-4">
                        <Text className="text-4xl">🎁</Text>
                    </View>

                    <Text className="text-xl font-bold text-black mb-2 text-center">
                        Surprise Reward!
                    </Text>

                    <Text className="text-sm text-[#6B7280] text-center mb-4">
                        Selamat! Kamu mendapat hadiah spesial
                    </Text>

                    <View className="bg-[#ECF4E8] rounded-2xl p-4 w-full mb-4">
                        <View className="flex-row items-center justify-center mb-2">
                            <Ionicons name="trophy" size={24} color="#FFD93D" />
                            <Text className="text-lg font-bold text-black ml-2">+50 Bonus Poin</Text>
                        </View>
                        <Text className="text-xs text-[#6B7280] text-center">
                            Terus konsisten untuk unlock reward lainnya!
                        </Text>
                    </View>

                    <Pressable
                        onPress={() => setShowRewardModal(false)}
                        className="bg-[#ABE7B2] px-8 py-3 rounded-full w-full"
                        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                    >
                        <Text className="text-sm font-semibold text-black text-center">
                            Mantap! 🎉
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );

    // =====================================================
    // MAIN RENDER
    // =====================================================

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={['top']}>
            {/* HEADER */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#F3F4F6]">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center"
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                    <Ionicons name="chevron-back" size={24} color="black" />
                </Pressable>

                <Text className="text-base font-semibold text-black flex-1 text-center" numberOfLines={1}>
                    Detail Tantangan
                </Text>

                <Pressable
                    onPress={handleShare}
                    className="w-10 h-10 items-center justify-center"
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                    <Ionicons name="share-outline" size={22} color="black" />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* HERO SECTION */}
                <View className="px-4 pt-4">
                    <LinearGradient
                        colors={gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-3xl p-6 items-center"
                        style={{ elevation: 2 }}
                    >
                        {/* Icon */}
                        <View className="w-24 h-24 rounded-full bg-white/30 items-center justify-center mb-4">
                            <Ionicons name={challenge.icon as any} size={48} color="white" />
                        </View>

                        {/* Title */}
                        <Text className="text-xl font-bold text-white text-center mb-2">
                            {challenge.title}
                        </Text>

                        {/* Badges */}
                        <View className="flex-row items-center gap-2 mb-4">
                            <View className="px-3 py-1 bg-white/30 rounded-full">
                                <Text className="text-xs font-medium text-white">
                                    {challenge.duration} Hari
                                </Text>
                            </View>
                            <View className="px-3 py-1 bg-white/30 rounded-full">
                                <Text className="text-xs font-medium text-white">
                                    {getDifficultyLabel(challenge.difficulty)}
                                </Text>
                            </View>
                        </View>

                        {/* Streak */}
                        {challenge.isActive && (
                            <View className="flex-row items-center bg-white/30 px-4 py-2 rounded-full">
                                <Text className="text-2xl mr-2">🔥</Text>
                                <Text className="text-lg font-bold text-white">
                                    Streak: {challenge.streak} hari
                                </Text>
                            </View>
                        )}
                    </LinearGradient>
                </View>

                {/* PROGRESS OVERVIEW */}
                {challenge.isActive && (
                    <View className="px-4 pt-4">
                        <View className="bg-white rounded-2xl p-4" style={{ elevation: 1 }}>
                            {/* Circular Progress */}
                            <View className="items-center mb-4">
                                {renderCircularProgress()}
                                <Text className="text-lg font-bold text-black mt-2">{Math.round(progress)}%</Text>
                                <Text className="text-sm text-[#6B7280]">Progress Selesai</Text>
                            </View>

                            {/* Stats Grid */}
                            <View className="flex-row justify-between pt-4 border-t border-[#F3F4F6]">
                                <View className="flex-1 items-center">
                                    <Ionicons name="checkmark-circle" size={24} color="#ABE7B2" />
                                    <Text className="text-xl font-bold text-black mt-1">
                                        {challenge.completedDays}
                                    </Text>
                                    <Text className="text-xs text-[#6B7280]">Hari Selesai</Text>
                                </View>

                                <View className="w-px bg-[#F3F4F6]" />

                                <View className="flex-1 items-center">
                                    <Ionicons name="time-outline" size={24} color="#FFD93D" />
                                    <Text className="text-xl font-bold text-black mt-1">
                                        {remainingDays}
                                    </Text>
                                    <Text className="text-xs text-[#6B7280]">Hari Tersisa</Text>
                                </View>

                                <View className="w-px bg-[#F3F4F6]" />

                                <View className="flex-1 items-center">
                                    <Ionicons name="trophy" size={24} color="#FFD93D" />
                                    <Text className="text-xl font-bold text-black mt-1">
                                        {totalEarnedPoints}
                                    </Text>
                                    <Text className="text-xs text-[#6B7280]">Total Poin</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* CALENDAR CHECKLIST */}
                {challenge.isActive && (
                    <View className="px-4 pt-4">
                        {renderCalendarGrid()}
                    </View>
                )}

                {/* MARK COMPLETE SECTION */}
                {challenge.isActive && !todayMarkedComplete && (
                    <View className="px-4 pt-4">
                        <LinearGradient
                            colors={gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="rounded-2xl p-4"
                            style={{ elevation: 1 }}
                        >
                            <View className="flex-row items-center mb-3">
                                <View className="w-12 h-12 rounded-full bg-white/30 items-center justify-center mr-3">
                                    <Ionicons name="checkmark-circle" size={28} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-bold text-white mb-1">
                                        Sudah selesai hari ini?
                                    </Text>
                                    <Text className="text-sm text-white/80">
                                        {challenge.target}
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={handleMarkComplete}
                                className="bg-white py-3 rounded-xl"
                                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
                            >
                                <Text className="text-center text-sm font-bold text-black">
                                    Tandai Selesai
                                </Text>
                            </Pressable>
                        </LinearGradient>
                    </View>
                )}

                {/* TODAY COMPLETED MESSAGE */}
                {todayMarkedComplete && (
                    <View className="px-4 pt-4">
                        <View className="bg-[#ABE7B2] rounded-2xl p-4 flex-row items-center">
                            <Ionicons name="checkmark-circle" size={32} color="white" />
                            <View className="flex-1 ml-3">
                                <Text className="text-base font-bold text-white">Selesai! 🎉</Text>
                                <Text className="text-sm text-white/90">
                                    Kembali lagi besok untuk melanjutkan
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* REWARD PREVIEW */}
                <View className="px-4 pt-4">
                    <View className="bg-white rounded-2xl p-4" style={{ elevation: 1 }}>
                        <Text className="text-base font-bold text-black mb-3">Hadiah</Text>

                        {/* Completion Reward */}
                        <View className="bg-[#ECF4E8] rounded-xl p-3 mb-2 flex-row items-center">
                            <View className="w-12 h-12 bg-[#ABE7B2] rounded-full items-center justify-center mr-3">
                                <Ionicons name="trophy" size={24} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-bold text-black">{challenge.badgeName}</Text>
                                <Text className="text-xs text-[#6B7280]">+{challenge.totalPoints} poin</Text>
                            </View>
                        </View>

                        {/* Streak Bonus */}
                        <View className="bg-[#FFF9E6] rounded-xl p-3 mb-2 flex-row items-center">
                            <Text className="text-2xl mr-3">🔥</Text>
                            <View className="flex-1">
                                <Text className="text-sm font-bold text-black">Bonus Streak</Text>
                                <Text className="text-xs text-[#6B7280]">
                                    +{challenge.dailyPoints} poin per hari
                                </Text>
                            </View>
                        </View>

                        {/* Mystery Rewards */}
                        <View className="bg-[#FFF9E6] rounded-xl p-3 flex-row items-center">
                            <Text className="text-2xl mr-3">🎁</Text>
                            <View className="flex-1">
                                <Text className="text-sm font-bold text-black">Hadiah Surprise</Text>
                                <Text className="text-xs text-[#6B7280]">
                                    Di beberapa hari tertentu!
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* CHALLENGE INFO & RULES */}
                <View className="px-4 pt-4">
                    <View className="bg-white rounded-2xl p-4" style={{ elevation: 1 }}>
                        <Pressable
                            onPress={() => setShowRulesExpanded(!showRulesExpanded)}
                            className="flex-row items-center justify-between mb-3"
                        >
                            <Text className="text-base font-bold text-black">Info & Aturan</Text>
                            <Ionicons
                                name={showRulesExpanded ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#6B7280"
                            />
                        </Pressable>

                        {showRulesExpanded && (
                            <>
                                {/* Description */}
                                <Text className="text-sm text-[#6B7280] mb-4 leading-5">
                                    {challenge.description}
                                </Text>

                                {/* Rules */}
                                <Text className="text-sm font-semibold text-black mb-2">Aturan:</Text>
                                {challenge.rules.map((rule, index) => (
                                    <View key={index} className="flex-row mb-2">
                                        <Text className="text-sm text-[#6B7280] mr-2">•</Text>
                                        <Text className="text-sm text-[#6B7280] flex-1">{rule}</Text>
                                    </View>
                                ))}

                                {/* Tips */}
                                <Text className="text-sm font-semibold text-black mb-2 mt-3">Tips Sukses:</Text>
                                {challenge.tips.map((tip, index) => (
                                    <View key={index} className="flex-row mb-2">
                                        <Text className="text-sm text-[#6B7280] mr-2">✓</Text>
                                        <Text className="text-sm text-[#6B7280] flex-1">{tip}</Text>
                                    </View>
                                ))}
                            </>
                        )}
                    </View>
                </View>

                {/* PARTICIPANTS */}
                <View className="px-4 pt-4 pb-24">
                    <View className="bg-white rounded-2xl p-4 flex-row items-center" style={{ elevation: 1 }}>
                        <Ionicons name="people" size={24} color="#ABE7B2" />
                        <Text className="text-sm text-[#6B7280] ml-2">
                            {challenge.participantsCount} orang ikut tantangan ini
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* BOTTOM ACTION BUTTON */}
            {!challenge.isActive && (
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] px-4 py-4">
                    <Pressable
                        onPress={handleStartChallenge}
                        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
                    >
                        <LinearGradient
                            colors={gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="py-4 rounded-full"
                        >
                            <Text className="text-center text-base font-bold text-white">
                                Mulai Tantangan
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            )}

            {/* REWARD MODAL */}
            {renderRewardModal()}
        </SafeAreaView>
    );
}