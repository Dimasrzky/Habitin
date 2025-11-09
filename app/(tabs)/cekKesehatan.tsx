// app/(tabs)/cekKesehatan/Page.tsx

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
const CARD_WIDTH = (width - 48 - CARD_SPACING) / 2;

export default function CekKesehatanPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Cek Kesehatan</Text>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#1F2937" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>🧪 Pantau Kesehatan Anda</Text>
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
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="document-text" size={32} color="#ABE7B2" />
            </View>
            <Text style={styles.cardTitle}>Upload Hasil Lab</Text>
            <Text style={styles.cardDescription}>
              Unggah foto/dokumen hasil laboratorium
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#ABE7B2" />
                <Text style={styles.featureText}>Analisis otomatis</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.featureText}>Hasil 2-3 menit</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Ionicons name="arrow-forward" size={20} color="#ABE7B2" />
            </View>
          </Pressable>

          {/* Card 2: Self-Check */}
          <Pressable
            style={({ pressed }) => [
              styles.gridCard,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => router.push('../cekKesehatan/self-check')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="clipboard" size={32} color="#93BFC7" />
            </View>
            <Text style={styles.cardTitle}>Self-Check</Text>
            <Text style={styles.cardDescription}>
              Cek risiko dengan kuesioner cepat
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#93BFC7" />
                <Text style={styles.featureText}>15 pertanyaan</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.featureText}>Estimasi 5 menit</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Ionicons name="arrow-forward" size={20} color="#93BFC7" />
            </View>
          </Pressable>
        </View>

        {/* Full Width Card: Event Skrining */}
        <Pressable
          style={({ pressed }) => [
            styles.fullWidthCard,
            { opacity: pressed ? 0.95 : 1 },
          ]}
          onPress={() => router.push('../cekKesehatan/event-screening')}
        >
          <View style={styles.fullCardHeader}>
            <View style={styles.iconBadge}>
              <Ionicons name="location" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.fullCardTitleContainer}>
              <Text style={styles.fullCardTitle}>Event Skrining Gratis</Text>
              <Text style={styles.fullCardSubtitle}>
                Temukan event kesehatan di sekitar Anda
              </Text>
            </View>
          </View>

          <View style={styles.mapPreview}>
            <Ionicons name="map" size={48} color="#D1D5DB" />
            <Text style={styles.mapPreviewText}>Peta Lokasi Event</Text>
          </View>

          <View style={styles.eventInfoRow}>
            <View style={styles.eventBadge}>
              <View style={styles.redDot} />
              <Text style={styles.eventBadgeText}>2 event terdekat</Text>
            </View>
            <View style={styles.eventInfo}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.eventInfoText}>Minggu ini</Text>
            </View>
          </View>

          <View style={styles.fullCardFooter}>
            <Text style={styles.viewMoreText}>Lihat Semua Event</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFD580" />
          </View>
        </Pressable>

        {/* Riwayat Card */}
        <Pressable
          style={({ pressed }) => [
            styles.historyCard,
            { opacity: pressed ? 0.95 : 1 },
          ]}
          onPress={() => router.push('../cekKesehatan/history')}
        >
          <View style={styles.historyHeader}>
            <Ionicons name="bar-chart" size={24} color="#93BFC7" />
            <View style={styles.historyTextContainer}>
              <Text style={styles.historyTitle}>Riwayat Pemeriksaan</Text>
              <Text style={styles.historySubtitle}>Terakhir: 15 hari lalu</Text>
            </View>
          </View>
          <View style={styles.historyFooter}>
            <Text style={styles.historyLink}>Lihat Grafik</Text>
            <Ionicons name="arrow-forward" size={18} color="#93BFC7" />
          </View>
        </Pressable>

        <View style={{ height: 24 }} />
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
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
    width: CARD_WIDTH,
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
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
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