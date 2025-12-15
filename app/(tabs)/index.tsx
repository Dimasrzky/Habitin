import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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

// Fungsi untuk menghitung skor risiko individual per parameter (0-100)
const calculateRiskScore = (value: number | null, type: string): number => {
  if (value === null) return 0;

  switch (type) {
    case 'glucose':
      // Normal: < 100 (0%), Prediabetes: 100-125 (50%), Diabetes: >= 126 (100%)
      if (value < 100) return 0;
      if (value < 126) return ((value - 100) / 26) * 50; // 0-50%
      return Math.min(50 + ((value - 126) / 74) * 50, 100); // 50-100%

    case 'glucose_2h':
      // Normal: < 140 (0%), Prediabetes: 140-199 (50%), Diabetes: >= 200 (100%)
      if (value < 140) return 0;
      if (value < 200) return ((value - 140) / 60) * 50;
      return Math.min(50 + ((value - 200) / 50) * 50, 100);

    case 'hba1c':
      // Normal: < 5.7 (0%), Prediabetes: 5.7-6.4 (50%), Diabetes: >= 6.5 (100%)
      if (value < 5.7) return 0;
      if (value < 6.5) return ((value - 5.7) / 0.8) * 50;
      return Math.min(50 + ((value - 6.5) / 3.5) * 50, 100);

    case 'cholesterol_total':
      // Desirable: < 200 (0%), Borderline: 200-239 (50%), High: >= 240 (100%)
      if (value < 200) return 0;
      if (value < 240) return ((value - 200) / 40) * 50;
      return Math.min(50 + ((value - 240) / 60) * 50, 100);

    case 'ldl':
      // Optimal: < 100 (0%), Borderline: 100-159 (50%), High: >= 160 (100%)
      if (value < 100) return 0;
      if (value < 160) return ((value - 100) / 60) * 50;
      return Math.min(50 + ((value - 160) / 40) * 50, 100);

    case 'hdl':
      // Good: >= 60 (0%), Borderline: 40-59 (50%), Low: < 40 (100%)
      if (value >= 60) return 0;
      if (value >= 40) return ((60 - value) / 20) * 50;
      return Math.min(50 + ((40 - value) / 40) * 50, 100);

    case 'triglycerides':
      // Normal: < 150 (0%), Borderline: 150-199 (50%), High: >= 200 (100%)
      if (value < 150) return 0;
      if (value < 200) return ((value - 150) / 50) * 50;
      return Math.min(50 + ((value - 200) / 50) * 50, 100);

    default:
      return 0;
  }
};

// Fungsi untuk menghitung persentase risiko diabetes (rata-rata dari semua parameter diabetes)
const calculateDiabetesRiskPercentage = (labResult: any): number => {
  const scores: number[] = [];

  if (labResult.glucose_level !== null) {
    scores.push(calculateRiskScore(labResult.glucose_level, 'glucose'));
  }
  if (labResult.glucose_2h !== null) {
    scores.push(calculateRiskScore(labResult.glucose_2h, 'glucose_2h'));
  }
  if (labResult.hba1c !== null) {
    scores.push(calculateRiskScore(labResult.hba1c, 'hba1c'));
  }

  if (scores.length === 0) return 0;

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(average);
};

// Fungsi untuk menghitung persentase risiko kolesterol (rata-rata dari semua parameter kolesterol)
const calculateCholesterolRiskPercentage = (labResult: any): number => {
  const scores: number[] = [];

  if (labResult.cholesterol_total !== null) {
    scores.push(calculateRiskScore(labResult.cholesterol_total, 'cholesterol_total'));
  }
  if (labResult.cholesterol_ldl !== null) {
    scores.push(calculateRiskScore(labResult.cholesterol_ldl, 'ldl'));
  }
  if (labResult.cholesterol_hdl !== null) {
    scores.push(calculateRiskScore(labResult.cholesterol_hdl, 'hdl'));
  }
  if (labResult.triglycerides !== null) {
    scores.push(calculateRiskScore(labResult.triglycerides, 'triglycerides'));
  }

  if (scores.length === 0) return 0;

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(average);
};

// Fungsi untuk mendapatkan status berdasarkan persentase
const getRiskStatusFromPercentage = (percentage: number): string => {
  if (percentage < 25) return 'Rendah';
  if (percentage < 50) return 'Sedang';
  if (percentage < 75) return 'Tinggi';
  return 'Sangat Tinggi';
};

