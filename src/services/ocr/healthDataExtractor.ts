// src/services/ocr/extractHealthData.ts

interface HealthData {
  glucose_level: number | null;
  glucose_2h: number | null;
  hba1c: number | null;
  cholesterol_total: number | null;
  cholesterol_ldl: number | null;
  cholesterol_hdl: number | null;
  triglycerides: number | null;
}

export function extractHealthData(ocrText: string): HealthData {
  console.log('📊 Mengekstrak data kesehatan dari OCR...');
  console.log('📝 Teks OCR lengkap:', ocrText);

  const result: HealthData = {
    glucose_level: null,
    glucose_2h: null,
    hba1c: null,
    cholesterol_total: null,
    cholesterol_ldl: null,
    cholesterol_hdl: null,
    triglycerides: null,
  };

  const lines = ocrText.split('\n').filter(line => line.trim());
  console.log('📄 Total baris:', lines.length);
  
  /**
   * STRATEGI EKSTRAKSI MULTI-FORMAT
   * 
   * 1. Cari baris yang mengandung keyword
   * 2. Ambil context window (N baris sebelum & sesudah)
   * 3. Ekstrak angka dengan berbagai pattern:
   *    - Pattern 1: Angka setelah keyword di baris yang sama
   *    - Pattern 2: Angka di baris berikutnya
   *    - Pattern 3: Angka sebelum operator perbandingan (<, >)
   *    - Pattern 4: Angka di kolom tengah (format tabel)
   * 4. Filter berdasarkan range valid
   * 5. Prioritas: angka paling dekat dengan keyword
   */
  const extractValue = (
    keywords: string[],
    minVal: number,
    maxVal: number,
    options: {
      contextBefore?: number;
      contextAfter?: number;
      allowDecimal?: boolean;
      skipIfTooSmall?: number;
    } = {}
  ): number | null => {
    
    const {
      contextBefore = 1,
      contextAfter = 4,
      allowDecimal = false,
      skipIfTooSmall = 10,
    } = options;

    for (const keyword of keywords) {
      // 1. Cari baris yang mengandung keyword (case-insensitive)
      const rowIndex = lines.findIndex(line => 
        line.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (rowIndex === -1) continue;
      
      console.log(`\n🔍 [${keyword}] Ditemukan di baris ${rowIndex}:`, lines[rowIndex]);
      
      // 2. Ambil context window (baris sebelum & sesudah)
      const startIndex = Math.max(0, rowIndex - contextBefore);
      const endIndex = Math.min(lines.length, rowIndex + contextAfter + 1);
      const contextLines = lines.slice(startIndex, endIndex);
      const contextText = contextLines.join(' ');
      
      console.log(`📝 [${keyword}] Context (${contextLines.length} baris):`, contextText);
      
      // 3. Pattern matching untuk ekstrak angka
      const candidates: {value: number, source: string, priority: number}[] = [];
      
      // PATTERN 1: Angka setelah keyword di baris yang sama
      const currentRow = lines[rowIndex];
      const keywordPos = currentRow.toLowerCase().indexOf(keyword.toLowerCase());
      const afterKeyword = currentRow.substring(keywordPos + keyword.length);
      
      // Ekstrak angka dari after keyword (before comparison operators)
      const beforeOperator = afterKeyword.split(/[<>]/)[0].trim();
      const pattern1Numbers = allowDecimal 
        ? beforeOperator.match(/\b\d+[.,]?\d*\b/g)
        : beforeOperator.match(/\b\d{2,3}\b/g);
      
      if (pattern1Numbers) {
        console.log(`🔢 [${keyword}] Pattern 1 (same row):`, pattern1Numbers);
        pattern1Numbers.forEach(numStr => {
          const num = parseFloat(numStr.replace(',', '.'));
          if (num >= skipIfTooSmall) {
            candidates.push({value: num, source: 'same-row', priority: 1});
          }
        });
      }
      
      // PATTERN 2: Angka di baris berikutnya (1-2 baris)
      for (let i = 1; i <= 2; i++) {
        if (rowIndex + i < lines.length) {
          const nextRow = lines[rowIndex + i];
          const pattern2Numbers = allowDecimal
            ? nextRow.match(/\b\d+[.,]?\d*\b/g)
            : nextRow.match(/\b\d{2,3}\b/g);
          
          if (pattern2Numbers) {
            console.log(`🔢 [${keyword}] Pattern 2 (row +${i}):`, pattern2Numbers);
            pattern2Numbers.forEach(numStr => {
              const num = parseFloat(numStr.replace(',', '.'));
              if (num >= skipIfTooSmall) {
                candidates.push({value: num, source: `next-row-${i}`, priority: 2 + i});
              }
            });
          }
        }
      }
      
      // PATTERN 3: Split by operators dan cari di section setelahnya
      const sections = contextText.split(/[<>]/);
      console.log(`📦 [${keyword}] Split operators: ${sections.length} sections`);
      
      // Skip section pertama, cek section 2+
      for (let i = 1; i < sections.length; i++) {
        const section = sections[i].trim();
        const pattern3Numbers = allowDecimal
          ? section.match(/\b\d+[.,]?\d*\b/g)
          : section.match(/\b\d{2,3}\b/g);
        
        if (pattern3Numbers) {
          console.log(`🔢 [${keyword}] Pattern 3 (section ${i}):`, pattern3Numbers);
          pattern3Numbers.forEach(numStr => {
            const num = parseFloat(numStr.replace(',', '.'));
            if (num >= skipIfTooSmall) {
              candidates.push({value: num, source: `section-${i}`, priority: 5});
            }
          });
        }
      }
      
      // Fallback: section pertama
      if (candidates.length === 0) {
        const firstSection = sections[0].trim();
        const fallbackNumbers = allowDecimal
          ? firstSection.match(/\b\d+[.,]?\d*\b/g)
          : firstSection.match(/\b\d{2,3}\b/g);
        
        if (fallbackNumbers) {
          console.log(`🔢 [${keyword}] Pattern 3 (fallback section 0):`, fallbackNumbers);
          fallbackNumbers.forEach(numStr => {
            const num = parseFloat(numStr.replace(',', '.'));
            if (num >= skipIfTooSmall) {
              candidates.push({value: num, source: 'section-0-fallback', priority: 10});
            }
          });
        }
      }
      
      // 4. Filter candidates yang dalam range valid
      const validCandidates = candidates.filter(c => 
        c.value >= minVal && c.value <= maxVal
      );
      
      console.log(`🎯 [${keyword}] Valid candidates:`, validCandidates);
      
      // 5. Return candidate dengan priority tertinggi (angka terkecil = priority tertinggi)
      if (validCandidates.length > 0) {
        validCandidates.sort((a, b) => a.priority - b.priority);
        const winner = validCandidates[0];
        console.log(`✅ [${keyword}] DIPILIH: ${winner.value} (source: ${winner.source}, priority: ${winner.priority})\n`);
        return winner.value;
      }
      
      console.log(`❌ [${keyword}] Tidak ada nilai valid dalam range ${minVal}-${maxVal}\n`);
    }
    
    return null;
  };

  // ============================================
  // EKSTRAK SETIAP PARAMETER (DIABETES & KOLESTEROL)
  // ============================================

  // 1. Kolesterol Total
  result.cholesterol_total = extractValue(
    ['kolesterol total', 'cholesterol total', 'total cholesterol'],
    80,  
    400,
    { contextAfter: 4 }
  );

  // 2. HDL (Kolesterol Baik)
  result.cholesterol_hdl = extractValue(
    ['hdl', 'kolesterol hdl', 'cholesterol hdl', 'h d l'],
    20,   
    150,
    { contextAfter: 4 }
  );

  // 3. LDL (Kolesterol Jahat)
  result.cholesterol_ldl = extractValue(
    ['ldl', 'kolesterol ldl', 'cholesterol ldl', 'l d l'],
    20,   
    300,
    { contextAfter: 4 }
  );

  // 4. Trigliserida
  result.triglycerides = extractValue(
    ['trigliserida', 'triglyceride', 'trigliserida'],
    30,   
    600,
    { contextAfter: 5 }
  );

  // 5. Glukosa Puasa
  result.glucose_level = extractValue(
    [
      'glukosa puasa', 
      'gula darah puasa', 
      'glucose fasting', 
      'gdp', 
      'gula puasa',
      'glukosa darah puasa'
    ],
    50,   
    400,
    { contextAfter: 4 }
  );

  // 6. Glukosa Darah 2 Jam
  result.glucose_2h = extractValue(
    [
      'glukosa darah 2 jam',
      'glukosa 2 jam',
      'gula darah 2 jam',
      'glucose 2 hours',
      'gdpp',
      'glukosa darah 2'
    ],
    50,
    500,
    { contextAfter: 4 }
  );

  // 7. HbA1c (desimal)
  result.hba1c = extractValue(
    ['hba1c', 'hb a1c', 'hb a 1 c', 'hemoglobin a1c'],
    3,
    15,
    { allowDecimal: true, skipIfTooSmall: 3, contextAfter: 3 }
  );

  console.log('\n🎯 ========== HASIL AKHIR ==========');
  console.log('💊 KOLESTEROL:');
  console.log('  - Total:', result.cholesterol_total, 'mg/dL');
  console.log('  - HDL:', result.cholesterol_hdl, 'mg/dL');
  console.log('  - LDL:', result.cholesterol_ldl, 'mg/dL');
  console.log('  - Trigliserida:', result.triglycerides, 'mg/dL');
  console.log('\n🩸 DIABETES:');
  console.log('  - Glukosa Puasa:', result.glucose_level, 'mg/dL');
  console.log('  - Glukosa 2 Jam:', result.glucose_2h, 'mg/dL');
  console.log('  - HbA1c:', result.hba1c, '%');
  console.log('====================================\n');

  return result;
}