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

const EXERCISE_OPTIONS = [
  'Tidak pernah',
  '1-2 kali/minggu',
  '3-4 kali/minggu',
  '>5 kali/minggu',
];

const DIET_OPTIONS = [
  'Sangat tidak sehat (fast food, gorengan sering)',
  'Cukup sehat (kadang sayur/buah)',
  'Sehat (rutin sayur/buah)',
  'Sangat sehat (diet teratur)',
];

const SMOKING_OPTIONS = [
  'Tidak',
  'Ya, kadang-kadang',
  'Ya, rutin (<10 batang/hari)',
  'Ya, rutin (>10 batang/hari)',
];

const SLEEP_OPTIONS = ['<5 jam', '5-6 jam', '7-8 jam', '>8 jam'];

const STRESS_OPTIONS = ['Jarang', 'Kadang-kadang', 'Sering', 'Selalu'];

export default function LifestyleScreen() {
  const { data, updateData } = useOnboarding();

  const canProceed =
    data.exerciseFrequency !== '' &&
    data.dietPattern !== '' &&
    data.smokingHabit !== '' &&
    data.sleepHours !== '' &&
    data.stressLevel !== '';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
        <Text style={styles.stepText}>Step 4 of 8</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Gaya Hidup</Text>
        <Text style={styles.subtitle}>
          Lifestyle Anda sangat mempengaruhi risiko kesehatan
        </Text>

        {/* Exercise Frequency */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            Seberapa sering Anda berolahraga? *
          </Text>

          {EXERCISE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                data.exerciseFrequency === option && styles.optionButtonSelected,
              ]}
              onPress={() => updateData('exerciseFrequency', option)}
            >
              <View style={styles.radio}>
                {data.exerciseFrequency === option && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[
                  styles.optionText,
                  data.exerciseFrequency === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Diet Pattern */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Bagaimana pola makan Anda? *</Text>

          {DIET_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                data.dietPattern === option && styles.optionButtonSelected,
              ]}
              onPress={() => updateData('dietPattern', option)}
            >
              <View style={styles.radio}>
                {data.dietPattern === option && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[
                  styles.optionText,
                  data.dietPattern === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Smoking Habit */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Apakah Anda merokok? *</Text>

          {SMOKING_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                data.smokingHabit === option && styles.optionButtonSelected,
              ]}
              onPress={() => updateData('smokingHabit', option)}
            >
              <View style={styles.radio}>
                {data.smokingHabit === option && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[
                  styles.optionText,
                  data.smokingHabit === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sleep Hours */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Berapa jam Anda tidur per hari? *</Text>

          {SLEEP_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                data.sleepHours === option && styles.optionButtonSelected,
              ]}
              onPress={() => updateData('sleepHours', option)}
            >
              <View style={styles.radio}>
                {data.sleepHours === option && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[
                  styles.optionText,
                  data.sleepHours === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stress Level */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            Seberapa sering Anda merasa stres? *
          </Text>

          {STRESS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                data.stressLevel === option && styles.optionButtonSelected,
              ]}
              onPress={() => updateData('stressLevel', option)}
            >
              <View style={styles.radio}>
                {data.stressLevel === option && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[
                  styles.optionText,
                  data.stressLevel === option && styles.optionTextSelected,
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
          onPress={() => canProceed && router.push('/onboarding/symptoms')}
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
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 28,
    color: '#212121',
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