// Fungsi untuk mendapatkan warna berdasarkan persentase
const getRiskColorFromPercentage = (percentage: number): string => {
  if (percentage < 25) return '#ABE7B2'; // Hijau
  if (percentage < 50) return '#FFD580'; // Kuning
  if (percentage < 75) return '#FFB4B4'; // Merah muda
  return '#FF8A8A'; // Merah
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
        marginHorizontal: -6,
      }}
    >
      {QUICK_ACCESS_ITEMS.map((item, index) => (
        <View
          key={index}
          style={{
            width: '33.333%',
            paddingHorizontal: 23,
            marginBottom: 16,
          }}
        >
          <Pressable
            onPress={() => onPress(item.label)}
            style={({ pressed }) => ({
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 4,
              backgroundColor: pressed ? '#F9FAFB' : 'transparent',
              borderRadius: 12,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: item.color,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
                left: 4,
              }}
            >
              <Ionicons name={item.icon} size={26} color="#1F2937" />
            </View>
            <Text
              numberOfLines={2}
              style={{
                fontSize: 11.5,
                fontWeight: '500',
                color: '#374151',
                textAlign: 'center',
                lineHeight: 15,
                paddingHorizontal: 1,
                minHeight: 30,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        </View>
      ))} 
    </View>
  </Card>
);

// Component untuk menampilkan persentase risiko penyakit
interface DiseaseRiskItemProps {
  icon: string;
  diseaseName: string;
  riskPercentage: number;
}

const DiseaseRiskItem: React.FC<DiseaseRiskItemProps> = ({ icon, diseaseName, riskPercentage }) => {
  const status = getRiskStatusFromPercentage(riskPercentage);
  const color = getRiskColorFromPercentage(riskPercentage);

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937' }}>{diseaseName}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: color }}>
            {riskPercentage}%
          </Text>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              backgroundColor: color,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#FFFFFF' }}>
              {status}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View
        style={{
          height: 8,
          backgroundColor: '#F3F4F6',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${riskPercentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      </View>

      {/* Status Description */}
      <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
        {riskPercentage < 25
          ? 'Hasil pemeriksaan Anda dalam batas normal'
          : riskPercentage < 50
          ? 'Perlu perhatian, pertimbangkan konsultasi dengan dokter'
          : riskPercentage < 75
          ? 'Risiko tinggi, segera konsultasi dengan dokter'
          : 'Risiko sangat tinggi, segera periksakan ke dokter'}
      </Text>
    </View>
  );
};

// ==================== MAIN COMPONENT ====================
export default function HomeScreen() {
  // ===== State Management =====
  const [dailyMissionChecked, setDailyMissionChecked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [hasUploadedLab, setHasUploadedLab] = useState(false);
  const [isHealthDetailExpanded, setIsHealthDetailExpanded] = useState(false);

  // ===== Animation =====
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

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

  // Animate dropdown when expanded/collapsed
  useEffect(() => {
    Animated.parallel([
      Animated.timing(dropdownAnimation, {
        toValue: isHealthDetailExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnimation, {
        toValue: isHealthDetailExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isHealthDetailExpanded, dropdownAnimation, rotateAnimation]);

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
    // Navigation logic
    switch (label) {
      case 'Custom Reminder':
        router.push('/screens/customReminder' as any  );
        break;
      case 'Tracker Rutin':
        // TODO: Navigate to tracker
        alert(`Fitur "${label}" belum diimplementasikan`);
        break;
      case 'Artikel Kesehatan':
        // TODO: Navigate to articles
        router.push('/screens/artikelKesehatan' as any  );
        break;
      // ... other cases
      default:
        alert(`Fitur "${label}" belum diimplementasikan`);
    }
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
          // ✅ User sudah upload lab → Tampilkan Health Risk Status with dropdown
          <Card>
            <Pressable onPress={() => setIsHealthDetailExpanded(!isHealthDetailExpanded)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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
                  <View style={{ flex: 1 }}>
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
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: rotateAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '180deg'],
                        }),
                      },
                    ],
                  }}
                >
                  <Ionicons name="chevron-down" size={24} color="#6B7280" />
                </Animated.View>
              </View>
            </Pressable>

            {/* Dropdown Content - Persentase Risiko Penyakit dengan Animasi */}
            <Animated.View
              style={{
                maxHeight: dropdownAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 500],
                }),
                opacity: dropdownAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0, 1],
                }),
                overflow: 'hidden',
              }}
            >
              {dashboardData?.latestLabResult && (
                <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 12 }}>
                    Rincian Hasil Analisis
                  </Text>

                  {/* Diabetes Risk */}
                  {(dashboardData.latestLabResult.glucose_level !== null ||
                    dashboardData.latestLabResult.glucose_2h !== null ||
                    dashboardData.latestLabResult.hba1c !== null) && (
                    <DiseaseRiskItem
                      icon="🩸"
                      diseaseName="Risiko Diabetes"
                      riskPercentage={calculateDiabetesRiskPercentage(dashboardData.latestLabResult)}
                    />
                  )}

                  {/* Cholesterol Risk */}
                  {(dashboardData.latestLabResult.cholesterol_total !== null ||
                    dashboardData.latestLabResult.cholesterol_ldl !== null ||
                    dashboardData.latestLabResult.cholesterol_hdl !== null ||
                    dashboardData.latestLabResult.triglycerides !== null) && (
                    <DiseaseRiskItem
                      icon="💊"
                      diseaseName="Risiko Kolesterol"
                      riskPercentage={calculateCholesterolRiskPercentage(dashboardData.latestLabResult)}
                    />
                  )}
                </View>
              )}
            </Animated.View>
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