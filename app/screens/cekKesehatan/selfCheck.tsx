// app/screens/cekKesehatan/selfCheck.tsx

import SwipeToStartButton from '@components/SwipeToStartButton';
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

export default function SelfCheckScreen() {
  const router = useRouter();

  const handleSwipeComplete = () => {
    // Mulai dari tahap 1: Diabetes
    router.push({
      pathname: '/screens/cekKesehatan/selfCheckKuesioner' as any,
      params: { stage: '1', type: 'diabetes' },
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
        <Text style={styles.headerTitle}>Self-Check</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon Section */}
        <View style={styles.iconSection}>
          <View style={styles.mainIcon}>
            <Ionicons name="clipboard" size={80} color="#93BFC7" />
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Cek Risiko Kesehatanmu</Text>
          <Text style={styles.subtitle}>
            Jawab beberapa pertanyaan singkat untuk mengetahui estimasi risiko diabetes & kolesterol
          </Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="time" size={24} color="#93BFC7" />
            <Text style={styles.infoCardTitle}>Waktu</Text>
            <Text style={styles.infoCardValue}>~5 menit</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="help-circle" size={24} color="#93BFC7" />
            <Text style={styles.infoCardTitle}>Pertanyaan</Text>
            <Text style={styles.infoCardValue}>15 item</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="flash" size={24} color="#93BFC7" />
            <Text style={styles.infoCardTitle}>Hasil</Text>
            <Text style={styles.infoCardValue}>Langsung</Text>
          </View>
        </View>

        {/* What Will Be Checked */}
        <View style={styles.checkListCard}>
          <Text style={styles.checkListTitle}>Yang Akan Dianalisis</Text>
          <View style={styles.checkList}>
            <CheckItem text="Gaya hidup & pola makan" />
            <CheckItem text="Aktivitas fisik & olahraga" />
            <CheckItem text="Riwayat kesehatan keluarga" />
            <CheckItem text="Kebiasaan tidur" />
            <CheckItem text="Tingkat stress" />
          </View>
        </View>

        {/* Note Card */}
        <View style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <Text style={styles.noteTitle}>Catatan Penting</Text>
          </View>
          <Text style={styles.noteText}>
            Hasil self-check ini adalah <Text style={styles.noteBold}>estimasi risiko</Text> berdasarkan jawaban Anda. 
            Untuk diagnosis yang akurat, silakan upload hasil lab atau konsultasi dengan dokter.
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>✨ Keuntungan Self-Check</Text>
          <View style={styles.benefitsList}>
            <BenefitItem text="Gratis & tanpa alat khusus" />
            <BenefitItem text="Privasi terjaga 100%" />
            <BenefitItem text="Dapat dilakukan kapan saja" />
            <BenefitItem text="Rekomendasi personal" />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <SwipeToStartButton
          onComplete={handleSwipeComplete}
          text="Geser untuk Mulai"
          backgroundColor="#93BFC7"
          sliderColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

const CheckItem = ({ text }: { text: string }) => (
  <View style={styles.checkItem}>
    <Ionicons name="checkmark-circle" size={20} color="#93BFC7" />
    <Text style={styles.checkItemText}>{text}</Text>
  </View>
);

const BenefitItem = ({ text }: { text: string }) => (
  <View style={styles.benefitItem}>
    <Ionicons name="star" size={16} color="#FFD580" />
    <Text style={styles.benefitItemText}>{text}</Text>
  </View>
);

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
    paddingBottom: 100,
  },
  iconSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  mainIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoCardTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  checkListCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  checkListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  checkList: {
    gap: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkItemText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  noteCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  noteText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  noteBold: {
    fontWeight: '600',
  },
  benefitsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitItemText: {
    fontSize: 13,
    color: '#78350F',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#78cc79ff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#93BFC7',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffffff',
  },
});