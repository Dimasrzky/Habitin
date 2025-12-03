import { ExerciseFrequency, Lifestyle, SmokingStatus, StressLevel } from '@/services/onboarding/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function LifestyleScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<Lifestyle>({
    exerciseFrequency: 'rarely',
    smokingStatus: 'never',
    alcoholConsumption: 'never',
    sleepHours: 7,
    stressLevel: 'moderate',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.sleepHours || formData.sleepHours < 3 || formData.sleepHours > 15) {
      newErrors.sleepHours = 'Jam tidur harus antara 3-15 jam';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      router.push('/onboarding/symptoms');
    } else {
      Alert.alert('Validasi Error', 'Mohon lengkapi data dengan benar');
    }
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
            <View style={[styles.progressFill, { width: '66.6%' }]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 6</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gaya Hidup</Text>
          <Text style={styles.subtitle}>
            Kebiasaan sehari-hari berpengaruh besar pada kesehatan Anda
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Frekuensi Olahraga */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Seberapa sering Anda berolahraga? <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.optionsGrid}>
              {[
                { value: 'never', label: 'Tidak Pernah', icon: '😴' },
                { value: 'rarely', label: '< 1x/minggu', icon: '🚶' },
                { value: '1-2_per_week', label: '1-2x/minggu', icon: '🏃' },
                { value: '3-4_per_week', label: '3-4x/minggu', icon: '💪' },
                { value: 'daily', label: 'Setiap Hari', icon: '🏋️' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.exerciseFrequency === option.value && styles.optionButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, exerciseFrequency: option.value as ExerciseFrequency })}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.optionLabel,
                    formData.exerciseFrequency === option.value && styles.optionLabelActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status Merokok */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Apakah Anda merokok? <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.optionsGrid}>
              {[
                { value: 'never', label: 'Tidak Pernah', icon: '🚭' },
                { value: 'former', label: 'Dulu (Sudah Berhenti)', icon: '✅' },
                { value: 'current_light', label: 'Ya, Ringan', icon: '🚬' },
                { value: 'current_heavy', label: 'Ya, Berat', icon: '🔴' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.smokingStatus === option.value && styles.optionButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, smokingStatus: option.value as SmokingStatus })}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.optionLabel,
                    formData.smokingStatus === option.value && styles.optionLabelActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Konsumsi Alkohol */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Seberapa sering Anda mengonsumsi alkohol? <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.optionsGrid}>
              {[
                { value: 'never', label: 'Tidak Pernah', icon: '🚫' },
                { value: 'occasional', label: 'Kadang-kadang', icon: '🍷' },
                { value: 'regular', label: 'Rutin', icon: '🍺' },
                { value: 'heavy', label: 'Sering/Berat', icon: '⚠️' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.alcoholConsumption === option.value && styles.optionButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, alcoholConsumption: option.value as any })}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.optionLabel,
                    formData.alcoholConsumption === option.value && styles.optionLabelActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Jam Tidur */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Berapa jam Anda tidur per hari? <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.sleepSlider}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sleepOptions}
              >
                {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((hours) => (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.sleepOption,
                      formData.sleepHours === hours && styles.sleepOptionActive
                    ]}
                    onPress={() => setFormData({ ...formData, sleepHours: hours })}
                  >
                    <Text style={[
                      styles.sleepValue,
                      formData.sleepHours === hours && styles.sleepValueActive
                    ]}>
                      {hours}
                    </Text>
                    <Text style={[
                      styles.sleepLabel,
                      formData.sleepHours === hours && styles.sleepLabelActive
                    ]}>
                      jam
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {errors.sleepHours && (
              <Text style={styles.errorText}>{errors.sleepHours}</Text>
            )}
          </View>

          {/* Level Stress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Bagaimana tingkat stress Anda? <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.optionsGrid}>
              {[
                { value: 'low', label: 'Rendah', icon: '😌', color: '#10B981' },
                { value: 'moderate', label: 'Sedang', icon: '😐', color: '#F59E0B' },
                { value: 'high', label: 'Tinggi', icon: '😰', color: '#EF4444' },
                { value: 'very_high', label: 'Sangat Tinggi', icon: '😱', color: '#991B1B' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.stressLevel === option.value && styles.optionButtonActive,
                    formData.stressLevel === option.value && { borderColor: option.color }
                  ]}
                  onPress={() => setFormData({ ...formData, stressLevel: option.value as StressLevel })}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.optionLabel,
                    formData.stressLevel === option.value && styles.optionLabelActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
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
    marginBottom: 32,
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
  form: {
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    color: '#EF4444',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    gap: 8,
  },
  optionButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionIcon: {
    fontSize: 32,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  optionLabelActive: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  sleepSlider: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  sleepOptions: {
    gap: 12,
    paddingHorizontal: 4,
  },
  sleepOption: {
    width: 70,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    gap: 4,
  },
  sleepOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  sleepValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  sleepValueActive: {
    color: '#1E40AF',
  },
  sleepLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sleepLabelActive: {
    color: '#3B82F6',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
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