// app/screens/cekKesehatan/selfCheckHasil.tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { auth } from '../../../src/config/firebase.config';

interface RiskCategory {
  level: string;
  color: string;
  description: string;
}

const getRiskCategory = (percentage: number): RiskCategory => {
  if (percentage < 25) {
    return {
      level: 'Rendah',
      color: '#ABE7B2',
      description: 'Risiko rendah',
    };
  } else if (percentage < 50) {
    return {
      level: 'Sedang',
      color: '#FFD580',
      description: 'Perlu perhatian',
    };
  } else if (percentage < 75) {
    return {
      level: 'Tinggi',
      color: '#FFB4B4',
      description: 'Risiko tinggi',
    };
  } else {
    return {
      level: 'Sangat Tinggi',
      color: '#FF8A8A',
      description: 'Sangat berisiko',
    };
  }
};

const getOverallRecommendation = (
  diabetesPercentage: number,
  cholesterolPercentage: number,
  overallPercentage: number
): string => {
  const maxRisk = Math.max(diabetesPercentage, cholesterolPercentage, overallPercentage);

  if (maxRisk < 25) {
    return 'Pertahankan pola hidup sehat Anda dan lakukan pemeriksaan rutin setiap 6-12 bulan.';
  } else if (maxRisk < 50) {
    return 'Pertimbangkan untuk konsultasi dengan dokter dan perbaiki pola hidup. Lakukan pemeriksaan lab dalam 3-6 bulan.';
  } else if (maxRisk < 75) {
    return 'Sangat disarankan untuk segera berkonsultasi dengan dokter dan melakukan pemeriksaan lab lengkap.';
  } else {
    return 'SEGERA periksakan diri ke dokter untuk pemeriksaan menyeluruh dan penanganan lebih lanjut.';
  }
};

