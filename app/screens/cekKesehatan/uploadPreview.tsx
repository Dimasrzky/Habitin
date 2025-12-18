// app/screens/cekKesehatan/uploadPreview.tsx

import { supabaseStorage as supabase } from '@/config/supabase.storage';
import type { LabResult } from '@/types/health.types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { markLabAsUploaded } from '../../../src/utils/labUploadHelper'; // ← TAMBAHKAN INI

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function UploadPreviewScreen() {
  const params = useLocalSearchParams();
  const labResultId = params.labResultId as string;
  const imageUrl = params.imageUrl as string;

  // State
  const [labResult, setLabResult] = useState<LabResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // =====================================================
  // MARK LAB AS UPLOADED (useEffect terpisah)
  // =====================================================
  
  useEffect(() => {
    const markAsUploaded = async () => {
      try {
        console.log('✅ Marking lab as uploaded...');
        await markLabAsUploaded();
        console.log('✅ Lab status updated successfully');
      } catch (error) {
        console.error('⚠️ Failed to update lab status:', error);
        // Don't block UI if this fails
      }
    };

    markAsUploaded();
  }, []); // Run once on mount

  // =====================================================
  // FETCH LAB RESULT (useCallback untuk fix warning)
  // =====================================================

  const fetchLabResult = useCallback(async () => {
    try {
      console.log('🔍 Fetching lab result with ID:', labResultId);
      
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('lab_results')
        .select('*')
        .eq('id', labResultId)
        .eq('user_id', user.uid)
        .single();

      if (error) throw error;
      
      console.log('✅ Lab result fetched:', data);
      setLabResult(data);
    } catch (error) {
      console.error('❌ Error fetching lab result:', error);
    } finally {
      setIsLoading(false);
    }
  }, [labResultId]);

  useEffect(() => {
    fetchLabResult();
  }, [fetchLabResult]);

  // =====================================================
  // HELPERS
  // =====================================================

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'rendah': return '#ABE7B2';
      case 'sedang': return '#FFD580';
      case 'tinggi': return '#FFB4B4';
      default: return '#D1D5DB';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'rendah': return 'checkmark-circle';
      case 'sedang': return 'alert-circle';
      case 'tinggi': return 'warning';
      default: return 'help-circle';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'rendah': return 'Risiko Rendah';
      case 'sedang': return 'Risiko Sedang';
      case 'tinggi': return 'Risiko Tinggi';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (value: number | null, type: string): string => {
    if (value === null) return '#D1D5DB';

    switch (type) {
      case 'glucose':
        // Normal: 70-105
        if (value >= 70 && value <= 105) return '#ABE7B2';
        if (value < 70) return '#FFD580'; // Rendah
        return '#FFB4B4'; // Tinggi (>105)
      case 'glucose_2h':
        if (value < 140) return '#ABE7B2';
        if (value < 200) return '#FFD580';
        return '#FFB4B4';
      case 'hba1c':
        // Normal: <6%
        if (value < 6) return '#ABE7B2';
        return '#FFB4B4'; // Tinggi (>=6)
      case 'cholesterol_total':
        // Optimal: <200, Borderline: 200-239, High: >239
        if (value < 200) return '#ABE7B2';
        if (value <= 239) return '#FFD580';
        return '#FFB4B4';
      case 'ldl':
        // Optimal: <129, Borderline: 130-159, High: >159
        if (value < 129) return '#ABE7B2';
        if (value <= 159) return '#FFD580';
        return '#FFB4B4';
      case 'hdl':
        // Normal: 40-60
        if (value >= 40 && value <= 60) return '#ABE7B2';
        if (value < 40) return '#FFB4B4'; // Rendah
        return '#ABE7B2'; // Tinggi (>60) adalah baik
      case 'triglycerides':
        // Optimal: <150, Borderline: 150-199, High: >200
        if (value < 150) return '#ABE7B2';
        if (value <= 199) return '#FFD580';
        return '#FFB4B4';
      default:
        return '#D1D5DB';
    }
  };

  const getStatusIcon = (value: number | null, type: string) => {
    const color = getStatusColor(value, type);
    if (color === '#ABE7B2') return 'checkmark-circle';
    if (color === '#FFD580') return 'alert-circle';
    if (color === '#FFB4B4') return 'warning';
    return 'help-circle';
  };

  const getStatusText = (value: number | null, type: string): string => {
    const color = getStatusColor(value, type);
    if (color === '#ABE7B2') return 'Normal';
    if (color === '#FFD580') return 'Borderline';
    if (color === '#FFB4B4') return 'Tinggi';
    return 'No Data';
  };

  // =====================================================
  // RENDER LOADING
  // =====================================================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ABE7B2" />
          <Text style={styles.loadingText}>Memuat hasil analisis...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!labResult) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FFB4B4" />
          <Text style={styles.errorText}>Gagal memuat data</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.retryButtonText}>Kembali ke Beranda</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // RENDER MAIN
  // =====================================================

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Hasil Analisis</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Preview Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>📄 Dokumen yang Dianalisis</Text>
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
          </View>
        </View>

        {/* Risk Status Card */}
        <View style={[styles.statusCard, { backgroundColor: getRiskColor(labResult.risk_level) }]}>
          <View style={styles.statusHeader}>
            <Ionicons name={getRiskIcon(labResult.risk_level)} size={32} color="#FFFFFF" />
            <View style={styles.statusContent}>
              <Text style={styles.statusLabel}>{getRiskLabel(labResult.risk_level)}</Text>
              <Text style={styles.statusScore}>Skor Risiko: {labResult.risk_score}</Text>
            </View>
          </View>
          <Text style={styles.statusDate}>
            Diperiksa {new Date(labResult.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Detail Pemeriksaan */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>📊 Detail Pemeriksaan</Text>

          {/* Diabetes Section */}
          {(labResult.glucose_level || labResult.glucose_2h || labResult.hba1c) && (
            <View style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>🩸 Pemeriksaan Diabetes</Text>

              {/* Gula Darah Puasa */}
              {labResult.glucose_level !== null && (
                <TestCard
                  label="Gula Darah Puasa"
                  value={labResult.glucose_level}
                  unit="mg/dL"
                  normalRange="70 - 105 mg/dL"
                  status={getStatusText(labResult.glucose_level, 'glucose')}
                  statusColor={getStatusColor(labResult.glucose_level, 'glucose')}
                  statusIcon={getStatusIcon(labResult.glucose_level, 'glucose')}
                  maxValue={200}
                />
              )}

              {/* Glukosa 2 Jam */}
              {labResult.glucose_2h !== null && (
                <TestCard
                  label="Glukosa Darah 2 Jam"
                  value={labResult.glucose_2h}
                  unit="mg/dL"
                  normalRange="< 140 mg/dL"
                  status={getStatusText(labResult.glucose_2h, 'glucose_2h')}
                  statusColor={getStatusColor(labResult.glucose_2h, 'glucose_2h')}
                  statusIcon={getStatusIcon(labResult.glucose_2h, 'glucose_2h')}
                  maxValue={250}
                />
              )}

              {/* HbA1c */}
              {labResult.hba1c !== null && (
                <TestCard
                  label="HbA1c"
                  value={labResult.hba1c}
                  unit="%"
                  normalRange="< 6%"
                  status={getStatusText(labResult.hba1c, 'hba1c')}
                  statusColor={getStatusColor(labResult.hba1c, 'hba1c')}
                  statusIcon={getStatusIcon(labResult.hba1c, 'hba1c')}
                  maxValue={10}
                />
              )}
            </View>
          )}

          {/* Cholesterol Section */}
          {(labResult.cholesterol_total || labResult.cholesterol_ldl || 
            labResult.cholesterol_hdl || labResult.triglycerides) && (
            <View style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>💊 Pemeriksaan Kolesterol</Text>

              {/* Kolesterol Total */}
              {labResult.cholesterol_total !== null && (
                <TestCard
                  label="Kolesterol Total"
                  value={labResult.cholesterol_total}
                  unit="mg/dL"
                  normalRange="< 200 mg/dL"
                  status={getStatusText(labResult.cholesterol_total, 'cholesterol_total')}
                  statusColor={getStatusColor(labResult.cholesterol_total, 'cholesterol_total')}
                  statusIcon={getStatusIcon(labResult.cholesterol_total, 'cholesterol_total')}
                  maxValue={300}
                />
              )}

              {/* LDL */}
              {labResult.cholesterol_ldl !== null && (
                <TestCard
                  label="Kolesterol LDL (Jahat)"
                  value={labResult.cholesterol_ldl}
                  unit="mg/dL"
                  normalRange="< 129 mg/dL"
                  status={getStatusText(labResult.cholesterol_ldl, 'ldl')}
                  statusColor={getStatusColor(labResult.cholesterol_ldl, 'ldl')}
                  statusIcon={getStatusIcon(labResult.cholesterol_ldl, 'ldl')}
                  maxValue={200}
                />
              )}

              {/* HDL */}
              {labResult.cholesterol_hdl !== null && (
                <TestCard
                  label="Kolesterol HDL (Baik)"
                  value={labResult.cholesterol_hdl}
                  unit="mg/dL"
                  normalRange="40 - 60 mg/dL"
                  status={getStatusText(labResult.cholesterol_hdl, 'hdl')}
                  statusColor={getStatusColor(labResult.cholesterol_hdl, 'hdl')}
                  statusIcon={getStatusIcon(labResult.cholesterol_hdl, 'hdl')}
                  maxValue={100}
                />
              )}

              {/* Trigliserida */}
              {labResult.triglycerides !== null && (
                <TestCard
                  label="Trigliserida"
                  value={labResult.triglycerides}
                  unit="mg/dL"
                  normalRange="< 150 mg/dL"
                  status={getStatusText(labResult.triglycerides, 'triglycerides')}
                  statusColor={getStatusColor(labResult.triglycerides, 'triglycerides')}
                  statusIcon={getStatusIcon(labResult.triglycerides, 'triglycerides')}
                  maxValue={250}
                />
              )}
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Catatan Penting</Text>
            <Text style={styles.infoText}>
              Hasil analisis ini bersifat informatif. Untuk diagnosis akurat dan penanganan medis,
              konsultasikan dengan dokter atau profesional kesehatan.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.secondaryButtonText}>Kembali ke Beranda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Mulai Tantangan Sehat</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================
// TEST CARD COMPONENT (tidak berubah)
// =====================================================

interface TestCardProps {
  label: string;
  value: number;
  unit: string;
  normalRange: string;
  status: string;
  statusColor: string;
  statusIcon: keyof typeof Ionicons.glyphMap;
  maxValue: number;
}

function TestCard({
  label,
  value,
  unit,
  normalRange,
  status,
  statusColor,
  statusIcon,
  maxValue,
}: TestCardProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <View style={styles.testCard}>
      {/* Header */}
      <View style={styles.testHeader}>
        <Text style={styles.testLabel}>{label}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Ionicons name={statusIcon} size={14} color="#FFFFFF" />
          <Text style={styles.statusBadgeText}>{status}</Text>
        </View>
      </View>

      {/* Value */}
      <View style={styles.testValueRow}>
        <Text style={styles.testValue}>
          {value} <Text style={styles.testUnit}>{unit}</Text>
        </Text>
        <Text style={styles.testNormalRange}>{normalRange}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: statusColor },
          ]}
        />
      </View>
    </View>
  );
}

// =====================================================
// STYLES (tidak berubah)
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#ABE7B2',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Image Section
  imageSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: 300,
  },

  // Status Card
  statusCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statusScore: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statusDate: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.8,
  },

  // Detail Section
  detailSection: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },

  // Test Card
  testCard: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    gap: 8,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
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
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  testValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  testValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  testUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
  },
  testNormalRange: {
    fontSize: 12,
    color: '#64748B',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ABE7B2',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});