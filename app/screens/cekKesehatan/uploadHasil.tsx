// app/screens/cekKesehatan/uploadHasil.tsx
import { supabase } from '@/config/supabase.config';
import { LabResult } from '@/types/health.types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type RiskLevel = 'rendah' | 'sedang' | 'tinggi';

export default function UploadResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [labResult, setLabResult] = useState<LabResult | null>(null);
  
  // ✅ FIX: Ambil labResultId dari params (bukan resultId)
  const labResultId = params.labResultId as string;
  const riskLevel = params.riskLevel as RiskLevel;
  const imageUrl = params.imageUrl as string;

  console.log('📊 Received params:', { labResultId, riskLevel, imageUrl });

  // ✅ FETCH DATA DARI DATABASE
 useEffect(() => {
    const fetchLabResult = async () => {
      try {
        console.log('🔍 Fetching lab result with ID:', labResultId);
        setLoading(true);
        
        // ✅ METHOD 1: Try dengan auth context
        const { data: authData } = await supabase.auth.getUser();
        console.log('👤 Current user:', authData.user?.id);
        
        // ✅ METHOD 2: Fetch dengan maybeSingle() untuk avoid error
        const { data, error } = await supabase
          .from('lab_results')
          .select('*')
          .eq('id', labResultId)
          .maybeSingle();

        if (error) {
          console.error('❌ Supabase error:', error);
          
          // ✅ FALLBACK: Coba tanpa filter by user_id (untuk debug)
          const { data: allData, error: allError } = await supabase
            .from('lab_results')
            .select('*')
            .eq('id', labResultId);
          
          console.log('🔄 Fallback query result:', { allData, allError });
          
          if (allError) throw allError;
          if (allData && allData.length > 0) {
            console.log('✅ Found via fallback!');
            setLabResult(allData[0] as LabResult);
            return;
          }
          
          throw error;
        }
        
        if (!data) {
          console.error('❌ No data found for ID:', labResultId);
          return;
        }
        
        console.log('✅ Lab result fetched:', data);
        setLabResult(data as LabResult);
      } catch (error) {
        console.error('❌ Error fetching lab result:', error);
      } finally {
        setLoading(false);
      }
    };

    if (labResultId) {
      fetchLabResult();
    } else {
      console.error('❌ No labResultId provided!');
      setLoading(false);
    }
  }, [labResultId]);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'rendah': return '#CBF3BB';
      case 'sedang': return '#FFE8B6';
      case 'tinggi': return '#FFB4B4';
      default: return '#ECF4E8';
    }
  };

  const getRiskText = (level: RiskLevel) => {
    switch (level) {
      case 'rendah': return 'RISIKO RENDAH';
      case 'sedang': return 'RISIKO SEDANG';
      case 'tinggi': return 'RISIKO TINGGI';
      default: return 'TIDAK DIKETAHUI';
    }
  };

  const getRiskDescription = (level: RiskLevel) => {
    switch (level) {
      case 'rendah':
        return 'Selamat! Hasil lab Anda menunjukkan kondisi yang baik. Pertahankan pola hidup sehat Anda.';
      case 'sedang':
        return 'Anda memiliki beberapa faktor risiko. Perlu perbaikan pada gaya hidup untuk mencegah risiko lebih tinggi.';
      case 'tinggi':
        return 'Hasil lab Anda menunjukkan risiko tinggi. Sangat disarankan untuk segera konsultasi dengan dokter.';
      default:
        return '';
    }
  };

  const getStatusColor = (value: number | null, type: string) => {
    if (value === null) return '#D1D5DB';
    
    switch (type) {
      case 'glucose':
        if (value < 100) return '#ABE7B2';
        if (value < 126) return '#FFD580';
        return '#FFB4B4';
      case 'hba1c':
        if (value < 5.7) return '#ABE7B2';
        if (value < 6.5) return '#FFD580';
        return '#FFB4B4';
      case 'cholesterol_total':
        if (value < 200) return '#ABE7B2';
        if (value < 240) return '#FFD580';
        return '#FFB4B4';
      case 'ldl':
        if (value < 100) return '#ABE7B2';
        if (value < 160) return '#FFD580';
        return '#FFB4B4';
      case 'hdl':
        if (value >= 40) return '#ABE7B2';
        return '#FFB4B4';
      case 'triglycerides':
        if (value < 150) return '#ABE7B2';
        if (value < 200) return '#FFD580';
        return '#FFB4B4';
      default:
        return '#D1D5DB';
    }
  };

  const getStatusIcon = (value: number | null, type: string) => {
    const color = getStatusColor(value, type);
    if (color === '#ABE7B2') return 'checkmark-circle';
    if (color === '#FFD580') return 'alert-circle';
    if (color === '#FFB4B4') return 'warning';
    return 'information-circle';
  };

  const getStatusText = (value: number | null, type: string) => {
    const color = getStatusColor(value, type);
    if (color === '#ABE7B2') return 'Normal';
    if (color === '#FFD580') return 'Borderline';
    if (color === '#FFB4B4') return 'Tinggi';
    return '-';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // =====================================================
  // LOADING STATE
  // =====================================================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ABE7B2" />
        <Text style={styles.loadingText}>Memuat hasil...</Text>
      </View>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================
  if (!labResult) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Data tidak ditemukan</Text>
        <Text style={styles.errorSubtext}>
          ID: {labResultId || 'Tidak ada ID'}
        </Text>
        <Pressable
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/cekKesehatan' as any)}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  // =====================================================
  // PREPARE TEST RESULTS
  // =====================================================
  const testResults = [
    {
      name: 'Gula Darah Puasa',
      value: labResult.glucose_level,
      unit: 'mg/dL',
      type: 'glucose',
      normalRange: '< 100 mg/dL',
    },
    {
      name: 'HbA1c',
      value: labResult.hba1c,
      unit: '%',
      type: 'hba1c',
      normalRange: '< 5.7%',
    },
    {
      name: 'Kolesterol Total',
      value: labResult.cholesterol_total,
      unit: 'mg/dL',
      type: 'cholesterol_total',
      normalRange: '< 200 mg/dL',
    },
    {
      name: 'Kolesterol LDL',
      value: labResult.cholesterol_ldl,
      unit: 'mg/dL',
      type: 'ldl',
      normalRange: '< 100 mg/dL',
    },
    {
      name: 'Kolesterol HDL',
      value: labResult.cholesterol_hdl,
      unit: 'mg/dL',
      type: 'hdl',
      normalRange: '> 40 mg/dL',
    },
    {
      name: 'Trigliserida',
      value: labResult.triglycerides,
      unit: 'mg/dL',
      type: 'triglycerides',
      normalRange: '< 150 mg/dL',
    },
  ].filter(test => test.value !== null); // Hanya tampilkan yang ada datanya

  // =====================================================
  // MAIN RENDER
  // =====================================================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => router.push('/(tabs)' as any)} 
          style={styles.headerBackButton}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Hasil Analisis</Text>
        <Pressable style={styles.iconButton}>
          <Ionicons name="share-outline" size={24} color="#1F2937" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#ABE7B2" />
          </View>
          <Text style={styles.successTitle}>Analisis Selesai!</Text>
          <Text style={styles.successSubtitle}>
            Hasil lab berhasil dianalisis
          </Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status Kesehatan Anda</Text>
          <View style={[
            styles.riskBadge, 
            { backgroundColor: getRiskColor(labResult.risk_level) }
          ]}>
            <View style={styles.riskCircle} />
            <Text style={styles.riskText}>
              {getRiskText(labResult.risk_level)}
            </Text>
          </View>
          <Text style={styles.scoreText}>Skor: {labResult.risk_score}/100</Text>
          <Text style={styles.dateText}>
            {formatDate(labResult.created_at)}
          </Text>
          <Text style={styles.resultDescription}>
            {getRiskDescription(labResult.risk_level)}
          </Text>
        </View>

        {/* Results Title */}
        <Text style={styles.sectionTitle}>📊 Detail Pemeriksaan</Text>

        {/* Test Results */}
        {testResults.map((test, index) => (
          <View key={index} style={styles.testCard}>
            <View style={styles.testHeader}>
              <Text style={styles.testName}>{test.name}</Text>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(test.value, test.type) }
              ]}>
                <Ionicons 
                  name={getStatusIcon(test.value, test.type) as any}
                  size={14} 
                  color="#FFFFFF" 
                />
                <Text style={styles.statusText}>
                  {getStatusText(test.value, test.type)}
                </Text>
              </View>
            </View>

            <View style={styles.testValueRow}>
              <Text style={styles.testValue}>
                {test.value} <Text style={styles.testUnit}>{test.unit}</Text>
              </Text>
              <Text style={styles.normalRange}>Normal: {test.normalRange}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min((test.value! / 300) * 100, 100)}%`,
                    backgroundColor: getStatusColor(test.value, test.type)
                  }
                ]} 
              />
            </View>
          </View>
        ))}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#93BFC7" />
            <Text style={styles.infoTitle}>Catatan</Text>
          </View>
          <Text style={styles.infoText}>
            Hasil analisis ini berdasarkan data yang terdeteksi dari hasil lab Anda. 
            Untuk diagnosis yang akurat, konsultasikan dengan dokter.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.secondaryButton,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => router.push('/(tabs)' as any)}
          >
            <Ionicons name="home" size={20} color="#6B7280" />
            <Text style={styles.secondaryButtonText}>Kembali ke Beranda</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryButton,
              { opacity: pressed ? 0.9 : 1 }
            ]}
            onPress={() => router.push('/(tabs)/tantangan' as any)}
          >
            <Ionicons name="trophy" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Mulai Tantangan Sehat</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#ABE7B2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBackButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  iconButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  successIcon: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 8,
    gap: 8,
  },
  riskCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  riskText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  resultDescription: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  testValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  testUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  normalRange: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  primaryButton: {
    backgroundColor: '#ABE7B2',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});