// src/services/onboarding/onboardingService.ts

import auth from '@react-native-firebase/auth'; // Firebase auth
import { supabase } from '../../config/supabase.config'; // Sesuaikan path
import { calculateHealthRisks } from './riskCalculation';
import { OnboardingData, RiskAssessment, UserHealthProfile } from './types';

export class OnboardingService {
  
  /**
   * Simpan data onboarding pertama kali atau update
   */
  static async saveOnboarding(data: OnboardingData): Promise<UserHealthProfile> {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User not authenticated');
      
      console.log('🔵 Saving onboarding for user:', user.uid);
      
      // Calculate risks
      const riskAssessment = calculateHealthRisks(data);
      console.log('📊 Risk assessment:', riskAssessment);
      
      // Calculate BMI if not provided
      const bmi = data.physical.bmi || 
        data.physical.weight / Math.pow(data.physical.height / 100, 2);
      
      // Prepare data for Supabase
      const onboardingRecord = {
        user_id: user.uid, // Firebase UID (string)
        
        // Personal
        full_name: data.personal.fullName,
        age: data.personal.age,
        gender: data.personal.gender,
        
        // Physical
        weight: data.physical.weight,
        height: data.physical.height,
        bmi: parseFloat(bmi.toFixed(2)),
        blood_pressure_systolic: data.physical.bloodPressureSystolic || null,
        blood_pressure_diastolic: data.physical.bloodPressureDiastolic || null,
        
        // Family
        family_diabetes: data.family.hasDiabetes,
        family_cholesterol: data.family.hasCholesterol,
        family_heart_disease: data.family.hasHeartDisease,
        
        // Lifestyle
        exercise_frequency: data.lifestyle.exerciseFrequency,
        smoking_status: data.lifestyle.smokingStatus,
        alcohol_consumption: data.lifestyle.alcoholConsumption,
        sleep_hours: data.lifestyle.sleepHours,
        stress_level: data.lifestyle.stressLevel,
        
        // Symptoms (JSONB format)
        diabetes_symptoms: {
          frequentUrination: data.symptoms.frequentUrination || false,
          excessiveThirst: data.symptoms.excessiveThirst || false,
          unexplainedWeightLoss: data.symptoms.unexplainedWeightLoss || false,
          fatigue: data.symptoms.fatigue || false,
          blurredVision: data.symptoms.blurredVision || false,
          slowHealingWounds: data.symptoms.slowHealingWounds || false,
        },
        cholesterol_symptoms: {
          chestPain: data.symptoms.chestPain || false,
          shortnessOfBreath: data.symptoms.shortnessOfBreath || false,
          numbness: data.symptoms.numbness || false,
          yellowishSkinPatches: data.symptoms.yellowishSkinPatches || false,
        },
        
        // Risk Assessment
        diabetes_risk: riskAssessment.diabetesRisk,
        cholesterol_risk: riskAssessment.cholesterolRisk,
        has_diabetes: riskAssessment.hasDiabetes,
        has_cholesterol: riskAssessment.hasCholesterol,
        
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('💾 Inserting to Supabase...');
      
      // Upsert: Insert jika belum ada, Update jika sudah ada
      const { data: savedData, error } = await supabase
        .from('user_onboarding')
        .upsert(onboardingRecord, {
          onConflict: 'user_id', // Conflict resolution berdasarkan user_id
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Onboarding saved successfully!');
      
      return this.mapToUserHealthProfile(savedData, data, riskAssessment);
      
    } catch (error) {
      console.error('❌ Error saving onboarding:', error);
      throw error;
    }
  }
  
  /**
   * Get user onboarding data
   */
  static async getUserOnboarding(): Promise<UserHealthProfile | null> {
    try {
      const user = auth().currentUser;
      if (!user) {
        console.log('⚠️ No authenticated user');
        return null;
      }
      
      console.log('🔍 Fetching onboarding for user:', user.uid);
      
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.uid)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No onboarding data found for user');
          return null; // Data belum ada
        }
        throw error;
      }
      
      console.log('✅ Onboarding data found');
      return this.mapFromDatabase(data);
      
    } catch (error) {
      console.error('❌ Error fetching onboarding:', error);
      throw error;
    }
  }
  
  /**
   * Check if user has completed onboarding
   */
  static async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const profile = await this.getUserOnboarding();
      const completed = profile !== null && profile.completedAt !== null;
      console.log('🎯 Has completed onboarding:', completed);
      return completed;
    } catch (error) {
      console.error('❌ Error checking onboarding status:', error);
      return false;
    }
  }
  
  /**
   * Update onboarding (saat user edit dari profile)
   */
  static async updateOnboarding(data: OnboardingData): Promise<UserHealthProfile> {
    console.log('🔄 Updating onboarding...');
    return this.saveOnboarding(data); // Upsert akan handle update
  }
  
  /**
   * Delete onboarding data (optional, jika dibutuhkan)
   */
  static async deleteOnboarding(): Promise<void> {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User not authenticated');
      
      console.log('🗑️ Deleting onboarding for user:', user.uid);
      
      const { error } = await supabase
        .from('user_onboarding')
        .delete()
        .eq('user_id', user.uid);
      
      if (error) throw error;
      
      console.log('✅ Onboarding deleted successfully');
      
    } catch (error) {
      console.error('❌ Error deleting onboarding:', error);
      throw error;
    }
  }
  
  // ============= HELPER METHODS =============
  
  /**
   * Map database record to UserHealthProfile
   */
  private static mapFromDatabase(dbData: any): UserHealthProfile {
    const onboardingData: OnboardingData = {
      personal: {
        fullName: dbData.full_name,
        age: dbData.age,
        gender: dbData.gender,
      },
      physical: {
        weight: parseFloat(dbData.weight),
        height: parseFloat(dbData.height),
        bmi: dbData.bmi ? parseFloat(dbData.bmi) : undefined,
        bloodPressureSystolic: dbData.blood_pressure_systolic,
        bloodPressureDiastolic: dbData.blood_pressure_diastolic,
      },
      family: {
        hasDiabetes: dbData.family_diabetes,
        hasCholesterol: dbData.family_cholesterol,
        hasHeartDisease: dbData.family_heart_disease,
      },
      lifestyle: {
        exerciseFrequency: dbData.exercise_frequency,
        smokingStatus: dbData.smoking_status,
        alcoholConsumption: dbData.alcohol_consumption,
        sleepHours: dbData.sleep_hours,
        stressLevel: dbData.stress_level,
      },
      symptoms: {
        // Merge diabetes & cholesterol symptoms
        frequentUrination: dbData.diabetes_symptoms?.frequentUrination || false,
        excessiveThirst: dbData.diabetes_symptoms?.excessiveThirst || false,
        unexplainedWeightLoss: dbData.diabetes_symptoms?.unexplainedWeightLoss || false,
        fatigue: dbData.diabetes_symptoms?.fatigue || false,
        blurredVision: dbData.diabetes_symptoms?.blurredVision || false,
        slowHealingWounds: dbData.diabetes_symptoms?.slowHealingWounds || false,
        chestPain: dbData.cholesterol_symptoms?.chestPain || false,
        shortnessOfBreath: dbData.cholesterol_symptoms?.shortnessOfBreath || false,
        numbness: dbData.cholesterol_symptoms?.numbness || false,
        yellowishSkinPatches: dbData.cholesterol_symptoms?.yellowishSkinPatches || false,
      },
    };
    
    const riskAssessment: RiskAssessment = {
      diabetesRisk: dbData.diabetes_risk,
      cholesterolRisk: dbData.cholesterol_risk,
      hasDiabetes: dbData.has_diabetes,
      hasCholesterol: dbData.has_cholesterol,
      recommendations: [], // Generate jika perlu
    };
    
    return {
      ...onboardingData,
      userId: dbData.user_id,
      riskAssessment,
      completedAt: dbData.completed_at ? new Date(dbData.completed_at) : new Date(),
      updatedAt: new Date(dbData.updated_at),
    };
  }
  
  /**
   * Map saved data to UserHealthProfile
   */
  private static mapToUserHealthProfile(
    dbData: any,
    originalData: OnboardingData,
    riskAssessment: RiskAssessment
  ): UserHealthProfile {
    return {
      ...originalData,
      userId: dbData.user_id,
      riskAssessment,
      completedAt: new Date(dbData.completed_at),
      updatedAt: new Date(dbData.updated_at),
    };
  }
}