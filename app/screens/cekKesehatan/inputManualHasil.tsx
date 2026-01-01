// app/screens/cekKesehatan/inputManualHasil.tsx

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
import { supabase } from '../../../src/config/supabase.config';

interface RiskCategory {
  level: string;
  color: string;
  bgColor: string;
  description: string;
}

const getRiskCategory = (percentage: number): RiskCategory => {
  if (percentage < 25) {
    return {
      level: 'Rendah',
      color: '#10B981',
      bgColor: '#D1FAE5',
      description: 'Risiko rendah, pertahankan pola hidup sehat',
    };
  } else if (percentage < 50) {
    return {
      level: 'Sedang',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      description: 'Perlu perhatian dan perbaikan pola hidup',
    };
  } else if (percentage < 75) {
    return {
      level: 'Tinggi',
      color: '#EF4444',
      bgColor: '#FEE2E2',
      description: 'Risiko tinggi, segera konsultasi dokter',
    };
  } else {
    return {
      level: 'Sangat Tinggi',
      color: '#DC2626',
      bgColor: '#FEE2E2',
      description: 'Sangat berisiko, SEGERA periksakan diri',
    };
  }
};

// Calculate individual risk score (0-100) for each parameter
const calculateRiskScore = (value: number, type: string): number => {
  if (value === 0) return 0;

  switch (type) {
    case 'glucose':
      if (value < 100) return 0;
      if (value < 126) return ((value - 100) / 26) * 50;
      return Math.min(50 + ((value - 126) / 74) * 50, 100);

    case 'hba1c':
      if (value < 5.7) return 0;
      if (value < 6.5) return ((value - 5.7) / 0.8) * 50;
      return Math.min(50 + ((value - 6.5) / 3.5) * 50, 100);

    case 'cholesterol_total':
      if (value < 200) return 0;
      if (value < 240) return ((value - 200) / 40) * 50;
      return Math.min(50 + ((value - 240) / 60) * 50, 100);

    case 'ldl':
      if (value < 100) return 0;
      if (value < 160) return ((value - 100) / 60) * 50;
      return Math.min(50 + ((value - 160) / 40) * 50, 100);

    case 'hdl':
      if (value >= 60) return 0;
      if (value >= 40) return ((60 - value) / 20) * 50;
      return Math.min(50 + ((40 - value) / 40) * 50, 100);

    case 'triglycerides':
      if (value < 150) return 0;
      if (value < 200) return ((value - 150) / 50) * 50;
      return Math.min(50 + ((value - 200) / 50) * 50, 100);

    default:
      return 0;
  }
};

