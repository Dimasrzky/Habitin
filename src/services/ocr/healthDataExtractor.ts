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

  // Debug: Print semua lines untuk melihat format
  console.log('📋 DEBUG - All lines:');
  lines.forEach((line, idx) => {
    console.log(`  [${idx}] ${line}`);
  });

  // ============================================
  // 🆕 CUSTOM EXTRACTION UNTUK TRIGLISERIDA
  // ============================================
  
  const extractTrigliserida = (): number | null => {
    const keywords = [
      'trigliserida',
      'triglyceride',
      'trigliserid',
      'triglycerides',
      'trig',
      'tg'
    ];
    const minVal = 30;
    const maxVal = 600;

    for (const keyword of keywords) {
      const rowIndex = lines.findIndex(line =>
        line.toLowerCase().includes(keyword.toLowerCase())
      );

      if (rowIndex === -1) continue;

      console.log(`\n🔍 [Trigliserida] Ditemukan di baris ${rowIndex}:`, lines[rowIndex]);

      const candidates: {value: number, source: string, priority: number}[] = [];

      // PATTERN 1: Same row (dengan deteksi lebih baik)
      const currentRow = lines[rowIndex];
      const sameRowNumbers = currentRow.match(/\b(\d{2,3})\b/g);

      if (sameRowNumbers) {
        console.log(`🔢 [Trigliserida] Pattern 1 (same row):`, sameRowNumbers);
        sameRowNumbers.forEach(numStr => {
          const num = parseFloat(numStr);
          if (num >= minVal && num <= maxVal) {
            const hasUnit = /mg\s*\/\s*d?l/i.test(currentRow);
            const hasOperator = /[<>-]/.test(currentRow);

            // Jika angka di same row dengan unit dan tanpa operator = best
            let priority = 2;
            if (hasUnit && !hasOperator) {
              priority = 1;
            } else if (hasOperator) {
              priority = 9; // Range value, prioritas rendah
            }

            console.log(`   ➡️ Value: ${num}, hasUnit: ${hasUnit}, hasOperator: ${hasOperator}, priority: ${priority}`);
            candidates.push({value: num, source: 'same-row', priority});
          }
        });
      }

      // PATTERN 2: Next row +1 (dengan validasi unit yang lebih ketat)
      if (rowIndex + 1 < lines.length) {
        const nextRow1 = lines[rowIndex + 1];
        const row1Numbers = nextRow1.match(/\b(\d{2,3})\b/g);

        if (row1Numbers) {
          console.log(`🔢 [Trigliserida] Pattern 2 (row +1):`, row1Numbers);

          const hasUnit = /mg\s*\/\s*d?l/i.test(nextRow1);
          const hasOperator = /[<>-]/.test(nextRow1);

          console.log(`   📏 [Trigliserida] Row +1 - hasUnit: ${hasUnit}, hasOperator: ${hasOperator}`);

          row1Numbers.forEach(numStr => {
            const num = parseFloat(numStr);
            if (num >= minVal && num <= maxVal) {
              let priority = 6;
              if (hasUnit && !hasOperator) {
                priority = 3; // Prioritas tinggi: ada unit, bukan range
              } else if (hasOperator) {
                priority = 9; // Kemungkinan range value
              }

              console.log(`   ➡️ Value: ${num}, priority: ${priority}`);
              candidates.push({value: num, source: 'next-row-1', priority});
            }
          });
        }
      }

      // PATTERN 3: Next row +2
      if (rowIndex + 2 < lines.length) {
        const nextRow2 = lines[rowIndex + 2];
        const row2Numbers = nextRow2.match(/\b(\d{2,3})\b/g);

        if (row2Numbers) {
          console.log(`🔢 [Trigliserida] Pattern 3 (row +2):`, row2Numbers);

          const hasUnit = /mg\s*\/\s*d?l/i.test(nextRow2);
          const hasOperator = /[<>-]/.test(nextRow2);

          console.log(`   📏 [Trigliserida] Row +2 - hasUnit: ${hasUnit}, hasOperator: ${hasOperator}`);

          row2Numbers.forEach(numStr => {
            const num = parseFloat(numStr);
            if (num >= minVal && num <= maxVal) {
              let priority = 7;
              if (hasUnit && !hasOperator) {
                priority = 4;
              } else if (hasOperator) {
                priority = 9;
              }

              console.log(`   ➡️ Value: ${num}, priority: ${priority}`);
              candidates.push({value: num, source: 'next-row-2', priority});
            }
          });
        }
      }

      // PATTERN 4: Context window (untuk menangkap nilai yang mungkin terpisah jauh)
      const contextStart = Math.max(0, rowIndex);
      const contextEnd = Math.min(lines.length, rowIndex + 5);

      for (let i = contextStart; i < contextEnd; i++) {
        if (i === rowIndex || i === rowIndex + 1 || i === rowIndex + 2) continue;

        const contextRow = lines[i];
        const contextNumbers = contextRow.match(/\b(\d{2,3})\b/g);

        if (contextNumbers) {
          const hasUnit = /mg\s*\/\s*d?l/i.test(contextRow);
          const hasOperator = /[<>-]/.test(contextRow);

          contextNumbers.forEach(numStr => {
            const num = parseFloat(numStr);
            if (num >= minVal && num <= maxVal) {
              // Standalone value dengan unit = prioritas menengah
              let priority = 8;
              if (hasUnit && !hasOperator) {
                priority = 5;
              } else if (hasOperator) {
                priority = 10;
              }

              console.log(`   🔍 Context row ${i}: ${num}, hasUnit: ${hasUnit}, priority: ${priority}`);
              candidates.push({value: num, source: `context-${i}`, priority});
            }
          });
        }
      }

      // Selection
      if (candidates.length > 0) {
        console.log(`🎯 [Trigliserida] Valid candidates:`, candidates);

        // Sort by priority (lower number = higher priority)
        candidates.sort((a, b) => a.priority - b.priority);

        const winner = candidates[0];
        console.log(`✅ [Trigliserida] DIPILIH: ${winner.value} (source: ${winner.source}, priority: ${winner.priority})\n`);

        return winner.value;
      }

      break;
    }

    console.log(`❌ [Trigliserida] Tidak ditemukan nilai valid\n`);
    return null;
  };

  // ============================================
  // EKSTRAK SETIAP PARAMETER (DIABETES & KOLESTEROL)
  // ============================================

  // 1. Kolesterol Total - UPGRADED dengan keywords lebih lengkap
  const extractCholesterolTotal = (): number | null => {
    const keywords = [
      'kolesterol total',
      'cholesterol total',
      'total cholesterol',
      'chol total',
      'total chol',
      'kolesterol',
      'tchol'
    ];
    const minVal = 80;
    const maxVal = 400;

    for (const keyword of keywords) {
      const rowIndex = lines.findIndex(line =>
        line.toLowerCase().includes(keyword.toLowerCase())
      );

      if (rowIndex === -1) continue;

      console.log(`\n🔍 [Cholesterol Total] Ditemukan di baris ${rowIndex}:`, lines[rowIndex]);

      const candidates: {value: number, source: string, priority: number}[] = [];
      const currentRow = lines[rowIndex];

      // PATTERN 1: Same row
      const sameRowNumbers = currentRow.match(/\b(\d{2,3})\b/g);
      if (sameRowNumbers) {
        console.log(`🔢 [Cholesterol Total] Pattern 1 (same row):`, sameRowNumbers);
        sameRowNumbers.forEach(numStr => {
          const num = parseFloat(numStr);
          if (num >= minVal && num <= maxVal) {
            const hasUnit = /mg\s*\/\s*d?l/i.test(currentRow);
            const priority = hasUnit ? 1 : 2;
            candidates.push({value: num, source: 'same-row', priority});
          }
        });
      }

      // PATTERN 2: Next rows
      for (let offset = 1; offset <= 3; offset++) {
        if (rowIndex + offset < lines.length) {
          const nextRow = lines[rowIndex + offset];
          const rowNumbers = nextRow.match(/\b(\d{2,3})\b/g);

          if (rowNumbers) {
            const hasUnit = /mg\s*\/\s*d?l/i.test(nextRow);
            const hasOperator = /[<>-]/.test(nextRow);

            rowNumbers.forEach(numStr => {
              const num = parseFloat(numStr);
              if (num >= minVal && num <= maxVal) {
                let priority = 5 + offset;
                if (hasUnit && !hasOperator) priority = 2 + offset;
                else if (hasOperator) priority = 8;
                candidates.push({value: num, source: `next-row-${offset}`, priority});
              }
            });
          }
        }
      }

      if (candidates.length > 0) {
        candidates.sort((a, b) => a.priority - b.priority);
        const winner = candidates[0];
        console.log(`✅ [Cholesterol Total] DIPILIH: ${winner.value}\n`);
        return winner.value;
      }
      break;
    }

    console.log(`❌ [Cholesterol Total] Tidak ditemukan\n`);
    return null;
  };

  result.cholesterol_total = extractCholesterolTotal();

  // 2. HDL (Kolesterol Baik) - UPGRADED dengan keywords lebih lengkap
  const extractHDL = (): number | null => {
    const keywords = [
      'hdl',
      'kolesterol hdl',
      'cholesterol hdl',
      'h d l',
      'hdl cholesterol',
      'hdl-c',
      'high density lipoprotein'
    ];
    const minVal = 20;
    const maxVal = 150;

    for (const keyword of keywords) {
      const rowIndex = lines.findIndex(line =>
        line.toLowerCase().includes(keyword.toLowerCase())
      );

      if (rowIndex === -1) continue;

      console.log(`\n🔍 [HDL] Ditemukan di baris ${rowIndex}:`, lines[rowIndex]);

      const candidates: {value: number, source: string, priority: number}[] = [];
      const currentRow = lines[rowIndex];

      // PATTERN 1: Same row
      const sameRowNumbers = currentRow.match(/\b(\d{2,3})\b/g);
      if (sameRowNumbers) {
        console.log(`🔢 [HDL] Pattern 1 (same row):`, sameRowNumbers);
        sameRowNumbers.forEach(numStr => {
          const num = parseFloat(numStr);
          if (num >= minVal && num <= maxVal) {
            const hasUnit = /mg\s*\/\s*d?l/i.test(currentRow);
            const priority = hasUnit ? 1 : 2;
            candidates.push({value: num, source: 'same-row', priority});
          }
        });
      }

      // PATTERN 2: Next rows
      for (let offset = 1; offset <= 3; offset++) {
        if (rowIndex + offset < lines.length) {
          const nextRow = lines[rowIndex + offset];
          const rowNumbers = nextRow.match(/\b(\d{2,3})\b/g);

          if (rowNumbers) {
            const hasUnit = /mg\s*\/\s*d?l/i.test(nextRow);
            const hasOperator = /[<>-]/.test(nextRow);

            rowNumbers.forEach(numStr => {
              const num = parseFloat(numStr);
              if (num >= minVal && num <= maxVal) {
                let priority = 5 + offset;
                if (hasUnit && !hasOperator) priority = 2 + offset;
                else if (hasOperator) priority = 8;
                candidates.push({value: num, source: `next-row-${offset}`, priority});
              }
            });
          }
        }
      }

      if (candidates.length > 0) {
        candidates.sort((a, b) => a.priority - b.priority);
        const winner = candidates[0];
        console.log(`✅ [HDL] DIPILIH: ${winner.value}\n`);
        return winner.value;
      }
      break;
    }

    console.log(`❌ [HDL] Tidak ditemukan\n`);
    return null;
  };

  result.cholesterol_hdl = extractHDL();

  // 3. LDL (Kolesterol Jahat) - UPGRADED dengan keywords lebih lengkap
  const extractLDL = (): number | null => {
    const keywords = [
      'ldl',
      'kolesterol ldl',
      'cholesterol ldl',
      'l d l',
      'ldl cholesterol',
      'ldl-c',
      'low density lipoprotein'
    ];
    const minVal = 20;
    const maxVal = 300;

    for (const keyword of keywords) {
      const rowIndex = lines.findIndex(line =>
        line.toLowerCase().includes(keyword.toLowerCase())
      );

      if (rowIndex === -1) continue;

      console.log(`\n🔍 [LDL] Ditemukan di baris ${rowIndex}:`, lines[rowIndex]);

      const candidates: {value: number, source: string, priority: number}[] = [];
      const currentRow = lines[rowIndex];

      // PATTERN 1: Same row
      const sameRowNumbers = currentRow.match(/\b(\d{2,3})\b/g);
      if (sameRowNumbers) {
        console.log(`🔢 [LDL] Pattern 1 (same row):`, sameRowNumbers);
        sameRowNumbers.forEach(numStr => {
          const num = parseFloat(numStr);
          if (num >= minVal && num <= maxVal) {
            const hasUnit = /mg\s*\/\s*d?l/i.test(currentRow);
            const priority = hasUnit ? 1 : 2;
            candidates.push({value: num, source: 'same-row', priority});
          }
        });
      }

      // PATTERN 2: Next rows
      for (let offset = 1; offset <= 3; offset++) {
        if (rowIndex + offset < lines.length) {
          const nextRow = lines[rowIndex + offset];
          const rowNumbers = nextRow.match(/\b(\d{2,3})\b/g);

          if (rowNumbers) {
            const hasUnit = /mg\s*\/\s*d?l/i.test(nextRow);
            const hasOperator = /[<>-]/.test(nextRow);

            rowNumbers.forEach(numStr => {
              const num = parseFloat(numStr);
              if (num >= minVal && num <= maxVal) {
                let priority = 5 + offset;
                if (hasUnit && !hasOperator) priority = 2 + offset;
                else if (hasOperator) priority = 8;
                candidates.push({value: num, source: `next-row-${offset}`, priority});
              }
            });
          }
        }
      }

      if (candidates.length > 0) {
        candidates.sort((a, b) => a.priority - b.priority);
        const winner = candidates[0];
        console.log(`✅ [LDL] DIPILIH: ${winner.value}\n`);
        return winner.value;
      }
      break;
    }

    console.log(`❌ [LDL] Tidak ditemukan\n`);
    return null;
  };

  result.cholesterol_ldl = extractLDL();

  // 4. Trigliserida (CUSTOM EXTRACTION)
  result.triglycerides = extractTrigliserida();

  // ============================================
  // 🆕 SMART DIABETES EXTRACTION SYSTEM
  // ============================================
  // Sistem pintar untuk ekstraksi data diabetes dengan deteksi struktur tabel vertikal

  const extractSmartDiabetes = (): {glucose: number | null, hba1c: number | null} => {
    console.log('\n🧠 ========== SMART DIABETES EXTRACTION V3 ==========');

    // Step 1: Cari section DIABETES dengan pattern yang lebih flexible
    let diabetesSectionIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      // Match: "DIABETES", "diabetes", "PEMERIKSAAN DIABETES", etc.
      if (line === 'diabetes' || line.includes('diabetes')) {
        diabetesSectionIndex = i;
        console.log(`✅ Section DIABETES ditemukan di baris ${i}: "${lines[i]}"`);
        break;
      }
    }

    if (diabetesSectionIndex === -1) {
      console.log('❌ Section DIABETES tidak ditemukan, fallback ke extraction biasa');
      console.log('📋 Semua baris yang tersedia:');
      lines.forEach((line, idx) => {
        console.log(`  [${idx}] "${line}"`);
      });
      return {glucose: null, hba1c: null};
    }

    // Step 2: Analisis struktur dalam section diabetes (expand range untuk vertical format)
    const sectionStart = diabetesSectionIndex + 1;
    const sectionEnd = Math.min(lines.length, diabetesSectionIndex + 20); // Increase to 20 for more coverage

    console.log(`\n📊 Menganalisis baris ${sectionStart} sampai ${sectionEnd}:`);
    for (let i = sectionStart; i < sectionEnd; i++) {
      console.log(`  [${i}] ${lines[i]}`);
    }

    let glucoseValue: number | null = null;
    let hba1cValue: number | null = null;
    let glucoseLabelIndex = -1;
    let hba1cLabelIndex = -1;

    // Step 3: Cari index baris label "Glukosa Puasa" dan "Hb A1C"
    for (let i = sectionStart; i < sectionEnd; i++) {
      const line = lines[i];
      const normalizedLine = line.toLowerCase().replace(/\s+/g, ' ').trim();

      console.log(`  🔍 Scanning line [${i}]: "${line}" (normalized: "${normalizedLine}")`);

      // Cari label "Glukosa Puasa" dengan multiple patterns
      if (glucoseLabelIndex === -1) {
        if (/glukosa\s+puasa/i.test(normalizedLine) ||
            /glucose\s+fasting/i.test(normalizedLine) ||
            normalizedLine.includes('glukosa puasa')) {
          glucoseLabelIndex = i;
          console.log(`\n✅ [Glukosa Puasa] Label ditemukan di baris ${i}: "${line}"`);
        }
      }

      // Cari label "Hb A1C" dengan multiple patterns
      if (hba1cLabelIndex === -1) {
        if (/hb\s*a\s*1\s*c/i.test(normalizedLine) ||
            /hba1c/i.test(normalizedLine) ||
            normalizedLine.includes('hb a1c') ||
            normalizedLine.includes('hba1c')) {
          hba1cLabelIndex = i;
          console.log(`\n✅ [HbA1C] Label ditemukan di baris ${i}: "${line}"`);
        }
      }
    }

    console.log(`\n📍 Label Detection Results:`);
    console.log(`   - Glukosa Puasa label index: ${glucoseLabelIndex}`);
    console.log(`   - HbA1C label index: ${hba1cLabelIndex}`);

    // Step 4: Extract nilai untuk Glukosa Puasa
    if (glucoseLabelIndex !== -1) {
      const labelLine = lines[glucoseLabelIndex];

      // STRATEGI 1: Cek apakah ada angka di baris yang sama (format horizontal)
      const sameLineNumbers = labelLine.match(/\b(\d{2,3})\b/g);
      if (sameLineNumbers) {
        console.log(`   📊 [Glukosa] Angka di baris yang sama:`, sameLineNumbers);
        const validNumbers = sameLineNumbers
          .map(n => parseInt(n))
          .filter(n => n >= 50 && n <= 400);

        if (validNumbers.length > 0) {
          // Pastikan bukan SGPT/SGOT value di baris yang sama
          if (!/sgot|sgpt|hati|liver/i.test(labelLine)) {
            glucoseValue = validNumbers[0];
            console.log(`   ✅ [Glukosa] HORIZONTAL format = ${glucoseValue} mg/dL`);
          } else {
            console.log(`   ⚠️ Skipped same line - contains SGOT/SGPT keyword`);
          }
        }
      }

      // STRATEGI 2: Jika tidak ada di baris yang sama, coba VERTICAL format
      // Cari baris yang mengandung mg/dL atau pola nilai diabetes SETELAH label
      if (!glucoseValue) {
        console.log(`   🔄 [Glukosa] Trying VERTICAL format...`);
        console.log(`   📍 Scanning from row ${glucoseLabelIndex + 1} onwards (AFTER Glukosa Puasa label)`);
        console.log(`   📍 DIABETES section starts at row ${diabetesSectionIndex}, ends at row ${sectionEnd}`);

        // CRITICAL FIX: Prioritaskan nilai yang ADA DALAM DIABETES SECTION
        // Collect ALL candidates dengan scoring system yang lebih ketat
        const candidates: {value: number, index: number, priority: number, reason: string}[] = [];

        for (let offset = 1; offset <= 10; offset++) {
          const targetIndex = glucoseLabelIndex + offset;
          if (targetIndex >= sectionEnd) break;

          const targetLine = lines[targetIndex];
          console.log(`      Checking [${targetIndex}]: "${targetLine}"`);

          // CRITICAL: Skip baris yang mengandung keyword SGOT/SGPT/HATI/LIVER
          if (/sgot|sgpt|hati|liver/i.test(targetLine)) {
            console.log(`      ⏭️ Skipped - contains SGOT/SGPT/HATI/LIVER keyword`);
            continue;
          }

          // Skip baris yang hanya berisi label lain
          if (/hb\s*a\s*1\s*c|lemak|cholesterol/i.test(targetLine)) {
            console.log(`      ⏭️ Skipped - label lain`);
            continue;
          }

          // Skip certificate/ID number patterns
          if (/\b\d{2,4}\s+\d{3,4}\s+\d{4}\b/.test(targetLine)) {
            console.log(`      ⏭️ Skipped - certificate number pattern`);
            continue;
          }
          if (/cat\s*(no|number)|cert|certificate|no\.\s*id|id\/rm|s-mojo/i.test(targetLine)) {
            console.log(`      ⏭️ Skipped - contains certificate identifier`);
            continue;
          }

          // CRITICAL: Skip baris yang mengandung "U/L" (unit untuk SGOT/SGPT)
          if (/u\s*\/\s*l/i.test(targetLine)) {
            console.log(`      ⏭️ Skipped - contains U/L unit (SGOT/SGPT value)`);
            continue;
          }

          // Cari angka 2-3 digit
          const numbers = targetLine.match(/\b(\d{2,3})\b/g);

          if (numbers) {
            console.log(`      📊 Found numbers:`, numbers);

            const validNumbers = numbers
              .map(n => parseInt(n))
              .filter(n => n >= 50 && n <= 400);

            for (const num of validNumbers) {
              const hasMgDl = /mg\s*\/\s*d?l/i.test(targetLine);
              const hasNormalRange = /70.*105|70-105/i.test(targetLine);
              const isReasonableValue = num >= 60 && num <= 200;

              // PRIORITY SYSTEM (lower = better):
              let priority = 100;
              let reason = '';

              if (hasMgDl && hasNormalRange) {
                // BEST: Has both unit AND normal range
                priority = 1;
                reason = 'has mg/dL AND normal range';
              } else if (hasMgDl) {
                // GOOD: Has mg/dL unit
                priority = 2;
                reason = 'has mg/dL unit';
              } else if (hasNormalRange && isReasonableValue) {
                // MEDIUM: Has normal range and reasonable value
                priority = 3;
                reason = 'has normal range AND reasonable value';
              } else if (isReasonableValue && offset <= 3) {
                // ACCEPTABLE: Reasonable value within first 3 rows
                priority = 5;
                reason = 'reasonable value in first 3 rows';
              } else if (isReasonableValue && offset <= 6) {
                // LOW PRIORITY: Reasonable value but further away
                priority = 10;
                reason = 'reasonable value but offset > 3';
              } else {
                // VERY LOW: Value outside reasonable range
                priority = 50;
                reason = 'outside reasonable range';
              }

              console.log(`         Value: ${num}, Priority: ${priority} (${reason})`);

              candidates.push({
                value: num,
                index: targetIndex,
                priority: priority,
                reason: reason
              });
            }
          }
        }

        // Select the BEST candidate (lowest priority number)
        if (candidates.length > 0) {
          candidates.sort((a, b) => a.priority - b.priority);

          console.log(`   🎯 All candidates:`, candidates.map(c => `${c.value} (priority: ${c.priority})`));

          const winner = candidates[0];

          // FINAL VALIDATION: Reject if priority is too low (likely wrong value)
          if (winner.priority <= 10) {
            glucoseValue = winner.value;
            console.log(`   ✅ [Glukosa] VERTICAL format = ${glucoseValue} mg/dL (row: ${winner.index}, priority: ${winner.priority}, ${winner.reason})`);
          } else {
            console.log(`   ⚠️ Best candidate priority too low (${winner.priority}), rejecting all candidates`);
          }
        }
      }
    }

    // Step 5: Extract nilai untuk HbA1C
    if (hba1cLabelIndex !== -1) {
      const labelLine = lines[hba1cLabelIndex];

      // STRATEGI 1: Cek apakah ada angka desimal di baris yang sama (format horizontal)
      const decimalPattern = /\b(\d{1,2}[.,]\d{1,2})\b/g;
      const sameLineDecimals = labelLine.match(decimalPattern);

      if (sameLineDecimals) {
        console.log(`   📊 [HbA1C] Desimal di baris yang sama:`, sameLineDecimals);
        const validDecimals = sameLineDecimals
          .map(d => parseFloat(d.replace(',', '.')))
          .filter(d => d >= 3 && d <= 15);

        if (validDecimals.length > 0) {
          // Pastikan bukan SGPT/SGOT value di baris yang sama
          if (!/sgot|sgpt|hati|liver|u\/l/i.test(labelLine)) {
            hba1cValue = validDecimals[0];
            console.log(`   ✅ [HbA1C] HORIZONTAL format = ${hba1cValue}%`);
          } else {
            console.log(`   ⚠️ Skipped same line - contains SGOT/SGPT keyword or U/L`);
          }
        }
      }

      // STRATEGI 2: Jika tidak ada di baris yang sama, coba VERTICAL format
      if (!hba1cValue) {
        console.log(`   🔄 [HbA1C] Trying VERTICAL format...`);
        console.log(`   📍 Scanning ONLY from row ${hba1cLabelIndex + 1} onwards (AFTER HbA1C label)`);

        // CRITICAL: Cari di mana baris SGOT/SGPT berada untuk memastikan kita tidak ambil nilainya
        let sgptSectionEnd = hba1cLabelIndex; // Default: SGPT ada sebelum label
        for (let i = 0; i < hba1cLabelIndex; i++) {
          if (/sgot|sgpt/i.test(lines[i])) {
            sgptSectionEnd = Math.max(sgptSectionEnd, i + 3); // SGPT + 3 baris setelahnya
            console.log(`   🚫 Found SGOT/SGPT at row ${i}, will exclude up to row ${sgptSectionEnd}`);
          }
        }

        for (let offset = 1; offset <= 12; offset++) {
          const targetIndex = hba1cLabelIndex + offset;
          if (targetIndex >= sectionEnd) break;

          // CRITICAL: Jangan ambil nilai dari baris yang masih dalam range SGPT section
          if (targetIndex <= sgptSectionEnd) {
            console.log(`      ⏭️ Row ${targetIndex} is still within SGPT section, skipping`);
            continue;
          }

          const targetLine = lines[targetIndex];
          console.log(`      Checking [${targetIndex}]: "${targetLine}"`);

          // Skip baris yang hanya berisi label lain
          if (/glukosa|lemak|cholesterol|sgot|sgpt|hati|liver/i.test(targetLine)) {
            console.log(`      ⏭️ Skipped - label lain atau SGOT/SGPT`);
            continue;
          }

          // CRITICAL: Skip certificate/ID number patterns (same as Glucose)
          if (/\b\d{2,4}\s+\d{3,4}\s+\d{4}\b/.test(targetLine)) {
            console.log(`      ⏭️ Skipped - certificate number pattern`);
            continue;
          }
          if (/cat\s*(no|number)|cert|certificate|no\.\s*id|id\/rm|s-mojo/i.test(targetLine)) {
            console.log(`      ⏭️ Skipped - contains certificate identifier`);
            continue;
          }
          // Skip baris yang mengandung "U/L" (unit untuk SGOT/SGPT)
          if (/u\s*\/\s*l/i.test(targetLine)) {
            console.log(`      ⏭️ Skipped - contains U/L unit (likely SGOT/SGPT value)`);
            continue;
          }

          // Cari angka desimal (prioritas) atau integer
          const decimals = targetLine.match(decimalPattern);

          if (decimals) {
            console.log(`      📊 Found decimals:`, decimals);

            const validDecimals = decimals
              .map(d => parseFloat(d.replace(',', '.')))
              .filter(d => d >= 3 && d <= 15);

            if (validDecimals.length > 0) {
              const hasPercent = /%/.test(targetLine);
              const hasNormalRange = /<\s*6|< 6/i.test(targetLine);

              // Accept if:
              // 1. Has % OR normal range (best case)
              // 2. OR offset <= 12 AND decimal value looks like HbA1C (3-10 range)
              const isReasonableHbA1c = validDecimals[0] >= 3 && validDecimals[0] <= 10;

              if (hasPercent || hasNormalRange) {
                hba1cValue = validDecimals[0];
                console.log(`   ✅ [HbA1C] VERTICAL format = ${hba1cValue}% (offset: ${offset}, hasPercent: ${hasPercent})`);
                break;
              } else if (offset <= 12 && isReasonableHbA1c) {
                // Relaxed: accept reasonable HbA1C values within 12 rows
                hba1cValue = validDecimals[0];
                console.log(`   ✅ [HbA1C] VERTICAL format (relaxed) = ${hba1cValue}% (offset: ${offset}, reasonable value)`);
                break;
              } else {
                console.log(`      ⚠️ Skipped - no indicator and not reasonable (value: ${validDecimals[0]}, offset: ${offset})`);
              }
            }
          }
        }
      }
    }

    console.log('\n🎯 HASIL SMART DIABETES EXTRACTION V2:');
    console.log(`   - Glukosa Puasa: ${glucoseValue} ${glucoseValue ? 'mg/dL' : ''}`);
    console.log(`   - HbA1C: ${hba1cValue} ${hba1cValue ? '%' : ''}`);

    return {glucose: glucoseValue, hba1c: hba1cValue};
  };

  // Jalankan smart extraction
  const smartDiabetesResult = extractSmartDiabetes();

  // 5. Glukosa Puasa - FALLBACK jika smart extraction gagal
  const extractGlukosaPuasa = (): number | null => {
    // Jika smart extraction berhasil, gunakan hasilnya
    if (smartDiabetesResult.glucose !== null) {
      console.log(`\n✅ Menggunakan hasil Smart Extraction untuk Glukosa Puasa: ${smartDiabetesResult.glucose}`);
      return smartDiabetesResult.glucose;
    }

    console.log('\n⚠️ Smart extraction gagal, menggunakan fallback extraction...');

    const keywords = [
      'glukosa puasa',
      'Glukosa Puasa',
      'gula darah puasa',
      'glucose fasting',
      'gdp',
      'gula puasa',
      'glukosa darah puasa',
      'gd puasa',
      'fasting glucose',
      'fasting blood sugar',
      'fbs',
      'gds puasa',
      'glukosa sewaktu',
      'blood glucose fasting',
      'puasa glukosa'
    ];
    const minVal = 50;
    const maxVal = 400;

    // Keywords yang harus dihindari (untuk filter false positives)
    const excludeKeywords = ['sgot', 'sgpt', 'fungsi hati', 'ginjal', 'asam urat'];

    for (const keyword of keywords) {
      // Normalize text untuk matching yang lebih robust
      const rowIndex = lines.findIndex(line => {
        const normalizedLine = line.toLowerCase().replace(/\s+/g, ' ').trim();
        const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, ' ').trim();
        return normalizedLine.includes(normalizedKeyword);
      });

      if (rowIndex === -1) continue;

      console.log(`\n🔍 [Glukosa Puasa FALLBACK] Ditemukan di baris ${rowIndex}:`, lines[rowIndex]);

      // Check apakah context row mengandung keyword yang harus dihindari
      const checkContextForExclusion = (contextRowIndex: number): boolean => {
        if (contextRowIndex < 0 || contextRowIndex >= lines.length) return false;
        const contextText = lines[contextRowIndex].toLowerCase();
        return excludeKeywords.some(excl => contextText.includes(excl));
      };

      // Check apakah ada section DIABETES di dekat baris ini
      const checkDiabetesSection = (): boolean => {
        // Cari keyword "diabetes" dalam 5 baris ke atas
        for (let i = Math.max(0, rowIndex - 5); i < rowIndex; i++) {
          if (lines[i].toLowerCase().includes('diabetes')) {
            console.log(`   ✓ Found DIABETES section at row ${i}`);
            return true;
          }
        }
        return false;
      };

      const inDiabetesSection = checkDiabetesSection();
      const candidates: {value: number, source: string, priority: number}[] = [];

      // PATTERN 1: Same row - angka 2-3 digit (dengan atau tanpa desimal)
      const currentRow = lines[rowIndex];

      // Improved pattern: Cari angka yang diikuti/didahului oleh mg/dL atau dalam range normal
      const sameRowNumbers = currentRow.match(/\b(\d{2,3}(?:[.,]\d{1,2})?)\b/g);

      if (sameRowNumbers) {
        console.log(`🔢 [Glukosa Puasa] Pattern 1 (same row):`, sameRowNumbers);
        sameRowNumbers.forEach(numStr => {
          const num = parseFloat(numStr.replace(',', '.'));
          if (num >= minVal && num <= maxVal) {
            // Skip jika context mengandung keyword exclusion
            if (checkContextForExclusion(rowIndex)) {
              console.log(`   ⚠️ Skipped ${num} - dalam context SGOT/SGPT`);
              return;
            }

            // Skip jika baris mengandung pattern sertifikat/tanggal (untuk menghindari "180 1001 2015")
            if (/\b\d{3,4}\s+\d{4}\s+\d{4}\b/.test(currentRow) ||
                /cert|certificate|no\.\s*\d+/i.test(currentRow)) {
              console.log(`   ⚠️ Skipped ${num} - sepertinya nomor certificate/ID`);
              return;
            }

            // Prioritas tinggi untuk angka di baris yang sama
            const hasUnit = /mg\s*\/\s*d?l/i.test(currentRow);
            const hasOperator = /[<>-]/.test(currentRow);
            let priority = hasUnit ? 1 : 2;
            if (hasOperator) priority = 8; // Range values mendapat prioritas rendah

            // Bonus prioritas jika dalam section DIABETES
            if (inDiabetesSection && priority < 8) {
              priority = Math.max(1, priority - 1);
              console.log(`   ✓ Bonus priority (in DIABETES section): ${priority}`);
            }

            candidates.push({value: num, source: 'same-row', priority});
          }
        });
      }

      // PATTERN 2: Next row +1
      if (rowIndex + 1 < lines.length) {
        const nextRow1 = lines[rowIndex + 1];
        const row1Numbers = nextRow1.match(/\b(\d{2,3}(?:[.,]\d{1,2})?)\b/g);

        if (row1Numbers) {
          console.log(`🔢 [Glukosa Puasa] Pattern 2 (row +1):`, row1Numbers);

          const hasUnit = /mg\s*\/\s*d?l/i.test(nextRow1);
          const hasOperator = /[<>-]/.test(nextRow1);

          row1Numbers.forEach(numStr => {
            const num = parseFloat(numStr.replace(',', '.'));
            if (num >= minVal && num <= maxVal) {
              // Skip jika context mengandung keyword exclusion
              if (checkContextForExclusion(rowIndex + 1) || checkContextForExclusion(rowIndex)) {
                console.log(`   ⚠️ Skipped ${num} - dalam context SGOT/SGPT`);
                return;
              }

              // Prioritas: ada unit + tidak ada operator = best
              let priority = 5;
              if (hasUnit && !hasOperator) {
                priority = 3;
              } else if (hasUnit && hasOperator) {
                priority = 7; // Kemungkinan nilai normal range
              } else if (hasOperator) {
                priority = 9;
              }
              candidates.push({value: num, source: 'next-row-1', priority});
            }
          });
        }
      }

      // PATTERN 3: Next row +2 (untuk format lab yang value-nya 2 baris di bawah)
      if (rowIndex + 2 < lines.length) {
        const nextRow2 = lines[rowIndex + 2];
        const row2Numbers = nextRow2.match(/\b(\d{2,3}(?:[.,]\d{1,2})?)\b/g);

        if (row2Numbers) {
          console.log(`🔢 [Glukosa Puasa] Pattern 2.5 (row +2):`, row2Numbers);

          const hasUnit = /mg\s*\/\s*d?l/i.test(nextRow2);
          const hasOperator = /[<>-]/.test(nextRow2);

          row2Numbers.forEach(numStr => {
            const num = parseFloat(numStr.replace(',', '.'));
            if (num >= minVal && num <= maxVal) {
              let priority = 6;
              if (hasUnit && !hasOperator) {
                priority = 4;
              } else if (hasOperator) {
                priority = 9;
              }
              candidates.push({value: num, source: 'next-row-2', priority});
            }
          });
        }
      }

      // PATTERN 4: Context window (exclude range values)
      const contextStart = Math.max(0, rowIndex);
      const contextEnd = Math.min(lines.length, rowIndex + 6);

      for (let i = contextStart; i < contextEnd; i++) {
        if (i === rowIndex || i === rowIndex + 1 || i === rowIndex + 2) continue;

        const contextRow = lines[i];
        const contextNumbers = contextRow.match(/\b(\d{2,3}(?:[.,]\d{1,2})?)\b/g);

        if (contextNumbers) {
          const hasUnit = /mg\s*\/\s*d?l/i.test(contextRow);
          const hasOperator = /[<>-]/.test(contextRow);

          contextNumbers.forEach(numStr => {
            const num = parseFloat(numStr.replace(',', '.'));
            if (num >= minVal && num <= maxVal) {
              // Skip jika kemungkinan range value
              if (hasOperator && (num < 80 || num > 200)) {
                return; // Skip nilai range yang ekstrem
              }

              const priority = hasUnit && !hasOperator ? 5 : 7;
              candidates.push({value: num, source: `context-${i}`, priority});
            }
          });
        }
      }

      // Selection
      if (candidates.length > 0) {
        console.log(`🎯 [Glukosa Puasa] Valid candidates:`, candidates);
        candidates.sort((a, b) => a.priority - b.priority);
        const winner = candidates[0];
        console.log(`✅ [Glukosa Puasa] DIPILIH: ${winner.value} (source: ${winner.source}, priority: ${winner.priority})\n`);
        return winner.value;
      }

      break;
    }

    console.log(`❌ [Glukosa Puasa] Tidak ditemukan nilai valid\n`);
    return null;
  };

  result.glucose_level = extractGlukosaPuasa();

  // 6. Glukosa Darah 2 Jam - UPGRADED
  const extractGlukosa2Jam = (): number | null => {
    const keywords = [
      'glukosa darah 2 jam',
      'glukosa 2 jam',
      'gula darah 2 jam',
      'glucose 2 hours',
      'gdpp',
      'glukosa darah 2',
      'gd 2 jam',
      '2 jam pp'
    ];
    const minVal = 50;
    const maxVal = 500;

    for (const keyword of keywords) {
      const rowIndex = lines.findIndex(line =>
        line.toLowerCase().includes(keyword.toLowerCase())
      );

      if (rowIndex === -1) continue;

      console.log(`\n🔍 [Glukosa 2 Jam] Ditemukan di baris ${rowIndex}:`, lines[rowIndex]);

      const candidates: {value: number, source: string, priority: number}[] = [];

      // PATTERN 1: Same row - angka 2-3 digit
      const currentRow = lines[rowIndex];
      const sameRowNumbers = currentRow.match(/\b(\d{2,3})\b/g);

      if (sameRowNumbers) {
        console.log(`🔢 [Glukosa 2 Jam] Pattern 1 (same row):`, sameRowNumbers);
        sameRowNumbers.forEach(numStr => {
          const num = parseFloat(numStr);
          if (num >= minVal && num <= maxVal) {
            const hasUnit = /mg\s*\/\s*d?l/i.test(currentRow);
            const hasOperator = /[<>-]/.test(currentRow);

            let priority = 2;
            if (hasUnit && !hasOperator) {
              priority = 1;
            } else if (hasOperator) {
              priority = 9;
            }

            candidates.push({value: num, source: 'same-row', priority});
          }
        });
      }

      // PATTERN 2: Next row +1
      if (rowIndex + 1 < lines.length) {
        const nextRow1 = lines[rowIndex + 1];
        const row1Numbers = nextRow1.match(/\b(\d{2,3})\b/g);

        if (row1Numbers) {
          console.log(`🔢 [Glukosa 2 Jam] Pattern 2 (row +1):`, row1Numbers);

          const hasUnit = /mg\s*\/\s*d?l/i.test(nextRow1);
          const hasOperator = /[<>-]/.test(nextRow1);

          row1Numbers.forEach(numStr => {
            const num = parseFloat(numStr);
            if (num >= minVal && num <= maxVal) {
              let priority = 5;
              if (hasUnit && !hasOperator) {
                priority = 3;
              } else if (hasOperator) {
                priority = 8;
              }
              candidates.push({value: num, source: 'next-row-1', priority});
            }
          });
        }
      }

      // PATTERN 3: Context window
      const contextStart = Math.max(0, rowIndex);
      const contextEnd = Math.min(lines.length, rowIndex + 5);

      for (let i = contextStart; i < contextEnd; i++) {
        if (i === rowIndex || i === rowIndex + 1) continue;

        const contextRow = lines[i];
        const contextNumbers = contextRow.match(/\b(\d{2,3})\b/g);

        if (contextNumbers) {
          const hasUnit = /mg\s*\/\s*d?l/i.test(contextRow);
          const hasOperator = /[<>-]/.test(contextRow);

          contextNumbers.forEach(numStr => {
            const num = parseFloat(numStr);
            if (num >= minVal && num <= maxVal) {
              // Skip jika kemungkinan range value dengan nilai ekstrem
              if (hasOperator && (num < 80 || num > 300)) {
                return;
              }

              const priority = hasUnit && !hasOperator ? 4 : 6;
              candidates.push({value: num, source: `context-${i}`, priority});
            }
          });
        }
      }

      // Selection
      if (candidates.length > 0) {
        console.log(`🎯 [Glukosa 2 Jam] Valid candidates:`, candidates);
        candidates.sort((a, b) => a.priority - b.priority);
        const winner = candidates[0];
        console.log(`✅ [Glukosa 2 Jam] DIPILIH: ${winner.value} (source: ${winner.source}, priority: ${winner.priority})\n`);
        return winner.value;
      }

      break;
    }

    console.log(`❌ [Glukosa 2 Jam] Tidak ditemukan nilai valid\n`);
    return null;
  };

  result.glucose_2h = extractGlukosa2Jam();

  // 7. HbA1c (desimal) - UPGRADED dengan Smart Extraction
  const extractHbA1c = (): number | null => {
    // Jika smart extraction berhasil, gunakan hasilnya
    if (smartDiabetesResult.hba1c !== null) {
      console.log(`\n✅ Menggunakan hasil Smart Extraction untuk HbA1C: ${smartDiabetesResult.hba1c}`);
      return smartDiabetesResult.hba1c;
    }

    console.log('\n⚠️ Smart extraction gagal untuk HbA1C, menggunakan fallback extraction...');

    // FALLBACK extraction untuk HbA1c
    const keywords = [
      'hb a1c',  // PRIORITAS TERTINGGI - format lab umum dengan spasi
      'hba1c',
      'Hb A1C',
      'HbA1c',
      'HbA1C',
      'hb a 1 c',
      'hb a1 c',  // Variasi spacing
      'hb a 1c',  // Variasi spacing
      'hemoglobin a1c',
      'a1c',
      'glycated hemoglobin',
      'glycohemoglobin',
      'hgba1c',
      'hgb a1c',
      'hgb a 1c',
      'hemoglobin glikosilasi',
      'hemoglobin terglikosilasi',
      'glikohemoglobin'
    ];
    const minVal = 3;
    const maxVal = 15;

    // Try dengan regex pattern yang lebih flexible untuk "Hb A1C"
    let rowIndex = lines.findIndex(line => {
      const normalizedLine = line.toLowerCase().replace(/\s+/g, ' ').trim();
      // Pattern: "hb" diikuti spasi/non-spasi, lalu "a1c" atau "a 1c" atau "a 1 c"
      return /hb\s*a\s*1\s*c/i.test(normalizedLine);
    });

    // Jika tidak ditemukan dengan pattern, coba dengan keywords biasa
    if (rowIndex === -1) {
      for (const keyword of keywords) {
        const foundIndex = lines.findIndex(line => {
          const normalizedLine = line.toLowerCase().replace(/\s+/g, ' ').trim();
          const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, ' ').trim();
          return normalizedLine.includes(normalizedKeyword);
        });

        if (foundIndex !== -1) {
          rowIndex = foundIndex;
          break;
        }
      }
    }

    if (rowIndex !== -1) {
      console.log(`\n🔍 [HbA1c] Ditemukan di baris ${rowIndex}:`, lines[rowIndex]);
      const candidates: {value: number, source: string, priority: number}[] = [];

      // PATTERN 1: Same row - cari desimal dengan koma atau titik
      const currentRow = lines[rowIndex];
      // Match: 5,2 atau 5.2 atau 5,1 dll
      const decimalPattern = /\b(\d{1,2}[,.]\d{1,2})\b/g;
      const sameRowDecimals = currentRow.match(decimalPattern);

      if (sameRowDecimals) {
        console.log(`🔢 [HbA1c] Pattern 1 (same row decimals):`, sameRowDecimals);
        sameRowDecimals.forEach(numStr => {
          const num = parseFloat(numStr.replace(',', '.'));
          if (num >= minVal && num <= maxVal) {
            // HbA1c di baris yang sama = priority tertinggi
            candidates.push({value: num, source: 'same-row-decimal', priority: 1});
          }
        });
      }

      // PATTERN 1.5: Same row - coba cari integer juga (untuk kasus HbA1c seperti "6" atau "7")
      const integerPattern = /\b(\d{1,2})\b/g;
      const sameRowIntegers = currentRow.match(integerPattern);

      if (sameRowIntegers && !sameRowDecimals) {
        console.log(`🔢 [HbA1c] Pattern 1.5 (same row integers):`, sameRowIntegers);
        sameRowIntegers.forEach(numStr => {
          const num = parseFloat(numStr);
          if (num >= minVal && num <= maxVal) {
            const hasPercent = /%/.test(currentRow);
            // Integer di baris sama dengan %, prioritas 2
            const priority = hasPercent ? 2 : 5;
            candidates.push({value: num, source: 'same-row-integer', priority});
          }
        });
      }

      // PATTERN 2: Next row +1 (dengan unit % nearby)
      if (rowIndex + 1 < lines.length) {
        const nextRow1 = lines[rowIndex + 1];
        const row1Decimals = nextRow1.match(decimalPattern);

        if (row1Decimals) {
          console.log(`🔢 [HbA1c] Pattern 2 (row +1 decimals):`, row1Decimals);

          // Check apakah ada tanda % di dekat angka
          const hasPercent = /%/.test(nextRow1);
          const hasOperator = /[<>-]/.test(nextRow1);

          row1Decimals.forEach(numStr => {
            const num = parseFloat(numStr.replace(',', '.'));
            if (num >= minVal && num <= maxVal) {
              // Jika ada %, priority lebih tinggi
              let priority = hasPercent ? 2 : 3;
              if (hasOperator) priority = 8; // Range values
              candidates.push({value: num, source: 'next-row-1-decimal', priority});
            }
          });
        }

        // Coba juga integer untuk row +1
        const row1Integers = nextRow1.match(integerPattern);
        if (row1Integers && !row1Decimals) {
          console.log(`🔢 [HbA1c] Pattern 2.1 (row +1 integers):`, row1Integers);
          const hasPercent = /%/.test(nextRow1);
          const hasOperator = /[<>-]/.test(nextRow1);

          row1Integers.forEach(numStr => {
            const num = parseFloat(numStr);
            if (num >= minVal && num <= maxVal) {
              let priority = hasPercent ? 3 : 6;
              if (hasOperator) priority = 9;
              candidates.push({value: num, source: 'next-row-1-integer', priority});
            }
          });
        }
      }

      // PATTERN 2.5: Next row +2
      if (rowIndex + 2 < lines.length) {
        const nextRow2 = lines[rowIndex + 2];
        const row2Decimals = nextRow2.match(decimalPattern);

        if (row2Decimals) {
          console.log(`🔢 [HbA1c] Pattern 2.5 (row +2 decimals):`, row2Decimals);
          const hasPercent = /%/.test(nextRow2);
          const hasOperator = /[<>-]/.test(nextRow2);

          row2Decimals.forEach(numStr => {
            const num = parseFloat(numStr.replace(',', '.'));
            if (num >= minVal && num <= maxVal) {
              let priority = hasPercent ? 4 : 5;
              if (hasOperator) priority = 9;
              candidates.push({value: num, source: 'next-row-2-decimal', priority});
            }
          });
        }
      }

      // PATTERN 3: Context window untuk desimal
      const contextStart = Math.max(0, rowIndex);
      const contextEnd = Math.min(lines.length, rowIndex + 6);

      for (let i = contextStart; i < contextEnd; i++) {
        if (i === rowIndex || i === rowIndex + 1 || i === rowIndex + 2) continue;

        const contextRow = lines[i];
        const contextDecimals = contextRow.match(decimalPattern);

        if (contextDecimals) {
          const hasPercent = /%/.test(contextRow);
          const hasOperator = /[<>-]/.test(contextRow);

          contextDecimals.forEach(numStr => {
            const num = parseFloat(numStr.replace(',', '.'));
            if (num >= minVal && num <= maxVal) {
              let priority = hasPercent ? 5 : 6;
              if (hasOperator) priority = 10;
              console.log(`   🔍 Context row ${i}: ${num}, hasPercent: ${hasPercent}, priority: ${priority}`);
              candidates.push({value: num, source: `context-${i}`, priority});
            }
          });
        }
      }

      // Selection
      if (candidates.length > 0) {
        console.log(`🎯 [HbA1c] Valid candidates:`, candidates);
        candidates.sort((a, b) => a.priority - b.priority);
        const winner = candidates[0];
        console.log(`✅ [HbA1c] DIPILIH: ${winner.value} (source: ${winner.source}, priority: ${winner.priority})\n`);
        return winner.value;
      }
    }

    console.log(`❌ [HbA1c] Tidak ditemukan nilai valid\n`);
    return null;
  };

  result.hba1c = extractHbA1c();

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