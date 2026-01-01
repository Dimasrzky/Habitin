import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import { useOnboarding } from '../../src/context/OnboardingContext';

const CONDITION_OPTIONS = [
  'Diabetes',
  'Hipertensi',
  'Kolesterol tinggi',
  'Penyakit jantung',
  'Asma',
  'Tidak ada',
  'Lainnya',
];

const FAMILY_HISTORY_OPTIONS = [
  'Diabetes',
  'Hipertensi',
  'Penyakit jantung',
  'Stroke',
  'Kanker',
  'Kolesterol tinggi',
  'Tidak ada riwayat',
];

export default function PhysicalScreen() {
  const { data, updateData } = useOnboarding();

  const toggleCondition = (option: string) => {
    if (option === 'Tidak ada') {
      updateData('existingConditions', ['Tidak ada']);
    } else {
      const filtered = data.existingConditions.filter((c) => c !== 'Tidak ada');
      const newConditions = filtered.includes(option)
        ? filtered.filter((c) => c !== option)
        : [...filtered, option];
      updateData('existingConditions', newConditions);
    }
  };

  const toggleFamilyHistory = (option: string) => {
    if (option === 'Tidak ada riwayat') {
      updateData('familyHistory', ['Tidak ada riwayat']);
    } else {
      const filtered = data.familyHistory.filter((h) => h !== 'Tidak ada riwayat');
      const newHistory = filtered.includes(option)
        ? filtered.filter((h) => h !== option)
        : [...filtered, option];
      updateData('familyHistory', newHistory);
    }
  };

  const calculateBMI = () => {
    const height = parseFloat(data.heightCm);
    const weight = parseFloat(data.weightKg);
    if (height > 0 && weight > 0) {
      const bmi = weight / ((height / 100) ** 2);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Kurang', color: '#FF9800' };
    if (bmi < 25) return { text: 'Normal', color: '#4CAF50' };
    if (bmi < 30) return { text: 'Berlebih', color: '#FF9800' };
    return { text: 'Obesitas', color: '#F44336' };
  };

  const bmiValue = calculateBMI();
  const bmiCategory = bmiValue ? getBMICategory(parseFloat(bmiValue)) : null;

  const canProceed =
    data.heightCm !== '' &&
    data.weightKg !== '' &&
    data.existingConditions.length > 0 &&
    data.familyHistory.length > 0;

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={8}
      showBackButton={true}
      onBack={() => router.back()}
      footer={
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={() => canProceed && router.push('/onboarding/lifestyle')}
          disabled={!canProceed}
        >
          <Text style={styles.nextButtonText}>Lanjut</Text>
        </TouchableOpacity>
      }
    >
      <Text style={styles.title}>Kondisi Fisik & Riwayat</Text>
      <Text style={styles.subtitle}>Bantu kami memahami kondisi kesehatan Anda</Text>

      {/* Height & Weight */}
      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Tinggi Badan (cm)</Text>
          <TextInput
            style={styles.input}
            value={data.heightCm}
            onChangeText={(text) => updateData('heightCm', text.replace(/[^0-9]/g, ''))}
            placeholder="170"
            keyboardType="numeric"
            placeholderTextColor="#BDBDBD"
          />
        </View>

        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.label}>Berat Badan (kg)</Text>
          <TextInput
            style={styles.input}
            value={data.weightKg}
            onChangeText={(text) => updateData('weightKg', text.replace(/[^0-9]/g, ''))}
            placeholder="65"
            keyboardType="numeric"
            placeholderTextColor="#BDBDBD"
          />
        </View>
      </View>

      {/* BMI Display */}
      {bmiValue && bmiCategory && (
        <View style={styles.bmiContainer}>
          <Text style={styles.bmiLabel}>BMI Anda:</Text>
          <View style={styles.bmiValue}>
            <Text style={styles.bmiNumber}>{bmiValue}</Text>
            <Text style={[styles.bmiCategory, { color: bmiCategory.color }]}>
              {bmiCategory.text}
            </Text>
          </View>
        </View>
      )}

      {/* Existing Conditions */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          Apakah Anda memiliki kondisi kesehatan khusus?
        </Text>
        <Text style={styles.hint}>Pilih sesuai kondisi Anda</Text>

        {CONDITION_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              data.existingConditions.includes(option) && styles.optionButtonSelected,
            ]}
            onPress={() => toggleCondition(option)}
          >
            <View style={styles.checkbox}>
              {data.existingConditions.includes(option) && (
                <View style={styles.checkboxInner} />
              )}
            </View>
            <Text
              style={[
                styles.optionText,
                data.existingConditions.includes(option) && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}

        {data.existingConditions.includes('Lainnya') && (
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            value={data.otherCondition || ''}
            onChangeText={(text) => updateData('otherCondition', text)}
            placeholder="Sebutkan kondisi lainnya"
            placeholderTextColor="#BDBDBD"
          />
        )}
      </View>

      {/* Family History */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Riwayat Kesehatan Keluarga</Text>
        <Text style={styles.hint}>
          Apakah ada anggota keluarga yang memiliki riwayat penyakit
          berikut?
        </Text>

        {FAMILY_HISTORY_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              data.familyHistory.includes(option) && styles.optionButtonSelected,
            ]}
            onPress={() => toggleFamilyHistory(option)}
          >
            <View style={styles.checkbox}>
              {data.familyHistory.includes(option) && (
                <View style={styles.checkboxInner} />
              )}
            </View>
            <Text
              style={[
                styles.optionText,
                data.familyHistory.includes(option) && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}

        {data.familyHistory.includes('Kanker') && (
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            value={data.cancerType || ''}
            onChangeText={(text) => updateData('cancerType', text)}
            placeholder="Sebutkan jenis kanker"
            placeholderTextColor="#BDBDBD"
          />
        )}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 30,
    lineHeight: 24,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bmiContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: 15,
    color: '#757575',
  },
  bmiValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bmiNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  bmiCategory: {
    fontSize: 16,
    fontWeight: '600',
  },
  questionContainer: {
    marginBottom: 30,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: '#9E9E9E',
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  optionText: {
    fontSize: 15,
    color: '#424242',
    flex: 1,
  },
  optionTextSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
