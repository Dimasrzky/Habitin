// src/services/health/riskCalculator.ts

interface HealthData {
  glucose_level: number | null;
  cholesterol_total: number | null;
  cholesterol_ldl: number | null;
  cholesterol_hdl: number | null;
  triglycerides: number | null;
  hba1c: number | null;
}

interface RiskResult {
  level: 'rendah' | 'sedang' | 'tinggi';
  score: number;
  recommendations: string[];
  detectedConditions: ('diabetes' | 'cholesterol')[];
}

/**
 * Calculate health risk based on lab results
 * Auto-detects which conditions are present
 */
export function calculateHealthRisk(data: HealthData): RiskResult {
  console.log('⚖️ Calculating health risk...');
  console.log('📊 Input data:', data);

  let totalScore = 0;
  const recommendations: string[] = [];
  const detectedConditions: ('diabetes' | 'cholesterol')[] = [];

  // ==============================================
  // DETECT WHICH CONDITIONS ARE PRESENT
  // ==============================================
  
  const hasDiabetesData = data.glucose_level !== null || data.hba1c !== null;
  const hasCholesterolData = 
    data.cholesterol_total !== null || 
    data.cholesterol_ldl !== null || 
    data.cholesterol_hdl !== null || 
    data.triglycerides !== null;

  console.log('🔍 Detected conditions:', {
    diabetes: hasDiabetesData,
    cholesterol: hasCholesterolData,
  });

  // ==============================================
  // DIABETES RISK (if data available)
  // ==============================================
  
  if (hasDiabetesData) {
    detectedConditions.push('diabetes');
    console.log('🩺 Analyzing diabetes markers...');

    // Glucose Level
    if (data.glucose_level !== null) {
      if (data.glucose_level < 100) {
        console.log('✅ Glucose normal:', data.glucose_level);
      } else if (data.glucose_level < 126) {
        totalScore += 15;
        recommendations.push('Gula darah prediabetes. Kurangi konsumsi gula dan karbohidrat sederhana.');
        console.log('⚠️ Glucose prediabetes:', data.glucose_level);
      } else {
        totalScore += 30;
        recommendations.push('⚠️ Gula darah tinggi (diabetes). Segera konsultasi dokter!');
        console.log('🚨 Glucose diabetes:', data.glucose_level);
      }
    }

    // HbA1c
    if (data.hba1c !== null) {
      if (data.hba1c < 5.7) {
        console.log('✅ HbA1c normal:', data.hba1c);
      } else if (data.hba1c < 6.5) {
        totalScore += 15;
        recommendations.push('HbA1c prediabetes. Jaga pola makan dan olahraga rutin.');
        console.log('⚠️ HbA1c prediabetes:', data.hba1c);
      } else {
        totalScore += 30;
        recommendations.push('⚠️ HbA1c tinggi (diabetes). Konsultasi dokter untuk terapi.');
        console.log('🚨 HbA1c diabetes:', data.hba1c);
      }
    }
  }

  // ==============================================
  // CHOLESTEROL RISK (if data available)
  // ==============================================
  
  if (hasCholesterolData) {
    detectedConditions.push('cholesterol');
    console.log('💉 Analyzing cholesterol markers...');

    // Total Cholesterol
    if (data.cholesterol_total !== null) {
      if (data.cholesterol_total < 200) {
        console.log('✅ Total cholesterol normal:', data.cholesterol_total);
      } else if (data.cholesterol_total < 240) {
        totalScore += 10;
        recommendations.push('Kolesterol total borderline. Batasi lemak jenuh.');
        console.log('⚠️ Total cholesterol borderline:', data.cholesterol_total);
      } else {
        totalScore += 25;
        recommendations.push('⚠️ Kolesterol total tinggi. Hindari gorengan dan fast food.');
        console.log('🚨 Total cholesterol high:', data.cholesterol_total);
      }
    }

    // LDL Cholesterol
    if (data.cholesterol_ldl !== null) {
      if (data.cholesterol_ldl < 100) {
        console.log('✅ LDL optimal:', data.cholesterol_ldl);
      } else if (data.cholesterol_ldl < 130) {
        totalScore += 5;
        recommendations.push('LDL di atas optimal. Hindari makanan tinggi lemak trans.');
        console.log('⚠️ LDL near optimal:', data.cholesterol_ldl);
      } else if (data.cholesterol_ldl < 160) {
        totalScore += 15;
        recommendations.push('LDL borderline tinggi. Tingkatkan konsumsi serat.');
        console.log('⚠️ LDL borderline high:', data.cholesterol_ldl);
      } else {
        totalScore += 25;
        recommendations.push('⚠️ LDL tinggi. Konsultasi dokter untuk terapi penurun kolesterol.');
        console.log('🚨 LDL high:', data.cholesterol_ldl);
      }
    }

    // HDL Cholesterol
    if (data.cholesterol_hdl !== null) {
      if (data.cholesterol_hdl >= 60) {
        totalScore -= 5; // Bonus untuk HDL tinggi
        console.log('✅ HDL excellent (protective):', data.cholesterol_hdl);
      } else if (data.cholesterol_hdl >= 40) {
        console.log('✅ HDL normal:', data.cholesterol_hdl);
      } else {
        totalScore += 10;
        recommendations.push('HDL rendah. Tingkatkan dengan olahraga aerobik.');
        console.log('⚠️ HDL low:', data.cholesterol_hdl);
      }
    }

    // Triglycerides
    if (data.triglycerides !== null) {
      if (data.triglycerides < 150) {
        console.log('✅ Triglycerides normal:', data.triglycerides);
      } else if (data.triglycerides < 200) {
        totalScore += 10;
        recommendations.push('Trigliserida borderline. Kurangi konsumsi gula dan alkohol.');
        console.log('⚠️ Triglycerides borderline:', data.triglycerides);
      } else {
        totalScore += 20;
        recommendations.push('⚠️ Trigliserida tinggi. Batasi karbohidrat dan lemak.');
        console.log('🚨 Triglycerides high:', data.triglycerides);
      }
    }
  }

  // ==============================================
  // NO DATA CASE
  // ==============================================
  
  if (!hasDiabetesData && !hasCholesterolData) {
    console.log('⚠️ No health data detected in lab result');
    return {
      level: 'rendah',
      score: 0,
      recommendations: ['Data lab tidak lengkap. Upload ulang dengan foto yang lebih jelas.'],
      detectedConditions: [],
    };
  }

  // ==============================================
  // DETERMINE RISK LEVEL
  // ==============================================
  
  let level: 'rendah' | 'sedang' | 'tinggi';
  
  if (totalScore < 15) {
    level = 'rendah';
  } else if (totalScore < 40) {
    level = 'sedang';
  } else {
    level = 'tinggi';
  }

  console.log('✅ Risk calculation complete:', {
    level,
    score: totalScore,
    conditions: detectedConditions,
  });

  return {
    level,
    score: totalScore,
    recommendations,
    detectedConditions,
  };
}