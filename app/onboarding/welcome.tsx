import { router } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useOnboarding } from '../../src/context/OnboardingContext';

const PURPOSE_OPTIONS = [
  'Memantau kesehatan secara rutin',
  'Memahami hasil lab saya',
  'Mencegah penyakit tertentu',
  'Rekomendasi dari dokter',
  'Lainnya',
];

const FREQUENCY_OPTIONS = [
  'Belum pernah',
  'Jarang (1-2 kali/tahun)',
  'Rutin (3-4 kali/tahun)',
  'Sangat rutin (>4 kali/tahun)',
];

export default function WelcomeScreen() {
  const { data, updateData } = useOnboarding();

  const togglePurpose = (option: string) => {
    const newPurpose = data.purpose.includes(option)
      ? data.purpose.filter((p) => p !== option)
      : [...data.purpose, option];
    updateData('purpose', newPurpose);
  };

  const canProceed = data.purpose.length > 0 && data.checkupFrequency !== '';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '12.5%' }]} />
        </View>
        <Text style={styles.stepText}>Step 1 of 8</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Selamat Datang di Habitin! 🎉</Text>
        <Text style={styles.subtitle}>
          Mari kenalan dulu supaya kami bisa memberikan pengalaman terbaik untuk Anda
        </Text>

        {/* Question 1 */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            Apa tujuan utama Anda menggunakan aplikasi ini?
          </Text>
          <Text style={styles.hint}>Pilih semua yang sesuai</Text>

          {PURPOSE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                data.purpose.includes(option) && styles.optionButtonSelected,
              ]}
              onPress={() => togglePurpose(option)}
            >
              <View style={styles.checkbox}>
                {data.purpose.includes(option) && <View style={styles.checkboxInner} />}
              </View>
              <Text
                style={[
                  styles.optionText,
                  data.purpose.includes(option) && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Question 2 */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            Seberapa sering Anda melakukan cek kesehatan/lab?
          </Text>

          {FREQUENCY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                data.checkupFrequency === option && styles.optionButtonSelected,
              ]}
              onPress={() => updateData('checkupFrequency', option)}
            >
              <View style={styles.radio}>
                {data.checkupFrequency === option && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[
                  styles.optionText,
                  data.checkupFrequency === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={() => canProceed && router.push('/onboarding/personal')}
          disabled={!canProceed}
        >
          <Text style={styles.nextButtonText}>Lanjut</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  stepText: {
    marginTop: 8,
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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