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

  // ============================================
  // 🆕 CUSTOM EXTRACTION UNTUK TRIGLISERIDA
  // ============================================
  
  const extractTrigliserida = (): number | null => {
    const keywords = ['trigliserida', 'triglyceride', 'trigliserid'];
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

  // 1. Kolesterol Total - UPGRADED
  const extractCholesterolTotal = (): number | null => {
    const keywords = ['kolesterol total', 'cholesterol total', 'total cholesterol', 'chol total'];
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

  // 2. HDL (Kolesterol Baik) - UPGRADED
  const extractHDL = (): number | null => {
    const keywords = ['hdl', 'kolesterol hdl', 'cholesterol hdl', 'h d l'];
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

  // 3. LDL (Kolesterol Jahat) - UPGRADED
  const extractLDL = (): number | null => {
    const keywords = ['ldl', 'kolesterol ldl', 'cholesterol ldl', 'l d l'];
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

  // 5. Glukosa Puasa - UPGRADED
  const extractGlukosaPuasa = (): number | null => {
    const keywords = [
      'glukosa puasa',
      'gula darah puasa',
      'glucose fasting',
      'gdp',
      'gula puasa',
      'glukosa darah puasa',
      'gd puasa'
    ];
    const minVal = 50;
    const maxVal = 400;

    for (const keyword of keywords) {
      const rowIndex = lines.findIndex(line =>
        line.toLowerCase().includes(keyword.toLowerCase())
      );

      if (rowIndex === -1) continue;

      console.log(`\n🔍 [Glukosa Puasa] Ditemukan di baris ${rowIndex}:`, lines[rowIndex]);

      const candidates: {value: number, source: string, priority: number}[] = [];

      // PATTERN 1: Same row - angka 2-3 digit
      const currentRow = lines[rowIndex];
      const sameRowNumbers = currentRow.match(/\b(\d{2,3})\b/g);

      if (sameRowNumbers) {
        console.log(`🔢 [Glukosa Puasa] Pattern 1 (same row):`, sameRowNumbers);
        sameRowNumbers.forEach(numStr => {
          const num = parseFloat(numStr);
          if (num >= minVal && num <= maxVal) {
            // Prioritas tinggi untuk angka di baris yang sama
            const hasUnit = /mg\s*\/\s*d?l/i.test(currentRow);
            const priority = hasUnit ? 1 : 2;
            candidates.push({value: num, source: 'same-row', priority});
          }
        });
      }

      // PATTERN 2: Next row +1
      if (rowIndex + 1 < lines.length) {
        const nextRow1 = lines[rowIndex + 1];
        const row1Numbers = nextRow1.match(/\b(\d{2,3})\b/g);

        if (row1Numbers) {
          console.log(`🔢 [Glukosa Puasa] Pattern 2 (row +1):`, row1Numbers);

          const hasUnit = /mg\s*\/\s*d?l/i.test(nextRow1);
          const hasOperator = /[<>-]/.test(nextRow1);

          row1Numbers.forEach(numStr => {
            const num = parseFloat(numStr);
            if (num >= minVal && num <= maxVal) {
              // Prioritas: ada unit + tidak ada operator = best
              let priority = 5;
              if (hasUnit && !hasOperator) {
                priority = 3;
              } else if (hasUnit && hasOperator) {
                priority = 7; // Kemungkinan nilai normal range
              }
              candidates.push({value: num, source: 'next-row-1', priority});
            }
          });
        }
      }

      // PATTERN 3: Context window (exclude range values)
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
              // Skip jika kemungkinan range value
              if (hasOperator && (num < 80 || num > 200)) {
                return; // Skip nilai range yang ekstrem
              }

              const priority = hasUnit && !hasOperator ? 4 : 6;
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

  // 7. HbA1c (desimal) - UPGRADED
  // Custom extraction untuk HbA1c yang lebih akurat
  const extractHbA1c = (): number | null => {
    const keywords = ['hba1c', 'hb a1c', 'hb a 1 c', 'hemoglobin a1c', 'a1c'];
    const minVal = 3;
    const maxVal = 15;

    for (const keyword of keywords) {
      const rowIndex = lines.findIndex(line =>
        line.toLowerCase().includes(keyword.toLowerCase())
      );

      if (rowIndex === -1) continue;

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

      // PATTERN 2: Next row +1 (dengan unit % nearby)
      if (rowIndex + 1 < lines.length) {
        const nextRow1 = lines[rowIndex + 1];
        const row1Decimals = nextRow1.match(decimalPattern);

        if (row1Decimals) {
          console.log(`🔢 [HbA1c] Pattern 2 (row +1 decimals):`, row1Decimals);

          // Check apakah ada tanda % di dekat angka
          const hasPercent = /%/.test(nextRow1);

          row1Decimals.forEach(numStr => {
            const num = parseFloat(numStr.replace(',', '.'));
            if (num >= minVal && num <= maxVal) {
              // Jika ada %, priority lebih tinggi
              const priority = hasPercent ? 2 : 3;
              candidates.push({value: num, source: 'next-row-1-decimal', priority});
            }
          });
        }
      }

      // PATTERN 3: Context window untuk desimal
      const contextStart = Math.max(0, rowIndex);
      const contextEnd = Math.min(lines.length, rowIndex + 4);

      for (let i = contextStart; i < contextEnd; i++) {
        if (i === rowIndex || i === rowIndex + 1) continue;

        const contextRow = lines[i];
        const contextDecimals = contextRow.match(decimalPattern);

        if (contextDecimals) {
          const hasPercent = /%/.test(contextRow);

          contextDecimals.forEach(numStr => {
            const num = parseFloat(numStr.replace(',', '.'));
            if (num >= minVal && num <= maxVal) {
              const priority = hasPercent ? 4 : 5;
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

      break;
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