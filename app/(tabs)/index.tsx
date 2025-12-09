import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../src/config/firebase.config';
import { useDashboard } from '../../src/hooks/useDashboard';
import { useUser } from '../../src/hooks/useUser';

// ==================== TYPES ====================
type RiskLevel = 'rendah' | 'sedang' | 'tinggi';

interface CardProps {
  children: React.ReactNode;
}

interface QuickAccessItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}

interface QuickAccessCardProps {
  onPress: (label: string) => void;
}

// ==================== CONSTANTS ====================
const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
  { icon: 'pulse-outline', label: 'Tracker Rutin', color: '#ABE7B2' },
  { icon: 'book-outline', label: 'Artikel Kesehatan', color: '#93BFC7' },
  { icon: 'notifications-outline', label: 'Custom Reminder', color: '#ABE7B2' },
  { icon: 'chatbubble-ellipses-outline', label: 'Chatbot', color: '#93BFC7' },
  { icon: 'folder-open-outline', label: 'Arsip Lab', color: '#ABE7B2' },
  { icon: 'location-outline', label: 'Lab Terdekat', color: '#93BFC7' },
];

const DAILY_TIPS = [
  'Minum air putih 8 gelas sehari membantu menjaga kesehatan ginjal dan metabolisme tubuh.',
  'Tidur 7-8 jam sehari sangat penting untuk kesehatan mental dan fisik.',
  'Olahraga 30 menit sehari dapat meningkatkan mood dan energi Anda.',
  'Konsumsi sayur dan buah setiap hari untuk memenuhi kebutuhan vitamin.',
  'Hindari stres berlebihan dengan meditasi atau hobi yang menyenangkan.',
];

// AsyncStorage Keys
const UPLOAD_MODAL_SHOWN_KEY = 'upload_modal_shown';
const HAS_UPLOADED_LAB_KEY = 'has_uploaded_lab';

// ==================== HELPER FUNCTIONS ====================
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
    default:
      return 'Status Tidak Diketahui';
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
    default:
      return '#D1D5DB';
  }
};

// ==================== COMPONENTS ====================
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

