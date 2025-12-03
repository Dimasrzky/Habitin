// services/onboarding/riskCalculation.ts

import { OnboardingData, RiskAssessment, RiskLevel } from './types';

export function calculateHealthRisks(data: OnboardingData): RiskAssessment {
  const diabetesRisk = calculateDiabetesRisk(data);
  const cholesterolRisk = calculateCholesterolRisk(data);
  
  return {
    diabetesRisk,
    cholesterolRisk,
    hasDiabetes: diabetesRisk === 'high',
    hasCholesterol: cholesterolRisk === 'high',
    recommendations: generateRecommendations(diabetesRisk, cholesterolRisk)
  };
}

function calculateDiabetesRisk(data: OnboardingData): RiskLevel {
  let score = 0;
  
  // Age risk (usia > 45 tahun)
  if (data.personal.age >= 45) score += 2;
  else if (data.personal.age >= 35) score += 1;
  
  // BMI risk
  const bmi = data.physical.bmi || 
    data.physical.weight / Math.pow(data.physical.height / 100, 2);
  
  if (bmi >= 30) score += 3; // Obesitas
  else if (bmi >= 25) score += 2; // Overweight
  else if (bmi >= 23) score += 1; // Pre-overweight (Asia)
  
  // Family history
  if (data.family.hasDiabetes) score += 3;
  
  // Lifestyle
  if (data.lifestyle.exerciseFrequency === 'never' || 
      data.lifestyle.exerciseFrequency === 'rarely') score += 2;
  
  if (data.lifestyle.smokingStatus.startsWith('current')) score += 1;
  
  if (data.lifestyle.sleepHours < 6 || data.lifestyle.sleepHours > 9) score += 1;
  
  if (data.lifestyle.stressLevel === 'high' || 
      data.lifestyle.stressLevel === 'very_high') score += 1;
  
  // Symptoms (most important!)
  const diabetesSymptoms = [
    data.symptoms.frequentUrination,
    data.symptoms.excessiveThirst,
    data.symptoms.unexplainedWeightLoss,
    data.symptoms.fatigue,
    data.symptoms.blurredVision,
    data.symptoms.slowHealingWounds
  ].filter(Boolean).length;
  
  score += diabetesSymptoms * 2; // Each symptom adds 2 points
  
  // Blood pressure
  if (data.physical.bloodPressureSystolic && 
      data.physical.bloodPressureSystolic >= 140) score += 2;
  
  // Risk classification
  if (score >= 10) return 'high';
  if (score >= 6) return 'medium';
  return 'low';
}

function calculateCholesterolRisk(data: OnboardingData): RiskLevel {
  let score = 0;
  
  // Age & Gender
  if (data.personal.gender === 'male' && data.personal.age >= 45) score += 2;
  if (data.personal.gender === 'female' && data.personal.age >= 55) score += 2;
  
  // BMI
  const bmi = data.physical.bmi || 
    data.physical.weight / Math.pow(data.physical.height / 100, 2);
  
  if (bmi >= 30) score += 3;
  else if (bmi >= 25) score += 2;
  
  // Family history
  if (data.family.hasCholesterol || data.family.hasHeartDisease) score += 3;
  
  // Lifestyle
  if (data.lifestyle.exerciseFrequency === 'never' || 
      data.lifestyle.exerciseFrequency === 'rarely') score += 2;
  
  if (data.lifestyle.smokingStatus.startsWith('current')) score += 2;
  
  if (data.lifestyle.alcoholConsumption === 'heavy') score += 1;
  
  // Symptoms
  const cholesterolSymptoms = [
    data.symptoms.chestPain,
    data.symptoms.shortnessOfBreath,
    data.symptoms.numbness,
    data.symptoms.yellowishSkinPatches
  ].filter(Boolean).length;
  
  score += cholesterolSymptoms * 2;
  
  // Blood pressure
  if (data.physical.bloodPressureSystolic && 
      data.physical.bloodPressureSystolic >= 140) score += 2;
  
  // Risk classification
  if (score >= 9) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

function generateRecommendations(
  diabetesRisk: RiskLevel, 
  cholesterolRisk: RiskLevel
): string[] {
  const recommendations: string[] = [];
  
  if (diabetesRisk === 'high' || cholesterolRisk === 'high') {
    recommendations.push('Segera konsultasi dengan dokter');
    recommendations.push('Lakukan pemeriksaan lab (gula darah & lipid panel)');
  }
  
  if (diabetesRisk !== 'low') {
    recommendations.push('Batasi konsumsi gula dan karbohidrat sederhana');
    recommendations.push('Monitor gula darah secara berkala');
  }
  
  if (cholesterolRisk !== 'low') {
    recommendations.push('Kurangi makanan tinggi lemak jenuh');
    recommendations.push('Tingkatkan konsumsi serat dan omega-3');
  }
  
  recommendations.push('Olahraga minimal 150 menit per minggu');
  recommendations.push('Jaga berat badan ideal');
  recommendations.push('Kelola stress dengan baik');
  
  return recommendations;
}