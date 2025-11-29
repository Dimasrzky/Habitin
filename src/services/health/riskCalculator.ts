// src/services/health/riskCalculator.ts

import { ExtractedHealthData, RiskLevel } from '../../types/health.types';

export interface RiskAnalysis {
  level: RiskLevel;
  score: number;
  recommendations: string[];
}

/**
 * ✅ Calculate health risk based on lab values
 * Total score: 0-100 (higher = more risk)
 * 
 * Scoring breakdown:
 * - Glucose: 0-40 points
 * - Cholesterol Total: 0-25 points
 * - LDL: 0-20 points
 * - HDL: 0-10 points (penalty if low)
 * - Triglycerides: 0-15 points
 * - HbA1c: bonus +10 if ≥6.5%
 */
export const calculateRisk = (data: ExtractedHealthData): RiskAnalysis => {
  console.log('⚖️ Calculating health risk...');
  
  let score = 0;
  const recommendations: string[] = [];

  // 1. Glucose Level (40 points max)
  if (data.glucose_level !== null) {
    if (data.glucose_level < 100) {
      // Normal
      score += 0;
    } else if (data.glucose_level < 126) {
      // Prediabetes
      score += 20;
      recommendations.push('Kadar gula darah Anda dalam kategori prediabetes. Kurangi konsumsi gula dan karbohidrat sederhana.');
    } else {
      // Diabetes range
      score += 40;
      recommendations.push('⚠️ Kadar gula darah tinggi! Segera konsultasi dengan dokter.');
    }
  }

  // 2. Cholesterol Total (25 points max)
  if (data.cholesterol_total !== null) {
    if (data.cholesterol_total < 200) {
      // Normal
      score += 0;
    } else if (data.cholesterol_total < 240) {
      // Borderline high
      score += 12;
      recommendations.push('Kolesterol total borderline tinggi. Kurangi makanan berlemak jenuh.');
    } else {
      // High
      score += 25;
      recommendations.push('⚠️ Kolesterol total tinggi! Perbanyak serat dan olahraga rutin.');
    }
  }

  // 3. LDL Cholesterol (20 points max)
  if (data.cholesterol_ldl !== null) {
    if (data.cholesterol_ldl < 100) {
      // Optimal
      score += 0;
    } else if (data.cholesterol_ldl < 160) {
      // Near/above optimal
      score += 10;
      recommendations.push('LDL kolesterol di atas optimal. Hindari makanan tinggi lemak trans.');
    } else {
      // High
      score += 20;
      recommendations.push('⚠️ LDL kolesterol tinggi! Konsultasi dokter untuk penanganan lebih lanjut.');
    }
  }

  // 4. HDL Cholesterol (10 points penalty if low)
  if (data.cholesterol_hdl !== null) {
    if (data.cholesterol_hdl < 40) {
      score += 10;
      recommendations.push('HDL (kolesterol baik) rendah. Tingkatkan dengan olahraga aerobik.');
    }
    // No penalty if normal/high HDL
  }

  // 5. Triglycerides (15 points max)
  if (data.triglycerides !== null) {
    if (data.triglycerides < 150) {
      // Normal
      score += 0;
    } else if (data.triglycerides < 200) {
      // Borderline high
      score += 7;
      recommendations.push('Trigliserida borderline tinggi. Kurangi konsumsi karbohidrat dan alkohol.');
    } else {
      // High
      score += 15;
      recommendations.push('⚠️ Trigliserida tinggi! Hindari makanan tinggi gula dan lemak.');
    }
  }

  // 6. HbA1c Bonus (if available)
  if (data.hba1c !== null && data.hba1c >= 6.5) {
    score += 10;
    recommendations.push('⚠️ HbA1c menunjukkan indikasi diabetes. Segera konsultasi dokter!');
  }

  // Determine risk level
  let level: RiskLevel;
  if (score < 30) {
    level = 'rendah';
    if (recommendations.length === 0) {
      recommendations.push('Hasil lab Anda baik! Pertahankan gaya hidup sehat.');
    }
  } else if (score < 60) {
    level = 'sedang';
    recommendations.push('✅ Mulai tantangan hidup sehat untuk menurunkan risiko.');
  } else {
    level = 'tinggi';
    recommendations.push('⚠️ PENTING: Segera konsultasi dengan dokter untuk penanganan lebih lanjut!');
  }

  console.log('✅ Risk calculation complete:', { level, score });

  return {
    level,
    score,
    recommendations,
  };
};