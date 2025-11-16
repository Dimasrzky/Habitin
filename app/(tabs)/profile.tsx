import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import { Pressable, ScrollView, StatusBar, Text, View } from "react-native"

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
    height: number // cm
    weight: number // kg
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

const SETTINGS_ITEMS: SettingsItem[] = [
    { icon: "notifications-outline", label: "Pengaturan Notifikasi", color: "#ABE7B2" },
    { icon: "shield-checkmark-outline", label: "Privasi & Keamanan", color: "#93BFC7" },
    { icon: "help-circle-outline", label: "Bantuan & Dukungan", color: "#ABE7B2" },
    { icon: "information-circle-outline", label: "Tentang Habitin", color: "#93BFC7" },
]

// Helper function for BMI status
const getBMIStatus = (bmi: number): { text: string; color: string } => {
    if (bmi < 18.5) return { text: "Kurang", color: "#FFD580" }
    if (bmi < 25) return { text: "Normal", color: "#ABE7B2" }
    if (bmi < 30) return { text: "Berlebih", color: "#FFD580" }
    return { text: "Obesitas", color: "#FF8A8A" }
}

// Card Component
interface CardProps {
    children: React.ReactNode
    style?: object
}

const Card: React.FC<CardProps> = ({ children, style }) => (
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
    const [healthDataExpanded, setHealthDataExpanded] = useState(false)

    const bmiStatus = getBMIStatus(MOCK_HEALTH_DATA.bmi)

    const handleSettingsPress = (label: string) => {
        console.log(`Pressed: ${label}`)
    }

    const handleAvatarStorePress = () => {
        console.log("Navigate to Avatar Store")
    }

    const handleLogout = () => {
        console.log("Logout pressed")
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
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
                        {/* Avatar with camera overlay */}
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
                                onPress={handleAvatarStorePress}
                            >
                                <Ionicons name="camera" size={14} color="#1F2937" />
                            </Pressable>
                        </View>

                        {/* User Info */}
                        <Text style={{ fontSize: 20, fontWeight: "700", color: "#000000", marginBottom: 4 }}>
                            {MOCK_USER.name}
                        </Text>
                        <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}>
                            {MOCK_USER.email}
                        </Text>

                        {/* Edit Profile Button */}
                        <Pressable
                            style={({ pressed }) => ({
                                borderWidth: 1,
                                borderColor: "#ABE7B2",
                                borderRadius: 8,
                                paddingHorizontal: 20,
                                paddingVertical: 8,
                                opacity: pressed ? 0.7 : 1,
                            })}
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
                        {/* Level */}
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
                                {MOCK_USER.level}
                            </Text>
                            <Text style={{ fontSize: 12, color: "#6B7280" }}>Level</Text>
                        </View>

                        {/* Divider */}
                        <View style={{ width: 1, backgroundColor: "#E5E7EB", marginHorizontal: 8 }} />

                        {/* Points */}
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
                                {MOCK_USER.points}
                            </Text>
                            <Text style={{ fontSize: 12, color: "#6B7280" }}>Poin</Text>
                        </View>

                        {/* Divider */}
                        <View style={{ width: 1, backgroundColor: "#E5E7EB", marginHorizontal: 8 }} />

                        {/* Badges */}
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
                                {MOCK_USER.badges}
                            </Text>
                            <Text style={{ fontSize: 12, color: "#6B7280" }}>Badge</Text>
                        </View>
                    </View>
                </Card>

                {/* Personal Health Data Card (Collapsible) */}
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

                    {/* Collapsed View - Show only BMI */}
                    {!healthDataExpanded && (
                        <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center" }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: bmiStatus.color,
                                    opacity: 0.3,
                                    marginRight: 12,
                                }}
                            />
                            <View>
                                <Text style={{ fontSize: 14, color: "#6B7280" }}>BMI</Text>
                                <Text style={{ fontSize: 18, fontWeight: "600", color: "#000000" }}>
                                    {MOCK_HEALTH_DATA.bmi} - {bmiStatus.text}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Expanded View - Full Health Data */}
                    {healthDataExpanded && (
                        <View style={{ marginTop: 16 }}>
                            {/* Data Rows */}
                            {[
                                { label: "Nama Lengkap", value: MOCK_HEALTH_DATA.fullName },
                                { label: "Umur", value: `${MOCK_HEALTH_DATA.age} tahun` },
                                { label: "Jenis Kelamin", value: MOCK_HEALTH_DATA.gender },
                                { label: "Tinggi Badan", value: `${MOCK_HEALTH_DATA.height} cm` },
                                { label: "Berat Badan", value: `${MOCK_HEALTH_DATA.weight} kg` },
                                {
                                    label: "BMI",
                                    value: `${MOCK_HEALTH_DATA.bmi} (${bmiStatus.text})`,
                                    valueColor: bmiStatus.color
                                },
                                { label: "Aktivitas Fisik", value: MOCK_HEALTH_DATA.physicalActivity },
                                { label: "Pola Makan", value: MOCK_HEALTH_DATA.dietPattern },
                                {
                                    label: "Riwayat Keluarga",
                                    value: MOCK_HEALTH_DATA.familyHistory
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

                            {/* Edit Data Button */}
                            <Pressable
                                style={({ pressed }) => ({
                                    backgroundColor: "#ECF4E8",
                                    borderRadius: 8,
                                    paddingVertical: 10,
                                    alignItems: "center",
                                    marginTop: 16,
                                    opacity: pressed ? 0.7 : 1,
                                })}
                            >
                                <Text style={{ fontSize: 14, fontWeight: "500", color: "#1F2937" }}>
                                    Edit Data
                                </Text>
                            </Pressable>
                        </View>
                    )}
                </Card>

                {/* Achievement Section Card */}
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
                        <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                            <Ionicons name="arrow-forward" size={20} color="#93BFC7" />
                        </Pressable>
                    </View>

                    {/* Horizontal Badge List */}
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

                    {/* View All Link */}
                    <Pressable
                        style={({ pressed }) => ({
                            marginTop: 16,
                            alignItems: "center",
                            opacity: pressed ? 0.7 : 1,
                        })}
                    >
                        <Text style={{ fontSize: 13, fontWeight: "500", color: "#93BFC7" }}>
                            Lihat Semua Badge →
                        </Text>
                    </Pressable>
                </Card>

                {/* Avatar Store Access Card */}
                <Pressable
                    onPress={handleAvatarStorePress}
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.95 : 1,
                    })}
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

                {/* Settings Menu List */}
                <Card>
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#000000", marginBottom: 12 }}>
                        Pengaturan
                    </Text>
                    {SETTINGS_ITEMS.map((item, index) => (
                        <Pressable
                            key={index}
                            onPress={() => handleSettingsPress(item.label)}
                            style={({ pressed }) => ({
                                paddingVertical: 12,
                                borderBottomWidth: index < SETTINGS_ITEMS.length - 1 ? 1 : 0,
                                borderBottomColor: "#F3F4F6",
                                opacity: pressed ? 0.7 : 1,
                            })}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginBottom: 10 }}>
                                    <View
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            backgroundColor: `${item.color}40`,
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginRight: 12,
                                        }}
                                    >
                                        <Ionicons name={item.icon} size={20} color={item.color} />
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

                {/* Logout Section */}
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