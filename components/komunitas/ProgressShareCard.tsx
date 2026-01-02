import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';

interface ProgressShareCardProps {
    userName: string;
    userAvatar?: string;
    content: string;
    metrics?: {
        steps?: number;
        calories?: number;
        distance?: number;
        duration?: number;
    };
}

export const ProgressShareCard = React.forwardRef<View, ProgressShareCardProps>(
    ({ userName, userAvatar, content, metrics }, ref) => {
        return (
            <View
                ref={ref}
                style={{
                    width: 400,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 24,
                    padding: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5,
                }}
            >
                {/* Watermark Logo - Top Right */}
                <View
                    style={{
                        position: 'absolute',
                        top: 24,
                        right: 24,
                        zIndex: 10,
                        opacity: 0.2,
                    }}
                >
                    <Image
                        source={require('../../assets/images/Launcher_logos_RBG(1).png')}
                        style={{
                            width: 56,
                            height: 56,
                        }}
                        resizeMode="contain"
                    />
                </View>

                {/* Header - User Info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    {userAvatar ? (
                        <Image
                            source={{ uri: userAvatar }}
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: '#ECF4E8',
                                borderWidth: 3,
                                borderColor: '#ABE7B2',
                                marginRight: 12,
                            }}
                        />
                    ) : (
                        <View
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: '#ECF4E8',
                                borderWidth: 3,
                                borderColor: '#ABE7B2',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                            }}
                        >
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ABE7B2' }}>
                                {userName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}

                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000000' }}>
                            {userName}
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <Text
                    style={{
                        fontSize: 16,
                        color: '#1F2937',
                        lineHeight: 24,
                        marginBottom: 20,
                    }}
                    numberOfLines={3}
                >
                    {content}
                </Text>

                {/* Metrics Grid */}
                {metrics && (
                    <View
                        style={{
                            backgroundColor: '#ECF4E8',
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 16,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                justifyContent: 'space-between',
                            }}
                        >
                            {/* Steps */}
                            {metrics.steps !== undefined && (
                                <View style={{ width: '48%', alignItems: 'center', marginBottom: 16 }}>
                                    <View
                                        style={{
                                            width: 48,
                                            height: 48,
                                            backgroundColor: '#D4F4DD',
                                            borderRadius: 24,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Ionicons name="footsteps" size={28} color="#ABE7B2" />
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 'bold',
                                            color: '#000000',
                                            marginBottom: 4,
                                        }}
                                    >
                                        {metrics.steps.toLocaleString('id-ID')}
                                    </Text>
                                    <Text style={{ fontSize: 14, color: '#6B7280' }}>Langkah</Text>
                                </View>
                            )}

                            {/* Calories */}
                            {metrics.calories !== undefined && (
                                <View style={{ width: '48%', alignItems: 'center', marginBottom: 16 }}>
                                    <View
                                        style={{
                                            width: 48,
                                            height: 48,
                                            backgroundColor: '#FFE5E5',
                                            borderRadius: 24,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Ionicons name="flame" size={28} color="#FF6B6B" />
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 'bold',
                                            color: '#000000',
                                            marginBottom: 4,
                                        }}
                                    >
                                        {metrics.calories.toLocaleString('id-ID')}
                                    </Text>
                                    <Text style={{ fontSize: 14, color: '#6B7280' }}>Kalori</Text>
                                </View>
                            )}

                            {/* Distance */}
                            {metrics.distance !== undefined && (
                                <View style={{ width: '48%', alignItems: 'center' }}>
                                    <View
                                        style={{
                                            width: 48,
                                            height: 48,
                                            backgroundColor: '#E0F0F3',
                                            borderRadius: 24,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Ionicons name="navigate" size={28} color="#93BFC7" />
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 'bold',
                                            color: '#000000',
                                            marginBottom: 4,
                                        }}
                                    >
                                        {metrics.distance.toLocaleString('id-ID', {
                                            minimumFractionDigits: 1,
                                            maximumFractionDigits: 1,
                                        })}
                                    </Text>
                                    <Text style={{ fontSize: 14, color: '#6B7280' }}>km Jarak</Text>
                                </View>
                            )}

                            {/* Duration */}
                            {metrics.duration !== undefined && (
                                <View style={{ width: '48%', alignItems: 'center' }}>
                                    <View
                                        style={{
                                            width: 48,
                                            height: 48,
                                            backgroundColor: '#FFF8E1',
                                            borderRadius: 24,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Ionicons name="time" size={28} color="#FFD93D" />
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 'bold',
                                            color: '#000000',
                                            marginBottom: 4,
                                        }}
                                    >
                                        {metrics.duration.toLocaleString('id-ID')}
                                    </Text>
                                    <Text style={{ fontSize: 14, color: '#6B7280' }}>Menit</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Footer - App Branding */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingTop: 16,
                        borderTopWidth: 1,
                        borderTopColor: '#F3F4F6',
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

ProgressShareCard.displayName = 'ProgressShareCard';
