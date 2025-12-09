// app/(tabs)/cekKesehatan.tsx

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_SPACING = 12;

export default function CekKesehatanTab() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cek Kesehatan</Text>
        <Pressable style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color="#1F2937" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Pantau Kesehatan Anda</Text>
          <Text style={styles.subtitle}>Pilih metode pemeriksaan</Text>
        </View>

        {/* Grid Row - 2 Cards Side by Side */}
        <View style={styles.gridRow}>
          {/* Card 1: Upload Hasil Lab */}
          <Pressable
            style={({ pressed }) => [
              styles.gridCard,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => router.push('/screens/cekKesehatan/uploadLab')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#def0e0ff' }]}>
              <Ionicons name="document-text" size={32} color="#66d373ff" top={15} />
              <Text style={styles.cardTitle}>Upload Hasil Lab</Text>
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureText}>Analisis otomatis</Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Card 2: Self-Check */}
          <Pressable
            style={({ pressed }) => [
              styles.gridCard,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => router.push('/screens/cekKesehatan/selfCheck')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="clipboard" size={32} color="#93BFC7" top={15} />
              <Text style={styles.cardTitle}>Self-Check</Text>
              <Text style={styles.cardDescription}>
                Cek risiko dengan kuesioner
              </Text>
              <View style={styles.featureList}></View>
            </View>
          </Pressable>
        </View>  
      </ScrollView>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={20} color="#93BFC7" />
            <Text style={styles.infoTitle}>Yang Akan Dianalisis</Text>
        </View>
        <View style={styles.infoList}>
            <InfoItem text="Kadar Gula Darah" />
            <InfoItem text="Kolesterol Total" />
            <InfoItem text="Kolesterol LDL" />
            <InfoItem text="Kolesterol HDL" />
            <InfoItem text="Trigliserida" />
            <InfoItem text="HbA1c (jika ada)" />
        </View>
          <View style={styles.autoDetectNote}>
            <Ionicons name="sparkles" size={16} color="#FFD580" />
              <Text style={styles.autoDetectText}>
                Sistem akan otomatis mendeteksi jenis pemeriksaan (Diabetes/Kolesterol)
              </Text>
          </View>
      </View>
    </View>
  );
}

const InfoItem = ({ text }: { text: string }) => (
  <View style={styles.infoItem}>
    <Ionicons name="checkmark" size={16} color="#ABE7B2" />
    <Text style={styles.infoItemText}>{text}</Text>
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
    marginTop: 15,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 22,
  },
  iconButton: {
    padding: 15,
    marginTop: 8,
    top: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: CARD_SPACING,
  },
  gridCard: {
    width: (width - 48 - CARD_SPACING) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0,
  },
  iconContainer: {
    width: 170,
    height: 120,
    borderRadius: 8,
    //justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 28,
  },
  cardDescription: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 12,
  },
  featureList: {
    gap: 6,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 11,
    color: '#6B7280',
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  fullWidthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fullCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFD580',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fullCardTitleContainer: {
    flex: 1,
  },
  fullCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  fullCardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  mapPreview: {
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapPreviewText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  eventInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  eventBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#991B1B',
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventInfoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  fullCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 160,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoItemText: {
    fontSize: 13,
    color: '#374151',
  },
  autoDetectNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(147, 191, 199, 0.2)',
  },
  autoDetectText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  historySubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  historyLink: {
    fontSize: 13,
    fontWeight: '500',
    color: '#93BFC7',
  },
});