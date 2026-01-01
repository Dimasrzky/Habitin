// app/screens/cekKesehatan/inputManual.tsx

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface LabValues {
  // Diabetes
  glucoseFasting: string;
  hba1c: string;
  // Cholesterol
  totalCholesterol: string;
  ldl: string;
  hdl: string;
  triglycerides: string;
}

export default function InputManualScreen() {
  const router = useRouter();

  const [values, setValues] = useState<LabValues>({
    glucoseFasting: '',
    hba1c: '',
    totalCholesterol: '',
    ldl: '',
    hdl: '',
    triglycerides: '',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleValueChange = (field: keyof LabValues, value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setValues((prev) => ({ ...prev, [field]: numericValue }));
  };

  const validateInputs = (): boolean => {
    // At least one diabetes OR one cholesterol value must be filled
    const hasDiabetesValue = values.glucoseFasting !== '' || values.hba1c !== '';
    const hasCholesterolValue =
      values.totalCholesterol !== '' ||
      values.ldl !== '' ||
      values.hdl !== '' ||
      values.triglycerides !== '';

    if (!hasDiabetesValue && !hasCholesterolValue) {
      Alert.alert(
        'Data Tidak Lengkap',
        'Harap isi minimal satu nilai dari Diabetes atau Kolesterol'
      );
      return false;
    }

    // Validate ranges
    if (values.glucoseFasting !== '') {
      const glucose = parseFloat(values.glucoseFasting);
      if (glucose < 50 || glucose > 500) {
        Alert.alert('Nilai Tidak Valid', 'Glukosa Puasa harus antara 50-500 mg/dL');
        return false;
      }
    }

    if (values.hba1c !== '') {
      const hba1c = parseFloat(values.hba1c);
      if (hba1c < 3 || hba1c > 20) {
        Alert.alert('Nilai Tidak Valid', 'HbA1c harus antara 3-20%');
        return false;
      }
    }

    if (values.totalCholesterol !== '') {
      const total = parseFloat(values.totalCholesterol);
      if (total < 100 || total > 500) {
        Alert.alert('Nilai Tidak Valid', 'Kolesterol Total harus antara 100-500 mg/dL');
        return false;
      }
    }

    if (values.ldl !== '') {
      const ldl = parseFloat(values.ldl);
      if (ldl < 50 || ldl > 400) {
        Alert.alert('Nilai Tidak Valid', 'LDL harus antara 50-400 mg/dL');
        return false;
      }
    }

    if (values.hdl !== '') {
      const hdl = parseFloat(values.hdl);
      if (hdl < 20 || hdl > 150) {
        Alert.alert('Nilai Tidak Valid', 'HDL harus antara 20-150 mg/dL');
        return false;
      }
    }

    if (values.triglycerides !== '') {
      const trig = parseFloat(values.triglycerides);
      if (trig < 50 || trig > 1000) {
        Alert.alert('Nilai Tidak Valid', 'Trigliserida harus antara 50-1000 mg/dL');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateInputs()) return;

    // Navigate to result page with values
    router.push({
      pathname: '/screens/cekKesehatan/inputManualHasil' as any,
      params: {
        glucoseFasting: values.glucoseFasting || '0',
        hba1c: values.hba1c || '0',
        totalCholesterol: values.totalCholesterol || '0',
        ldl: values.ldl || '0',
        hdl: values.hdl || '0',
        triglycerides: values.triglycerides || '0',
      },
    });
  };

  const InputField = ({
    label,
    value,
    field,
    unit,
    normalRange,
    placeholder,
  }: {
    label: string;
    value: string;
    field: keyof LabValues;
    unit: string;
    normalRange: string;
    placeholder: string;
  }) => (
    <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.inputLabel}>{label}</Text>
        <Text style={styles.normalRangeText}>Normal: {normalRange}</Text>
      </View>
      <View
        style={[
          styles.inputWrapper,
          focusedField === field && styles.inputWrapperFocused,
          value !== '' && styles.inputWrapperFilled,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => handleValueChange(field, text)}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Input Manual</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <Ionicons name="create-outline" size={48} color="#256742" />
          </View>
          <Text style={styles.heroTitle}>Masukkan Nilai Lab Anda</Text>
          <Text style={styles.heroSubtitle}>
            Isi nilai hasil lab untuk mendapatkan analisis kesehatan
          </Text>
        </View>

        {/* Quick Info Pills */}
        <View style={styles.infoPills}>
          <View style={styles.infoPill}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.infoPillText}>Isi sebagian/semua</Text>
          </View>
          <View style={styles.infoPill}>
            <Ionicons name="speedometer-outline" size={16} color="#3B82F6" />
            <Text style={styles.infoPillText}>Hasil instan</Text>
          </View>
        </View>

        {/* Diabetes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <View style={styles.sectionIconBadge}>
              <Ionicons name="water" size={20} color="#EF4444" />
            </View>
            <Text style={styles.sectionTitle}>Parameter Diabetes</Text>
          </View>

          <View style={styles.fieldsContainer}>
            <InputField
              label="Glukosa Puasa"
              value={values.glucoseFasting}
              field="glucoseFasting"
              unit="mg/dL"
              normalRange="< 100"
              placeholder="Masukkan nilai"
            />

            <InputField
              label="HbA1c"
              value={values.hba1c}
              field="hba1c"
              unit="%"
              normalRange="< 5.7"
              placeholder="Masukkan nilai"
            />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Cholesterol Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="fitness" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.sectionTitle}>Parameter Kolesterol</Text>
          </View>

          <View style={styles.fieldsContainer}>
            <InputField
              label="Kolesterol Total"
              value={values.totalCholesterol}
              field="totalCholesterol"
              unit="mg/dL"
              normalRange="< 200"
              placeholder="Masukkan nilai"
            />

            <InputField
              label="LDL (Kolesterol Jahat)"
              value={values.ldl}
              field="ldl"
              unit="mg/dL"
              normalRange="< 100"
              placeholder="Masukkan nilai"
            />

            <InputField
              label="HDL (Kolesterol Baik)"
              value={values.hdl}
              field="hdl"
              unit="mg/dL"
              normalRange="> 60"
              placeholder="Masukkan nilai"
            />

            <InputField
              label="Trigliserida"
              value={values.triglycerides}
              field="triglycerides"
              unit="mg/dL"
              normalRange="< 150"
              placeholder="Masukkan nilai"
            />
          </View>
        </View>

        {/* Reference Guide */}
        <View style={styles.guideCard}>
          <View style={styles.guideHeader}>
            <Ionicons name="book-outline" size={20} color="#6366F1" />
            <Text style={styles.guideTitle}>Panduan Nilai Normal</Text>
          </View>
          <View style={styles.guideGrid}>
            <View style={styles.guideItem}>
              <Text style={styles.guideLabel}>Glukosa Puasa</Text>
              <Text style={styles.guideValue}>&lt; 100 mg/dL</Text>
            </View>
            <View style={styles.guideItem}>
              <Text style={styles.guideLabel}>HbA1c</Text>
              <Text style={styles.guideValue}>&lt; 5.7%</Text>
            </View>
            <View style={styles.guideItem}>
              <Text style={styles.guideLabel}>Kol. Total</Text>
              <Text style={styles.guideValue}>&lt; 200 mg/dL</Text>
            </View>
            <View style={styles.guideItem}>
              <Text style={styles.guideLabel}>LDL</Text>
              <Text style={styles.guideValue}>&lt; 100 mg/dL</Text>
            </View>
            <View style={styles.guideItem}>
              <Text style={styles.guideLabel}>HDL</Text>
              <Text style={styles.guideValue}>&gt; 60 mg/dL</Text>
            </View>
            <View style={styles.guideItem}>
              <Text style={styles.guideLabel}>Trigliserida</Text>
              <Text style={styles.guideValue}>&lt; 150 mg/dL</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={styles.submitButtonText}>Analisis Hasil</Text>
          <View style={styles.submitButtonIcon}>
            <Ionicons name="arrow-forward" size={20} color="#256742" />
          </View>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoPills: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  fieldsContainer: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  normalRangeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: '#256742',
    backgroundColor: '#F9FAFB',
  },
  inputWrapperFilled: {
    borderColor: '#D1D5DB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  unit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  guideGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  guideItem: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  guideLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  guideValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#256742',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  submitButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
