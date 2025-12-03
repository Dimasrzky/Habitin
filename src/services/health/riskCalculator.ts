// src/services/health/calculateRisk.ts

interface HealthData {
  glucose_level: number | null;
  glucose_2h: number | null;
  hba1c: number | null;
  cholesterol_total: number | null;
  cholesterol_ldl: number | null;
  cholesterol_hdl: number | null;
  triglycerides: number | null;
}

interface RiskResult {
  level: 'rendah' | 'sedang' | 'tinggi';
  score: number;
  detectedConditions: string[];
  recommendations: string[];
}

export function calculateHealthRisk(data: HealthData): RiskResult {
  console.log('⚖️ Menghitung risiko kesehatan...');
  console.log('📊 Input data:', data);

  let score = 0;
  const conditions: string[] = [];
  const recommendations: string[] = [];

  // ============================================
  // 1. DIABETES RISK
  // ============================================
  const hasDiabetesData = data.glucose_level || data.glucose_2h || data.hba1c;
  
  if (hasDiabetesData) {
    console.log('💉 Menganalisis marker diabetes...');
    conditions.push('diabetes');

    // Glukosa Puasa
    if (data.glucose_level !== null) {
      if (data.glucose_level >= 126) {
        score += 3;
        recommendations.push('⚠️ Glukosa puasa sangat tinggi (≥126) - indikasi diabetes! Segera konsultasi dokter.');
        console.log('🔴 Glukosa puasa tinggi:', data.glucose_level);
      } else if (data.glucose_level >= 100) {
        score += 2;
        recommendations.push('⚠️ Glukosa puasa tinggi (100-125) - pre-diabetes. Perhatikan pola makan dan olahraga rutin.');
        console.log('🟡 Glukosa puasa borderline:', data.glucose_level);
      } else {
        console.log('✅ Glukosa puasa normal:', data.glucose_level);
      }
    }

    // Glukosa 2 Jam Setelah Makan
    if (data.glucose_2h !== null) {
      if (data.glucose_2h >= 200) {
        score += 3;
        recommendations.push('⚠️ Glukosa 2 jam sangat tinggi (≥200) - indikasi diabetes! Segera konsultasi dokter.');
        console.log('🔴 Glukosa 2 jam tinggi:', data.glucose_2h);
      } else if (data.glucose_2h >= 140) {
        score += 2;
        recommendations.push('⚠️ Glukosa 2 jam tinggi (140-199) - pre-diabetes. Kurangi konsumsi karbohidrat sederhana.');
        console.log('🟡 Glukosa 2 jam borderline:', data.glucose_2h);
      } else {
        console.log('✅ Glukosa 2 jam normal:', data.glucose_2h);
      }
    }

    // HbA1c (Rata-rata gula darah 3 bulan terakhir)
    if (data.hba1c !== null) {
      if (data.hba1c >= 6.5) {
        score += 3;
        recommendations.push('⚠️ HbA1c tinggi (≥6.5%) - indikasi diabetes. Kontrol gula darah secara ketat.');
        console.log('🔴 HbA1c tinggi:', data.hba1c);
      } else if (data.hba1c >= 5.7) {
        score += 1;
        recommendations.push('⚠️ HbA1c borderline (5.7-6.4%) - pre-diabetes. Jaga pola makan sehat.');
        console.log('🟡 HbA1c borderline:', data.hba1c);
      } else {
        console.log('✅ HbA1c normal:', data.hba1c);
      }
    }
  }

  // ============================================
  // 2. CHOLESTEROL RISK
  // ============================================
  const hasCholesterolData = 
    data.cholesterol_total || data.cholesterol_ldl || 
    data.cholesterol_hdl || data.triglycerides;
  
  if (hasCholesterolData) {
    console.log('💉 Menganalisis marker kolesterol...');
    conditions.push('cholesterol');

    // Total Cholesterol
    if (data.cholesterol_total !== null) {
      if (data.cholesterol_total >= 240) {
        score += 2;
        recommendations.push('⚠️ Kolesterol total sangat tinggi (≥240) - risiko penyakit jantung! Kurangi makanan berlemak.');
        console.log('🔴 Kolesterol total tinggi:', data.cholesterol_total);
      } else if (data.cholesterol_total >= 200) {
        score += 1;
        recommendations.push('⚠️ Kolesterol total borderline (200-239) - mulai perhatikan pola makan.');
        console.log('🟡 Kolesterol total borderline:', data.cholesterol_total);
      } else {
        console.log('✅ Kolesterol total normal:', data.cholesterol_total);
      }
    }

    // LDL (Kolesterol Jahat)
    if (data.cholesterol_ldl !== null) {
      if (data.cholesterol_ldl >= 160) {
        score += 2;
        recommendations.push('⚠️ LDL (kolesterol jahat) tinggi (≥160) - risiko penyakit jantung! Hindari gorengan dan lemak jenuh.');
        console.log('🔴 LDL tinggi:', data.cholesterol_ldl);
      } else if (data.cholesterol_ldl >= 130) {
        score += 1;
        recommendations.push('⚠️ LDL borderline (130-159) - kurangi konsumsi lemak jenuh.');
        console.log('🟡 LDL borderline:', data.cholesterol_ldl);
      } else {
        console.log('✅ LDL normal:', data.cholesterol_ldl);
      }
    }

    // HDL (Kolesterol Baik)
    if (data.cholesterol_hdl !== null) {
      if (data.cholesterol_hdl < 40) {
        score += 1;
        recommendations.push('⚠️ HDL (kolesterol baik) terlalu rendah (<40) - tingkatkan dengan olahraga dan omega-3.');
        console.log('🔴 HDL rendah:', data.cholesterol_hdl);
      } else if (data.cholesterol_hdl >= 60) {
        // HDL tinggi adalah BAIK - beri reward!
        if (score > 0) score -= 1; // Kurangi risk score jika HDL bagus
        console.log('✅ HDL sangat baik (≥60):', data.cholesterol_hdl);
      } else {
        console.log('✅ HDL normal:', data.cholesterol_hdl);
      }
    }

    // Triglycerides (Lemak Darah)
    if (data.triglycerides !== null) {
      if (data.triglycerides >= 200) {
        score += 2;
        recommendations.push('⚠️ Trigliserida tinggi (≥200) - kurangi gula dan karbohidrat sederhana.');
        console.log('🔴 Trigliserida tinggi:', data.triglycerides);
      } else if (data.triglycerides >= 150) {
        score += 1;
        recommendations.push('⚠️ Trigliserida borderline (150-199) - kurangi konsumsi gula dan alkohol.');
        console.log('🟡 Trigliserida borderline:', data.triglycerides);
      } else {
        console.log('✅ Trigliserida normal:', data.triglycerides);
      }
    }
  }

  // ============================================
  // DETERMINE RISK LEVEL
  // ============================================
  let level: 'rendah' | 'sedang' | 'tinggi';
  
  if (score === 0) {
    level = 'rendah';
  } else if (score <= 3) {
    level = 'sedang';
  } else {
    level = 'tinggi';
  }

  // General recommendations based on risk level
  if (level === 'rendah') {
    recommendations.push('✅ Selamat! Hasil lab Anda baik. Pertahankan gaya hidup sehat Anda!');
    recommendations.push('💪 Tetap olahraga rutin 3-4x seminggu');
    recommendations.push('🥗 Konsumsi sayur dan buah setiap hari');
  } else {
    recommendations.push('💪 Olahraga minimal 30 menit, 3-4x seminggu (jalan cepat, jogging, bersepeda)');
    recommendations.push('🥗 Perbanyak sayur, buah, dan serat. Kurangi makanan berlemak dan manis');
    recommendations.push('💧 Minum air putih minimal 8 gelas per hari');
    recommendations.push('😴 Tidur cukup 7-8 jam per hari untuk metabolisme optimal');
    recommendations.push('🚭 Hindari rokok dan batasi alkohol');
  }

  if (level === 'tinggi') {
    recommendations.push('🏥 SEGERA konsultasi dengan dokter untuk penanganan lebih lanjut!');
    recommendations.push('📊 Lakukan pemeriksaan ulang dalam 1-3 bulan');
  } else if (level === 'sedang') {
    recommendations.push('📊 Cek ulang dalam 3-6 bulan untuk monitor progress');
  }

  console.log('🔍 Kondisi terdeteksi:', conditions);
  console.log('✅ Kalkulasi risiko selesai:', { level, score });

  return {
    level,
    score,
    detectedConditions: conditions,
    recommendations,
  };
}