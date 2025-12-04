import { supabase } from '../../config/supabase.config';
import { OnboardingData } from '../../types/onboarding.types';

const calculateBMI = (heightCm: number, weightKg: number): number => {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
};

export const saveOnboardingData = async (
  userId: string,
  data: OnboardingData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const bmi = calculateBMI(
      parseFloat(data.heightCm),
      parseFloat(data.weightKg)
    );

    const dbData = {
      user_id: userId,
      purpose: data.purpose,
      checkup_frequency: data.checkupFrequency,
      full_name: data.fullName,
      date_of_birth: data.dateOfBirth?.toISOString().split('T')[0],
      gender: data.gender,
      blood_type: data.bloodType || null,
      height_cm: parseFloat(data.heightCm),
      weight_kg: parseFloat(data.weightKg),
      bmi: bmi,
      existing_conditions: data.existingConditions,
      family_history: data.familyHistory,
      exercise_frequency: data.exerciseFrequency,
      diet_pattern: data.dietPattern,
      smoking_habit: data.smokingHabit,
      sleep_hours: data.sleepHours,
      stress_level: data.stressLevel,
      symptoms: data.symptoms.length > 0 ? data.symptoms : null,
      checkup_reminder: data.checkupReminder,
      reminder_frequency: data.reminderFrequency || null,
      daily_tips: data.dailyTips,
      privacy_consent: data.privacyConsent,
      data_analysis_consent: data.dataAnalysisConsent,
      age_consent: data.ageConsent,
    };

    const { error } = await supabase
      .from('onboarding_data')
      .upsert(dbData, { onConflict: 'user_id' });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Save onboarding error:', error);
    return { success: false, error: error.message };
  }
};

export const checkOnboardingCompleted = async (
  userId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('onboarding_data')
      .select('id')
      .eq('user_id', userId)
      .single();

    return !error && data !== null;
  } catch {
    return false;
  }
};