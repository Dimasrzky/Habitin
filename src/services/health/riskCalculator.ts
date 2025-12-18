// src/services/health/riskCalculator.ts

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

    // Glukosa Puasa (Normal: 70-105 mg/dL)
    if (data.glucose_level !== null) {
      if (data.glucose_level >= 70 && data.glucose_level <= 105) {
        score += 5;
        recommendations.push('✅ Glukosa puasa normal (70-105 mg/dL). Pertahankan pola hidup sehat!');
        console.log('✅ Glukosa puasa normal:', data.glucose_level);
      } else if (data.glucose_level < 70) {
        score += 3;
        recommendations.push('⚠️ Glukosa puasa rendah (<70 mg/dL) - risiko hipoglikemia. Konsumsi makanan secara teratur.');
        console.log('🟡 Glukosa puasa rendah:', data.glucose_level);
      } else {
        // Di atas 105 mg/dL
        score += 5;
        recommendations.push('⚠️ Glukosa puasa tinggi (>105 mg/dL) - risiko diabetes. Segera konsultasi dokter dan jaga pola makan.');
        console.log('🔴 Glukosa puasa tinggi:', data.glucose_level);
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

    // HbA1c (Normal: <6%)
    if (data.hba1c !== null) {
      if (data.hba1c < 6) {
        score += 5;
        recommendations.push('✅ HbA1c normal (<6%) - kontrol gula darah baik. Pertahankan!');
        console.log('✅ HbA1c normal:', data.hba1c);
      } else {
        // HbA1c >= 6%
        score += 5;
        recommendations.push('⚠️ HbA1c tinggi (≥6%) - risiko diabetes. Kontrol gula darah secara ketat dan konsultasi dokter.');
        console.log('🔴 HbA1c tinggi:', data.hba1c);
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

    // Total Cholesterol (Optimal: <200, Borderline High: 200-239, High: >239)
    if (data.cholesterol_total !== null) {
      if (data.cholesterol_total > 239) {
        score += 17;
        recommendations.push('⚠️ Kolesterol total TINGGI (>239 mg/dL) - risiko penyakit jantung! Segera konsultasi dokter dan kurangi makanan berlemak.');
        console.log('🔴 Kolesterol total tinggi:', data.cholesterol_total);
      } else if (data.cholesterol_total >= 200 && data.cholesterol_total <= 239) {
        score += 12;
        recommendations.push('⚠️ Kolesterol total borderline high (200-239 mg/dL) - mulai perhatikan pola makan dan kurangi lemak jenuh.');
        console.log('🟡 Kolesterol total borderline:', data.cholesterol_total);
      } else {
        // Optimal: <200
        score += 5;
        recommendations.push('✅ Kolesterol total optimal (<200 mg/dL). Pertahankan pola makan sehat!');
        console.log('✅ Kolesterol total optimal:', data.cholesterol_total);
      }
    }

    // LDL (Kolesterol Jahat) - Optimal: <129, Borderline High: 130-159, High: >159
    if (data.cholesterol_ldl !== null) {
      if (data.cholesterol_ldl > 159) {
        score += 17;
        recommendations.push('⚠️ LDL (kolesterol jahat) TINGGI (>159 mg/dL) - risiko penyakit jantung! Hindari gorengan dan lemak jenuh, segera konsultasi dokter.');
        console.log('🔴 LDL tinggi:', data.cholesterol_ldl);
      } else if (data.cholesterol_ldl >= 130 && data.cholesterol_ldl <= 159) {
        score += 12;
        recommendations.push('⚠️ LDL borderline high (130-159 mg/dL) - kurangi konsumsi lemak jenuh dan tingkatkan aktivitas fisik.');
        console.log('🟡 LDL borderline:', data.cholesterol_ldl);
      } else {
        // Optimal: <129
        score += 5;
        recommendations.push('✅ LDL optimal (<129 mg/dL). Pertahankan gaya hidup sehat!');
        console.log('✅ LDL optimal:', data.cholesterol_ldl);
      }
    }

    // HDL (Kolesterol Baik) - Normal: 40-60 mg/dL
    if (data.cholesterol_hdl !== null) {
      if (data.cholesterol_hdl >= 40 && data.cholesterol_hdl <= 60) {
        score += 5;
        recommendations.push('✅ HDL (kolesterol baik) normal (40-60 mg/dL). Pertahankan!');
        console.log('✅ HDL normal:', data.cholesterol_hdl);
      } else if (data.cholesterol_hdl < 40) {
        score += 5;
        recommendations.push('⚠️ HDL (kolesterol baik) rendah (<40 mg/dL) - tingkatkan dengan olahraga rutin dan konsumsi omega-3.');
        console.log('🔴 HDL rendah:', data.cholesterol_hdl);
      } else {
        // HDL > 60 adalah BAIK
        score += 5;
        recommendations.push('✅ HDL tinggi (>60 mg/dL) - sangat baik! Kolesterol baik Anda tinggi, ini melindungi jantung.');
        console.log('✅ HDL sangat baik (>60):', data.cholesterol_hdl);
      }
    }

    // Triglycerides (Optimal: <150, Borderline High: 150-199, High: >200)
    if (data.triglycerides !== null) {
      if (data.triglycerides > 200) {
        score += 17;
        recommendations.push('⚠️ Trigliserida TINGGI (>200 mg/dL) - risiko penyakit jantung! Kurangi gula dan karbohidrat sederhana, segera konsultasi dokter.');
        console.log('🔴 Trigliserida tinggi:', data.triglycerides);
      } else if (data.triglycerides >= 150 && data.triglycerides <= 199) {
        score += 12;
        recommendations.push('⚠️ Trigliserida borderline high (150-199 mg/dL) - kurangi konsumsi gula, alkohol, dan karbohidrat olahan.');
        console.log('🟡 Trigliserida borderline:', data.triglycerides);
      } else {
        // Optimal: <150
        score += 5;
        recommendations.push('✅ Trigliserida optimal (<150 mg/dL). Pertahankan pola makan sehat!');
        console.log('✅ Trigliserida optimal:', data.triglycerides);
      }
    }
  }

  // ============================================
  // DETERMINE RISK LEVEL
  // ============================================
  // Dengan sistem scoring baru:
  // - Optimal semua (score 5 per parameter)
  // - Borderline High (score 12 per parameter)
  // - High (score 17 per parameter)
  let level: 'rendah' | 'sedang' | 'tinggi';

  // Hitung jumlah parameter yang terdeteksi
  const detectedParams = [
    data.glucose_level,
    data.hba1c,
    data.cholesterol_total,
    data.cholesterol_ldl,
    data.cholesterol_hdl,
    data.triglycerides
  ].filter(v => v !== null).length;

  // Skor maksimal optimal = detectedParams * 5
  const maxOptimalScore = detectedParams * 5;

  if (score <= maxOptimalScore) {
    // Semua parameter optimal/normal
    level = 'rendah';
  } else if (score <= maxOptimalScore + (detectedParams * 7)) {
    // Ada beberapa borderline atau sedikit high
    level = 'sedang';
  } else {
    // Banyak high atau sangat berisiko
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