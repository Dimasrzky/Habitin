import { useOnboarding } from '@/context/OnboardingContext';
import { OnboardingService } from '@/services/onboarding/onboardingService';
import { OnboardingData } from '@/services/onboarding/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SummaryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { onboardingData, resetOnboarding, isEditMode, setIsEditMode } = useOnboarding();

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate all data exists
      if (!onboardingData.personal || !onboardingData.physical || 
          !onboardingData.family || !onboardingData.lifestyle || 
          !onboardingData.symptoms) {
        Alert.alert('Error', 'Data tidak lengkap. Mohon lengkapi semua form.');
        setLoading(false);
        return;
      }

      const completeData: OnboardingData = {
        personal: onboardingData.personal,
        physical: onboardingData.physical,
        family: onboardingData.family,
        lifestyle: onboardingData.lifestyle,
        symptoms: onboardingData.symptoms,
      };

      console.log('🔵 Submitting onboarding data...');

      // Save to Supabase (akan otomatis update jika sudah ada)
      const profile = await OnboardingService.saveOnboarding(completeData);

      console.log('✅ Profile saved successfully!');
      console.log('📊 Diabetes Risk:', profile.riskAssessment.diabetesRisk);
      console.log('📊 Cholesterol Risk:', profile.riskAssessment.cholesterolRisk);

      // Reset context
      resetOnboarding();

      // Show success message
      const title = isEditMode ? 'Berhasil Diperbarui! ✅' : 'Berhasil! 🎉';
      const message = isEditMode 
        ? 'Data kesehatan Anda berhasil diperbarui!' 
        : 'Data kesehatan Anda telah disimpan. Kami akan memberikan rekomendasi yang dipersonalisasi untuk Anda.';

      Alert.alert(title, message, [
        {
          text: 'OK',
          onPress: () => {
            if (isEditMode) {
              // Kembali ke profile jika edit mode
              setIsEditMode(false);
              router.replace('/(tabs)'); // atau router.back() beberapa kali
            } else {
              // Ke home jika onboarding pertama kali
              router.replace('/(tabs)');
            }
          },
        },
      ]);
    } catch (error: any) {
      console.error('❌ Error submitting onboarding:', error);
      Alert.alert(
        'Error',
        error?.message || 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const title = isEditMode ? 'Batalkan Edit?' : 'Batalkan Onboarding?';
    const message = isEditMode 
      ? 'Perubahan yang belum disimpan akan hilang. Yakin ingin membatalkan?'
      : 'Data yang sudah diisi akan hilang. Yakin ingin membatalkan?';

    Alert.alert(title, message, [
      { text: 'Lanjutkan', style: 'cancel' },
      {
        text: 'Batalkan',
        style: 'destructive',
        onPress: () => {
          resetOnboarding();
          if (isEditMode) {
            setIsEditMode(false);
            router.replace('/(tabs)');
          } else {
            router.back();
          }
        },
      },
    ]);
  };

  const handleEdit = (section: string) => {
    // Navigate back to specific section
    router.push(`/onboarding/${section}` as any);
  };

  // Helper functions
  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Kurus';
    if (bmi < 23) return 'Normal';
    if (bmi < 25) return 'Gemuk';
    if (bmi < 30) return 'Obesitas Ringan';
    return 'Obesitas Berat';
  };

  const getBMICategoryColor = (bmi: number): string => {
    if (bmi < 18.5) return '#F59E0B';
    if (bmi < 23) return '#10B981';
    if (bmi < 25) return '#F59E0B';
    return '#EF4444';
  };

  const getExerciseLabel = (freq: string): string => {
    const labels: Record<string, string> = {
      never: 'Tidak Pernah',
      rarely: '< 1x/minggu',
      '1-2_per_week': '1-2x/minggu',
      '3-4_per_week': '3-4x/minggu',
      daily: 'Setiap Hari',
    };
    return labels[freq] || freq;
  };

  const getSmokingLabel = (status: string): string => {
    const labels: Record<string, string> = {
      never: 'Tidak Pernah',
      former: 'Dulu (Sudah Berhenti)',
      current_light: 'Ya, Ringan',
      current_heavy: 'Ya, Berat',
    };
    return labels[status] || status;
  };

  const getAlcoholLabel = (consumption: string): string => {
    const labels: Record<string, string> = {
      never: 'Tidak Pernah',
      occasional: 'Kadang-kadang',
      regular: 'Rutin',
      heavy: 'Sering/Berat',
    };
    return labels[consumption] || consumption;
  };

  const getStressLabel = (level: string): string => {
    const labels: Record<string, string> = {
      low: 'Rendah',
      moderate: 'Sedang',
      high: 'Tinggi',
      very_high: 'Sangat Tinggi',
    };
    return labels[level] || level;
  };

  const getSymptomLabel = (key: string): string => {
    const labels: Record<string, string> = {
      frequentUrination: 'Sering Buang Air Kecil',
      excessiveThirst: 'Rasa Haus Berlebihan',
      unexplainedWeightLoss: 'Penurunan Berat Badan',
      fatigue: 'Mudah Lelah',
      blurredVision: 'Penglihatan Kabur',
      slowHealingWounds: 'Luka Sulit Sembuh',
      chestPain: 'Nyeri Dada',
      shortnessOfBreath: 'Sesak Napas',
      numbness: 'Kesemutan/Mati Rasa',
      yellowishSkinPatches: 'Bercak Kuning di Kulit',
    };
    return labels[key] || key;
  };

  // Count selected symptoms
  const selectedSymptoms = onboardingData.symptoms 
    ? Object.entries(onboardingData.symptoms)
        .filter(([_, value]) => value === true)
        .map(([key, _]) => key)
    : [];

  // Check if data is complete
  const isDataComplete = onboardingData.personal && 
                         onboardingData.physical && 
                         onboardingData.family && 
                         onboardingData.lifestyle && 
                         onboardingData.symptoms;

  if (!isDataComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.incompleteContainer}>
          <Text style={styles.incompleteIcon}>⚠️</Text>
          <Text style={styles.incompleteTitle}>Data Tidak Lengkap</Text>
          <Text style={styles.incompleteText}>
            Mohon lengkapi semua form sebelum melanjutkan ke ringkasan.
          </Text>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => router.push('/onboarding/personal')}
          >
            <Text style={styles.buttonPrimaryText}>Kembali ke Awal</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const bmi = onboardingData.physical?.bmi || 0;
  const bmiCategory = getBMICategory(bmi);
  const bmiColor = getBMICategoryColor(bmi);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>
            {isEditMode ? 'Edit Data - Langkah Terakhir' : 'Step 6 of 6 - Selesai!'}
          </Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditMode ? 'Review Perubahan' : 'Ringkasan Data Anda'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditMode 
              ? 'Periksa kembali perubahan yang telah Anda buat'
              : 'Periksa kembali informasi yang telah Anda berikan'}
          </Text>
        </View>

        {/* Edit Mode Badge */}
        {isEditMode && (
          <View style={styles.editModeBadge}>
            <Text style={styles.editModeIcon}>✏️</Text>
            <Text style={styles.editModeText}>Mode Edit - Perubahan akan memperbarui data Anda</Text>
          </View>
        )}

        {/* Summary Sections */}
        <View style={styles.summaryContainer}>
          {/* Personal Data */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardIcon}>👤</Text>
                <Text style={styles.cardTitle}>Data Personal</Text>
              </View>
              <TouchableOpacity onPress={() => handleEdit('personal')}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nama</Text>
                <Text style={styles.infoValue}>{onboardingData.personal?.fullName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Usia</Text>
                <Text style={styles.infoValue}>{onboardingData.personal?.age} tahun</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Jenis Kelamin</Text>
                <Text style={styles.infoValue}>
                  {onboardingData.personal?.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                </Text>
              </View>
            </View>
          </View>

          {/* Physical Data */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardIcon}>📊</Text>
                <Text style={styles.cardTitle}>Data Fisik</Text>
              </View>
              <TouchableOpacity onPress={() => handleEdit('physical')}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Berat Badan</Text>
                <Text style={styles.infoValue}>{onboardingData.physical?.weight} kg</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tinggi Badan</Text>
                <Text style={styles.infoValue}>{onboardingData.physical?.height} cm</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>BMI</Text>
                <View style={styles.bmiContainer}>
                  <Text style={styles.infoValue}>{bmi.toFixed(1)}</Text>
                  <View style={[styles.bmiBadge, { backgroundColor: bmiColor + '20' }]}>
                    <Text style={[styles.bmiText, { color: bmiColor }]}>
                      {bmiCategory}
                    </Text>
                  </View>
                </View>
              </View>
              {onboardingData.physical?.bloodPressureSystolic && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tekanan Darah</Text>
                  <Text style={styles.infoValue}>
                    {onboardingData.physical.bloodPressureSystolic}/
                    {onboardingData.physical.bloodPressureDiastolic} mmHg
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Family History */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardIcon}>👨‍👩‍👧‍👦</Text>
                <Text style={styles.cardTitle}>Riwayat Keluarga</Text>
              </View>
              <TouchableOpacity onPress={() => handleEdit('family')}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.tagContainer}>
                {onboardingData.family?.hasDiabetes && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Diabetes</Text>
                  </View>
                )}
                {onboardingData.family?.hasCholesterol && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Kolesterol</Text>
                  </View>
                )}
                {onboardingData.family?.hasHeartDisease && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Penyakit Jantung</Text>
                  </View>
                )}
                {!onboardingData.family?.hasDiabetes && 
                 !onboardingData.family?.hasCholesterol && 
                 !onboardingData.family?.hasHeartDisease && (
                  <Text style={styles.noDataText}>Tidak ada riwayat keluarga</Text>
                )}
              </View>
            </View>
          </View>

          {/* Lifestyle */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardIcon}>🏃</Text>
                <Text style={styles.cardTitle}>Gaya Hidup</Text>
              </View>
              <TouchableOpacity onPress={() => handleEdit('lifestyle')}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Olahraga</Text>
                <Text style={styles.infoValue}>
                  {getExerciseLabel(onboardingData.lifestyle?.exerciseFrequency || '')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Merokok</Text>
                <Text style={styles.infoValue}>
                  {getSmokingLabel(onboardingData.lifestyle?.smokingStatus || '')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Alkohol</Text>
                <Text style={styles.infoValue}>
                  {getAlcoholLabel(onboardingData.lifestyle?.alcoholConsumption || '')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Jam Tidur</Text>
                <Text style={styles.infoValue}>{onboardingData.lifestyle?.sleepHours} jam/hari</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tingkat Stress</Text>
                <Text style={styles.infoValue}>
                  {getStressLabel(onboardingData.lifestyle?.stressLevel || '')}
                </Text>
              </View>
            </View>
          </View>

          {/* Symptoms */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardIcon}>🩺</Text>
                <Text style={styles.cardTitle}>Gejala</Text>
              </View>
              <TouchableOpacity onPress={() => handleEdit('symptoms')}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
              {selectedSymptoms.length > 0 ? (
                <View style={styles.symptomsList}>
                  {selectedSymptoms.map((symptom, index) => (
                    <View key={index} style={styles.symptomItem}>
                      <Text style={styles.symptomBullet}>•</Text>
                      <Text style={styles.symptomText}>
                        {getSymptomLabel(symptom)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>Tidak ada gejala yang dilaporkan</Text>
              )}
            </View>
          </View>
        </View>

        {/* Warning if many symptoms */}
        {selectedSymptoms.length >= 3 && (
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Rekomendasi Penting</Text>
              <Text style={styles.warningText}>
                Berdasarkan gejala yang Anda alami, sangat disarankan untuk segera 
                berkonsultasi dengan dokter untuk pemeriksaan lebih lanjut.
              </Text>
            </View>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardIcon}>ℹ️</Text>
          <Text style={styles.infoCardText}>
            {isEditMode 
              ? 'Data yang Anda ubah akan memperbarui profil kesehatan Anda dan memengaruhi rekomendasi yang diberikan.'
              : 'Data ini akan digunakan untuk memberikan rekomendasi kesehatan yang dipersonalisasi untuk Anda.'}
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.buttonSecondary, loading && styles.buttonDisabled]}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.buttonSecondaryText}>
            {isEditMode ? 'Batalkan' : 'Kembali'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonPrimaryText}>
              {isEditMode ? 'Simpan Perubahan' : 'Selesai & Simpan'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: '#10B981',
    textAlign: 'center',
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  editModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  editModeIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  editModeText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
  summaryContainer: {
    gap: 16,
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  editButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  cardContent: {
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bmiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bmiText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  symptomsList: {
    gap: 8,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  symptomBullet: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  symptomText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 14,
    color: '#B91C1C',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoCardIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoCardText: {
    flex: 1,
    fontSize: 13,
    color: '#0369A1',
    lineHeight: 18,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  buttonSecondary: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  buttonPrimary: {
    flex: 2,
    height: 52,
    backgroundColor: '#10B981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  incompleteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  incompleteIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  incompleteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  incompleteText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
});