import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import { Pressable, ScrollView, StatusBar, Text, View } from "react-native"

type RiskLevel = "rendah" | "sedang" | "tinggi"

interface HealthData {
    riskLevel: RiskLevel
    dailyTip: string
    challengeProgress: number
    challengeTitle: string
    nearbyEvent: string
    nearbyEventLocation: string
    dailyMission: string
    monthlyMission: string
    monthlyProgress: number
}

const MOCK_DATA: HealthData = {
    riskLevel: "rendah",
    dailyTip: "Minum air putih 8 gelas sehari membantu menjaga kesehatan ginjal dan metabolisme tubuh.",
    challengeProgress: 65,
    challengeTitle: "7-Day Walking Challenge",
    nearbyEvent: "Health Screening Camp",
    nearbyEventLocation: "Community Center, 2 km away",
    dailyMission: "Catat asupan gula hari ini",
    monthlyMission: "Capai 100 aktivitas sehat bulan ini",
    monthlyProgress: 42,
}

const getRiskColor = (level: RiskLevel): string => {
    switch (level) {
        case "rendah":
            return "#CBF3BB"
        case "sedang":
            return "#FFE8B6"
        case "tinggi":
            return "#FFB4B4"
        default:
            return "#ECF4E8"
    }
}

const getRiskStatusText = (level: RiskLevel): string => {
    switch (level) {
        case "rendah":
            return "Risiko Rendah"
        case "sedang":
            return "Risiko Sedang"
        case "tinggi":
            return "Risiko Tinggi"
    }
}

const getRiskCircleColor = (level: RiskLevel): string => {
    switch (level) {
        case "rendah":
            return "#ABE7B2"
        case "sedang":
            return "#FFD580"
        case "tinggi":
            return "#FF8A8A"
    }
}

interface CardProps {
    children: React.ReactNode
}

const Card: React.FC<CardProps> = ({ children }) => (
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
        }}
    >
        {children}
    </View>
)

interface QuickAccessItem {
    icon: keyof typeof Ionicons.glyphMap
    label: string
    color: string
}

const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
    { icon: "pulse-outline", label: "Tracker Rutin", color: "#ABE7B2" },
    { icon: "book-outline", label: "Artikel Kesehatan", color: "#93BFC7" },
    { icon: "notifications-outline", label: "Custom Reminder", color: "#ABE7B2" },
    { icon: "chatbubble-ellipses-outline", label: "Chatbot", color: "#93BFC7" },
    { icon: "folder-open-outline", label: "Arsip Lab", color: "#ABE7B2" },
    { icon: "location-outline", label: "Lab Terdekat", color: "#93BFC7" },
]

