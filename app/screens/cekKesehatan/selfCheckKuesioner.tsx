// app/screens/cekKesehatan/selfCheckQuestions.tsx

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Tipe untuk jawaban
type Answer = string | number | null;

// Data pertanyaan
const QUESTIONS = [
  {
    id: 1,
    question: 'Berapa usia Anda?',
    type: 'choice',
    options: ['< 18 tahun', '18-25 tahun', '26-35 tahun', '36-45 tahun', '> 45 tahun'],
  },
  {
    id: 2,
    question: 'Apakah ada riwayat diabetes atau kolesterol tinggi di keluarga Anda?',
    type: 'choice',
    options: ['Tidak ada', 'Ada (orang tua)', 'Ada (saudara kandung)', 'Ada (keduanya)'],
  },
  {
    id: 3,
    question: 'Berapa kali Anda berolahraga dalam seminggu?',
    type: 'choice',
    options: ['Tidak pernah', '1-2 kali', '3-4 kali', '5-7 kali'],
  },
  {
    id: 4,
    question: 'Berapa lama Anda duduk/tidak aktif dalam sehari?',
    type: 'choice',
    options: ['< 4 jam', '4-6 jam', '6-8 jam', '> 8 jam'],
  },
  {
    id: 5,
    question: 'Seberapa sering Anda mengonsumsi minuman manis (softdrink, teh manis, dll)?',
    type: 'choice',
    options: ['Tidak pernah', '1-2 kali/minggu', '3-5 kali/minggu', 'Setiap hari'],
  },
  {
    id: 6,
    question: 'Seberapa sering Anda makan gorengan atau makanan berlemak?',
    type: 'choice',
    options: ['Jarang (< 1x/minggu)', 'Kadang (2-3x/minggu)', 'Sering (4-5x/minggu)', 'Setiap hari'],
  },
  {
    id: 7,
    question: 'Berapa porsi sayur dan buah yang Anda konsumsi per hari?',
    type: 'choice',
    options: ['Tidak ada', '1-2 porsi', '3-4 porsi', '5+ porsi'],
  },
  {
    id: 8,
    question: 'Berapa gelas air putih yang Anda minum per hari?',
    type: 'choice',
    options: ['< 4 gelas', '4-6 gelas', '6-8 gelas', '> 8 gelas'],
  },
  {
    id: 9,
    question: 'Bagaimana kualitas tidur Anda?',
    type: 'choice',
    options: ['Buruk (< 5 jam)', 'Kurang (5-6 jam)', 'Cukup (6-7 jam)', 'Baik (> 7 jam)'],
  },
  {
    id: 10,
    question: 'Apakah Anda sering merasa stress atau cemas?',
    type: 'choice',
    options: ['Tidak pernah', 'Jarang', 'Kadang-kadang', 'Sering'],
  },
  {
    id: 11,
    question: 'Apakah Anda merokok?',
    type: 'choice',
    options: ['Tidak', 'Dulu, tapi sudah berhenti', 'Ya, kadang-kadang', 'Ya, rutin'],
  },
  {
    id: 12,
    question: 'Seberapa sering Anda mengonsumsi alkohol?',
    type: 'choice',
    options: ['Tidak pernah', 'Jarang (acara khusus)', 'Kadang (1-2x/bulan)', 'Sering (tiap minggu)'],
  },
  {
    id: 13,
    question: 'Apakah Anda pernah cek gula darah atau kolesterol dalam 6 bulan terakhir?',
    type: 'choice',
    options: ['Tidak pernah', 'Pernah, hasilnya normal', 'Pernah, hasilnya borderline', 'Pernah, hasilnya tinggi'],
  },
  {
    id: 14,
    question: 'Apakah Anda sering merasa lelah tanpa sebab yang jelas?',
    type: 'choice',
    options: ['Tidak pernah', 'Jarang', 'Kadang-kadang', 'Sering'],
  },
  {
    id: 15,
    question: 'Apakah Anda sering merasa haus atau buang air kecil berlebihan?',
    type: 'choice',
    options: ['Tidak', 'Jarang', 'Kadang-kadang', 'Sering'],
  },
];

export default function SelfCheckQuestionsScreen() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(new Array(QUESTIONS.length).fill(null));

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQuestion];

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (answers[currentQuestion] === null) {
      Alert.alert('Perhatian', 'Silakan pilih salah satu jawaban');
      return;
    }

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Selesai, hitung skor dan navigate ke hasil
      calculateAndNavigateToResult();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateAndNavigateToResult = () => {
    // Kalkulasi skor sederhana
    let totalScore = 0;
    answers.forEach((answer) => {
      if (typeof answer === 'number') {
        totalScore += answer;
      }
    });

    // Tentukan level risiko
    let riskLevel: 'rendah' | 'sedang' | 'tinggi';
    if (totalScore < 20) {
      riskLevel = 'rendah';
    } else if (totalScore < 35) {
      riskLevel = 'sedang';
    } else {
      riskLevel = 'tinggi';
    }

    // Navigate dengan params
    router.replace({
      pathname: '/screens/cekKesehatan/selfCheckHasil' as any,
      params: {
        score: totalScore,
        riskLevel: riskLevel,
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>
          Pertanyaan {currentQuestion + 1}/{QUESTIONS.length}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionNumberBadge}>
            <Text style={styles.questionNumberText}>#{currentQuestion + 1}</Text>
          </View>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.optionCard,
                answers[currentQuestion] === index && styles.optionCardSelected,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => handleAnswer(index)}
            >
              <View style={[
                styles.optionRadio,
                answers[currentQuestion] === index && styles.optionRadioSelected,
              ]}>
                {answers[currentQuestion] === index && (
                  <View style={styles.optionRadioInner} />
                )}
              </View>
              <Text style={[
                styles.optionText,
                answers[currentQuestion] === index && styles.optionTextSelected,
              ]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomAction}>
        <Pressable
          style={({ pressed }) => [
            styles.previousButton,
            { opacity: pressed ? 0.8 : 1 },
            currentQuestion === 0 && styles.buttonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <Ionicons name="arrow-back" size={20} color={currentQuestion === 0 ? '#7fcc5cff' : '#6B7280'} />
          <Text style={[
            styles.previousButtonText,
            currentQuestion === 0 && styles.buttonTextDisabled,
          ]}>
            Sebelumnya
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            { opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion === QUESTIONS.length - 1 ? 'Selesai' : 'Lanjut'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#7fcc5cff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#93BFC7',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#93BFC7',
    minWidth: 45,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionNumberBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  questionNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#93BFC7',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionCardSelected: {
    borderColor: '#93BFC7',
    backgroundColor: '#E3F2FD',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: '#93BFC7',
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#93BFC7',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  optionTextSelected: {
    color: '#1F2937',
    fontWeight: '500',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  previousButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  previousButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 30,
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#93BFC7',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#d2c0c0ff',
    left: 120,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    color: '#D1D5DB',
  },
});