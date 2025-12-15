// src/services/health/healthAnalysis.ts

import { supabase } from '@/config/supabase.config';

export interface HealthPriority {
  focus: 'diabetes' | 'cholesterol' | 'balanced';
  diabetesScore: number;
  cholesterolScore: number;
  reason: string;
}

export async function analyzeUserHealthPriority(
  firebaseUid: string
): Promise<HealthPriority> {
  try {
    const { data: labResults, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('user_id', firebaseUid)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !labResults) {
      return {
        focus: 'balanced',
        diabetesScore: 0.5,
        cholesterolScore: 0.5,
        reason: 'No health data available yet',
      };
    }

    const glucose = labResults.glucose_value || 0;
    const hba1c = labResults.hba1c_value || 0;
    const cholesterol = labResults.cholesterol_value || 0;

    const diabetesScore = calculateDiabetesScore(glucose, hba1c);
    const cholesterolScore = calculateCholesterolScore(cholesterol);

    let focus: 'diabetes' | 'cholesterol' | 'balanced';
    let reason: string;

    const diff = Math.abs(diabetesScore - cholesterolScore);

    if (diff < 0.15) {
      focus = 'balanced';
      reason = 'Both diabetes and cholesterol need attention';
    } else if (diabetesScore > cholesterolScore) {
      focus = 'diabetes';
      reason = `Diabetes risk higher (${(diabetesScore * 100).toFixed(0)}% vs ${(cholesterolScore * 100).toFixed(0)}%)`;
    } else {
      focus = 'cholesterol';
      reason = `Cholesterol risk higher (${(cholesterolScore * 100).toFixed(0)}% vs ${(diabetesScore * 100).toFixed(0)}%)`;
    }

    return {
      focus,
      diabetesScore,
      cholesterolScore,
      reason,
    };
  } catch (error) {
    console.error('Error analyzing health priority:', error);
    return {
      focus: 'balanced',
      diabetesScore: 0.5,
      cholesterolScore: 0.5,
      reason: 'Analysis error, showing balanced content',
    };
  }
}

function calculateDiabetesScore(glucose: number, hba1c: number): number {
  let score = 0;

  if (glucose >= 126) score += 0.5;
  else if (glucose >= 100) score += 0.3;
  else if (glucose >= 70) score += 0.1;
  else score += 0.2;

  if (hba1c >= 6.5) score += 0.5;
  else if (hba1c >= 5.7) score += 0.3;
  else if (hba1c >= 4.0) score += 0.1;

  return Math.min(score, 1);
}

function calculateCholesterolScore(cholesterol: number): number {
  if (cholesterol >= 240) return 1.0;
  if (cholesterol >= 200) return 0.7;
  if (cholesterol >= 150) return 0.3;
  return 0.1;
}