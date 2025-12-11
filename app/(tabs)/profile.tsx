// app/(tabs)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { auth } from '../../src/config/firebase.config';
import { supabase } from '../../src/config/supabase.config';
import { useUser } from '../../src/hooks/useUser';
import { resetOnboardingStatus } from '../../src/services/onboarding/onboardingService';
import { resetLabUploadStatus } from '../../src/utils/labUploadHelper';

// TypeScript Interfaces
interface UserProfile {
    id: string
    name: string
    email: string
    avatar?: string
    level: number
    points: number
    badges: number
}

interface HealthData {
    fullName: string
    age: number
    gender: 'Laki-laki' | 'Perempuan'
    height: number
    weight: number
    bloodType?: string
    bmi: number
    physicalActivity: string
    dietPattern: string
    familyHistory: boolean
    familyCondition?: string
}

interface Badge {
    id: string
    name: string
    icon: keyof typeof Ionicons.glyphMap
    earned: boolean
}

interface SettingsItem {
    icon: keyof typeof Ionicons.glyphMap
    label: string
    color: string
    route: string
}

interface DeveloperItem {
    icon: keyof typeof Ionicons.glyphMap
    label: string
    subtitle: string
    color: string
    action: () => void
    danger?: boolean
}

// Mock Data
const MOCK_USER: UserProfile = {
    id: "user_001",
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    level: 12,
    points: 3450,
    badges: 8,
}

const MOCK_HEALTH_DATA: HealthData = {
    fullName: "Budi Santoso",
    age: 19,
    gender: "Laki-laki",
    height: 172,
    weight: 68,
    bmi: 23.0,
    physicalActivity: "Sedang (3-4x/minggu)",
    dietPattern: "Seimbang",
    familyHistory: true,
    familyCondition: "Diabetes (Ayah)",
}

const MOCK_BADGES: Badge[] = [
    { id: "1", name: "7-Day Streak", icon: "flame", earned: true },
    { id: "2", name: "First Check", icon: "checkmark-circle", earned: true },
    { id: "3", name: "Challenge Master", icon: "trophy", earned: true },
    { id: "4", name: "Community Star", icon: "star", earned: false },
]

const getBMIStatus = (bmi: number): { text: string; color: string } => {
    if (bmi < 18.5) return { text: "Kurang", color: "#FFD580" }
    if (bmi < 25) return { text: "Normal", color: "#ABE7B2" }
    if (bmi < 30) return { text: "Berlebih", color: "#FFD580" }
    return { text: "Obesitas", color: "#FF8A8A" }
}

const Card: React.FC<{ children: React.ReactNode; style?: object }> = ({ children, style }) => (
    <View
        style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            borderWidth: 1,
            borderColor: "#F3F4F6",
            ...style,
        }}
    >
        {children}
    </View>
)

