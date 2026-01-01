// app/screens/cekKesehatan/selfCheckKuesioner.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getQuestionsByType, SelfCheckType } from '../../../src/data/selfCheckQuestions';

const STORAGE_KEY = 'self_check_answers';

interface StageInfo {
  stage: number;
  type: SelfCheckType;
  title: string;
  icon: string;
  nextStage?: number;
  nextType?: SelfCheckType;
}

const STAGES: StageInfo[] = [
  { stage: 1, type: 'diabetes', title: 'Tahap 1: Cek Diabetes', icon: '🩸', nextStage: 2, nextType: 'cholesterol' },
  { stage: 2, type: 'cholesterol', title: 'Tahap 2: Cek Kolesterol', icon: '💊', nextStage: 3, nextType: 'both' },
  { stage: 3, type: 'both', title: 'Tahap 3: Cek Gabungan', icon: '❤️' },
];

export default function SelfCheckKuesionerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const currentStageNum = parseInt(params.stage as string) || 1;
  const stageInfo = STAGES[currentStageNum - 1];

  const QUESTIONS = getQuestionsByType(stageInfo.type);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(-1));
  const [allStageAnswers, setAllStageAnswers] = useState<any>({});

  // Load saved answers on mount
  useEffect(() => {
    loadSavedAnswers();
  }, []);

  const loadSavedAnswers = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedAnswers = JSON.parse(saved);
        setAllStageAnswers(parsedAnswers);

        // Load current stage answers if exists
        if (parsedAnswers[`stage${currentStageNum}`]) {
          setAnswers(parsedAnswers[`stage${currentStageNum}`]);
        }
      }
    } catch (error) {
      console.error('Error loading saved answers:', error);
    }
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQuestion];

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (answers[currentQuestion] === -1) {
      Alert.alert('Perhatian', 'Silakan pilih salah satu jawaban');
      return;
    }

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Selesai satu tahap
      completeCurrentStage();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeCurrentStage = async () => {
    try {
      // Save current stage answers
      const updatedAnswers = {
        ...allStageAnswers,
        [`stage${currentStageNum}`]: answers,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnswers));

      // Check if there's a next stage
      if (stageInfo.nextStage && stageInfo.nextType) {
        // Show completion alert for current stage
        const nextStage = stageInfo.nextStage;
        const nextType = stageInfo.nextType;

        Alert.alert(
          `${stageInfo.title} Selesai! 🎉`,
          `Lanjut ke ${STAGES[nextStage - 1].title}`,
          [
            {
              text: 'Lanjut',
              onPress: () => {
                router.replace({
                  pathname: '/screens/cekKesehatan/selfCheckKuesioner' as any,
                  params: {
                    stage: nextStage.toString(),
                    type: nextType,
                  },
                });
              },
            },
          ]
        );
      } else {
        // Semua tahap selesai, hitung hasil
        calculateFinalResults(updatedAnswers);
      }
    } catch (error) {
      console.error('Error saving answers:', error);
      Alert.alert('Error', 'Gagal menyimpan jawaban');
    }
  };

  const calculateFinalResults = async (allAnswers: any) => {
    try {
      // Calculate scores for each stage
      const stage1Answers = allAnswers.stage1 || [];
      const stage2Answers = allAnswers.stage2 || [];
      const stage3Answers = allAnswers.stage3 || [];

      const diabetesQuestions = getQuestionsByType('diabetes');
      const cholesterolQuestions = getQuestionsByType('cholesterol');
      const bothQuestions = getQuestionsByType('both');

      // Calculate diabetes score (from stage 1)
      let diabetesScore = 0;
      stage1Answers.forEach((answerIndex: number, questionIndex: number) => {
        if (answerIndex !== -1) {
          diabetesScore += diabetesQuestions[questionIndex].options[answerIndex].score;
        }
      });
      const diabetesMaxScore = diabetesQuestions.length * 3;
      const diabetesPercentage = Math.round((diabetesScore / diabetesMaxScore) * 100);

      // Calculate cholesterol score (from stage 2)
      let cholesterolScore = 0;
      stage2Answers.forEach((answerIndex: number, questionIndex: number) => {
        if (answerIndex !== -1) {
          cholesterolScore += cholesterolQuestions[questionIndex].options[answerIndex].score;
        }
      });
      const cholesterolMaxScore = cholesterolQuestions.length * 3;
      const cholesterolPercentage = Math.round((cholesterolScore / cholesterolMaxScore) * 100);

      // Calculate combined score (from stage 3)
      let bothScore = 0;
      stage3Answers.forEach((answerIndex: number, questionIndex: number) => {
        if (answerIndex !== -1) {
          bothScore += bothQuestions[questionIndex].options[answerIndex].score;
        }
      });
      const bothMaxScore = bothQuestions.length * 3;
      const bothPercentage = Math.round((bothScore / bothMaxScore) * 100);

      // Clear saved answers
      await AsyncStorage.removeItem(STORAGE_KEY);

      // Navigate to results with all three percentages
      router.replace({
        pathname: '/screens/cekKesehatan/selfCheckHasil' as any,
        params: {
          diabetesPercentage: diabetesPercentage.toString(),
          cholesterolPercentage: cholesterolPercentage.toString(),
          overallPercentage: bothPercentage.toString(),
          diabetesScore: diabetesScore.toString(),
          cholesterolScore: cholesterolScore.toString(),
          overallScore: bothScore.toString(),
        },
      });
    } catch (error) {
      console.error('Error calculating results:', error);
      Alert.alert('Error', 'Gagal menghitung hasil');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerStage}>{stageInfo.title}</Text>
          <Text style={styles.headerProgress}>
            Pertanyaan {currentQuestion + 1}/{QUESTIONS.length}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Stage Progress Indicator */}
      <View style={styles.stageIndicator}>
        {STAGES.map((stage, index) => (
          <View key={index} style={styles.stageItem}>
            <View
              style={[
                styles.stageDot,
                currentStageNum > stage.stage && styles.stageDotCompleted,
                currentStageNum === stage.stage && styles.stageDotActive,
              ]}
            >
              {currentStageNum > stage.stage ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <Text style={styles.stageDotText}>{stage.stage}</Text>
              )}
            </View>
            {index < STAGES.length - 1 && (
              <View
                style={[
                  styles.stageLine,
                  currentStageNum > stage.stage && styles.stageLineCompleted,
                ]}
              />
            )}
          </View>
        ))}
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
          <View style={styles.questionHeader}>
            <View style={styles.questionNumberBadge}>
              <Text style={styles.questionNumberText}>#{currentQuestion + 1}</Text>
            </View>
            <Text style={styles.stageIcon}>{stageInfo.icon}</Text>
          </View>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <Pressable
              key={index}
              onPress={() => handleAnswer(index)}
              style={[
                styles.optionButton,
                answers[currentQuestion] === index && styles.optionButtonSelected,
              ]}
            >
              {/* Radio */}
              <View
                style={[
                  styles.radio,
                  answers[currentQuestion] === index && styles.radioSelected,
                ]}
              >
                {answers[currentQuestion] === index && (
                  <View style={styles.radioInner} />
                )}
              </View>

              {/* Option Text */}
              <Text style={styles.optionText}>{option.text}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable
          onPress={handlePrevious}
          disabled={currentQuestion === 0}
          style={[
            styles.btnPrevious,
            currentQuestion === 0 && styles.btnDisabled,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={currentQuestion === 0 ? '#FFFFFF' : '#256742'}
          />
          <Text
            style={[
              styles.btnPreviousText,
              currentQuestion === 0 && styles.btnDisabledText,
            ]}
          >
            {currentQuestion === 0 ? '' : 'Sebelumnya'}
          </Text>
        </Pressable>

        <Pressable onPress={handleNext} style={styles.btnNext}>
          <Text style={styles.btnNextText}>
            {currentQuestion === QUESTIONS.length - 1
              ? (stageInfo.nextStage ? 'Selesai Tahap' : 'Selesai')
              : 'Lanjut'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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
    marginTop: 40,
  },
  headerCenter: {
    alignItems: 'center',
    marginTop: 40,
  },
  headerStage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerProgress: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  stageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageDotActive: {
    backgroundColor: '#256742',
  },
  stageDotCompleted: {
    backgroundColor: '#ABE7B2',
  },
  stageDotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stageLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  stageLineCompleted: {
    backgroundColor: '#ABE7B2',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#256742',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#256742',
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
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumberBadge: {
    backgroundColor: '#256742',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stageIcon: {
    fontSize: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  optionButtonSelected: {
    backgroundColor: '#E2F8E0',
    borderColor: '#256742',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#256742',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#256742',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: 16,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  btnPrevious: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    right: 8,
  },
  btnPreviousText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#256742',
  },
  btnDisabled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  btnDisabledText: {
    color: '#FFFFFF',
  },
  btnNext: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#256742',
    borderRadius: 10,
    height: 50,
    paddingVertical: 14,
    gap: 8,
    paddingHorizontal: 45,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  btnNextText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
