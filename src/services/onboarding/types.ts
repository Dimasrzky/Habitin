// services/onboarding/types.ts

export type RiskLevel = 'low' | 'medium' | 'high';
export type Gender = 'male' | 'female';
export type ExerciseFrequency = 'never' | 'rarely' | '1-2_per_week' | '3-4_per_week' | 'daily';
export type SmokingStatus = 'never' | 'former' | 'current_light' | 'current_heavy';
export type StressLevel = 'low' | 'moderate' | 'high' | 'very_high';

export interface PersonalData {
  fullName: string;
  age: number;
  gender: Gender;
}

export interface PhysicalData {
  weight: number; // kg
  height: number; // cm
  bmi?: number; // auto-calculated
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
}

export interface FamilyHistory {
  hasDiabetes: boolean;
  hasCholesterol: boolean;
  hasHeartDisease: boolean;
}

export interface Lifestyle {
  exerciseFrequency: ExerciseFrequency;
  smokingStatus: SmokingStatus;
  alcoholConsumption: 'never' | 'occasional' | 'regular' | 'heavy';
  sleepHours: number;
  stressLevel: StressLevel;
}

export interface Symptoms {
  // Diabetes symptoms
  frequentUrination: boolean;
  excessiveThirst: boolean;
  unexplainedWeightLoss: boolean;
  fatigue: boolean;
  blurredVision: boolean;
  slowHealingWounds: boolean;
  
  // Cholesterol symptoms
  chestPain: boolean;
  shortnessOfBreath: boolean;
  numbness: boolean;
  yellowishSkinPatches: boolean; // xanthelasma
}

export interface OnboardingData {
  personal: PersonalData;
  physical: PhysicalData;
  family: FamilyHistory;
  lifestyle: Lifestyle;
  symptoms: Symptoms;
}

export interface RiskAssessment {
  diabetesRisk: RiskLevel;
  cholesterolRisk: RiskLevel;
  hasDiabetes: boolean;
  hasCholesterol: boolean;
  recommendations: string[];
}

export interface UserHealthProfile extends OnboardingData {
  userId: string;
  riskAssessment: RiskAssessment;
  completedAt: Date;
  updatedAt: Date;
}