export default function SelfCheckHasilScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const diabetesPercentage = parseInt(params.diabetesPercentage as string) || 0;
  const cholesterolPercentage = parseInt(params.cholesterolPercentage as string) || 0;
  const overallPercentage = parseInt(params.overallPercentage as string) || 0;

  const diabetesScore = parseInt(params.diabetesScore as string) || 0;
  const cholesterolScore = parseInt(params.cholesterolScore as string) || 0;
  const overallScore = parseInt(params.overallScore as string) || 0;

  const [isSaving, setIsSaving] = useState(false);

  const diabetesCategory = getRiskCategory(diabetesPercentage);
  const cholesterolCategory = getRiskCategory(cholesterolPercentage);
  const overallCategory = getRiskCategory(overallPercentage);

  const recommendation = getOverallRecommendation(
    diabetesPercentage,
    cholesterolPercentage,
    overallPercentage
  );

  const handleSaveToHealth = async () => {
    try {
      setIsSaving(true);

      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'User tidak terautentikasi');
        return;
      }

      // Import fungsi save dari health.service
      const { saveSelfCheckResult } = await import(
        '../../../src/services/database/health.service'
      );

      // Simpan hasil dengan kedua persentase
      await saveSelfCheckResult(userId, {
        type: 'both',
        riskPercentage: overallPercentage,
        totalScore: overallScore,
        maxScore: 45,
        timestamp: new Date().toISOString(),
      });

      // Update juga persentase individual
      const { supabase } = await import('../../../src/config/supabase.config');
      const { data: existingResult } = await supabase
        .from('lab_results')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingResult) {
        await supabase
          .from('lab_results')
          .update({
            diabetes_risk_percentage: diabetesPercentage,
            cholesterol_risk_percentage: cholesterolPercentage,
          })
          .eq('id', existingResult.id);
      }

      Alert.alert(
        'Berhasil! 🎉',
        'Hasil self-check telah disimpan ke status kesehatan Anda',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)' as any);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving self-check result:', error);
      Alert.alert('Error', 'Gagal menyimpan hasil. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToHome = () => {
    router.replace('/(tabs)' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Hasil Self-Check</Text>
        <Pressable onPress={handleBackToHome} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#1F2937" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.iconSection}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>✅</Text>
          </View>
          <Text style={styles.title}>Pemeriksaan Selesai!</Text>
          <Text style={styles.subtitle}>3 Tahap Pemeriksaan Telah Selesai</Text>
        </View>

        {/* Overall Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ringkasan Kesehatan</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Diabetes</Text>
              <Text style={[styles.summaryValue, { color: diabetesCategory.color }]}>
                {diabetesPercentage}%
              </Text>
              <View style={[styles.summaryBadge, { backgroundColor: diabetesCategory.color }]}>
                <Text style={styles.summaryBadgeText}>{diabetesCategory.level}</Text>
              </View>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Kolesterol</Text>
              <Text style={[styles.summaryValue, { color: cholesterolCategory.color }]}>
                {cholesterolPercentage}%
              </Text>
              <View style={[styles.summaryBadge, { backgroundColor: cholesterolCategory.color }]}>
                <Text style={styles.summaryBadgeText}>{cholesterolCategory.level}</Text>
              </View>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Gabungan</Text>
              <Text style={[styles.summaryValue, { color: overallCategory.color }]}>
                {overallPercentage}%
              </Text>
              <View style={[styles.summaryBadge, { backgroundColor: overallCategory.color }]}>
                <Text style={styles.summaryBadgeText}>{overallCategory.level}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Detail Cards for Each Category */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Rincian Hasil</Text>

          {/* Diabetes Detail */}
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailIcon}>🩸</Text>
              <Text style={styles.detailTitle}>Risiko Diabetes</Text>
            </View>
            <View style={styles.detailProgressBar}>
              <View
                style={[
                  styles.detailProgressFill,
                  {
                    width: `${diabetesPercentage}%`,
                    backgroundColor: diabetesCategory.color,
                  },
                ]}
              />
            </View>
            <View style={styles.detailFooter}>
              <Text style={styles.detailPercentage}>{diabetesPercentage}%</Text>
              <Text style={styles.detailScore}>Skor: {diabetesScore}/45</Text>
            </View>
            <Text style={styles.detailDescription}>{diabetesCategory.description}</Text>
          </View>

          {/* Cholesterol Detail */}
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailIcon}>💊</Text>
              <Text style={styles.detailTitle}>Risiko Kolesterol</Text>
            </View>
            <View style={styles.detailProgressBar}>
              <View
                style={[
                  styles.detailProgressFill,
                  {
                    width: `${cholesterolPercentage}%`,
                    backgroundColor: cholesterolCategory.color,
                  },
                ]}
              />
            </View>
            <View style={styles.detailFooter}>
              <Text style={styles.detailPercentage}>{cholesterolPercentage}%</Text>
              <Text style={styles.detailScore}>Skor: {cholesterolScore}/45</Text>
            </View>
            <Text style={styles.detailDescription}>{cholesterolCategory.description}</Text>
          </View>

          {/* Overall Detail */}
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailIcon}>❤️</Text>
              <Text style={styles.detailTitle}>Risiko Gabungan</Text>
            </View>
            <View style={styles.detailProgressBar}>
              <View
                style={[
                  styles.detailProgressFill,
                  {
                    width: `${overallPercentage}%`,
                    backgroundColor: overallCategory.color,
                  },
                ]}
              />
            </View>
            <View style={styles.detailFooter}>
              <Text style={styles.detailPercentage}>{overallPercentage}%</Text>
              <Text style={styles.detailScore}>Skor: {overallScore}/45</Text>
            </View>
            <Text style={styles.detailDescription}>{overallCategory.description}</Text>
          </View>
        </View>

        {/* Recommendation Card */}
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
            <Text style={styles.recommendationTitle}>Rekomendasi</Text>
          </View>
          <Text style={styles.recommendationText}>{recommendation}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <Text style={styles.infoTitle}>Catatan Penting</Text>
          </View>
          <Text style={styles.infoText}>
            Hasil ini adalah estimasi risiko berdasarkan 45 pertanyaan kuesioner (3 tahap). Untuk
            diagnosis yang akurat, silakan upload hasil lab atau konsultasi dengan dokter.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Pressable
          onPress={handleSaveToHealth}
          disabled={isSaving}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Simpan ke Status Kesehatan</Text>
            </>
          )}
        </Pressable>

        <Pressable onPress={handleBackToHome} style={styles.homeButton}>
          <Text style={styles.homeButtonText}>Kembali ke Beranda</Text>
        </Pressable>
      </View>
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
  closeButton: {
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
    paddingBottom: 150,
  },
  iconSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  detailIcon: {
    fontSize: 24,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailProgressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  detailProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  detailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailPercentage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailScore: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailDescription: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  recommendationCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  recommendationText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
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
    marginBottom: 8,
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
    lineHeight: 18,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#256742',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  homeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
});
