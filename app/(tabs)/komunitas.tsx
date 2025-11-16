import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    Share,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// =====================================================
// TYPESCRIPT INTERFACES & TYPES
// =====================================================

type PostType = 'progress' | 'tips' | 'photo';
type ReactionType = 'like' | 'support' | 'celebrate';

interface CommunityPost {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    userLevel: number;
    postType: PostType;
    content: string;
    timestamp: Date;
    metrics?: {
        steps?: number;
        calories?: number;
        distance?: number; // km
        duration?: number; // minutes
    };
    image?: string; // URL or require() for local
    reactions: {
        likes: number;
        supports: number;
        celebrates: number;
    };
    userReaction?: ReactionType;
}

interface FilterOption {
    id: string;
    label: string;
    value: PostType | 'all';
}

// =====================================================
// MOCK DATA
// =====================================================

const MOCK_POSTS: CommunityPost[] = [
    {
        id: '1',
        userId: 'user_001',
        userName: 'Sarah Wijaya',
        userLevel: 12,
        postType: 'progress',
        content: 'Yeay! Akhirnya menyelesaikan 7-Day Walking Challenge! Ternyata jalan kaki rutin bikin badan lebih segar dan tidur jadi lebih nyenyak. Next target: 10K steps per day! 💪',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 jam lalu
        metrics: {
            steps: 12500,
            calories: 450,
            distance: 8.2,
            duration: 95,
        },
        reactions: {
            likes: 24,
            supports: 18,
            celebrates: 12,
        },
        userReaction: 'like',
    },
    {
        id: '2',
        userId: 'user_002',
        userName: 'Budi Santoso',
        userLevel: 8,
        postType: 'tips',
        content: '5 Cara Menjaga Gula Darah Tetap Stabil:\n\n1. Makan teratur 3x sehari dengan porsi seimbang\n2. Pilih karbohidrat kompleks (nasi merah, oat)\n3. Perbanyak serat dari sayur dan buah\n4. Minum air putih minimal 8 gelas/hari\n5. Olahraga ringan 30 menit setiap hari\n\nYuk konsisten jaga kesehatan! 🌟',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 jam lalu
        reactions: {
            likes: 45,
            supports: 32,
            celebrates: 8,
        },
    },
    {
        id: '3',
        userId: 'user_003',
        userName: 'Dina Putri',
        userLevel: 15,
        postType: 'photo',
        content: 'Meal prep minggu ini! Menu sehat untuk kontrol kolesterol. Protein dari ayam kampung, sayur warna-warni, dan karbohidrat dari ubi 🥗✨',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 jam lalu
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        reactions: {
            likes: 67,
            supports: 23,
            celebrates: 15,
        },
        userReaction: 'celebrate',
    },
    {
        id: '4',
        userId: 'user_004',
        userName: 'Andi Pratama',
        userLevel: 10,
        postType: 'progress',
        content: 'Morning run hari ini! Rute baru di taman kota, udaranya segar banget. Target 5K tercapai dengan pace yang lebih baik dari minggu lalu 🏃‍♂️',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 jam lalu
        metrics: {
            steps: 7800,
            calories: 320,
            distance: 5.0,
            duration: 35,
        },
        reactions: {
            likes: 31,
            supports: 19,
            celebrates: 22,
        },
    },
    {
        id: '5',
        userId: 'user_005',
        userName: 'Maya Kusuma',
        userLevel: 18,
        postType: 'tips',
        content: 'Kenapa Tidur Cukup Penting untuk Diabetes Prevention?\n\nTernyata kurang tidur bisa:\n- Meningkatkan resistensi insulin\n- Bikin kita lebih sering ngemil\n- Menurunkan metabolisme tubuh\n- Meningkatkan hormon stress\n\nUsahakan tidur 7-8 jam setiap malam ya! Good sleep = good health 😴💚',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 hari lalu
        reactions: {
            likes: 89,
            supports: 45,
            celebrates: 12,
        },
        userReaction: 'support',
    },
    {
        id: '6',
        userId: 'user_006',
        userName: 'Rian Hidayat',
        userLevel: 14,
        postType: 'photo',
        content: 'Workout hari ke-30! Dari yang awalnya cuma bisa 10 push-up, sekarang udah bisa 30! Konsistensi adalah kunci 💪🔥',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 hari lalu
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
        reactions: {
            likes: 52,
            supports: 38,
            celebrates: 29,
        },
    },
    {
        id: '7',
        userId: 'user_007',
        userName: 'Lisa Anggraini',
        userLevel: 9,
        postType: 'progress',
        content: 'Weekly achievement unlocked! Total 65K steps minggu ini, naik 20% dari minggu lalu. Keep moving, keep healthy! 🚶‍♀️✨',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 hari lalu
        metrics: {
            steps: 65000,
            calories: 2100,
            distance: 42.5,
            duration: 480,
        },
        reactions: {
            likes: 76,
            supports: 42,
            celebrates: 35,
        },
    },
];