export default function InputManualHasilScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const glucoseFasting = parseFloat(params.glucoseFasting as string) || 0;
  const hba1c = parseFloat(params.hba1c as string) || 0;
  const totalCholesterol = parseFloat(params.totalCholesterol as string) || 0;
  const ldl = parseFloat(params.ldl as string) || 0;
  const hdl = parseFloat(params.hdl as string) || 0;
  const triglycerides = parseFloat(params.triglycerides as string) || 0;

  const [isSaving, setIsSaving] = useState(false);

  // Calculate Diabetes Risk
  const diabetesScores: number[] = [];
  if (glucoseFasting > 0) {
    diabetesScores.push(calculateRiskScore(glucoseFasting, 'glucose'));
  }
  if (hba1c > 0) {
    diabetesScores.push(calculateRiskScore(hba1c, 'hba1c'));
  }
  const diabetesPercentage =
    diabetesScores.length > 0
      ? Math.round(diabetesScores.reduce((a, b) => a + b, 0) / diabetesScores.length)
      : 0;

  // Calculate Cholesterol Risk
  const cholesterolScores: number[] = [];
  if (totalCholesterol > 0) {
    cholesterolScores.push(calculateRiskScore(totalCholesterol, 'cholesterol_total'));
  }
  if (ldl > 0) {
    cholesterolScores.push(calculateRiskScore(ldl, 'ldl'));
  }
  if (hdl > 0) {
    cholesterolScores.push(calculateRiskScore(hdl, 'hdl'));
  }
  if (triglycerides > 0) {
    cholesterolScores.push(calculateRiskScore(triglycerides, 'triglycerides'));
  }
  const cholesterolPercentage =
    cholesterolScores.length > 0
      ? Math.round(cholesterolScores.reduce((a, b) => a + b, 0) / cholesterolScores.length)
      : 0;

  // Overall Risk
  const allScores = [...diabetesScores, ...cholesterolScores];
  const overallPercentage =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

  const diabetesCategory = getRiskCategory(diabetesPercentage);
  const cholesterolCategory = getRiskCategory(cholesterolPercentage);
  const overallCategory = getRiskCategory(overallPercentage);

  const handleSaveToHealth = async () => {
    try {
      setIsSaving(true);

      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'User tidak terautentikasi');
        return;
      }

      // Determine risk level based on overall percentage
      let riskLevel: 'rendah' | 'sedang' | 'tinggi' = 'rendah';
      if (overallPercentage >= 75) riskLevel = 'tinggi';
      else if (overallPercentage >= 50) riskLevel = 'tinggi';
      else if (overallPercentage >= 25) riskLevel = 'sedang';

      // Check if user already has a lab result
      const { data: existingResult } = await supabase
        .from('lab_results')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingResult) {
        // Update existing record
        await supabase
          .from('lab_results')
          .update({
            glucose_level: glucoseFasting > 0 ? glucoseFasting : null,
            hba1c: hba1c > 0 ? hba1c : null,
            cholesterol_total: totalCholesterol > 0 ? totalCholesterol : null,
            cholesterol_ldl: ldl > 0 ? ldl : null,
            cholesterol_hdl: hdl > 0 ? hdl : null,
            triglycerides: triglycerides > 0 ? triglycerides : null,
            glucose_2h: null,
            risk_level: riskLevel,
            risk_score: overallPercentage,
            diabetes_risk_percentage: diabetesPercentage > 0 ? diabetesPercentage : null,
            cholesterol_risk_percentage: cholesterolPercentage > 0 ? cholesterolPercentage : null,
            raw_ocr_text: 'Manual Input',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingResult.id);
      } else {
        // Create new record
        await supabase.from('lab_results').insert({
          user_id: userId,
          glucose_level: glucoseFasting > 0 ? glucoseFasting : null,
          hba1c: hba1c > 0 ? hba1c : null,
          cholesterol_total: totalCholesterol > 0 ? totalCholesterol : null,
          cholesterol_ldl: ldl > 0 ? ldl : null,
          cholesterol_hdl: hdl > 0 ? hdl : null,
          triglycerides: triglycerides > 0 ? triglycerides : null,
          glucose_2h: null,
          risk_level: riskLevel,
          risk_score: overallPercentage,
          image_url: '',
          raw_ocr_text: 'Manual Input',
          diabetes_risk_percentage: diabetesPercentage > 0 ? diabetesPercentage : null,
          cholesterol_risk_percentage: cholesterolPercentage > 0 ? cholesterolPercentage : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      Alert.alert('Berhasil Disimpan!', 'Hasil analisis telah disimpan ke status kesehatan Anda', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/(tabs)' as any);
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving manual input:', error);
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
        <Text style={styles.headerTitle}>Hasil Analisis</Text>
        <Pressable onPress={handleBackToHome} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#1F2937" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Analisis Selesai!</Text>
          <Text style={styles.successSubtitle}>Berikut hasil analisis nilai lab Anda</Text>
        </View>

        {/* Risk Score Cards */}
        <View style={styles.riskCardsContainer}>
          {diabetesPercentage > 0 && (
            <View style={[styles.riskCard, { borderLeftColor: diabetesCategory.color }]}>
              <View style={styles.riskCardHeader}>
                <View style={[styles.riskIconBadge, { backgroundColor: diabetesCategory.bgColor }]}>
                  <Ionicons name="water" size={24} color={diabetesCategory.color} />
                </View>
                <View style={styles.riskCardHeaderText}>
                  <Text style={styles.riskCardLabel}>Risiko Diabetes</Text>
                  <View style={[styles.riskBadge, { backgroundColor: diabetesCategory.bgColor }]}>
                    <Text style={[styles.riskBadgeText, { color: diabetesCategory.color }]}>
                      {diabetesCategory.level}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.riskPercentage, { color: diabetesCategory.color }]}>
                {diabetesPercentage}%
              </Text>
              <Text style={styles.riskDescription}>{diabetesCategory.description}</Text>
            </View>
          )}

          {cholesterolPercentage > 0 && (
            <View style={[styles.riskCard, { borderLeftColor: cholesterolCategory.color }]}>
              <View style={styles.riskCardHeader}>
                <View style={[styles.riskIconBadge, { backgroundColor: cholesterolCategory.bgColor }]}>
                  <Ionicons name="fitness" size={24} color={cholesterolCategory.color} />
                </View>
                <View style={styles.riskCardHeaderText}>
                  <Text style={styles.riskCardLabel}>Risiko Kolesterol</Text>
                  <View style={[styles.riskBadge, { backgroundColor: cholesterolCategory.bgColor }]}>
                    <Text style={[styles.riskBadgeText, { color: cholesterolCategory.color }]}>
                      {cholesterolCategory.level}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.riskPercentage, { color: cholesterolCategory.color }]}>
                {cholesterolPercentage}%
              </Text>
              <Text style={styles.riskDescription}>{cholesterolCategory.description}</Text>
            </View>
          )}

          {diabetesPercentage > 0 && cholesterolPercentage > 0 && (
            <View style={[styles.riskCard, styles.overallCard, { borderLeftColor: overallCategory.color }]}>
              <View style={styles.riskCardHeader}>
                <View style={[styles.riskIconBadge, { backgroundColor: overallCategory.bgColor }]}>
                  <Ionicons name="pulse" size={24} color={overallCategory.color} />
                </View>
                <View style={styles.riskCardHeaderText}>
                  <Text style={styles.riskCardLabel}>Risiko Keseluruhan</Text>
                  <View style={[styles.riskBadge, { backgroundColor: overallCategory.bgColor }]}>
                    <Text style={[styles.riskBadgeText, { color: overallCategory.color }]}>
                      {overallCategory.level}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.riskPercentage, { color: overallCategory.color }]}>
                {overallPercentage}%
              </Text>
              <Text style={styles.riskDescription}>{overallCategory.description}</Text>
            </View>
          )}
        </View>

        {/* Values Display */}
        <View style={styles.valuesSection}>
          <Text style={styles.sectionTitle}>Nilai yang Diinput</Text>

          {(glucoseFasting > 0 || hba1c > 0) && (
            <View style={styles.valueCard}>
              <View style={styles.valueCardHeader}>
                <View style={styles.valueIconBadge}>
                  <Ionicons name="water" size={20} color="#EF4444" />
                </View>
                <Text style={styles.valueCardTitle}>Parameter Diabetes</Text>
              </View>
              <View style={styles.valuesList}>
                {glucoseFasting > 0 && (
                  <View style={styles.valueRow}>
                    <Text style={styles.valueLabel}>Glukosa Puasa</Text>
                    <Text style={styles.valueText}>{glucoseFasting} mg/dL</Text>
                  </View>
                )}
                {hba1c > 0 && (
                  <View style={styles.valueRow}>
                    <Text style={styles.valueLabel}>HbA1c</Text>
                    <Text style={styles.valueText}>{hba1c}%</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {(totalCholesterol > 0 || ldl > 0 || hdl > 0 || triglycerides > 0) && (
            <View style={styles.valueCard}>
              <View style={styles.valueCardHeader}>
                <View style={[styles.valueIconBadge, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="fitness" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.valueCardTitle}>Parameter Kolesterol</Text>
              </View>
              <View style={styles.valuesList}>
                {totalCholesterol > 0 && (
                  <View style={styles.valueRow}>
                    <Text style={styles.valueLabel}>Kolesterol Total</Text>
                    <Text style={styles.valueText}>{totalCholesterol} mg/dL</Text>
                  </View>
                )}
                {ldl > 0 && (
                  <View style={styles.valueRow}>
                    <Text style={styles.valueLabel}>LDL</Text>
                    <Text style={styles.valueText}>{ldl} mg/dL</Text>
                  </View>
                )}
                {hdl > 0 && (
                  <View style={styles.valueRow}>
                    <Text style={styles.valueLabel}>HDL</Text>
                    <Text style={styles.valueText}>{hdl} mg/dL</Text>
                  </View>
                )}
                {triglycerides > 0 && (
                  <View style={styles.valueRow}>
                    <Text style={styles.valueLabel}>Trigliserida</Text>
                    <Text style={styles.valueText}>{triglycerides} mg/dL</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={22} color="#3B82F6" />
            <Text style={styles.infoTitle}>Catatan Penting</Text>
          </View>
          <Text style={styles.infoText}>
            Hasil analisis ini dihitung berdasarkan nilai lab yang Anda input. Untuk diagnosis yang
            akurat dan pemantauan kesehatan optimal, konsultasikan dengan dokter dan lakukan
            pemeriksaan lab secara rutin.
          </Text>
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomActions}>
        <Pressable
          onPress={handleSaveToHealth}
          disabled={isSaving}
          style={({ pressed }) => [
            styles.saveButton,
            isSaving && styles.saveButtonDisabled,
            { opacity: pressed && !isSaving ? 0.9 : 1 },
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Simpan ke Status Kesehatan</Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={handleBackToHome}
          style={({ pressed }) => [
            styles.homeButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 180,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  riskCardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  riskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  overallCard: {
    backgroundColor: '#FAFAFA',
  },
  riskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  riskIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskCardHeaderText: {
    flex: 1,
    gap: 6,
  },
  riskCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  riskPercentage: {
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 8,
  },
  riskDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  valuesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  valueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  valueCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  valueIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  valuesList: {
    gap: 10,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  valueLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  valueText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  infoText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 19,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#256742',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
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
