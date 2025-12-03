import { Symptoms } from '@/services/onboarding/types';
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

export default function SymptomsScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<Symptoms>({
    // Diabetes symptoms
    frequentUrination: false,
    excessiveThirst: false,
    unexplainedWeightLoss: false,
    fatigue: false,
    blurredVision: false,
    slowHealingWounds: false,
    // Cholesterol symptoms
    chestPain: false,
    shortnessOfBreath: false,
    numbness: false,
    yellowishSkinPatches: false,
  });

  const toggleSymptom = (key: keyof Symptoms) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNext = () => {
    // Tidak ada validasi wajib, gejala bisa tidak ada
    router.push('/onboarding/summary');
  };

  // Diabetes symptoms list
  const diabetesSymptoms = [
    {
      key: 'frequentUrination' as keyof Symptoms,
      title: 'Sering Buang Air Kecil',
      description: 'Terutama di malam hari (poliuria)',
      icon: '🚽',
    },
    {
      key: 'excessiveThirst' as keyof Symptoms,
      title: 'Rasa Haus Berlebihan',
      description: 'Merasa haus terus menerus (polidipsia)',
      icon: '💧',
    },
    {
      key: 'unexplainedWeightLoss' as keyof Symptoms,
      title: 'Penurunan Berat Badan',
      description: 'Tanpa alasan yang jelas',
      icon: '⚖️',
    },
    {
      key: 'fatigue' as keyof Symptoms,
      title: 'Mudah Lelah',
      description: 'Merasa lemas sepanjang waktu',
      icon: '😴',
    },
    {
      key: 'blurredVision' as keyof Symptoms,
      title: 'Penglihatan Kabur',
      description: 'Pandangan tidak jelas atau buram',
      icon: '👓',
    },
    {
      key: 'slowHealingWounds' as keyof Symptoms,
      title: 'Luka Sulit Sembuh',
      description: 'Luka atau infeksi lambat pulih',
      icon: '🩹',
    },
  ];

  // Cholesterol symptoms list
  const cholesterolSymptoms = [
    {
      key: 'chestPain' as keyof Symptoms,
      title: 'Nyeri Dada',
      description: 'Rasa tidak nyaman atau tekanan di dada',
      icon: '💔',
    },
    {
      key: 'shortnessOfBreath' as keyof Symptoms,
      title: 'Sesak Napas',
      description: 'Kesulitan bernapas saat aktivitas',
      icon: '🫁',
    },
    {
      key: 'numbness' as keyof Symptoms,
      title: 'Kesemutan/Mati Rasa',
      description: 'Terutama di tangan atau kaki',
      icon: '🤚',
    },
    {
      key: 'yellowishSkinPatches' as keyof Symptoms,
      title: 'Bercak Kuning di Kulit',
      description: 'Xanthelasma (timbunan lemak)',
      icon: '🟡',
    },
  ];

  const selectedCount = Object.values(formData).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '83.3%' }]} />
          </View>
          <Text style={styles.progressText}>Step 5 of 6</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gejala yang Dialami</Text>
          <Text style={styles.subtitle}>
            Pilih gejala yang Anda alami saat ini atau dalam beberapa bulan terakhir
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Informasi ini membantu kami memberikan rekomendasi yang lebih akurat. 
            Jika tidak ada gejala, Anda bisa langsung melanjutkan.
          </Text>
        </View>

        {/* Selected Count */}
        {selectedCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {selectedCount} gejala dipilih
            </Text>
          </View>
        )}

        {/* Diabetes Symptoms Section */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryIcon}>🩸</Text>
            <View style={styles.categoryTitleContainer}>
              <Text style={styles.categoryTitle}>Gejala Diabetes</Text>
              <Text style={styles.categorySubtitle}>
                Tanda-tanda kadar gula darah tinggi
              </Text>
            </View>
          </View>

          <View style={styles.symptomsGrid}>
            {diabetesSymptoms.map((symptom) => (
              <TouchableOpacity
                key={symptom.key}
                style={[
                  styles.symptomCard,
                  formData[symptom.key] && styles.symptomCardActive
                ]}
                onPress={() => toggleSymptom(symptom.key)}
                activeOpacity={0.7}
              >
                <View style={styles.symptomHeader}>
                  <Text style={styles.symptomIcon}>{symptom.icon}</Text>
                  <View style={[
                    styles.symptomCheckbox,
                    formData[symptom.key] && styles.symptomCheckboxActive
                  ]}>
                    {formData[symptom.key] && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </View>
                <Text style={[
                  styles.symptomTitle,
                  formData[symptom.key] && styles.symptomTitleActive
                ]}>
                  {symptom.title}
                </Text>
                <Text style={styles.symptomDescription}>
                  {symptom.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cholesterol Symptoms Section */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryIcon}>💊</Text>
            <View style={styles.categoryTitleContainer}>
              <Text style={styles.categoryTitle}>Gejala Kolesterol</Text>
              <Text style={styles.categorySubtitle}>
                Tanda-tanda kolesterol tinggi
              </Text>
            </View>
          </View>

          <View style={styles.symptomsGrid}>
            {cholesterolSymptoms.map((symptom) => (
              <TouchableOpacity
                key={symptom.key}
                style={[
                  styles.symptomCard,
                  formData[symptom.key] && styles.symptomCardActive
                ]}
                onPress={() => toggleSymptom(symptom.key)}
                activeOpacity={0.7}
              >
                <View style={styles.symptomHeader}>
                  <Text style={styles.symptomIcon}>{symptom.icon}</Text>
                  <View style={[
                    styles.symptomCheckbox,
                    formData[symptom.key] && styles.symptomCheckboxActive
                  ]}>
                    {formData[symptom.key] && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </View>
                <Text style={[
                  styles.symptomTitle,
                  formData[symptom.key] && styles.symptomTitleActive
                ]}>
                  {symptom.title}
                </Text>
                <Text style={styles.symptomDescription}>
                  {symptom.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* No Symptoms Message */}
        {selectedCount === 0 && (
          <View style={styles.noSymptomsCard}>
            <Text style={styles.noSymptomsIcon}>✨</Text>
            <Text style={styles.noSymptomsTitle}>Tidak Ada Gejala</Text>
            <Text style={styles.noSymptomsText}>
              Bagus! Anda tidak mengalami gejala apapun saat ini.
              Tetap jaga pola hidup sehat.
            </Text>
          </View>
        )}

        {/* Warning for multiple symptoms */}
        {selectedCount >= 3 && (
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Perhatian</Text>
              <Text style={styles.warningText}>
                Anda memiliki beberapa gejala. Sangat disarankan untuk 
                berkonsultasi dengan dokter untuk pemeriksaan lebih lanjut.
              </Text>
            </View>
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
    marginBottom: 16,
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
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  symptomCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  symptomCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symptomIcon: {
    fontSize: 28,
  },
  symptomCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  symptomCheckboxActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  checkmark: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  symptomTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  symptomTitleActive: {
    color: '#1E40AF',
  },
  symptomDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  noSymptomsCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 16,
  },
  noSymptomsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noSymptomsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  noSymptomsText: {
    fontSize: 14,
    color: '#15803D',
    textAlign: 'center',
    lineHeight: 20,
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