interface QuickAccessCardProps {
    onPress: (label: string) => void
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ onPress }) => (
    <Card>
        <View
            style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
            }}
        >
            {QUICK_ACCESS_ITEMS.map((item, index) => (
                <Pressable
                    key={index}
                    onPress={() => onPress(item.label)}
                    style={({ pressed }) => ({
                        width: "30%",
                        alignItems: "center",
                        marginBottom: index < 3 ? 16 : 0,
                        opacity: pressed ? 0.7 : 1,
                    })}
                >
                    <View
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: item.color,
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 8,
                        }}
                    >
                        <Ionicons name={item.icon} size={24} color="#1F2937" />
                    </View>
                    <Text
                        style={{
                            fontSize: 12,
                            color: "#1F2937",
                            textAlign: "center",
                            lineHeight: 16,
                        }}
                    >
                        {item.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    </Card>
)

export default function HomeScreen() {
    const [dailyMissionChecked, setDailyMissionChecked] = useState(false)

    const userName = "Budi"
    const today = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    const handleQuickAccessPress = (label: string) => {
        console.log(`Pressed: ${label}`)
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
            >
                {/* Header */}
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 28, fontWeight: "700", color: "#000000" }}>
                        Hai, {userName}!
                    </Text>
                    <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
                        {today}
                    </Text>
                </View>

                {/* Health Risk Status Card */}
                <Card>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: getRiskColor(MOCK_DATA.riskLevel),
                                justifyContent: "center",
                                alignItems: "center",
                                marginRight: 16,
                            }}
                        >
                            <View
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    backgroundColor: getRiskCircleColor(MOCK_DATA.riskLevel),
                                }}
                            />
                        </View>
                        <View>
                            <Text style={{ fontSize: 14, color: "#6B7280" }}>
                                Status Kesehatan Anda
                            </Text>
                            <Text style={{ fontSize: 18, fontWeight: "600", color: "#000000", marginTop: 4 }}>
                                {getRiskStatusText(MOCK_DATA.riskLevel)}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Quick Access Features Card */}
                <QuickAccessCard onPress={handleQuickAccessPress} />

                {/* Daily Tips Card */}
                <Card>
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                        <Ionicons
                            name="bulb-outline"
                            size={24}
                            color="#ABE7B2"
                            style={{ marginRight: 12, marginTop: 2 }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: "#000000", marginBottom: 8 }}>
                                Tips Hari Ini
                            </Text>
                            <Text style={{ fontSize: 14, color: "#374151", lineHeight: 20 }}>
                                {MOCK_DATA.dailyTip}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Active Challenge Progress */}
                <Card>
                    <View style={{ marginBottom: 12 }}>
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8
                        }}>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: "#000000" }}>
                                {MOCK_DATA.challengeTitle}
                            </Text>
                            <Text style={{ fontSize: 12, fontWeight: "500", color: "#6B7280" }}>
                                {MOCK_DATA.challengeProgress}%
                            </Text>
                        </View>
                        <View style={{
                            backgroundColor: "#F3F4F6",
                            borderRadius: 10,
                            height: 8,
                            overflow: "hidden"
                        }}>
                            <View
                                style={{
                                    width: `${MOCK_DATA.challengeProgress}%`,
                                    backgroundColor: "#ABE7B2",
                                    height: 8,
                                }}
                            />
                        </View>
                    </View>
                    <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        Kamu sudah berjalan {Math.round((MOCK_DATA.challengeProgress / 100) * 25000)} langkah
                    </Text>
                </Card>

                {/* Nearby Event Card */}
                <Card>
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                        <Ionicons
                            name="location-outline"
                            size={20}
                            color="#93BFC7"
                            style={{ marginRight: 8, marginTop: 2 }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: "#000000", marginBottom: 4 }}>
                                {MOCK_DATA.nearbyEvent}
                            </Text>
                            <Text style={{ fontSize: 12, color: "#6B7280" }}>
                                {MOCK_DATA.nearbyEventLocation}
                            </Text>
                        </View>
                        <Pressable
                            style={({ pressed }) => ({
                                backgroundColor: "#EFF6FF",
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 8,
                                opacity: pressed ? 0.7 : 1,
                            })}
                        >
                            <Text style={{ fontSize: 12, fontWeight: "500", color: "#2563EB" }}>
                                Lihat
                            </Text>
                        </Pressable>
                    </View>
                </Card>

                {/* Daily Mission Card */}
                <Card>
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                            <Pressable
                                onPress={() => setDailyMissionChecked(!dailyMissionChecked)}
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderWidth: 2,
                                    borderColor: dailyMissionChecked ? "#ABE7B2" : "#D1D5DB",
                                    backgroundColor: dailyMissionChecked ? "#ABE7B2" : "transparent",
                                    borderRadius: 6,
                                    marginRight: 12,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {dailyMissionChecked && (
                                    <Ionicons name="checkmark" size={16} color="#1F2937" />
                                )}
                            </Pressable>
                            <Text style={{ fontSize: 14, color: "#000000", fontWeight: "500" }}>
                                {MOCK_DATA.dailyMission}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </View>
                </Card>

                {/* Monthly Mission Card */}
                <Card>
                    <View style={{ marginBottom: 12 }}>
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8
                        }}>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: "#000000" }}>
                                {MOCK_DATA.monthlyMission}
                            </Text>
                            <Text style={{ fontSize: 12, fontWeight: "500", color: "#6B7280" }}>
                                {MOCK_DATA.monthlyProgress}%
                            </Text>
                        </View>
                        <View style={{
                            backgroundColor: "#F3F4F6",
                            borderRadius: 10,
                            height: 10,
                            overflow: "hidden"
                        }}>
                            <View
                                style={{
                                    width: `${MOCK_DATA.monthlyProgress}%`,
                                    backgroundColor: "#93BFC7",
                                    height: 10,
                                }}
                            />
                        </View>
                    </View>
                    <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        {MOCK_DATA.monthlyProgress} dari 100 aktivitas selesai
                    </Text>
                </Card>
            </ScrollView>
        </View>
    )
}