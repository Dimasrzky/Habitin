// app/screens/cekKesehatan/selfCheckPilihTahap.tsx

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type SelfCheckType = 'diabetes' | 'cholesterol' | 'both';

interface StageCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  checkType: SelfCheckType;
  onPress: (type: SelfCheckType) => void;
}

const StageCard: React.FC<StageCardProps> = ({
  icon,
  title,
  description,
  color,
  checkType,
  onPress,
}) => (
  <Pressable
    onPress={() => onPress(checkType)}
    style={({ pressed }) => [
      styles.stageCard,
      { opacity: pressed ? 0.8 : 1 },
    ]}
  >
    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
      <Text style={styles.iconText}>{icon}</Text>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      <View style={styles.detailsContainer}>
        <Ionicons name="document-text-outline" size={16} color="#6B7280" />
        <Text style={styles.detailsText}>15 pertanyaan</Text>
        <Ionicons name="time-outline" size={16} color="#6B7280" style={{ marginLeft: 12 }} />
        <Text style={styles.detailsText}>~5 menit</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
  </Pressable>
);

export default function SelfCheckPilihTahapScreen() {
  const router = useRouter();

  const handleSelectStage = (type: SelfCheckType) => {
    router.push({
      pathname: '/screens/cekKesehatan/selfCheckKuesioner' as any,
      params: { type },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Pilih Tahap Check</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Pilih Yang Ingin Anda Periksa</Text>
          <Text style={styles.subtitle}>
            Pilih satu kategori pemeriksaan sesuai kebutuhan Anda
          </Text>
        </View>

        {/* Stage Cards */}
        <View style={styles.cardsContainer}>
          <StageCard
            icon="🩸"
            title="Cek Risiko Diabetes"
            description="Deteksi dini risiko diabetes melalui gaya hidup dan pola makan"
            color="#FF6B6B"
            checkType="diabetes"
            onPress={handleSelectStage}
          />

          <StageCard
            icon="💊"
            title="Cek Risiko Kolesterol"
            description="Analisis risiko kolesterol tinggi berdasarkan kebiasaan sehari-hari"
            color="#4ECDC4"
            checkType="cholesterol"
            onPress={handleSelectStage}
          />

          <StageCard
            icon="❤️"
            title="Cek Kesehatan Lengkap"
            description="Pemeriksaan menyeluruh untuk diabetes dan kolesterol sekaligus"
            color="#FFD93D"
            checkType="both"
            onPress={handleSelectStage}
          />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <Text style={styles.infoTitle}>Informasi Penting</Text>
          </View>
          <Text style={styles.infoText}>
            • Setiap tahap terdiri dari 15 pertanyaan{'\n'}
            • Jawab dengan jujur untuk hasil yang akurat{'\n'}
            • Hasil dapat disimpan ke status kesehatan Anda{'\n'}
            • Anda dapat mengulang pemeriksaan kapan saja
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 22,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 6,
    top: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    top: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  titleSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  stageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  infoText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 20,
  },
});
