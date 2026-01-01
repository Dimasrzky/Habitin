import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';

interface PhotoShareCardProps {
    userName: string;
    userAvatar?: string;
    userLevel?: number;
    postType: 'story' | 'photo' | 'tips' | 'progress';
    content: string;
    imageUrl: string;
}

export const PhotoShareCard = React.forwardRef<View, PhotoShareCardProps>(
    ({ userName, userAvatar, userLevel = 1, postType, content, imageUrl }, ref) => {
        // Get post type label and color
        const getPostTypeInfo = () => {
            switch (postType) {
                case 'story':
                    return { label: 'Cerita', color: '#ABE7B2', icon: 'book-outline' as const };
                case 'photo':
                    return { label: 'Foto', color: '#93BFC7', icon: 'image-outline' as const };
                case 'tips':
                    return { label: 'Tips & Trick', color: '#FFD93D', icon: 'bulb-outline' as const };
                case 'progress':
                    return { label: 'Progress', color: '#FF6B6B', icon: 'trophy-outline' as const };
                default:
                    return { label: 'Post', color: '#ABE7B2', icon: 'newspaper-outline' as const };
            }
        };

        const postTypeInfo = getPostTypeInfo();

        return (
            <View
                ref={ref}
                style={{
                    width: 400,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 24,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5,
                }}
            >
                {/* Header - User Info */}
                <View style={{ padding: 20, paddingBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        {userAvatar ? (
                            <Image
                                source={{ uri: userAvatar }}
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundColor: '#ECF4E8',
                                    borderWidth: 2,
                                    borderColor: '#ABE7B2',
                                    marginRight: 12,
                                }}
                            />
                        ) : (
                            <View
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundColor: '#ECF4E8',
                                    borderWidth: 2,
                                    borderColor: '#ABE7B2',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                }}
                            >
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ABE7B2' }}>
                                    {userName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}

                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }}>
                                    {userName}
                                </Text>
                                <View
                                    style={{
                                        paddingHorizontal: 8,
                                        paddingVertical: 2,
                                        backgroundColor: '#ECF4E8',
                                        borderRadius: 12,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Ionicons name="star" size={10} color="#ABE7B2" />
                                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', marginLeft: 4 }}>
                                        Lv. {userLevel}
                                    </Text>
                                </View>
                            </View>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: 4,
                                    gap: 6,
                                }}
                            >
                                <Ionicons name={postTypeInfo.icon} size={14} color={postTypeInfo.color} />
                                <Text style={{ fontSize: 13, color: '#6B7280' }}>
                                    {postTypeInfo.label}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Content */}
                    {content && (
                        <Text
                            style={{
                                fontSize: 15,
                                color: '#1F2937',
                                lineHeight: 22,
                            }}
                            numberOfLines={3}
                        >
                            {content}
                        </Text>
                    )}
                </View>

                {/* Image */}
                <View
                    style={{
                        paddingHorizontal: 20,
                        paddingBottom: 16,
                    }}
                >
                    <View
                        style={{
                            width: '100%',
                            height: 280,
                            backgroundColor: '#F3F4F6',
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            borderRadius: 12,
                            overflow: 'hidden',
                        }}
                    >
                        <Image
                            source={{ uri: imageUrl }}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            resizeMode="cover"
                        />
                    </View>
                </View>

                {/* Footer - App Branding */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingBottom: 16,
                        paddingHorizontal: 20,
                    }}
                >
                    <View
                        style={{
                            width: 32,
                            height: 32,
                            backgroundColor: '#ABE7B2',
                            borderRadius: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 8,
                        }}
                    >
                        <Ionicons name="heart" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000000' }}>
                        Habitin
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6B7280', marginLeft: 4 }}>
                        - Stay Health, Stay Happy
                    </Text>
                </View>
            </View>
        );
    }
);

PhotoShareCard.displayName = 'PhotoShareCard';
