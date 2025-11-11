// app/screens/cekKesehatan/uploadResult.tsx

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

// Mock data hasil analisis
const MOCK_RESULT = {
  date: '9 November 2025',
  riskLevel: 'sedang' as 'rendah' | 'sedang' | 'tinggi',
  tests: [
    {
      name: 'Gula Darah Puasa',
      value: 110,
      unit: 'mg/dL',
      status: 'tinggi' as 'normal' | 'tinggi' | 'rendah',
      percentage: 70,
      normalRange: '< 100 mg/dL',
    },
    {
      name: 'Kolesterol Total',
      value: 220,
      unit: 'mg/dL',
      status: 'tinggi' as 'normal' | 'tinggi' | 'rendah',
      percentage: 80,
      normalRange: '< 200 mg/dL',
    },
    {
      name: 'Trigliserida',
      value: 140,
      unit: 'mg/dL',
      status: 'normal' as 'normal' | 'tinggi' | 'rendah',
      percentage: 40,
      normalRange: '< 150 mg/dL',
    },
    {
      name: 'HDL (Kolesterol Baik)',
      value: 55,
      unit: 'mg/dL',
      status: 'normal' as 'normal' | 'tinggi' | 'rendah',
      percentage: 60,
      normalRange: '> 40 mg/dL',
    },
  ],
  recommendations: [
    'Kurangi konsumsi gula dan makanan manis',
    'Olahraga minimal 30 menit per hari',
    'Konsultasi dengan dokter untuk pemeriksaan lanjutan',
    'Perbanyak konsumsi sayur dan buah',
  ],
};

export default function UploadResultScreen() {
  const router = useRouter();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'rendah': return '#CBF3BB';
      case 'sedang': return '#FFE8B6';
      case 'tinggi': return '#FFB4B4';
      default: return '#ECF4E8';
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'rendah': return 'RISIKO RENDAH';
      case 'sedang': return 'RISIKO SEDANG';
      case 'tinggi': return 'RISIKO TINGGI';
      default: return 'TIDAK DIKETAHUI';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#ABE7B2';
      case 'tinggi': return '#FFB4B4';
      case 'rendah': return '#FFD580';
      default: return '#D1D5DB';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return 'checkmark-circle';
      case 'tinggi': return 'warning';
      case 'rendah': return 'alert-circle';
      default: return 'information-circle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return 'Normal';
      case 'tinggi': return 'Tinggi';
      case 'rendah': return 'Rendah';
      default: return '-';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Hasil Analisis</Text>
        <Pressable style={styles.iconButton}>
          <Ionicons name="share-outline" size={24} color="#1F2937" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status Kesehatan</Text>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(MOCK_RESULT.riskLevel) }]}>
            <View style={styles.riskCircle} />
            <Text style={styles.riskText}>{getRiskText(MOCK_RESULT.riskLevel)}</Text>
          </View>
          <Text style={styles.dateText}>Tanggal: {MOCK_RESULT.date}</Text>
        </View>

        {/* Results Title */}
        <Text style={styles.sectionTitle}>📊 Detail Pemeriksaan</Text>

        {/* Test Results */}
        {MOCK_RESULT.tests.map((test, index) => (
          <View key={index} style={styles.testCard}>
            <View style={styles.testHeader}>
              <Text style={styles.testName}>{test.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(test.status) }]}>
                <Ionicons 
                  name={getStatusIcon(test.status) as any} 
                  size={14} 
                  color="#FFFFFF" 
                />
                <Text style={styles.statusText}>{getStatusText(test.status)}</Text>
              </View>
            </View>

            <View style={styles.testValueRow}>
              <Text style={styles.testValue}>
                {test.value} <Text style={styles.testUnit}>{test.unit}</Text>
              </Text>
              <Text style={styles.normalRange}>Normal: {test.normalRange}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${test.percentage}%`,
                    backgroundColor: getStatusColor(test.status)
                  }
                ]} 
              />
            </View>
          </View>
        ))}

        {/* Recommendations */}
        <View style={styles.recommendationsCard}>
          <View style={styles.recommendationsHeader}>
            <Ionicons name="bulb" size={24} color="#FFD580" />
            <Text style={styles.recommendationsTitle}>Rekomendasi</Text>
          </View>
          <View style={styles.recommendationsList}>
            {MOCK_RESULT.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={18} color="#ABE7B2" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.secondaryButton,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            //onPress={() => router.push('/screens/cekKesehatan/history')}
          >
            <Ionicons name="folder-open-outline" size={20} color="#6B7280" />
            <Text style={styles.secondaryButtonText}>Simpan ke Riwayat</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryButton,
              { opacity: pressed ? 0.9 : 1 }
            ]}
            onPress={() => router.push('/(tabs)')}
          >
            <Ionicons name="home" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Kembali ke Beranda</Text>
          </Pressable>
        </View>

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
  iconButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 8,
    gap: 8,
  },
  riskCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  riskText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  testValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  testUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  normalRange: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  recommendationsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  recommendationsList: {
    gap: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: '#78350F',
    flex: 1,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  primaryButton: {
    backgroundColor: '#ABE7B2',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});