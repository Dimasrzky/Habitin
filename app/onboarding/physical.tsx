import { PhysicalData } from '@/services/onboarding/types';
import { useRouter } from 'expo-router';
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

export default function PhysicalScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<PhysicalData>({
    weight: 0,
    height: 0,
    bmi: undefined, // UBAH: set undefined sebagai default
    bloodPressureSystolic: undefined,
    bloodPressureDiastolic: undefined,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculate BMI
  useEffect(() => {
    if (formData.weight > 0 && formData.height > 0) {
      const heightInMeters = formData.height / 100;
      const bmi = formData.weight / (heightInMeters * heightInMeters);
      setFormData(prev => ({ ...prev, bmi: parseFloat(bmi.toFixed(1)) }));
    } else {
      // Reset BMI jika weight atau height tidak valid
      setFormData(prev => ({ ...prev, bmi: undefined }));
    }
  }, [formData.weight, formData.height]);

  // Get BMI category
  const getBMICategory = (bmi: number): { text: string; color: string } => {
    if (bmi < 18.5) return { text: 'Kurus', color: '#F59E0B' };
    if (bmi < 23) return { text: 'Normal', color: '#10B981' };
    if (bmi < 25) return { text: 'Gemuk', color: '#F59E0B' };
    if (bmi < 30) return { text: 'Obesitas Ringan', color: '#EF4444' };
    return { text: 'Obesitas Berat', color: '#991B1B' };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.weight || formData.weight < 30 || formData.weight > 300) {
      newErrors.weight = 'Berat badan harus antara 30-300 kg';
    }
    
    if (!formData.height || formData.height < 100 || formData.height > 250) {
      newErrors.height = 'Tinggi badan harus antara 100-250 cm';
    }
    
    // Validasi tekanan darah (opsional, tapi jika diisi harus valid)
    if (formData.bloodPressureSystolic) {
      if (formData.bloodPressureSystolic < 70 || formData.bloodPressureSystolic > 200) {
        newErrors.bloodPressureSystolic = 'Tekanan sistolik tidak valid';
      }
    }
    
    if (formData.bloodPressureDiastolic) {
      if (formData.bloodPressureDiastolic < 40 || formData.bloodPressureDiastolic > 130) {
        newErrors.bloodPressureDiastolic = 'Tekanan diastolik tidak valid';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      router.push('/onboarding/family');
    } else {
      Alert.alert('Validasi Error', 'Mohon lengkapi data dengan benar');
    }
  };

  // PERBAIKAN: Check undefined sebelum get category
  const bmiCategory = (formData.bmi !== undefined && formData.bmi > 0) 
    ? getBMICategory(formData.bmi) 
    : null;

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
              <View style={[styles.progressFill, { width: '33.3%' }]} />
            </View>
            <Text style={styles.progressText}>Step 2 of 6</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Data Fisik</Text>
            <Text style={styles.subtitle}>
              Informasi fisik membantu kami menilai risiko kesehatan Anda
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Berat Badan */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Berat Badan (kg) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[styles.input, errors.weight && styles.inputError]}
                  placeholder="Contoh: 65"
                  value={formData.weight ? formData.weight.toString() : ''}
                  onChangeText={(text) => {
                    const weight = parseFloat(text) || 0;
                    setFormData({ ...formData, weight });
                    if (errors.weight) setErrors({ ...errors, weight: '' });
                  }}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.unitText}>kg</Text>
              </View>
              {errors.weight && (
                <Text style={styles.errorText}>{errors.weight}</Text>
              )}
            </View>

            {/* Tinggi Badan */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tinggi Badan (cm) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[styles.input, errors.height && styles.inputError]}
                  placeholder="Contoh: 170"
                  value={formData.height ? formData.height.toString() : ''}
                  onChangeText={(text) => {
                    const height = parseFloat(text) || 0;
                    setFormData({ ...formData, height });
                    if (errors.height) setErrors({ ...errors, height: '' });
                  }}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.unitText}>cm</Text>
              </View>
              {errors.height && (
                <Text style={styles.errorText}>{errors.height}</Text>
              )}
            </View>

            {/* BMI Result - PERBAIKAN: Check undefined */}
            {formData.bmi !== undefined && formData.bmi > 0 && bmiCategory && (
              <View style={styles.bmiCard}>
                <Text style={styles.bmiLabel}>Indeks Massa Tubuh (BMI)</Text>
                <View style={styles.bmiResult}>
                  <Text style={styles.bmiValue}>{formData.bmi.toFixed(1)}</Text>
                  <View style={[styles.bmiCategoryBadge, { backgroundColor: bmiCategory.color + '20' }]}>
                    <Text style={[styles.bmiCategoryText, { color: bmiCategory.color }]}>
                      {bmiCategory.text}
                    </Text>
                  </View>
                </View>
                <Text style={styles.bmiInfo}>
                  BMI dihitung otomatis dari berat dan tinggi badan Anda
                </Text>
              </View>
            )}

            {/* Tekanan Darah (Opsional) */}
            <View style={styles.bloodPressureSection}>
              <Text style={styles.sectionTitle}>
                Tekanan Darah (Opsional)
              </Text>
              <Text style={styles.sectionSubtitle}>
                Jika Anda mengetahui tekanan darah Anda, silakan isi
              </Text>

              <View style={styles.bloodPressureRow}>
                <View style={styles.bloodPressureInput}>
                  <Text style={styles.label}>Sistolik</Text>
                  <View style={styles.inputWithUnit}>
                    <TextInput
                      style={styles.input}
                      placeholder="120"
                      value={formData.bloodPressureSystolic?.toString() || ''}
                      onChangeText={(text) => {
                        const value = parseInt(text) || undefined;
                        setFormData({ ...formData, bloodPressureSystolic: value });
                      }}
                      keyboardType="numeric"
                    />
                    <Text style={styles.unitText}>mmHg</Text>
                  </View>
                </View>

                <Text style={styles.bloodPressureSeparator}>/</Text>

                <View style={styles.bloodPressureInput}>
                  <Text style={styles.label}>Diastolik</Text>
                  <View style={styles.inputWithUnit}>
                    <TextInput
                      style={styles.input}
                      placeholder="80"
                      value={formData.bloodPressureDiastolic?.toString() || ''}
                      onChangeText={(text) => {
                        const value = parseInt(text) || undefined;
                        setFormData({ ...formData, bloodPressureDiastolic: value });
                      }}
                      keyboardType="numeric"
                    />
                    <Text style={styles.unitText}>mmHg</Text>
                  </View>
                </View>
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
  inputWithUnit: {
    position: 'relative',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 60,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  unitText: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  bmiCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  bmiLabel: {
    fontSize: 14,
    color: '#0369A1',
    fontWeight: '500',
    marginBottom: 8,
  },
  bmiResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0C4A6E',
  },
  bmiCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bmiCategoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bmiInfo: {
    fontSize: 12,
    color: '#0369A1',
  },
  bloodPressureSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  bloodPressureRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  bloodPressureInput: {
    flex: 1,
  },
  bloodPressureSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginBottom: 16,
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