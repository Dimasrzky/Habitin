import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import * as Haptics from 'expo-haptics';
import { useChallengeStore } from '@/stores/useChallengeStore';
import { ChallengeTask, UserActiveChallenge } from '@/types/challenge.types';

// =====================================================
// TYPESCRIPT INTERFACES & TYPES
// =====================================================

type ChallengeCategory = 'physical' | 'nutrition' | 'lifestyle';


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

// =====================================================
// TASK CHECKBOX COMPONENT
// =====================================================

interface TaskCheckboxItemProps {
    task: ChallengeTask;
    isCompleted: boolean;
    isDisabled: boolean;
    onToggle: () => void;
}

const TaskCheckboxItem: React.FC<TaskCheckboxItemProps> = ({
    task,
    isCompleted,
    isDisabled,
    onToggle,
}) => (
    <Pressable
        onPress={onToggle}
        disabled={isDisabled}
        className={`flex-row items-center p-3 mb-2 rounded-xl ${isCompleted ? 'bg-[#ECF4E8]' : 'bg-[#F3F4F6]'
            }`}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : isDisabled ? 0.5 : 1 })}
    >
        {/* Checkbox */}
        <View
            className={`w-6 h-6 rounded-full mr-3 items-center justify-center ${isCompleted ? 'bg-[#ABE7B2]' : 'bg-[#9CA3AF]'
                }`}
        >
            {isCompleted && <Ionicons name="checkmark" size={16} color="white" />}
        </View>

        {/* Icon emoji */}
        <Text className="text-2xl mr-2">{task.icon}</Text>

        {/* Task text */}
        <View className="flex-1">
            <Text
                className={`text-sm font-medium ${isCompleted ? 'text-[#6B7280] line-through' : 'text-black'
                    }`}
            >
                {task.text}
            </Text>
        </View>

        {/* Points badge */}
        <View className="bg-[#FFF9E6] px-2 py-1 rounded-full">
            <Text className="text-xs font-semibold text-[#FFD93D]">+{task.points}</Text>
        </View>
    </Pressable>
);


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function ChallengeDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ challengeId: string }>();
    const { activeChallenges, completeTaskAction } = useChallengeStore();

    const [challenge, setChallenge] = useState<UserActiveChallenge | null>(null);
    const [showRulesExpanded, setShowRulesExpanded] = useState(false);
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [lastDayComplete, setLastDayComplete] = useState(false);

    // Fetch real challenge data from store
    useEffect(() => {
        const foundChallenge = activeChallenges.find(c => c.id === params.challengeId);
        if (foundChallenge) {
            setChallenge(foundChallenge);

            // Check if day just completed for reward modal
            const dayKey = `day_${foundChallenge.current_day}`;
            const justCompleted = foundChallenge.daily_progress[dayKey]?.is_complete && !lastDayComplete;
            if (justCompleted) {
                setShowRewardModal(true);
                setLastDayComplete(true);
            }
        }
    }, [activeChallenges, params.challengeId, lastDayComplete]);

    // Show loading or not found state
    if (!challenge) {
        return (
            <SafeAreaView className="flex-1 bg-[#F9FAFB] items-center justify-center">
                <Text className="text-base text-[#6B7280]">Tantangan tidak ditemukan</Text>
                <Pressable
                    onPress={() => router.back()}
                    className="mt-4 px-6 py-3 bg-[#ABE7B2] rounded-full"
                >
                    <Text className="text-sm font-semibold text-white">Kembali</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    const masterChallenge = challenge.challenge!;

    // Helper functions
    const isTaskCompleted = (taskId: string): boolean => {
        const dayKey = `day_${challenge.current_day}`;
        const completed = challenge.daily_progress[dayKey]?.completed_tasks || [];
        return completed.includes(taskId);
    };

    const isDayCompleteCheck = (): boolean => {
        const dayKey = `day_${challenge.current_day}`;
        return challenge.daily_progress[dayKey]?.is_complete || false;
    };

    const getCompletedTasksCount = (): number => {
        const dayKey = `day_${challenge.current_day}`;
        return challenge.daily_progress[dayKey]?.completed_tasks?.length || 0;
    };

    const getCompletedDaysCount = (): number => {
        return Object.values(challenge.daily_progress).filter(d => d.is_complete).length;
    };

    // Calculated values
    const completedDays = getCompletedDaysCount();
    const progress = (completedDays / masterChallenge.duration_days) * 100;
    const remainingDays = masterChallenge.duration_days - challenge.current_day + 1;
    const dailyPoints = Math.floor(masterChallenge.total_points / masterChallenge.duration_days);
    const totalEarnedPoints = completedDays * dailyPoints;
    const gradient = getCategoryGradient(masterChallenge.category);
    const accentColor = getCategoryAccent(masterChallenge.category);

    // Handle task toggle
    const handleTaskToggle = async (taskId: string) => {
        if (isCompleting) return;

        const isAlreadyCompleted = isTaskCompleted(taskId);

        // Prevent unchecking (optional - bisa diubah jika mau allow unchecking)
        if (isAlreadyCompleted) {
            return;
        }

        try {
            setIsCompleting(true);

            // Call store action
            await completeTaskAction(challenge.id, taskId);

            // Haptic feedback
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Check if day just completed
            const updatedChallenge = activeChallenges.find(c => c.id === challenge.id);
            if (updatedChallenge) {
                const dayKey = `day_${updatedChallenge.current_day}`;
                const updatedDayProgress = updatedChallenge.daily_progress[dayKey];

                // Show reward modal if day complete
                if (updatedDayProgress?.is_complete && !lastDayComplete) {
                    setTimeout(() => {
                        setShowRewardModal(true);
                        setLastDayComplete(true);
                    }, 300);
                }
            }
        } catch (error: any) {
            console.error('Error completing task:', error);
            Alert.alert('Error', error.message || 'Gagal menyelesaikan task');
        } finally {
            setIsCompleting(false);
        }
    };

    // Handle share achievement
    const handleShare = async () => {
        try {
            await Share.share({
                message: `🎉 Saya sudah menyelesaikan ${completedDays} hari dari ${masterChallenge.title}! Streak ${challenge.current_streak} hari 🔥\n\nYuk ikutan tantangan kesehatan di Habitin!`,
            });
        } catch (error) {
            console.error(error);
        }
    };


    // =====================================================
    // RENDER CIRCULAR PROGRESS
    // =====================================================

    const renderCircularProgress = () => {
        const size = 120;

        return (
            <View className="items-center justify-center" style={{ width: size, height: size }}>
                <View className="absolute items-center justify-center">
                    <Text className="text-3xl font-bold text-black">
                        {challenge.current_day}
                    </Text>
                    <Text className="text-sm text-[#6B7280]">/{masterChallenge.duration_days}</Text>
                </View>
            </View>
        );
    };

    // =====================================================
    // RENDER CALENDAR GRID
    // =====================================================

    const renderCalendarGrid = () => {
        const days = [];
        for (let i = 1; i <= masterChallenge.duration_days; i++) {
            const dayKey = `day_${i}`;
            const dayProgress = challenge.daily_progress[dayKey];

            days.push({
                day: i,
                isComplete: dayProgress?.is_complete || false,
                isCurrent: i === challenge.current_day,
                isUpcoming: i > challenge.current_day,
            });
        }

        const rows = [];
        for (let i = 0; i < days.length; i += 7) {
            rows.push(days.slice(i, i + 7));
        }

        return (
            <View className="bg-white rounded-2xl p-4" style={{ elevation: 1 }}>
                <Text className="text-base font-bold text-black mb-4">Progress Harian</Text>

                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-row justify-between mb-2">
                        {row.map((day) => {
                            let bgColor = '#E5E7EB';
                            let textColor = '#6B7280';
                            let borderColor = 'transparent';
                            let icon: string | null = null;

                            if (day.isComplete) {
                                bgColor = '#ABE7B2';
                                textColor = 'white';
                                icon = 'checkmark';
                            } else if (day.isCurrent) {
                                bgColor = 'white';
                                textColor = accentColor;
                                borderColor = accentColor;
                            }

                            return (
                                <View
                                    key={day.day}
                                    className="items-center justify-center rounded-xl"
                                    style={{
                                        width: 42,
                                        height: 42,
                                        backgroundColor: bgColor,
                                        borderWidth: borderColor !== 'transparent' ? 2 : 0,
                                        borderColor: borderColor,
                                    }}
                                >
                                    {icon ? (
                                        <Ionicons name={icon as any} size={20} color={textColor} />
                                    ) : (
                                        <Text className="text-sm font-semibold" style={{ color: textColor }}>
                                            {day.day}
                                        </Text>
                                    )}
                                </View>
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

    const renderRewardModal = () => {
        // Calculate points earned from daily tasks
        const dailyTasksPoints = masterChallenge.daily_tasks?.reduce((sum: number, task: ChallengeTask) => sum + (task.points || 0), 0) || 0;

        return (
            <Modal
                visible={showRewardModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowRewardModal(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center px-6">
                    <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center">
                        <View className="w-20 h-20 bg-[#FFF9E6] rounded-full items-center justify-center mb-4">
                            <Text className="text-4xl">🎉</Text>
                        </View>

                        <Text className="text-xl font-bold text-black mb-2 text-center">
                            Hari ke-{challenge.current_day} Selesai!
                        </Text>

                        <Text className="text-sm text-[#6B7280] text-center mb-4">
                            Hebat! Kamu telah menyelesaikan semua task hari ini
                        </Text>

                        <View className="bg-[#ECF4E8] rounded-2xl p-4 w-full mb-4">
                            <View className="flex-row items-center justify-center mb-2">
                                <Ionicons name="trophy" size={24} color="#FFD93D" />
                                <Text className="text-lg font-bold text-black ml-2">+{dailyTasksPoints} Poin</Text>
                            </View>
                            <View className="flex-row items-center justify-center">
                                <Text className="text-2xl mr-2">🔥</Text>
                                <Text className="text-sm text-[#6B7280]">
                                    Streak: {challenge.current_streak} hari
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={() => setShowRewardModal(false)}
                            className="bg-[#ABE7B2] px-8 py-3 rounded-full w-full"
                            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                        >
                            <Text className="text-sm font-semibold text-black text-center">
                                Lanjutkan! 💪
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        );
    };

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
                            <Text className="text-5xl">{masterChallenge.icon_emoji || '🎯'}</Text>
                        </View>

                        {/* Title */}
                        <Text className="text-xl font-bold text-white text-center mb-2">
                            {masterChallenge.title}
                        </Text>

                        {/* Badges */}
                        <View className="flex-row items-center gap-2 mb-4">
                            <View className="px-3 py-1 bg-white/30 rounded-full">
                                <Text className="text-xs font-medium text-white">
                                    {masterChallenge.duration_days} Hari
                                </Text>
                            </View>
                            <View className="px-3 py-1 bg-white/30 rounded-full">
                                <Text className="text-xs font-medium text-white">
                                    {masterChallenge.category}
                                </Text>
                            </View>
                        </View>

                        {/* Streak */}
                        {challenge.status === 'active' && (
                            <View className="flex-row items-center bg-white/30 px-4 py-2 rounded-full">
                                <Text className="text-2xl mr-2">🔥</Text>
                                <Text className="text-lg font-bold text-white">
                                    Streak: {challenge.current_streak} hari
                                </Text>
                            </View>
                        )}
                    </LinearGradient>
                </View>

                {/* PROGRESS OVERVIEW */}
                {challenge.status === 'active' && (
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
                                        {completedDays}
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
                {challenge.status === 'active' && (
                    <View className="px-4 pt-4">
                        {renderCalendarGrid()}
                    </View>
                )}

                {/* DAILY TASKS CHECKLIST - Show if challenge is active and within duration */}
                {challenge.status === 'active' && challenge.current_day <= masterChallenge.duration_days && (
                    <View className="px-4 pt-4">
                        <View className="bg-white rounded-2xl p-4" style={{ elevation: 1 }}>
                            <Text className="text-base font-bold text-black mb-3">
                                Task Hari Ini (Hari {challenge.current_day})
                            </Text>

                            {masterChallenge.daily_tasks && masterChallenge.daily_tasks.length > 0 ? (
                                <>
                                    {masterChallenge.daily_tasks.map((task: ChallengeTask) => {
                                        const taskCompleted = isTaskCompleted(task.id);
                                        const dayComplete = isDayCompleteCheck();

                                        return (
                                            <TaskCheckboxItem
                                                key={task.id}
                                                task={task}
                                                isCompleted={taskCompleted}
                                                isDisabled={dayComplete || isCompleting}
                                                onToggle={() => handleTaskToggle(task.id)}
                                            />
                                        );
                                    })}

                                    {/* Progress indicator */}
                                    <View className="mt-3 pt-3 border-t border-gray-200">
                                        <Text className="text-sm text-gray-600">
                                            {getCompletedTasksCount()}/{masterChallenge.daily_tasks.length} task selesai
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <Text className="text-sm text-gray-500">Tidak ada task untuk hari ini</Text>
                            )}
                        </View>
                    </View>
                )}

                {/* TODAY COMPLETED MESSAGE */}
                {isDayCompleteCheck() && challenge.status === 'active' && (
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
                                <Text className="text-sm font-bold text-black">Badge {masterChallenge.title}</Text>
                                <Text className="text-xs text-[#6B7280]">+{masterChallenge.total_points} poin total</Text>
                            </View>
                        </View>

                        {/* Streak Bonus */}
                        <View className="bg-[#FFF9E6] rounded-xl p-3 mb-2 flex-row items-center">
                            <Text className="text-2xl mr-3">🔥</Text>
                            <View className="flex-1">
                                <Text className="text-sm font-bold text-black">Bonus Streak</Text>
                                <Text className="text-xs text-[#6B7280]">
                                    Dapatkan poin dengan selesaikan task setiap hari
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
                                {masterChallenge.description && (
                                    <Text className="text-sm text-[#6B7280] mb-4 leading-5">
                                        {masterChallenge.description}
                                    </Text>
                                )}

                                {/* Daily Tasks List */}
                                <Text className="text-sm font-semibold text-black mb-2">Task Harian:</Text>
                                {masterChallenge.daily_tasks && masterChallenge.daily_tasks.map((task: ChallengeTask, index: number) => (
                                    <View key={index} className="flex-row mb-2">
                                        <Text className="text-sm mr-2">{task.icon}</Text>
                                        <Text className="text-sm text-[#6B7280] flex-1">{task.text}</Text>
                                    </View>
                                ))}

                                {/* Challenge Info */}
                                <Text className="text-sm font-semibold text-black mb-2 mt-3">Info Tantangan:</Text>
                                <View className="flex-row mb-2">
                                    <Text className="text-sm text-[#6B7280] mr-2">•</Text>
                                    <Text className="text-sm text-[#6B7280] flex-1">
                                        Durasi: {masterChallenge.duration_days} hari
                                    </Text>
                                </View>
                                <View className="flex-row mb-2">
                                    <Text className="text-sm text-[#6B7280] mr-2">•</Text>
                                    <Text className="text-sm text-[#6B7280] flex-1">
                                        Kategori: {masterChallenge.category}
                                    </Text>
                                </View>
                                <View className="flex-row mb-2">
                                    <Text className="text-sm text-[#6B7280] mr-2">•</Text>
                                    <Text className="text-sm text-[#6B7280] flex-1">
                                        Fokus Kesehatan: {masterChallenge.health_focus}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* BOTTOM SPACING */}
                <View className="px-4 pt-4 pb-24" />
            </ScrollView>

            {/* BOTTOM ACTION BUTTON - Only show for completed/abandoned challenges */}
            {(challenge.status === 'completed' || challenge.status === 'abandoned') && (
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] px-4 py-4">
                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
                    >
                        <LinearGradient
                            colors={gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="py-4 rounded-full"
                        >
                            <Text className="text-center text-base font-bold text-white">
                                {challenge.status === 'completed' ? 'Kembali' : 'Tutup'}
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