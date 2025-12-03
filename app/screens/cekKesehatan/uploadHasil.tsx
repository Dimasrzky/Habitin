// app/screens/cekKesehatan/uploadHasil.tsx

import { auth } from '@/config/firebase.config';
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
  
  // ✅ Ambil labResultId dari params
  const labResultId = params.labResultId as string;
  const riskLevel = params.riskLevel as RiskLevel;
  const imageUrl = params.imageUrl as string;

  console.log('📊 Received params:', { labResultId, riskLevel, imageUrl });

  // ✅ FETCH WITH AUTH CHECK
  useEffect(() => {
    const fetchLabResult = async () => {
      try {
        console.log('🔍 Fetching lab result with ID:', labResultId);
        setLoading(true);
        
        // ✅ GET FIREBASE USER
        const firebaseUser = auth.currentUser;
        console.log('🔐 Firebase user:', firebaseUser?.uid);
        
        if (!firebaseUser) {
          console.error('❌ No Firebase user authenticated!');
          setLoading(false);
          return;
        }

        // ✅ Query dengan explicit user_id filter
        const { data, error } = await supabase
          .from('lab_results')
          .select('*')
          .eq('id', labResultId)
          .eq('user_id', firebaseUser.uid)
          .maybeSingle();

        console.log('📊 Query result:', { data, error });

        if (error) {
          console.error('❌ Supabase error:', error);
          
          // ✅ FALLBACK: Try without user_id filter (for debugging)
          console.log('🔄 Trying fallback query...');
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('lab_results')
            .select('*')
            .eq('id', labResultId)
            .limit(1)
            .single();
          
          console.log('🔄 Fallback result:', { fallbackData, fallbackError });
          
          if (fallbackError) {
            throw fallbackError;
          }
          
          if (fallbackData) {
            console.log('✅ Found via fallback!');
            setLabResult(fallbackData as LabResult);
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

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

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
      case 'glucose_2h':
        if (value < 140) return '#ABE7B2';
        if (value < 200) return '#FFD580';
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
      progressMax: 200,
    },
    {
      name: 'Glukosa Darah 2 Jam',
      value: labResult.glucose_2h,
      unit: 'mg/dL',
      type: 'glucose_2h',
      normalRange: '< 140 mg/dL',
      progressMax: 250,
    },
    {
      name: 'HbA1c',
      value: labResult.hba1c,
      unit: '%',
      type: 'hba1c',
      normalRange: '< 5.7%',
      progressMax: 10,
    },
    {
      name: 'Kolesterol Total',
      value: labResult.cholesterol_total,
      unit: 'mg/dL',
      type: 'cholesterol_total',
      normalRange: '< 200 mg/dL',
      progressMax: 300,
    },
    {
      name: 'Kolesterol LDL',
      value: labResult.cholesterol_ldl,
      unit: 'mg/dL',
      type: 'ldl',
      normalRange: '< 100 mg/dL',
      progressMax: 200,
    },
    {
      name: 'Kolesterol HDL',
      value: labResult.cholesterol_hdl,
      unit: 'mg/dL',
      type: 'hdl',
      normalRange: '> 40 mg/dL',
      progressMax: 100,
    },
    {
      name: 'Trigliserida',
      value: labResult.triglycerides,
      unit: 'mg/dL',
      type: 'triglycerides',
      normalRange: '< 150 mg/dL',
      progressMax: 250,
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
          <Text style={styles.scoreText}>Skor Risiko: {labResult.risk_score}</Text>
          <Text style={styles.dateText}>
            {formatDate(labResult.created_at)}
          </Text>
          <Text style={styles.resultDescription}>
            {getRiskDescription(labResult.risk_level)}
          </Text>
        </View>

        {/* Results Title */}
        <Text style={styles.sectionTitle}>📊 Detail Pemeriksaan</Text>

        {/* DIABETES SECTION */}
        {(labResult.glucose_level || labResult.glucose_2h || labResult.hba1c) && (
          <>
            <Text style={styles.subsectionTitle}>🩸 Pemeriksaan Diabetes</Text>
            
            {/* Glukosa Puasa */}
            {labResult.glucose_level && (
              <View style={styles.testCard}>
                <View style={styles.testHeader}>
                  <Text style={styles.testName}>Gula Darah Puasa</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(labResult.glucose_level, 'glucose') }
                  ]}>
                    <Ionicons 
                      name={getStatusIcon(labResult.glucose_level, 'glucose') as any}
                      size={14} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.statusText}>
                      {getStatusText(labResult.glucose_level, 'glucose')}
                    </Text>
                  </View>
                </View>

                <View style={styles.testValueRow}>
                  <Text style={styles.testValue}>
                    {labResult.glucose_level} <Text style={styles.testUnit}>mg/dL</Text>
                  </Text>
                  <Text style={styles.normalRange}>Normal: {'<'} 100 mg/dL</Text>
                </View>

                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min((labResult.glucose_level / 200) * 100, 100)}%`,
                        backgroundColor: getStatusColor(labResult.glucose_level, 'glucose')
                      }
                    ]} 
                  />
                </View>
              </View>
            )}

            {/* Glukosa 2 Jam */}
            {labResult.glucose_2h && (
              <View style={styles.testCard}>
                <View style={styles.testHeader}>
                  <Text style={styles.testName}>Glukosa Darah 2 Jam</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(labResult.glucose_2h, 'glucose_2h') }
                  ]}>
                    <Ionicons 
                      name={getStatusIcon(labResult.glucose_2h, 'glucose_2h') as any}
                      size={14} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.statusText}>
                      {getStatusText(labResult.glucose_2h, 'glucose_2h')}
                    </Text>
                  </View>
                </View>

                <View style={styles.testValueRow}>
                  <Text style={styles.testValue}>
                    {labResult.glucose_2h} <Text style={styles.testUnit}>mg/dL</Text>
                  </Text>
                  <Text style={styles.normalRange}>Normal: {'<'} 140 mg/dL</Text>
                </View>

                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min((labResult.glucose_2h / 250) * 100, 100)}%`,
                        backgroundColor: getStatusColor(labResult.glucose_2h, 'glucose_2h')
                      }
                    ]} 
                  />
                </View>
              </View>
            )}

            {/* HbA1c */}
            {labResult.hba1c && (
              <View style={styles.testCard}>
                <View style={styles.testHeader}>
                  <Text style={styles.testName}>HbA1c</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(labResult.hba1c, 'hba1c') }
                  ]}>
                    <Ionicons 
                      name={getStatusIcon(labResult.hba1c, 'hba1c') as any}
                      size={14} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.statusText}>
                      {getStatusText(labResult.hba1c, 'hba1c')}
                    </Text>
                  </View>
                </View>

                <View style={styles.testValueRow}>
                  <Text style={styles.testValue}>
                    {labResult.hba1c} <Text style={styles.testUnit}>%</Text>
                  </Text>
                  <Text style={styles.normalRange}>Normal: {'<'} 5.7%</Text>
                </View>

                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min((labResult.hba1c / 10) * 100, 100)}%`,
                        backgroundColor: getStatusColor(labResult.hba1c, 'hba1c')
                      }
                    ]} 
                  />
                </View>
              </View>
            )}
          </>
        )}

        {/* CHOLESTEROL SECTION */}
        {(labResult.cholesterol_total || labResult.cholesterol_ldl || 
          labResult.cholesterol_hdl || labResult.triglycerides) && (
          <>
            <Text style={styles.subsectionTitle}>💊 Pemeriksaan Kolesterol</Text>
            
            {/* Kolesterol Total */}
            {labResult.cholesterol_total && (
              <View style={styles.testCard}>
                <View style={styles.testHeader}>
                  <Text style={styles.testName}>Kolesterol Total</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(labResult.cholesterol_total, 'cholesterol_total') }
                  ]}>
                    <Ionicons 
                      name={getStatusIcon(labResult.cholesterol_total, 'cholesterol_total') as any}
                      size={14} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.statusText}>
                      {getStatusText(labResult.cholesterol_total, 'cholesterol_total')}
                    </Text>
                  </View>
                </View>

                <View style={styles.testValueRow}>
                  <Text style={styles.testValue}>
                    {labResult.cholesterol_total} <Text style={styles.testUnit}>mg/dL</Text>
                  </Text>
                  <Text style={styles.normalRange}>Normal: {'<'} 200 mg/dL</Text>
                </View>

                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min((labResult.cholesterol_total / 300) * 100, 100)}%`,
                        backgroundColor: getStatusColor(labResult.cholesterol_total, 'cholesterol_total')
                      }
                    ]} 
                  />
                </View>
              </View>
            )}

            {/* LDL */}
            {labResult.cholesterol_ldl && (
              <View style={styles.testCard}>
                <View style={styles.testHeader}>
                  <Text style={styles.testName}>Kolesterol LDL (Jahat)</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(labResult.cholesterol_ldl, 'ldl') }
                  ]}>
                    <Ionicons 
                      name={getStatusIcon(labResult.cholesterol_ldl, 'ldl') as any}
                      size={14} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.statusText}>
                      {getStatusText(labResult.cholesterol_ldl, 'ldl')}
                    </Text>
                  </View>
                </View>

                <View style={styles.testValueRow}>
                  <Text style={styles.testValue}>
                    {labResult.cholesterol_ldl} <Text style={styles.testUnit}>mg/dL</Text>
                  </Text>
                  <Text style={styles.normalRange}>Normal: {'<'} 100 mg/dL</Text>
                </View>

                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min((labResult.cholesterol_ldl / 200) * 100, 100)}%`,
                        backgroundColor: getStatusColor(labResult.cholesterol_ldl, 'ldl')
                      }
                    ]} 
                  />
                </View>
              </View>
            )}

            {/* HDL */}
            {labResult.cholesterol_hdl && (
              <View style={styles.testCard}>
                <View style={styles.testHeader}>
                  <Text style={styles.testName}>Kolesterol HDL (Baik)</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(labResult.cholesterol_hdl, 'hdl') }
                  ]}>
                    <Ionicons 
                      name={getStatusIcon(labResult.cholesterol_hdl, 'hdl') as any}
                      size={14} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.statusText}>
                      {getStatusText(labResult.cholesterol_hdl, 'hdl')}
                    </Text>
                  </View>
                </View>

                <View style={styles.testValueRow}>
                  <Text style={styles.testValue}>
                    {labResult.cholesterol_hdl} <Text style={styles.testUnit}>mg/dL</Text>
                  </Text>
                  <Text style={styles.normalRange}>Normal: {'>'} 40 mg/dL</Text>
                </View>

                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min((labResult.cholesterol_hdl / 100) * 100, 100)}%`,
                        backgroundColor: getStatusColor(labResult.cholesterol_hdl, 'hdl')
                      }
                    ]} 
                  />
                </View>
              </View>
            )}

            {/* Trigliserida */}
            {labResult.triglycerides && (
              <View style={styles.testCard}>
                <View style={styles.testHeader}>
                  <Text style={styles.testName}>Trigliserida</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(labResult.triglycerides, 'triglycerides') }
                  ]}>
                    <Ionicons 
                      name={getStatusIcon(labResult.triglycerides, 'triglycerides') as any}
                      size={14} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.statusText}>
                      {getStatusText(labResult.triglycerides, 'triglycerides')}
                    </Text>
                  </View>
                </View>

                <View style={styles.testValueRow}>
                  <Text style={styles.testValue}>
                    {labResult.triglycerides} <Text style={styles.testUnit}>mg/dL</Text>
                  </Text>
                  <Text style={styles.normalRange}>Normal: {'<'} 150 mg/dL</Text>
                </View>

                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min((labResult.triglycerides / 250) * 100, 100)}%`,
                        backgroundColor: getStatusColor(labResult.triglycerides, 'triglycerides')
                      }
                    ]} 
                  />
                </View>
              </View>
            )}
          </>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#93BFC7" />
            <Text style={styles.infoTitle}>Catatan Penting</Text>
          </View>
          <Text style={styles.infoText}>
            Hasil analisis ini berdasarkan data yang terdeteksi dari hasil lab Anda. 
            Untuk diagnosis yang akurat dan penanganan lebih lanjut, konsultasikan dengan dokter.
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
            <Ionicons name="home" size={20} color="#FFFFFF" />
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
            <Ionicons name="trophy" size={20} color="#1F2937" />
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 12,
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
    marginTop: 8,
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
    backgroundColor: '#6B7280',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#ABE7B2',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
});