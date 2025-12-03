// app/onboarding/personal.tsx

import { useOnboarding } from '@/context/OnboardingContext';
import { PersonalData } from '@/services/onboarding/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function PersonalScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams();
  const { onboardingData, updatePersonal, setIsEditMode } = useOnboarding();
  
  const [formData, setFormData] = useState<PersonalData>(
    onboardingData.personal || {
      fullName: '',
      age: 0,
      gender: 'male',
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set edit mode if parameter exists
  useEffect(() => {
    if (mode === 'edit') {
      setIsEditMode(true);
    }
  }, [mode, setIsEditMode]);

  // Validasi form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap harus diisi';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Nama minimal 3 karakter';
    }
    
    if (!formData.age || formData.age < 10) {
      newErrors.age = 'Usia minimal 10 tahun';
    } else if (formData.age > 100) {
      newErrors.age = 'Usia tidak valid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      updatePersonal(formData);
      router.push('/onboarding/physical');
    } else {
      Alert.alert('Validasi Error', 'Mohon lengkapi data dengan benar');
    }
  };

  const handleBack = () => {
    // Check if in edit mode
    if (mode === 'edit') {
      Alert.alert(
        'Batalkan Edit?',
        'Perubahan yang belum disimpan akan hilang',
        [
          { text: 'Lanjut Edit', style: 'cancel' },
          {
            text: 'Batalkan',
            style: 'destructive',
            onPress: () => {
              setIsEditMode(false);
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '16.6%' }]} />
            </View>
            <Text style={styles.progressText}>
              {mode === 'edit' ? 'Edit Data Personal' : 'Step 1 of 6'}
            </Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Data Personal</Text>
            <Text style={styles.subtitle}>
              Mari kita mulai dengan informasi dasar tentang diri Anda
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Nama Lengkap */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nama Lengkap <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="Masukkan nama lengkap Anda"
                value={formData.fullName}
                onChangeText={(text) => {
                  setFormData({ ...formData, fullName: text });
                  if (errors.fullName) {
                    setErrors({ ...errors, fullName: '' });
                  }
                }}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            {/* Usia */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Usia <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.age && styles.inputError]}
                placeholder="Masukkan usia Anda"
                value={formData.age ? formData.age.toString() : ''}
                onChangeText={(text) => {
                  const age = parseInt(text) || 0;
                  setFormData({ ...formData, age });
                  if (errors.age) {
                    setErrors({ ...errors, age: '' });
                  }
                }}
                keyboardType="numeric"
                maxLength={3}
              />
              {errors.age && (
                <Text style={styles.errorText}>{errors.age}</Text>
              )}
            </View>

            {/* Jenis Kelamin */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Jenis Kelamin <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.gender === 'male' && styles.genderButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, gender: 'male' })}
                >
                  <Text style={[
                    styles.genderText,
                    formData.gender === 'male' && styles.genderTextActive
                  ]}>
                    👨 Laki-laki
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.gender === 'female' && styles.genderButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, gender: 'female' })}
                >
                  <Text style={[
                    styles.genderText,
                    formData.gender === 'female' && styles.genderTextActive
                  ]}>
                    👩 Perempuan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={styles.buttonSecondary}
            onPress={handleBack}
          >
            <Text style={styles.buttonSecondaryText}>
              {mode === 'edit' ? 'Batalkan' : 'Kembali'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buttonPrimary}
            onPress={handleNext}
          >
            <Text style={styles.buttonPrimaryText}>Selanjutnya</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
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
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    color: '#EF4444',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  genderButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  genderText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  genderTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
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