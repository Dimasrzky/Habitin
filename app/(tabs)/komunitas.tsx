import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Share,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNShare from 'react-native-share';
import { captureRef } from 'react-native-view-shot';
import ImageViewer from '../../components/ImageViewer';
import { ProgressShareCard } from '../../components/komunitas/ProgressShareCard';
import { PhotoShareCard } from '../../components/komunitas/PhotoShareCard';
import { auth } from '../../src/config/firebase.config';
import { CommunityService } from '../../src/services/database/community.service';
import { CommunityPostWithUser, ReactionType } from '../../src/types/community.types';
import { EVENTS, eventManager } from '../../src/utils/eventEmitter';

// =====================================================
// TYPESCRIPT INTERFACES & TYPES
// =====================================================

type PostType = 'progress' | 'tips' | 'photo' | 'story';

interface FilterOption {
    id: string;
    label: string;
    value: PostType | 'all';
}

// Transform CommunityPostWithUser to match UI expected format
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
        distance?: number;
        duration?: number;
    };
    image?: string;
    reactions: {
        likes: number;
        supports: number;
        celebrates: number;
    };
    userReaction?: ReactionType;
}

// Note: MOCK_POSTS removed - now using dynamic data from database

const FILTER_OPTIONS: FilterOption[] = [
    { id: '1', label: 'Semua', value: 'all' },
    { id: '2', label: 'Cerita', value: 'story' },
    { id: '3', label: 'Progress', value: 'progress' },
    { id: '4', label: 'Tips & Trick', value: 'tips' },
    { id: '5', label: 'Foto', value: 'photo' },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function CommunityScreen() {
    const router = useRouter();

    // State Management
    const [selectedFilter, setSelectedFilter] = useState<PostType | 'all'>('all');
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [shareCardVisible, setShareCardVisible] = useState(false);
    const [selectedPostForShare, setSelectedPostForShare] = useState<CommunityPost | null>(null);
    const [shareCardType, setShareCardType] = useState<'progress' | 'photo' | null>(null);
    const shareCardRef = useRef<View>(null);

    // =====================================================
    // DATA FETCHING
    // =====================================================

    // Transform API data to UI format
     const transformPostData = useCallback((apiPost: CommunityPostWithUser): CommunityPost => {
        return {
            id: apiPost.id,
            userId: apiPost.user_id,
            userName: apiPost.user?.full_name || 'Anonymous',
            userAvatar: apiPost.user?.avatar_url || undefined,
            userLevel: 1,
            postType: apiPost.post_type as PostType,
            content: apiPost.content,
            timestamp: new Date(apiPost.created_at),
            metrics: apiPost.metrics || undefined,
            image: apiPost.image_url || undefined,
            reactions: {
                likes: apiPost.reactions_count.likes,
                supports: apiPost.reactions_count.supports,
                celebrates: apiPost.reactions_count.celebrates,
            },
            userReaction: apiPost.user_reaction || undefined,
        };
    }, []);
    const fetchPosts = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            console.log('🔄 Fetching community posts...');

            let result;
            if (selectedFilter === 'all') {
                result = await CommunityService.getAllPosts(currentUser.uid);
            } else {
                result = await CommunityService.getPostsByType(
                    currentUser.uid,
                    selectedFilter
                );
            }

            if (result.error) {
                throw new Error(result.error);
            }

            const transformedPosts = result.data.map(transformPostData);
            setPosts(transformedPosts);
            console.log('✅ Posts loaded:', transformedPosts.length);
        } catch (error: any) {
            console.error('❌ Error fetching posts:', error);
            Alert.alert('Error', 'Gagal memuat postingan');
        }
    }, [selectedFilter]); // 🔥 HANYA depend pada selectedFilter

    // 🎯 Refresh ONCE on screen focus
    useFocusEffect(
        useCallback(() => {
            console.log('🔄 Community screen focused - refreshing once');
            fetchPosts();
        }, [fetchPosts])
    );

    // Refresh saat filter berubah
    useEffect(() => {
        console.log('🔄 Filter changed - fetching posts');
        fetchPosts();
    }, [selectedFilter]);

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
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchPosts(); // Langsung call fetchPosts
        setRefreshing(false);
    }, [fetchPosts]);

    // Filter posts (already filtered by API, but keep for consistency)
    const filteredPosts = posts;

    // Handle reaction toggle with API
    const handleReaction = async (postId: string, reactionType: ReactionType) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            Alert.alert('Error', 'User tidak terautentikasi');
            return;
        }

        // Optimistic update
        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post.id !== postId) return post;

                const reactions = { ...post.reactions };
                const currentReaction = post.userReaction;

                if (currentReaction) {
                    reactions[`${currentReaction}s` as keyof typeof reactions]--;
                }

                if (currentReaction === reactionType) {
                    return {
                        ...post,
                        reactions,
                        userReaction: undefined,
                    };
                }

                reactions[`${reactionType}s` as keyof typeof reactions]++;
                return {
                    ...post,
                    reactions,
                    userReaction: reactionType,
                };
            })
        );

        // Update in database
        try {
            const result = await CommunityService.toggleReaction(
                postId,
                currentUser.uid,
                reactionType
            );

            if (result?.error) {
                await fetchPosts(); // Revert on error
                throw new Error(result.error);
            }
        } catch (error: any) {
            console.error('Error toggling reaction:', error);
            await fetchPosts(); // Revert optimistic update
        }
    };

    // Handle share post
    const handleShare = async (post: CommunityPost) => {
        try {
            // Determine which share card to use
            let cardType: 'progress' | 'photo' | null = null;

            // Postingan progress dengan metrics
            if (post.postType === 'progress' && post.metrics) {
                cardType = 'progress';
            }
            // Postingan dengan gambar (semua tipe)
            else if (post.image) {
                cardType = 'photo';
            }

            // Jika ada kartu share yang sesuai
            if (cardType) {
                setSelectedPostForShare(post);
                setShareCardType(cardType);
                setShareCardVisible(true);

                // Wait for modal to render
                setTimeout(async () => {
                    try {
                        if (shareCardRef.current) {
                            // Capture the card as image
                            const uri = await captureRef(shareCardRef.current, {
                                format: 'png',
                                quality: 1,
                            });

                            // Share the image using react-native-share
                            const shareOptions = {
                                title: cardType === 'progress' ? 'Bagikan Progress' : 'Bagikan Postingan',
                                message: cardType === 'progress'
                                    ? `Progress saya di Habitin`
                                    : `${post.userName} di Habitin`,
                                url: Platform.OS === 'ios' ? uri : `file://${uri}`,
                                type: 'image/png',
                            };

                            await RNShare.open(shareOptions);
                        }
                    } catch (error: any) {
                        // User cancelled share dialog
                        if (error.message !== 'User did not share') {
                            console.error('Error capturing/sharing card:', error);
                            Alert.alert('Error', 'Gagal membuat gambar share');
                        }
                    } finally {
                        setShareCardVisible(false);
                        setSelectedPostForShare(null);
                        setShareCardType(null);
                    }
                }, 500);
            } else {
                // Untuk postingan tanpa gambar dan bukan progress, gunakan share teks biasa
                await Share.share({
                    message: `${post.userName} di Habitin: ${post.content}`,
                });
            }
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

    // Handle image view
    const handleImagePress = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setImageViewerVisible(true);
    };

    const handleCloseImageViewer = () => {
        setImageViewerVisible(false);
        setTimeout(() => {
            setSelectedImage(null);
        }, 300);
    };

    // Handle add post - navigate to create post screen
    const handleAddPost = () => {
        router.push('/screens/community/CreatePost' as any);
    };

    // Handle post menu
    const handlePostMenu = (postId: string, postUserId: string) => {
        const currentUser = auth.currentUser;
        const isOwner = currentUser?.uid === postUserId;

        const menuOptions: any[] = [
            { text: 'Laporkan', onPress: () => console.log('Report:', postId) },
        ];

        if (isOwner) {
            menuOptions.unshift({
                text: 'Hapus',
                onPress: () => handleDeletePost(postId),
                style: 'destructive',
            });
        } else {
            menuOptions.push({
                text: 'Sembunyikan',
                onPress: () => console.log('Hide:', postId),
            });
        }

        menuOptions.push({ text: 'Batal', style: 'cancel' });

        Alert.alert('Opsi', 'Pilih aksi untuk postingan ini', menuOptions);
    };

    // Handle delete post
    const handleDeletePost = async (postId: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        Alert.alert(
            'Hapus Postingan',
            'Apakah Anda yakin ingin menghapus postingan ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await CommunityService.deletePost(
                                postId,
                                currentUser.uid
                            );

                            if (result.error) {
                                throw new Error(result.error);
                            }

                            // Remove from local state
                            setPosts(prev => prev.filter(p => p.id !== postId));
                            
                            // 🔔 EMIT EVENT
                            eventManager.emit(EVENTS.POST_DELETED, { postId });
                            
                            Alert.alert('Berhasil', 'Postingan telah dihapus');
                        } catch (error: any) {
                            console.error('Error deleting post:', error);
                            Alert.alert('Error', 'Gagal menghapus postingan');
                        }
                    },
                },
            ]
        );
    };

    // =====================================================
    // RENDER FILTER PILLS
    // =====================================================

    const renderFilterPills = () => (
        <View className="bg-white border-b border-[#F3F4F6]">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-4 py-2.5"
                contentContainerStyle={{ gap: 6, paddingRight: 16 }}
            >
                {FILTER_OPTIONS.map(filter => {
                    const isActive = selectedFilter === filter.value;
                    return (
                        <Pressable
                            key={filter.id}
                            onPress={() => setSelectedFilter(filter.value)}
                            className={`px-4 py-3 rounded-lg ${isActive
                                ? 'bg-[#ABE7B2]'
                                : 'bg-[#F9FAFB]'
                                }`}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.7 : 1,
                                transform: [{ scale: pressed ? 0.97 : 1 }]
                            })}
                        >
                            <Text
                                className={`text-x font-semibold ${isActive ? 'text-black' : 'text-[#6B7280]'
                                    }`}
                            >
                                {filter.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
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
                        <View className="mr-3">
                            {post.userAvatar ? (
                                <Image
                                    source={{ uri: post.userAvatar }}
                                    className="w-10 h-10 rounded-full"
                                    style={{
                                        backgroundColor: '#ECF4E8',
                                        borderWidth: 2,
                                        borderColor: '#ABE7B2'
                                    }}
                                />
                            ) : (
                                <View className="w-10 h-10 rounded-full bg-[#ECF4E8] items-center justify-center border-2 border-[#ABE7B2]">
                                    <Text className="text-base font-bold text-[#ABE7B2]">
                                        {post.userName.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
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
                        onPress={() => handlePostMenu(post.id, post.userId)}
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
                                    onPress={() => handleImagePress(post.image!)}
                                    className="mb-3"
                                    style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
                                >
                                    <Image
                                        source={{ uri: post.image }}
                                        className="w-full h-48 rounded-xl"
                                        resizeMode="cover"
                                    />
                                    <View className="absolute bottom-3 right-3 bg-black/50 rounded-full p-2">
                                        <Ionicons name="expand-outline" size={16} color="#FFFFFF" />
                                    </View>
                                </Pressable>
                            )}
                        </>
                    )}

                    {/* Story Post Type */}
                    {post.postType === 'story' && (
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
                            {post.image && (
                                <Pressable
                                    onPress={() => handleImagePress(post.image!)}
                                    className="mb-3"
                                    style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
                                >
                                    <Image
                                        source={{ uri: post.image }}
                                        className="w-full h-48 rounded-xl"
                                        resizeMode="cover"
                                    />
                                    <View className="absolute bottom-3 right-3 bg-black/50 rounded-full p-2">
                                        <Ionicons name="expand-outline" size={16} color="#FFFFFF" />
                                    </View>
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
                        <Ionicons name="add-circle-outline" size={28} color="#50e361ff" />
                    </Pressable>
                </View>
            </View>

            {/* FILTER PILLS */}
            {renderFilterPills()}

            {/* COMMUNITY FEED */}
            {!posts.length && !refreshing ? (
                renderEmptyState()
            ) : (
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
                    ListEmptyComponent={
                        refreshing ? (
                            <View className="flex-1 items-center justify-center py-16">
                                <ActivityIndicator size="large" color="#ABE7B2" />
                                <Text className="text-sm text-[#6B7280] mt-3">Memuat postingan...</Text>
                            </View>
                        ) : null
                    }
                />
            )}

            {/* Image Viewer Modal */}
            {selectedImage && (
                <ImageViewer
                    visible={imageViewerVisible}
                    imageUrl={selectedImage}
                    onClose={handleCloseImageViewer}
                />
            )}

            {/* Share Card Modal */}
            <Modal
                visible={shareCardVisible}
                transparent={true}
                animationType="none"
                onRequestClose={() => {
                    setShareCardVisible(false);
                    setSelectedPostForShare(null);
                    setShareCardType(null);
                }}
            >
                <View
                    style={{
                        position: 'absolute',
                        left: -9999,
                        top: -9999,
                        opacity: 0,
                    }}
                >
                    {selectedPostForShare && shareCardType === 'progress' && (
                        <ProgressShareCard
                            ref={shareCardRef}
                            userName={selectedPostForShare.userName}
                            userAvatar={selectedPostForShare.userAvatar}
                            content={selectedPostForShare.content}
                            metrics={selectedPostForShare.metrics}
                        />
                    )}
                    {selectedPostForShare && shareCardType === 'photo' && (
                        <PhotoShareCard
                            ref={shareCardRef}
                            userName={selectedPostForShare.userName}
                            userAvatar={selectedPostForShare.userAvatar}
                            userLevel={selectedPostForShare.userLevel}
                            postType={selectedPostForShare.postType}
                            content={selectedPostForShare.content}
                            imageUrl={selectedPostForShare.image!}
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}