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

const SYMPTOM_OPTIONS = [
  'Mudah lelah',
  'Sering haus',
  'Sering buang air kecil',
  'Pusing/sakit kepala',
  'Sesak napas',
  'Nyeri dada',
  'Berat badan turun drastis',
  'Tidak ada gejala',
];

export default function SymptomsScreen() {
  const { data, updateData } = useOnboarding();

  const toggleSymptom = (option: string) => {
    if (option === 'Tidak ada gejala') {
      updateData('symptoms', ['Tidak ada gejala']);
    } else {
      const filtered = data.symptoms.filter((s) => s !== 'Tidak ada gejala');
      const newSymptoms = filtered.includes(option)
        ? filtered.filter((s) => s !== option)
        : [...filtered, option];
      updateData('symptoms', newSymptoms);
    }
  };

  const handleSkip = () => {
    updateData('symptoms', []);
    router.push('/onboarding/notification');
  };

  const handleNext = () => {
    router.push('/onboarding/notification');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '62.5%' }]} />
        </View>
        <Text style={styles.stepText}>Step 5 of 8</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Gejala yang Dirasakan</Text>
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalText}>Opsional</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Apakah Anda merasakan gejala berikut dalam 3 bulan terakhir?
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Informasi ini membantu kami memberikan peringatan dini jika ada kondisi yang
            perlu perhatian lebih
          </Text>
        </View>

        {SYMPTOM_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              data.symptoms.includes(option) && styles.optionButtonSelected,
            ]}
            onPress={() => toggleSymptom(option)}
          >
            <View style={styles.checkbox}>
              {data.symptoms.includes(option) && <View style={styles.checkboxInner} />}
            </View>
            <Text
              style={[
                styles.optionText,
                data.symptoms.includes(option) && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Lewati</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212121',
    marginRight: 10,
  },
  optionalBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optionalText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 20,
    lineHeight: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
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
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  skipButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});