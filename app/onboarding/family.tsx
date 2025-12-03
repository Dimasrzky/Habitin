import { FamilyHistory } from '@/services/onboarding/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function FamilyScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FamilyHistory>({
    hasDiabetes: false,
    hasCholesterol: false,
    hasHeartDisease: false,
  });

  const handleNext = () => {
    // Tidak ada validasi khusus, semua opsional
    router.push('/onboarding/lifestyle');
  };

  const toggleOption = (key: keyof FamilyHistory) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 6</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Riwayat Keluarga</Text>
          <Text style={styles.subtitle}>
            Riwayat kesehatan keluarga membantu kami memahami risiko genetik Anda
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Pilih jika ada anggota keluarga dekat (orang tua, saudara kandung) yang memiliki kondisi berikut:
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Diabetes */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              formData.hasDiabetes && styles.optionCardActive
            ]}
            onPress={() => toggleOption('hasDiabetes')}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Text style={styles.iconEmoji}>🩸</Text>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.optionTitle,
                  formData.hasDiabetes && styles.optionTitleActive
                ]}>
                  Diabetes
                </Text>
                <Text style={styles.optionDescription}>
                  Riwayat diabetes tipe 1 atau tipe 2
                </Text>
              </View>
            </View>
            <View style={[
              styles.checkbox,
              formData.hasDiabetes && styles.checkboxActive
            ]}>
              {formData.hasDiabetes && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Kolesterol Tinggi */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              formData.hasCholesterol && styles.optionCardActive
            ]}
            onPress={() => toggleOption('hasCholesterol')}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Text style={styles.iconEmoji}>💊</Text>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.optionTitle,
                  formData.hasCholesterol && styles.optionTitleActive
                ]}>
                  Kolesterol Tinggi
                </Text>
                <Text style={styles.optionDescription}>
                  Riwayat hiperkolesterolemia atau dislipidemia
                </Text>
              </View>
            </View>
            <View style={[
              styles.checkbox,
              formData.hasCholesterol && styles.checkboxActive
            ]}>
              {formData.hasCholesterol && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Penyakit Jantung */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              formData.hasHeartDisease && styles.optionCardActive
            ]}
            onPress={() => toggleOption('hasHeartDisease')}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Text style={styles.iconEmoji}>❤️</Text>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.optionTitle,
                  formData.hasHeartDisease && styles.optionTitleActive
                ]}>
                  Penyakit Jantung
                </Text>
                <Text style={styles.optionDescription}>
                  Riwayat serangan jantung, stroke, atau penyakit kardiovaskular
                </Text>
              </View>
            </View>
            <View style={[
              styles.checkbox,
              formData.hasHeartDisease && styles.checkboxActive
            ]}>
              {formData.hasHeartDisease && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        {(formData.hasDiabetes || formData.hasCholesterol || formData.hasHeartDisease) && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Riwayat yang Dipilih:</Text>
            <View style={styles.summaryList}>
              {formData.hasDiabetes && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryBullet}>•</Text>
                  <Text style={styles.summaryText}>Diabetes</Text>
                </View>
              )}
              {formData.hasCholesterol && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryBullet}>•</Text>
                  <Text style={styles.summaryText}>Kolesterol Tinggi</Text>
                </View>
              )}
              {formData.hasHeartDisease && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryBullet}>•</Text>
                  <Text style={styles.summaryText}>Penyakit Jantung</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* No Family History */}
        {!formData.hasDiabetes && !formData.hasCholesterol && !formData.hasHeartDisease && (
          <View style={styles.noHistoryCard}>
            <Text style={styles.noHistoryText}>
              Tidak ada riwayat keluarga yang dipilih
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.buttonSecondary}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonSecondaryText}>Kembali</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buttonPrimary}
          onPress={handleNext}
        >
          <Text style={styles.buttonPrimaryText}>Selanjutnya</Text>
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
    backgroundColor: '#3B82F6',
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  optionCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  optionTitleActive: {
    color: '#1E40AF',
  },
  optionDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  checkmark: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryCard: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 12,
  },
  summaryList: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryBullet: {
    fontSize: 16,
    color: '#0369A1',
    marginRight: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#0C4A6E',
  },
  noHistoryCard: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
  },
  noHistoryText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
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
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});