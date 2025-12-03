// app/screens/Profile/EditHealthData.tsx
import { OnboardingService } from '@/services/onboarding/onboardingService';
import { UserHealthProfile } from '@/services/onboarding/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EditHealthData() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<UserHealthProfile | null>(null);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const data = await OnboardingService.getUserOnboarding();
      setHealthData(data);
    } catch (error) {
      console.error('Error loading health data:', error);
      Alert.alert('Error', 'Gagal memuat data kesehatan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!healthData) {
      Alert.alert('Error', 'Data kesehatan tidak ditemukan');
      return;
    }

    // Navigate ke onboarding dengan mode edit
    // Pass parameter isEdit=true untuk membedakan dengan onboarding pertama kali
    router.push('/onboarding/personal?mode=edit');
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Kurus';
    if (bmi < 23) return 'Normal';
    if (bmi < 25) return 'Gemuk';
    if (bmi < 30) return 'Obesitas Ringan';
    return 'Obesitas Berat';
  };

  const getBMIColor = (bmi: number): string => {
    if (bmi < 18.5) return '#F59E0B';
    if (bmi < 23) return '#10B981';
    if (bmi < 25) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Memuat data kesehatan...</Text>
      </View>
    );
  }

  if (!healthData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Data Kesehatan</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* No Data */}
        <View style={styles.noDataContainer}>
          <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
          <Text style={styles.noDataTitle}>Belum Ada Data</Text>
          <Text style={styles.noDataText}>
            Anda belum melengkapi data kesehatan. Silakan lengkapi terlebih dahulu.
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/onboarding/personal')}
          >
            <Text style={styles.primaryButtonText}>Lengkapi Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const bmi = healthData.physical.bmi || 0;
  const bmiCategory = getBMICategory(bmi);
  const bmiColor = getBMIColor(bmi);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Kesehatan Anda</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* BMI Card */}
        <View style={styles.bmiCard}>
          <Text style={styles.bmiLabel}>Indeks Massa Tubuh (BMI)</Text>
          <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
          <View style={[styles.bmiStatusBadge, { backgroundColor: bmiColor + '20' }]}>
            <Text style={[styles.bmiStatus, { color: bmiColor }]}>
              {bmiCategory}
            </Text>
          </View>
        </View>

        {/* Health Summary Cards */}
        <View style={styles.summaryContainer}>
          {/* Personal Info */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="person" size={24} color="#3B82F6" />
              <Text style={styles.summaryTitle}>Informasi Personal</Text>
            </View>
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Nama</Text>
                <Text style={styles.summaryValue}>{healthData.personal.fullName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Usia</Text>
                <Text style={styles.summaryValue}>{healthData.personal.age} tahun</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Jenis Kelamin</Text>
                <Text style={styles.summaryValue}>
                  {healthData.personal.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                </Text>
              </View>
            </View>
          </View>

          {/* Physical Data */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="fitness" size={24} color="#10B981" />
              <Text style={styles.summaryTitle}>Data Fisik</Text>
            </View>
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Berat Badan</Text>
                <Text style={styles.summaryValue}>{healthData.physical.weight} kg</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tinggi Badan</Text>
                <Text style={styles.summaryValue}>{healthData.physical.height} cm</Text>
              </View>
              {healthData.physical.bloodPressureSystolic && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tekanan Darah</Text>
                  <Text style={styles.summaryValue}>
                    {healthData.physical.bloodPressureSystolic}/
                    {healthData.physical.bloodPressureDiastolic} mmHg
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Risk Assessment */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="analytics" size={24} color="#F59E0B" />
              <Text style={styles.summaryTitle}>Penilaian Risiko</Text>
            </View>
            <View style={styles.summaryContent}>
              <View style={styles.riskRow}>
                <Text style={styles.riskLabel}>Risiko Diabetes</Text>
                <View style={[
                  styles.riskBadge,
                  { backgroundColor: getRiskColor(healthData.riskAssessment.diabetesRisk) + '20' }
                ]}>
                  <Text style={[
                    styles.riskValue,
                    { color: getRiskColor(healthData.riskAssessment.diabetesRisk) }
                  ]}>
                    {getRiskText(healthData.riskAssessment.diabetesRisk)}
                  </Text>
                </View>
              </View>
              <View style={styles.riskRow}>
                <Text style={styles.riskLabel}>Risiko Kolesterol</Text>
                <View style={[
                  styles.riskBadge,
                  { backgroundColor: getRiskColor(healthData.riskAssessment.cholesterolRisk) + '20' }
                ]}>
                  <Text style={[
                    styles.riskValue,
                    { color: getRiskColor(healthData.riskAssessment.cholesterolRisk) }
                  ]}>
                    {getRiskText(healthData.riskAssessment.cholesterolRisk)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Last Updated */}
          <View style={styles.lastUpdatedCard}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.lastUpdatedText}>
              Terakhir diperbarui: {new Date(healthData.updatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Edit Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit Data Kesehatan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Helper functions
function getRiskColor(risk: string): string {
  switch (risk) {
    case 'low': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'high': return '#EF4444';
    default: return '#6B7280';
  }
}

function getRiskText(risk: string): string {
  switch (risk) {
    case 'low': return 'Rendah';
    case 'medium': return 'Sedang';
    case 'high': return 'Tinggi';
    default: return 'Tidak Diketahui';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bmiCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  bmiLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  bmiValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  bmiStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bmiStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    gap: 16,
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  riskValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  lastUpdatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginTop: 8,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});