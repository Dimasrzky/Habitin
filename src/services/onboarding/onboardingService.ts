import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../config/supabase.config';
import { OnboardingData } from '../../types/onboarding.types';

// AsyncStorage Key
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

const calculateBMI = (heightCm: number, weightKg: number): number => {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
};

export const saveOnboardingData = async (
  userId: string,
  data: OnboardingData
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Saving onboarding data for user:', userId);

    if (!userId) {
      throw new Error('User ID is required');
    }

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

    console.log('Prepared data:', dbData);

    const { data: result, error } = await supabase
      .from('onboarding_data')
      .upsert(dbData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Save successful:', result);

    // ✅ TAMBAHAN: Mark onboarding as completed di AsyncStorage
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');

    return { success: true };

  } catch (error: any) {
    console.error('Save onboarding error:', error);
    
    let errorMessage = 'Gagal menyimpan data. Silakan coba lagi.';
    
    if (error.code === '42501') {
      errorMessage = 'Permission denied. Please check database policies.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

export const checkOnboardingCompleted = async (
  userId: string
): Promise<boolean> => {
  try {
    if (!userId) return false;

    const { data, error } = await supabase
      .from('onboarding_data')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.log('Check onboarding error:', error);
      return false;
    }

    return data !== null;
  } catch (error) {
    console.error('Check onboarding error:', error);
    return false;
  }
};

// ✅ FUNCTION BARU: Check if user completed onboarding (from AsyncStorage)
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

// ✅ FUNCTION BARU: Reset onboarding status (for testing)
export const resetOnboardingStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    console.log('✅ Onboarding status reset');
  } catch (error) {
    console.error('Error resetting onboarding status:', error);
    throw error;
  }
};