// ==================== MAIN COMPONENT ====================
export default function HomeScreen() {
  // ===== State Management =====
  const [dailyMissionChecked, setDailyMissionChecked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [hasUploadedLab, setHasUploadedLab] = useState(false);

  // ===== Hooks =====
  const { user, loading: userLoading } = useUser();
  const { data: dashboardData, loading: dashboardLoading, refetch } = useDashboard();

  // ===== Computed Values =====
  const currentUser = auth.currentUser;
  const userName = user?.full_name || currentUser?.displayName || 'User';

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const dailyTip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];

  // ===== Effects =====
  
  // Check lab upload status on mount
  useEffect(() => {
    const checkLabStatus = async () => {
      try {
        const modalShown = await AsyncStorage.getItem(UPLOAD_MODAL_SHOWN_KEY);
        const uploaded = await AsyncStorage.getItem(HAS_UPLOADED_LAB_KEY);

        setHasUploadedLab(uploaded === 'true');

        // Show modal only if:
        // 1. Modal hasn't been shown before
        // 2. User hasn't uploaded lab yet
        // 3. User data is loaded
        if (!modalShown && uploaded !== 'true' && !userLoading && !dashboardLoading) {
          setTimeout(() => {
            setShowUploadModal(true);
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking lab status:', error);
      }
    };

    checkLabStatus();
  }, [userLoading, dashboardLoading]);

  // ===== Handlers =====

  const handleUploadNow = async () => {
    try {
      await AsyncStorage.setItem(UPLOAD_MODAL_SHOWN_KEY, 'true');
      setShowUploadModal(false);
      
      // Navigate to upload screen
      router.push('/screens/cekKesehatan/uploadLab' as any);
    } catch (error) {
      console.error('Error setting modal status:', error);
    }
  };

  const handleUploadLater = async () => {
    try {
      // Set flag that modal has been shown
      await AsyncStorage.setItem(UPLOAD_MODAL_SHOWN_KEY, 'true');

      setShowUploadModal(false);
    } catch (error) {
      console.error('Error setting modal status:', error);
    }
  };

  const handleUploadCardPress = () => {
    
    // Navigate to upload page
    router.push('/screens/cekKesehatan/uploadLab' as any);
  };

  const handleQuickAccessPress = (label: string) => {
    console.log(`Pressed: ${label}`);
    // TODO: Navigate to respective screens
    alert(`Fitur "${label}" belum diimplementasikan`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    
    try {
      await refetch();

      // Recheck lab status after refresh
      const uploaded = await AsyncStorage.getItem(HAS_UPLOADED_LAB_KEY);
      
      setHasUploadedLab(uploaded === 'true');
      
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // ===== Loading State =====
  if (userLoading || dashboardLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <ActivityIndicator size="large" color="#ABE7B2" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Memuat data...</Text>
      </View>
    );
  }

  // ===== Main Render =====
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ABE7B2']}
            tintColor="#ABE7B2"
          />
        }
      >
        {/* ==================== HEADER ==================== */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#000000' }}>
            Hai, {userName}!
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            {today}
          </Text>
        </View>

        {/* ==================== HEALTH STATUS / UPLOAD LAB CARD ==================== */}
        {hasUploadedLab ? (
          // ✅ User sudah upload lab → Tampilkan Health Risk Status
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: getRiskColor(dashboardData?.riskLevel || 'rendah'),
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
        ) : (
          // ✅ User belum upload lab → Tampilkan Upload Lab Card (Abu-abu)
          <Pressable onPress={handleUploadCardPress}>
            {({ pressed }) => (
              <Card>
                <View
                  style={{
                    alignItems: 'center',
                    paddingVertical: 12,
                    opacity: pressed ? 0.7 : 1,
                  }}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: '#F3F4F6',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Ionicons name="cloud-upload-outline" size={32} color="#9CA3AF" />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#6B7280',
                      marginBottom: 4,
                    }}
                  >
                    Upload Hasil Lab
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#9CA3AF',
                      textAlign: 'center',
                      paddingHorizontal: 20,
                      lineHeight: 18,
                    }}
                  >
                    Tap untuk upload hasil lab dan dapatkan analisis kesehatan
                  </Text>
                </View>
              </Card>
            )}
          </Pressable>
        )}

        {/* ==================== QUICK ACCESS ==================== */}
        <QuickAccessCard onPress={handleQuickAccessPress} />

        {/* ==================== DAILY TIPS ==================== */}
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

        {/* ==================== ACTIVE CHALLENGE ==================== */}
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

        {/* ==================== CHALLENGE STATS ==================== */}
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

        {/* ==================== DAILY MISSION ==================== */}
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
                {dailyMissionChecked && (
                  <Ionicons name="checkmark" size={16} color="#1F2937" />
                )}
              </Pressable>
              <Text style={{ fontSize: 14, color: '#000000', fontWeight: '500' }}>
                Catat asupan gula hari ini
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </View>
        </Card>
      </ScrollView>

      {/* ==================== UPLOAD LAB MODAL ==================== */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="fade"
        onRequestClose={handleUploadLater}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#E8F5E9',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 40 }}>📋</Text>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 22,
                fontWeight: 'bold',
                color: '#212121',
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              Upload Hasil Lab?
            </Text>

            {/* Description */}
            <Text
              style={{
                fontSize: 15,
                color: '#757575',
                textAlign: 'center',
                marginBottom: 24,
                lineHeight: 22,
              }}
            >
              Mulai pantau kesehatan Anda dengan mengupload hasil lab. Anda juga bisa
              melakukannya nanti.
            </Text>

            {/* Upload Now Button */}
            <TouchableOpacity
              style={{
                width: '100%',
                backgroundColor: '#4CAF50',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 12,
                shadowColor: '#4CAF50',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={handleUploadNow}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Upload Sekarang
              </Text>
            </TouchableOpacity>

            {/* Skip Button */}
            <TouchableOpacity
              style={{
                width: '100%',
                paddingVertical: 16,
                alignItems: 'center',
              }}
              onPress={handleUploadLater}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: '#757575',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Nanti Saja
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}