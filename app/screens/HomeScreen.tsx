import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    Text,
    View,
} from 'react-native';
import { auth } from '../../src/config/firebase.config';
import { useDashboard } from '../../src/hooks/useDashboard';
import { useUser } from '../../src/hooks/useUser';

type RiskLevel = 'rendah' | 'sedang' | 'tinggi';

const getRiskColor = (level: RiskLevel): string => {
  switch (level) {
    case 'rendah':
      return '#CBF3BB';
    case 'sedang':
      return '#FFE8B6';
    case 'tinggi':
      return '#FFB4B4';
    default:
      return '#ECF4E8';
  }
};

const getRiskStatusText = (level: RiskLevel): string => {
  switch (level) {
    case 'rendah':
      return 'Risiko Rendah';
    case 'sedang':
      return 'Risiko Sedang';
    case 'tinggi':
      return 'Risiko Tinggi';
  }
};

const getRiskCircleColor = (level: RiskLevel): string => {
  switch (level) {
    case 'rendah':
      return '#ABE7B2';
    case 'sedang':
      return '#FFD580';
    case 'tinggi':
      return '#FF8A8A';
  }
};

interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => (
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#F3F4F6',
    }}
  >
    {children}
  </View>
);

interface QuickAccessItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}

const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
  { icon: 'pulse-outline', label: 'Tracker Rutin', color: '#ABE7B2' },
  { icon: 'book-outline', label: 'Artikel Kesehatan', color: '#93BFC7' },
  { icon: 'notifications-outline', label: 'Custom Reminder', color: '#ABE7B2' },
  { icon: 'chatbubble-ellipses-outline', label: 'Chatbot', color: '#93BFC7' },
  { icon: 'folder-open-outline', label: 'Arsip Lab', color: '#ABE7B2' },
  { icon: 'location-outline', label: 'Lab Terdekat', color: '#93BFC7' },
];

interface QuickAccessCardProps {
  onPress: (label: string) => void;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ onPress }) => (
  <Card>
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}
    >
      {QUICK_ACCESS_ITEMS.map((item, index) => (
        <Pressable
          key={index}
          onPress={() => onPress(item.label)}
          style={({ pressed }) => ({
            width: '30%',
            alignItems: 'center',
            marginBottom: index < 3 ? 16 : 0,
            opacity: pressed ? 0.7 : 1,
            minHeight: 90,
          })}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: item.color,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Ionicons name={item.icon} size={24} color="#1F2937" />
          </View>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 12,
              color: '#1F2937',
              textAlign: 'center',
              lineHeight: 16,
              width: '100%',
              height: 32,
            }}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  </Card>
);

// Daily tips array
const DAILY_TIPS = [
  'Minum air putih 8 gelas sehari membantu menjaga kesehatan ginjal dan metabolisme tubuh.',
  'Tidur 7-8 jam sehari sangat penting untuk kesehatan mental dan fisik.',
  'Olahraga 30 menit sehari dapat meningkatkan mood dan energi Anda.',
  'Konsumsi sayur dan buah setiap hari untuk memenuhi kebutuhan vitamin.',
  'Hindari stres berlebihan dengan meditasi atau hobi yang menyenangkan.',
];

export default function HomeScreen() {
  const [dailyMissionChecked, setDailyMissionChecked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user data
  const { user, loading: userLoading } = useUser();
  const { data: dashboardData, loading: dashboardLoading } = useDashboard();

  // Get current user from Firebase
  const currentUser = auth.currentUser;
  const userName = user?.full_name || currentUser?.displayName || 'User';

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Random daily tip
  const dailyTip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];

  const handleQuickAccessPress = (label: string) => {
    console.log(`Pressed: ${label}`);
    // TODO: Navigate to respective screens
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Implement refresh logic
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (userLoading || dashboardLoading) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}
      >
        <ActivityIndicator size="large" color="#ABE7B2" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 50,
          paddingBottom: 32,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ABE7B2']} />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#000000' }}>
            Hai, {userName}!
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>{today}</Text>
        </View>

        {/* Health Risk Status Card */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: getRiskColor(
                  dashboardData?.riskLevel || 'rendah'
                ),
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: getRiskCircleColor(
                    dashboardData?.riskLevel || 'rendah'
                  ),
                }}
              />
            </View>
            <View>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>
                Status Kesehatan Anda
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#000000',
                  marginTop: 4,
                }}
              >
                {getRiskStatusText(dashboardData?.riskLevel || 'rendah')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Access Features Card */}
        <QuickAccessCard onPress={handleQuickAccessPress} />

        {/* Daily Tips Card */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons
              name="bulb-outline"
              size={24}
              color="#ABE7B2"
              style={{ marginRight: 12, marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: 8,
                }}
              >
                Tips Hari Ini
              </Text>
              <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>
                {dailyTip}
              </Text>
            </View>
          </View>
        </Card>

        {/* Active Challenge Progress */}
        {dashboardData?.activeChallenge && (
          <Card>
            <View style={{ marginBottom: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#000000' }}>
                  {dashboardData.activeChallenge.title}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280' }}>
                  {dashboardData.activeChallenge.progress}%
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: 10,
                  height: 8,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${dashboardData.activeChallenge.progress}%`,
                    backgroundColor: '#ABE7B2',
                    height: 8,
                  }}
                />
              </View>
            </View>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              Progress: {dashboardData.activeChallenge.progress} dari{' '}
              {dashboardData.activeChallenge.target}
            </Text>
          </Card>
        )}

        {/* Challenge Stats */}
        {dashboardData?.challengeStats && (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ABE7B2' }}>
                  {dashboardData.challengeStats.active}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                  Aktif
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#93BFC7' }}>
                  {dashboardData.challengeStats.completed}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                  Selesai
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#374151' }}>
                  {dashboardData.challengeStats.total}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                  Total
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Daily Mission Card */}
        <Card>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Pressable
                onPress={() => setDailyMissionChecked(!dailyMissionChecked)}
                style={{
                  width: 24,
                  height: 24,
                  borderWidth: 2,
                  borderColor: dailyMissionChecked ? '#ABE7B2' : '#D1D5DB',
                  backgroundColor: dailyMissionChecked ? '#ABE7B2' : 'transparent',
                  borderRadius: 6,
                  marginRight: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {dailyMissionChecked && <Ionicons name="checkmark" size={16} color="#1F2937" />}
              </Pressable>
              <Text style={{ fontSize: 14, color: '#000000', fontWeight: '500' }}>
                Catat asupan gula hari ini
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}