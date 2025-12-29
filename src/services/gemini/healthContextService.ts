// src/services/gemini/healthContextService.ts

import { supabaseAdmin } from '@/config/supabase.config'; // ← UBAH INI
import { HealthContext } from '@/types/chat.types';

export class HealthContextService {
  static async getUserHealthContext(userId: string): Promise<HealthContext> {
    try {
      console.log('🔍 Getting health context for user:', userId);

      // ✅ GUNAKAN supabaseAdmin
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userData) {
        console.log('✅ User data found:', {
          id: userData.id,
          email: userData.email,
          hasGender: !!userData.gender,
          hasDOB: !!userData.date_of_birth,
        });
      } else {
        console.log('⚠️ User data not found in users table');
      }

      // ✅ GUNAKAN supabaseAdmin
      const { data: labResults } = await supabaseAdmin
        .from('lab_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (labResults) {
        console.log('✅ Lab results found');
      }

      // ... sisa kode sama seperti sebelumnya
      
      let age: number | undefined;
      if (userData?.date_of_birth) {
        const birthDate = new Date(userData.date_of_birth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      let bmi: number | undefined;
      let weight: number | undefined;
      let height: number | undefined;

      if (labResults) {
        weight = labResults.weight ? parseFloat(labResults.weight) : undefined;
        height = labResults.height ? parseFloat(labResults.height) : undefined;
        
        if (weight && height) {
          bmi = weight / Math.pow(height / 100, 2);
        }
      }

      const healthConditions: string[] = [];
      
      if (labResults) {
        if (labResults.glucose_level && parseFloat(labResults.glucose_level) > 126) {
          healthConditions.push('prediabetes atau diabetes');
        } else if (labResults.glucose_level && parseFloat(labResults.glucose_level) > 100) {
          healthConditions.push('gula darah tinggi (prediabetes)');
        }
        
        if (labResults.cholesterol_total) {
          const totalChol = parseFloat(labResults.cholesterol_total);
          if (totalChol > 200) {
            healthConditions.push('kolesterol tinggi');
          } else if (totalChol >= 240) {
            healthConditions.push('kolesterol sangat tinggi');
          }
        }
        
        if (labResults.cholesterol_hdl) {
          const hdl = parseFloat(labResults.cholesterol_hdl);
          if (hdl < 40) {
            healthConditions.push('HDL rendah (berisiko penyakit jantung)');
          }
        }
        
        if (labResults.cholesterol_ldl) {
          const ldl = parseFloat(labResults.cholesterol_ldl);
          if (ldl > 160) {
            healthConditions.push('LDL sangat tinggi');
          } else if (ldl > 130) {
            healthConditions.push('LDL tinggi');
          }
        }
      }

      if (bmi) {
        if (bmi >= 30) {
          healthConditions.push('obesitas');
        } else if (bmi >= 25) {
          healthConditions.push('overweight');
        } else if (bmi < 18.5) {
          healthConditions.push('berat badan kurang');
        }
      }

      const labSummary = labResults
        ? `Gula darah puasa: ${labResults.glucose_level || 'N/A'} mg/dL, ` +
          `Kolesterol total: ${labResults.cholesterol_total || 'N/A'} mg/dL (${parseFloat(labResults.cholesterol_total) > 200 ? 'Tinggi ⚠️' : 'Normal ✓'}), ` +
          `HDL: ${labResults.cholesterol_hdl || 'N/A'} mg/dL (${parseFloat(labResults.cholesterol_hdl) < 40 ? 'Rendah ⚠️' : 'Baik ✓'}), ` +
          `LDL: ${labResults.cholesterol_ldl || 'N/A'} mg/dL (${parseFloat(labResults.cholesterol_ldl) > 130 ? 'Tinggi ⚠️' : 'Normal ✓'})`
        : 'Belum ada data lab';

      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (healthConditions.length >= 3) {
        riskLevel = 'high';
      } else if (healthConditions.length >= 1) {
        riskLevel = 'medium';
      }

      const context: HealthContext = {
        age,
        gender: userData?.gender || undefined,
        weight,
        height,
        bmi,
        health_conditions: healthConditions.length > 0 ? healthConditions : undefined,
        latest_lab_summary: labSummary,
        risk_level: riskLevel,
      };

      console.log('✅ Health context retrieved:', {
        hasAge: !!context.age,
        hasGender: !!context.gender,
        hasBMI: !!context.bmi,
        conditionsCount: context.health_conditions?.length || 0,
        riskLevel: context.risk_level,
      });

      return context;

    } catch (error) {
      console.error('❌ Error getting health context:', error);
      return {
        risk_level: 'low',
        latest_lab_summary: 'Belum ada data kesehatan tersedia'
      };
    }
  }

  // ... sisa kode formatContextForAI sama seperti sebelumnya
  
  static formatContextForAI(context: HealthContext): string {
    const parts: string[] = ['=== INFORMASI KESEHATAN PENGGUNA ==='];

    if (context.age) {
      parts.push(`\n📅 Usia: ${context.age} tahun`);
    }

    if (context.gender) {
      const genderText = context.gender === 'male' ? 'Laki-laki' : 'Perempuan';
      parts.push(`👤 Jenis kelamin: ${genderText}`);
    }

    if (context.weight && context.height) {
      parts.push(`⚖️ Berat: ${context.weight} kg | Tinggi: ${context.height} cm`);
    }

    if (context.bmi) {
      const bmiCategory = 
        context.bmi < 18.5 ? 'Kurus (perlu menaikkan berat badan)' :
        context.bmi < 25 ? 'Normal (ideal) ✓' :
        context.bmi < 30 ? 'Overweight (perlu menurunkan berat badan) ⚠️' : 
        'Obesitas (perlu program penurunan berat badan serius) 🚨';
      parts.push(`📊 BMI: ${context.bmi.toFixed(1)} - ${bmiCategory}`);
    }

    if (context.latest_lab_summary) {
      parts.push(`\n🔬 HASIL LAB TERAKHIR:\n${context.latest_lab_summary}`);
    }

    if (context.health_conditions && context.health_conditions.length > 0) {
      parts.push(`\n⚠️ KONDISI YANG PERLU DIPERHATIKAN:`);
      context.health_conditions.forEach((condition, index) => {
        parts.push(`  ${index + 1}. ${condition}`);
      });
    }

    if (context.risk_level) {
      const riskInfo = {
        low: '\n✅ STATUS: Risiko kesehatan rendah - Pertahankan pola hidup sehat',
        medium: '\n⚠️ STATUS: Risiko kesehatan SEDANG - Perlu perhatian dan perbaikan gaya hidup segera',
        high: '\n🚨 STATUS: Risiko kesehatan TINGGI - Sangat perlu monitoring ketat dan intervensi medis'
      }[context.risk_level];
      parts.push(riskInfo);
    }

    if (parts.length === 1) {
      return 'Pengguna baru, belum melengkapi data kesehatan. Berikan informasi umum dan sarankan untuk melakukan pemeriksaan lab dan melengkapi profil kesehatan di aplikasi Habitin.';
    }

    parts.push('\n=== INSTRUKSI UNTUK ASISTEN ===');
    parts.push('Berikan saran yang SPESIFIK dan PERSONAL berdasarkan kondisi kesehatan di atas.');
    parts.push('Jika ada kondisi berisiko, berikan perhatian khusus dan saran preventif yang detail.');

    return parts.join('\n');
  }
}