const FILTER_OPTIONS: FilterOption[] = [
    { id: '1', label: 'Semua', value: 'all' },
    { id: '2', label: 'Progress', value: 'progress' },
    { id: '3', label: 'Tips & Trick', value: 'tips' },
    { id: '4', label: 'Foto', value: 'photo' },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function CommunityScreen() {
    // State Management
    const [selectedFilter, setSelectedFilter] = useState<PostType | 'all'>('all');
    const [posts, setPosts] = useState<CommunityPost[]>(MOCK_POSTS);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================

    // Format timestamp to relative time
    const formatTimestamp = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            return `${diffMinutes} menit yang lalu`;
        } else if (diffHours < 24) {
            return `${diffHours} jam yang lalu`;
        } else if (diffDays === 1) {
            return 'Kemarin';
        } else if (diffDays < 7) {
            return `${diffDays} hari yang lalu`;
        } else {
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        }
    };

    // Handle pull to refresh
    const onRefresh = () => {
        setRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    };

    // Filter posts based on selected filter
    const filteredPosts = selectedFilter === 'all'
        ? posts
        : posts.filter(post => post.postType === selectedFilter);

    // Handle reaction toggle
    const handleReaction = (postId: string, reactionType: ReactionType) => {
        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post.id !== postId) return post;

                const reactions = { ...post.reactions };
                const currentReaction = post.userReaction;

                // Remove previous reaction if exists
                if (currentReaction) {
                    reactions[`${currentReaction}s` as keyof typeof reactions]--;
                }

                // If clicking the same reaction, remove it
                if (currentReaction === reactionType) {
                    return {
                        ...post,
                        reactions,
                        userReaction: undefined,
                    };
                }

                // Add new reaction
                reactions[`${reactionType}s` as keyof typeof reactions]++;
                return {
                    ...post,
                    reactions,
                    userReaction: reactionType,
                };
            })
        );
    };

    // Handle share post
    const handleShare = async (post: CommunityPost) => {
        try {
            await Share.share({
                message: `${post.userName} di Habitin: ${post.content}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    // Toggle expand post content
    const toggleExpandPost = (postId: string) => {
        setExpandedPosts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    // Handle add post
    const handleAddPost = () => {
        Alert.alert('Buat Postingan', 'Fitur buat postingan akan segera hadir!');
    };

    // Handle post menu
    const handlePostMenu = (postId: string) => {
        Alert.alert(
            'Opsi',
            'Pilih aksi untuk postingan ini',
            [
                { text: 'Laporkan', onPress: () => console.log('Report:', postId) },
                { text: 'Sembunyikan', onPress: () => console.log('Hide:', postId) },
                { text: 'Batal', style: 'cancel' },
            ]
        );
    };

    // =====================================================
    // RENDER FILTER PILLS
    // =====================================================

    const renderFilterPills = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 py-4"
            contentContainerStyle={{ gap: 8 }}
        >
            {FILTER_OPTIONS.map(filter => {
                const isActive = selectedFilter === filter.value;
                return (
                    <Pressable
                        key={filter.id}
                        onPress={() => setSelectedFilter(filter.value)}
                        className={`px-4 py-4 rounded-full border ${isActive
                            ? 'bg-[#ABE7B2] border-[#ABE7B2]'
                            : 'bg-white border-[#E5E7EB]'
                            }`}
                        style={{ opacity: 1 }}
                    >
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
    );

    // =====================================================
    // RENDER POST CARD
    // =====================================================

    const renderPostCard = ({ item: post }: { item: CommunityPost }) => {
        const isExpanded = expandedPosts.has(post.id);
        const shouldTruncate = post.content.length > 150;
        const displayContent = isExpanded || !shouldTruncate
            ? post.content
            : post.content.slice(0, 150) + '...';

        return (
            <View className="bg-white mx-4 mb-4 rounded-2xl overflow-hidden" style={{ elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                {/* POST HEADER */}
                <View className="flex-row items-center justify-between p-4 pb-3">
                    <View className="flex-row items-center flex-1">
                        {/* Avatar */}
                        <View className="w-10 h-10 rounded-full bg-[#ECF4E8] items-center justify-center mr-3">
                            <Text className="text-base font-bold text-[#ABE7B2]">
                                {post.userName.charAt(0)}
                            </Text>
                        </View>

                        {/* User info */}
                        <View className="flex-1">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-base font-bold text-black">
                                    {post.userName}
                                </Text>
                                <View className="px-2 py-0.5 bg-[#ECF4E8] rounded-full flex-row items-center">
                                    <Ionicons name="star" size={10} color="#ABE7B2" />
                                    <Text className="text-xs font-medium text-[#6B7280] ml-1">
                                        Lv. {post.userLevel}
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-xs text-[#6B7280] mt-0.5">
                                {formatTimestamp(post.timestamp)}
                            </Text>
                        </View>
                    </View>

                    {/* Menu button */}
                    <Pressable
                        onPress={() => handlePostMenu(post.id)}
                        className="p-1"
                        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    >
                        <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
                    </Pressable>
                </View>

                {/* POST CONTENT */}
                <View className="px-4">
                    {/* Progress Post Type */}
                    {post.postType === 'progress' && (
                        <>
                            <Text className="text-sm text-black leading-5 mb-3">
                                {displayContent}
                            </Text>
                            {shouldTruncate && (
                                <Pressable onPress={() => toggleExpandPost(post.id)}>
                                    <Text className="text-sm text-[#ABE7B2] font-medium mb-3">
                                        {isExpanded ? 'Sembunyikan' : 'Baca Selengkapnya'}
                                    </Text>
                                </Pressable>
                            )}

                            {/* Metrics Card */}
                            {post.metrics && (
                                <View className="bg-[#ECF4E8] rounded-xl p-4 mb-3">
                                    <View className="flex-row flex-wrap justify-between">
                                        {post.metrics.steps && (
                                            <View className="items-center w-[48%] mb-3">
                                                <Ionicons name="footsteps" size={24} color="#ABE7B2" />
                                                <Text className="text-lg font-bold text-black mt-1">
                                                    {post.metrics.steps.toLocaleString()}
                                                </Text>
                                                <Text className="text-xs text-[#6B7280]">Langkah</Text>
                                            </View>
                                        )}
                                        {post.metrics.calories && (
                                            <View className="items-center w-[48%] mb-3">
                                                <Ionicons name="flame" size={24} color="#FF6B6B" />
                                                <Text className="text-lg font-bold text-black mt-1">
                                                    {post.metrics.calories}
                                                </Text>
                                                <Text className="text-xs text-[#6B7280]">Kalori</Text>
                                            </View>
                                        )}
                                        {post.metrics.distance && (
                                            <View className="items-center w-[48%]">
                                                <Ionicons name="navigate" size={24} color="#93BFC7" />
                                                <Text className="text-lg font-bold text-black mt-1">
                                                    {post.metrics.distance} km
                                                </Text>
                                                <Text className="text-xs text-[#6B7280]">Jarak</Text>
                                            </View>
                                        )}
                                        {post.metrics.duration && (
                                            <View className="items-center w-[48%]">
                                                <Ionicons name="time" size={24} color="#FFD93D" />
                                                <Text className="text-lg font-bold text-black mt-1">
                                                    {post.metrics.duration}
                                                </Text>
                                                <Text className="text-xs text-[#6B7280]">Menit</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}
                        </>
                    )}

                    {/* Tips Post Type */}
                    {post.postType === 'tips' && (
                        <View className="bg-[#ECF4E8] rounded-xl p-4 mb-3">
                            <View className="flex-row items-start">
                                <Ionicons name="bulb" size={20} color="#FFD93D" className="mr-2" />
                                <View className="flex-1 ml-2">
                                    <Text className="text-sm text-black leading-5">
                                        {displayContent}
                                    </Text>
                                    {shouldTruncate && (
                                        <Pressable onPress={() => toggleExpandPost(post.id)} className="mt-2">
                                            <Text className="text-sm text-[#ABE7B2] font-medium">
                                                {isExpanded ? 'Sembunyikan' : 'Baca Selengkapnya'}
                                            </Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Photo Post Type */}
                    {post.postType === 'photo' && (
                        <>
                            <Text className="text-sm text-black leading-5 mb-3">
                                {post.content}
                            </Text>
                            {post.image && (
                                <Pressable
                                    onPress={() => Alert.alert('Image Viewer', 'Full screen image view coming soon!')}
                                    className="mb-3"
                                >
                                    <Image
                                        source={{ uri: post.image }}
                                        className="w-full h-48 rounded-xl"
                                        resizeMode="cover"
                                    />
                                </Pressable>
                            )}
                        </>
                    )}
                </View>

                {/* POST FOOTER - REACTIONS */}
                <View className="px-4 pt-3 pb-4 border-t border-[#F3F4F6] mt-1">
                    <View className="flex-row items-center justify-between">
                        {/* Left side - Reactions */}
                        <View className="flex-row items-center gap-4">
                            {/* Like */}
                            <Pressable
                                onPress={() => handleReaction(post.id, 'like')}
                                className="flex-row items-center gap-1"
                                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                            >
                                <Ionicons
                                    name={post.userReaction === 'like' ? 'heart' : 'heart-outline'}
                                    size={20}
                                    color={post.userReaction === 'like' ? '#FF6B6B' : '#6B7280'}
                                />
                                <Text
                                    className={`text-sm ${post.userReaction === 'like' ? 'text-[#FF6B6B] font-medium' : 'text-[#6B7280]'
                                        }`}
                                >
                                    {post.reactions.likes}
                                </Text>
                            </Pressable>

                            {/* Support */}
                            <Pressable
                                onPress={() => handleReaction(post.id, 'support')}
                                className="flex-row items-center gap-1"
                                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                            >
                                <Ionicons
                                    name={post.userReaction === 'support' ? 'hand-left' : 'hand-left-outline'}
                                    size={20}
                                    color={post.userReaction === 'support' ? '#4ECDC4' : '#6B7280'}
                                />
                                <Text
                                    className={`text-sm ${post.userReaction === 'support' ? 'text-[#4ECDC4] font-medium' : 'text-[#6B7280]'
                                        }`}
                                >
                                    {post.reactions.supports}
                                </Text>
                            </Pressable>

                            {/* Celebrate */}
                            <Pressable
                                onPress={() => handleReaction(post.id, 'celebrate')}
                                className="flex-row items-center gap-1"
                                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                            >
                                <Ionicons
                                    name={post.userReaction === 'celebrate' ? 'trophy' : 'trophy-outline'}
                                    size={20}
                                    color={post.userReaction === 'celebrate' ? '#FFD93D' : '#6B7280'}
                                />
                                <Text
                                    className={`text-sm ${post.userReaction === 'celebrate' ? 'text-[#FFD93D] font-medium' : 'text-[#6B7280]'
                                        }`}
                                >
                                    {post.reactions.celebrates}
                                </Text>
                            </Pressable>
                        </View>

                        {/* Right side - Share */}
                        <Pressable
                            onPress={() => handleShare(post)}
                            className="p-1"
                            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                        >
                            <Ionicons name="share-outline" size={20} color="#6B7280" />
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    };

    // =====================================================
    // RENDER EMPTY STATE
    // =====================================================

    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center px-8 py-16">
            <View className="w-24 h-24 rounded-full bg-[#ECF4E8] items-center justify-center mb-4">
                <Ionicons name="people-outline" size={48} color="#ABE7B2" />
            </View>
            <Text className="text-lg font-bold text-black mb-2 text-center">
                Belum Ada Postingan
            </Text>
            <Text className="text-sm text-[#6B7280] text-center mb-6">
                Jadilah yang pertama berbagi progress dan tips kesehatan di komunitas!
            </Text>
            <Pressable
                onPress={handleAddPost}
                className="bg-[#ABE7B2] px-6 py-3 rounded-full"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
                <Text className="text-sm font-semibold text-black">Buat Postingan</Text>
            </Pressable>
        </View>
    );

    // =====================================================
    // MAIN RENDER
    // =====================================================

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={['top']}>
            {/* HEADER */}
            <View className="bg-white px-4 py-4 flex-row items-center justify-between border-b border-[#F3F4F6]">
                <Text className="text-2xl font-bold text-black">Komunitas</Text>
                <View className="flex-row items-center gap-3">
                    <Pressable
                        onPress={handleAddPost}
                        className="w-10 h-10 items-center justify-center"
                        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    >
                        <Ionicons name="add-circle-outline" size={28} color="#ABE7B2" />
                    </Pressable>
                </View>
            </View>

            {/* FILTER PILLS */}
            {renderFilterPills()}

            {/* COMMUNITY FEED */}
            <FlatList
                data={filteredPosts}
                renderItem={renderPostCard}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#ABE7B2"
                        colors={['#ABE7B2']}
                    />
                }
                ListEmptyComponent={renderEmptyState()}
            />
        </SafeAreaView>
    );
}