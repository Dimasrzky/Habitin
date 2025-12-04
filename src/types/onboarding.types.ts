export interface OnboardingData {
  // Step 1: Welcome
  purpose: string[];
  checkupFrequency: string;
  
  // Step 2: Personal
  fullName: string;
  dateOfBirth: Date | null;
  gender: string;
  bloodType: string;
  
  // Step 3: Physical
  heightCm: string;
  weightKg: string;
  bmi?: number;
  existingConditions: string[];
  otherCondition?: string;
  
  // Step 4: Family (akan digabung ke physical atau lifestyle)
  familyHistory: string[];
  cancerType?: string;
  
  // Step 5: Lifestyle
  exerciseFrequency: string;
  dietPattern: string;
  smokingHabit: string;
  sleepHours: string;
  stressLevel: string;
  
  // Step 6: Symptoms
  symptoms: string[];
  
  // Step 7: Notification
  checkupReminder: boolean;
  reminderFrequency: string;
  dailyTips: boolean;
  
  // Step 8: Consent
  privacyConsent: boolean;
  dataAnalysisConsent: boolean;
  ageConsent: boolean;
}

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  purpose: [],
  checkupFrequency: '',
  fullName: '',
  dateOfBirth: null,
  gender: '',
  bloodType: '',
  heightCm: '',
  weightKg: '',
  existingConditions: [],
  familyHistory: [],
  exerciseFrequency: '',
  dietPattern: '',
  smokingHabit: '',
  sleepHours: '',
  stressLevel: '',
  symptoms: [],
  checkupReminder: false,
  reminderFrequency: '',
  dailyTips: false,
  privacyConsent: false,
  dataAnalysisConsent: false,
  ageConsent: false,
};