export default function ProfileScreen() {
    const router = useRouter();
    const [healthDataExpanded, setHealthDataExpanded] = useState(false);
    const [developerExpanded, setDeveloperExpanded] = useState(false);
    const [userData] = useState(MOCK_USER);
    const {user} = useUser();

    const currentUser = auth.currentUser;
    const userName = user?.full_name || currentUser?.displayName || 'User';
    const userEmail = user?.email || currentUser?.email || 'email';

    const [healthData, setHealthData] = useState<HealthData | null>(null);

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        // Jika belum ulang tahun di tahun berjalan → umur -1
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return age;
    };

    const fetchHealthData = async () => {
        try {
            const firebaseId = auth.currentUser?.uid;

            if (!firebaseId) {
                console.warn("Firebase User ID tidak ditemukan");
                return;
            }

            const { data, error } = await supabase
                .from('onboarding_data')
                .select('*')
                .eq('user_id', firebaseId)
                .single();

            if (error) {
                console.error("Supabase Error:", error);
                return;
            }

            if (!data) {
                console.warn("Data health tidak ditemukan di Supabase");
                return;
            }

            const age = calculateAge(data.date_of_birth);

            setHealthData({
                fullName: data.full_name,
                age: age,
                gender: data.gender,
                height: data.height_cm,
                weight: data.weight_kg,
                bmi: data.bmi,
                bloodType: data.blood_type,
                physicalActivity: data.exercise_frequency,
                dietPattern: data.diet_pattern,
                familyHistory: data.family_history,
                familyCondition: data.family_condition,
            });
        } catch (err) {
            console.error("Unexpected error:", err);
        } 
    };

    useEffect(() => {
        fetchHealthData();
    },);

    const bmiStatus = healthData ? getBMIStatus(healthData.bmi) : null


    // Settings Items dengan route
    const SETTINGS_ITEMS: SettingsItem[] = [
        { 
            icon: "notifications", 
            label: "Pengaturan Notifikasi", 
            color: "#ABE7B2",
            route: "/screens/Profile/NotificationSettings"
        },
        { 
            icon: "shield-checkmark", 
            label: "Privasi & Keamanan", 
            color: "#93BFC7",
            route: "/screens/Profile/PrivacySecurity"
        },
        { 
            icon: "help-circle", 
            label: "Bantuan & Dukungan", 
            color: "#ABE7B2",
            route: "/screens/Profile/HelpSupport"
        },
        { 
            icon: "information-circle", 
            label: "Tentang Habitin", 
            color: "#93BFC7",
            route: "/screens/Profile/AboutHabitin"
        },
    ];

    // Reset Upload Modal (untuk testing)
    const resetUploadModal = async () => {
        Alert.alert(
            "Reset Upload Modal",
            "Modal upload akan muncul kembali saat membuka home screen. Lanjutkan?",
            [
                {
                    text: "Batal",
                    style: "cancel"
                },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('upload_modal_shown');
                            
                            Alert.alert(
                                "Berhasil! ✅",
                                "Modal upload telah direset. Buka home screen untuk melihat modal.",
                                [
                                    {
                                        text: "Ke Home",
                                        onPress: () => {
                                            router.push('/(tabs)' as any);
                                        }
                                    },
                                    {
                                        text: "OK",
                                        style: "cancel"
                                    }
                                ]
                            );
                        } catch (error) {
                            console.error('Error resetting modal:', error);
                            Alert.alert('Error', 'Gagal mereset modal. Silakan coba lagi.');
                        }
                    }
                }
            ]
        );
    };

    const resetLabStatus = async () => {
    Alert.alert(
        "Reset Lab Upload Status",
        "Ini akan mereset status upload lab. Modal dan card akan kembali seperti pertama kali. Lanjutkan?",
        [
        {
            text: "Batal",
            style: "cancel"
        },
        {
            text: "Reset",
            style: "destructive",
            onPress: async () => {
            try {
                await resetLabUploadStatus();
                
                Alert.alert(
                "Berhasil! ✅",
                "Status lab upload telah direset. Buka home untuk melihat perubahan.",
                [
                    {
                    text: "Ke Home",
                    onPress: () => {
                        router.push('/(tabs)' as any);
                    }
                    },
                    {
                    text: "OK",
                    style: "cancel"
                    }
                ]
                );
            } catch (error) {
                console.error('Error resetting lab status:', error);
                Alert.alert('Error', 'Gagal mereset status lab.');
            }
            }
        }
        ]
    );
    };

    // Clear All Local Data
    const clearAllData = async () => {
        Alert.alert(
            "Hapus Semua Data Lokal",
            "Ini akan menghapus semua cache dan preferensi lokal. Anda tidak akan logout. Lanjutkan?",
            [
                {
                    text: "Batal",
                    style: "cancel"
                },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            Alert.alert(
                                "Berhasil! ✅", 
                                "Semua data lokal telah dihapus. App akan restart."
                            );
                            
                            // Reload app (optional)
                            // Updates.reloadAsync();
                        } catch (error) {
                            console.error('Error clearing data:', error);
                            Alert.alert('Error', 'Gagal menghapus data.');
                        }
                    }
                }
            ]
        );
    };

    // View All AsyncStorage Keys (debugging)
    const viewStorageKeys = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const items = await AsyncStorage.multiGet(keys);
            
            let message = "AsyncStorage Keys:\n\n";
            items.forEach(([key, value]) => {
                message += `${key}: ${value?.substring(0, 50)}...\n`;
            });
            
            Alert.alert("Storage Keys", message);
        } catch (error) {
            console.error('Error reading storage:', error);
            Alert.alert('Error', 'Gagal membaca storage.');
        }
    };

    const resetOnboarding = async () => {
    Alert.alert(
        "Reset Onboarding",
        "Ini akan mereset status onboarding. Anda akan melihat onboarding lagi saat membuka app. Lanjutkan?",
        [
        {
            text: "Batal",
            style: "cancel"
        },
        {
            text: "Reset",
            style: "destructive",
            onPress: async () => {
            try {
                await resetOnboardingStatus();
                
                Alert.alert(
                "Berhasil! ✅",
                "Status onboarding telah direset. Restart app untuk melihat onboarding lagi.",
                [
                    {
                    text: "OK"
                    }
                ]
                );
            } catch (error) {
                console.error('Error resetting onboarding:', error);
                Alert.alert('Error', 'Gagal mereset onboarding.');
            }
            }
        }
        ]
    );
    };

    // Developer Options
    const DEVELOPER_ITEMS: DeveloperItem[] = [
    {
        icon: "refresh-outline",
        label: "Reset Upload Modal",
        subtitle: "Tampilkan kembali modal upload",
        color: "#9C27B0",
        action: resetUploadModal
    },
    {
        icon: "medical-outline", // NEW ITEM
        label: "Reset Lab Upload Status",
        subtitle: "Reset status upload lab & card",
        color: "#FF6B6B",
        action: resetLabStatus
    },
    {
        icon: "folder-open-outline",
        label: "Lihat Storage Keys",
        subtitle: "Debug AsyncStorage data",
        color: "#2196F3",
        action: viewStorageKeys
    },
    {
        icon: "school-outline", // NEW ITEM
        label: "Reset Onboarding",
        subtitle: "Tampilkan onboarding lagi",
        color: "#FF9800",
        action: resetOnboarding
    },
    {
        icon: "trash-outline",
        label: "Hapus Semua Data Lokal",
        subtitle: "Clear cache dan reset preferensi",
        color: "#FF5252",
        action: clearAllData,
        danger: true
    }
    ];

    const handleEditProfile = () => {
        router.push("/screens/Profile/EditProfile" as any);
    };

    const handleEditHealthData = () => {
        router.push("/screens/Profile/EditHealthData" as any);
    };

    const handleAllBadges = () => {
        router.push("/screens/Profile/AllBadges" as any);
    };

    const handleAvatarStore = () => {
        router.push("/screens/Profile/AvatarStore" as any);
    };

    const handleSettingsPress = (route: string) => {
        router.push(route as any);
    };

    const handleLogout = () => {
        Alert.alert(
            "Keluar",
            "Apakah Anda yakin ingin keluar?",
            [
                {
                    text: "Batal",
                    style: "cancel"
                },
                {
                    text: "Keluar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Hapus token dan data auth
                            await AsyncStorage.removeItem('userToken');
                            await AsyncStorage.removeItem('userData');
                            
                            // Redirect ke login
                            router.replace('loginSistem/login' as any);
                        } catch (error) {
                            console.error('Error during logout:', error);
                            Alert.alert('Error', 'Gagal logout. Silakan coba lagi.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 30,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F3F4F6",
                }}
            >
                <View style={{ width: 40 }} />
                <Text style={{ fontSize: 18, fontWeight: "600", color: "#1F2937" }}>
                    Profile
                </Text>
                <Pressable
                    style={({ pressed }) => ({
                        padding: 4,
                        opacity: pressed ? 0.7 : 1,
                    })}
                    onPress={() => router.push("/screens/Profile/NotificationSettings" as any)}
                >
                    <Ionicons name="notifications-outline" size={24} color="#1F2937" />
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
            >
                {/* Profile Info Card */}
                <Card>
                    <View style={{ alignItems: "center" }}>
                        <View style={{ position: "relative", marginBottom: 12 }}>
                            <View
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    backgroundColor: "#ECF4E8",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Ionicons name="person" size={40} color="#ABE7B2" />
                            </View>
                            <Pressable
                                style={({ pressed }) => ({
                                    position: "absolute",
                                    bottom: 0,
                                    right: 0,
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    backgroundColor: "#ABE7B2",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderWidth: 2,
                                    borderColor: "#FFFFFF",
                                    opacity: pressed ? 0.7 : 1,
                                })}
                                onPress={handleAvatarStore}
                            >
                                <Ionicons name="camera" size={14} color="#1F2937" />
                            </Pressable>
                        </View>

                        <Text style={{ fontSize: 20, fontWeight: "700", color: "#000000", marginBottom: 4 }}>
                            {userName}
                        </Text>
                        <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}>
                            {userEmail}
                        </Text>

                        <Pressable
                            style={({ pressed }) => ({
                                borderWidth: 1,
                                borderColor: "#ABE7B2",
                                borderRadius: 8,
                                paddingHorizontal: 20,
                                paddingVertical: 8,
                                opacity: pressed ? 0.7 : 1,
                            })}
                            onPress={handleEditProfile}
                        >
                            <Text style={{ fontSize: 14, fontWeight: "500", color: "#1F2937" }}>
                                Edit Profile
                            </Text>
                        </Pressable>
                    </View>
                </Card>

                {/* Gamification Stats Card */}
                <Card>
                    <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                        <View style={{ alignItems: "center", flex: 1 }}>
                            <View
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundColor: "#ECF4E8",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginBottom: 8,
                                }}
                            >
                                <Ionicons name="arrow-up" size={24} color="#ABE7B2" />
                            </View>
                            <Text style={{ fontSize: 20, fontWeight: "700", color: "#000000" }}>
                                {userData.level}
                            </Text>
                            <Text style={{ fontSize: 12, color: "#6B7280" }}>Level</Text>
                        </View>

                        <View style={{ width: 1, backgroundColor: "#E5E7EB", marginHorizontal: 8 }} />

                        <View style={{ alignItems: "center", flex: 1 }}>
                            <View
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundColor: "#FFF7E6",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginBottom: 8,
                                }}
                            >
                                <Ionicons name="diamond" size={24} color="#FFD580" />
                            </View>
                            <Text style={{ fontSize: 20, fontWeight: "700", color: "#000000" }}>
                                {userData.points}
                            </Text>
                            <Text style={{ fontSize: 12, color: "#6B7280" }}>Poin</Text>
                        </View>

                        <View style={{ width: 1, backgroundColor: "#E5E7EB", marginHorizontal: 8 }} />

                        <View style={{ alignItems: "center", flex: 1 }}>
                            <View
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundColor: "#E3F2FD",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginBottom: 8,
                                }}
                            >
                                <Ionicons name="trophy" size={24} color="#93BFC7" />
                            </View>
                            <Text style={{ fontSize: 20, fontWeight: "700", color: "#000000" }}>
                                {userData.badges}
                            </Text>
                            <Text style={{ fontSize: 12, color: "#6B7280" }}>Badge</Text>
                        </View>
                    </View>
                </Card>

                {/* Health Data Card */}
                <Card>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ fontSize: 16, fontWeight: "600", color: "#000000" }}>
                            Data Kesehatan Personal
                        </Text>
                        <Pressable
                            onPress={() => setHealthDataExpanded(!healthDataExpanded)}
                            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                        >
                            <Ionicons
                                name={healthDataExpanded ? "chevron-up" : "chevron-down"}
                                size={24}
                                color="#6B7280"
                            />
                        </Pressable>
                    </View>

                    {!healthDataExpanded && (
                        <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center" }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: "#7bb65eff",
                                    opacity: 0.3,
                                    marginRight: 12,
                                }}
                            />
                            <View>
                                <Text style={{ fontSize: 14, color: "#6B7280" }}>BMI</Text>
                                <Text style={{ fontSize: 18, fontWeight: "600", color: "#000000" }}>
                                    {bmiStatus?.text}
                                </Text>
                            </View>
                        </View>
                    )}

                    {healthDataExpanded && (
                        <View style={{ marginTop: 16 }}>
                            {[
                                { label: "Nama Lengkap", value: `${healthData?.fullName}` },
                                { label: "Umur", value: `${healthData?.age}` },
                                { label: "Jenis Kelamin", value: `${healthData?.gender}` },
                                { label: "Tinggi Badan", value: `${healthData?.height} cm` },
                                { label: "Berat Badan", value: `${healthData?.weight} kg` },
                                {
                                    label: "BMI",
                                    value: `${healthData?.bmi} `+`${bmiStatus?.text}`,
                                    valueColor: bmiStatus?.color
                                },
                                { label: "Golongan Darah", value: `${healthData?.bloodType}` },
                                { label: "Aktivitas Fisik", value: `${healthData?.physicalActivity}` },
                                { label: "Pola Makan", value: `${healthData?.dietPattern}` },
                                {
                                    label: "Riwayat Keluarga",
                                    value: `${healthData?.familyHistory}`
                                        ? `Ya (${MOCK_HEALTH_DATA.familyCondition})`
                                        : "Tidak"
                                },
                            ].map((item, index) => (
                                <View
                                    key={index}
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        paddingVertical: 10,
                                        borderBottomWidth: index < 8 ? 1 : 0,
                                        borderBottomColor: "#F3F4F6",
                                    }}
                                >
                                    <Text style={{ fontSize: 14, color: "#6B7280", flex: 1 }}>
                                        {item.label}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: "500",
                                            color: item.valueColor || "#000000",
                                            flex: 1,
                                            textAlign: "right",
                                        }}
                                    >
                                        {item.value}
                                    </Text>
                                </View>
                            ))}

                            <Pressable
                                style={({ pressed }) => ({
                                    backgroundColor: "#ECF4E8",
                                    borderRadius: 8,
                                    paddingVertical: 10,
                                    alignItems: "center",
                                    marginTop: 16,
                                    opacity: pressed ? 0.7 : 1,
                                })}
                                onPress={handleEditHealthData}
                            >
                                <Text style={{ fontSize: 14, fontWeight: "500", color: "#1F2937" }}>
                                    Edit Data
                                </Text>
                            </Pressable>
                        </View>
                    )}
                </Card>

                {/* Achievement Section */}
                <Card>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16,
                        }}
                    >
                        <Text style={{ fontSize: 16, fontWeight: "600", color: "#000000" }}>
                            Pencapaian Saya
                        </Text>
                        <Pressable 
                            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                            onPress={handleAllBadges}
                        >
                            <Ionicons name="arrow-forward" size={20} color="#93BFC7" />
                        </Pressable>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                            {MOCK_BADGES.map((badge) => (
                                <View key={badge.id} style={{ alignItems: "center", width: 80 }}>
                                    <View
                                        style={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: 32,
                                            backgroundColor: badge.earned ? "#ABE7B2" : "#F3F4F6",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Ionicons
                                            name={badge.icon}
                                            size={32}
                                            color={badge.earned ? "#1F2937" : "#9CA3AF"}
                                        />
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            color: badge.earned ? "#000000" : "#9CA3AF",
                                            textAlign: "center",
                                            lineHeight: 14,
                                        }}
                                    >
                                        {badge.name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    <Pressable
                        style={({ pressed }) => ({
                            marginTop: 16,
                            alignItems: "center",
                            opacity: pressed ? 0.7 : 1,
                        })}
                        onPress={handleAllBadges}
                    >
                        <Text style={{ fontSize: 13, fontWeight: "500", color: "#93BFC7" }}>
                            Lihat Semua Badge →
                        </Text>
                    </Pressable>
                </Card>

                {/* Avatar Store */}
                <Pressable
                    onPress={handleAvatarStore}
                    style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
                >
                    <Card>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                <View
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 24,
                                        backgroundColor: "#FFF7E6",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        marginRight: 12,
                                    }}
                                >
                                    <Ionicons name="sparkles" size={24} color="#FFD580" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 15, fontWeight: "600", color: "#000000", marginBottom: 2 }}>
                                        Toko Avatar
                                    </Text>
                                    <Text style={{ fontSize: 12, color: "#6B7280" }}>
                                        Percantik avatarmu!
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                        </View>
                    </Card>
                </Pressable>

                {/* Settings Menu */}
                <Card>
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#000000", marginBottom: 12 }}>
                        Pengaturan
                    </Text>
                    {SETTINGS_ITEMS.map((item, index) => (
                        <Pressable
                            key={index}
                            onPress={() => handleSettingsPress(item.route)}
                            style={({ pressed }) => ({
                                paddingVertical: 14,
                                paddingHorizontal: 4, 
                                marginBottom: index < SETTINGS_ITEMS.length - 1 ? 12 : 0, 
                                borderRadius: 8, 
                                backgroundColor: pressed ? "#F9FAFB" : "transparent", 
                                borderBottomWidth: 0, 
                            })}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginBottom: 12 }}>
                                    <View
                                        style={{
                                            width: 44, 
                                            height: 44,
                                            borderRadius: 22,
                                            backgroundColor: `${item.color}40`,
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginRight: 14,
                                        }}
                                    >
                                        <Ionicons name={item.icon} size={23} color={item.color} />
                                    </View>
                                    <Text style={{ fontSize: 14, color: "#000000" }}>
                                        {item.label}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                            </View>
                        </Pressable>
                    ))}
                </Card>

                {/* Developer Options - Collapsible */}
                <Card>
                    <Pressable
                        onPress={() => setDeveloperExpanded(!developerExpanded)}
                        style={({ pressed }) => ({
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            opacity: pressed ? 0.7 : 1,
                        })}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Ionicons name="code-slash" size={20} color="#9C27B0" style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: 16, fontWeight: "600", color: "#000000" }}>
                                Developer Options
                            </Text>
                        </View>
                        <Ionicons
                            name={developerExpanded ? "chevron-up" : "chevron-down"}
                            size={24}
                            color="#6B7280"
                        />
                    </Pressable>

                    {developerExpanded && (
                        <View style={{ marginTop: 16 }}>
                            {DEVELOPER_ITEMS.map((item, index) => (
                                <Pressable
                                    key={index}
                                    onPress={item.action}
                                    style={({ pressed }) => ({
                                        paddingVertical: 12,
                                        paddingHorizontal: 4,
                                        marginBottom: index < DEVELOPER_ITEMS.length - 1 ? 12 : 0,
                                        borderRadius: 8,
                                        backgroundColor: pressed ? "#F9FAFB" : "transparent",
                                    })}
                                >
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 20,
                                                backgroundColor: `${item.color}20`,
                                                justifyContent: "center",
                                                alignItems: "center",
                                                marginRight: 12,
                                            }}
                                        >
                                            <Ionicons name={item.icon} size={20} color={item.color} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: "500",
                                                    color: item.danger ? "#EF4444" : "#000000",
                                                    marginBottom: 2,
                                                }}
                                            >
                                                {item.label}
                                            </Text>
                                            <Text style={{ fontSize: 12, color: "#6B7280" }}>
                                                {item.subtitle}
                                            </Text>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </Card>

                {/* Logout */}
                <Pressable
                    onPress={handleLogout}
                    style={({ pressed }) => ({
                        borderWidth: 1,
                        borderColor: "#FF8A8A",
                        borderRadius: 12,
                        paddingVertical: 14,
                        alignItems: "center",
                        marginTop: 8,
                        opacity: pressed ? 0.7 : 1,
                    })}
                >
                    <Text style={{ fontSize: 15, fontWeight: "600", color: "#EF4444" }}>
                        Keluar
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}