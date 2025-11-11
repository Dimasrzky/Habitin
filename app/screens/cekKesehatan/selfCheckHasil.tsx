// app/screens/cekKesehatan/selfCheckResult.tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function SelfCheckResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const score = parseInt(params.score as string) || 0;
  const riskLevel = (params.riskLevel as 'rendah' | 'sedang' | 'tinggi') || 'sedang';

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'rendah': return '#CBF3BB';
      case 'sedang': return '#FFE8B6';
      case 'tinggi': return '#FFB4B4';
      default: return '#ECF4E8';
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'rendah': return 'RISIKO RENDAH';
      case 'sedang': return 'RISIKO SEDANG';
      case 'tinggi': return 'RISIKO TINGGI';
      default: return 'TIDAK DIKETAHUI';
    }
  };

  const getRiskDescription = (level: string) => {
    switch (level) {
      case 'rendah':
        return 'Selamat! Gaya hidup Anda sudah cukup baik. Pertahankan pola hidup sehat Anda.';
      case 'sedang':
        return 'Anda memiliki beberapa faktor risiko. Perlu perbaikan pada gaya hidup untuk mencegah diabetes dan kolesterol tinggi.';
      case 'tinggi':
        return 'Anda memiliki risiko tinggi. Sangat disarankan untuk segera memeriksakan diri ke dokter dan melakukan perubahan gaya hidup.';
      default:
        return '';
    }
  };

  const getRecommendations = (level: string) => {
    const common = [
      'Perbanyak konsumsi sayur dan buah',
      'Minum air putih minimal 8 gelas per hari',
      'Hindari stress berlebihan',
      'Tidur cukup 7-8 jam per hari',
    ];

    if (level === 'rendah') {
      return [
        'Pertahankan aktivitas fisik rutin',
        'Lakukan pemeriksaan kesehatan rutin',
        ...common.slice(0, 2),
      ];
    } else if (level === 'sedang') {
      return [
        'Kurangi konsumsi gula dan makanan berlemak',
        'Olahraga minimal 30 menit, 3-4x seminggu',
        'Lakukan pemeriksaan lab dalam 3-6 bulan',
        ...common,
      ];
    } else {
      return [
        'SEGERA konsultasi dengan dokter',
        'Lakukan pemeriksaan lab lengkap',
        'Kurangi drastis konsumsi gula dan gorengan',
        'Olahraga rutin minimal 5x seminggu',
        'Kelola stress dengan baik',
        ...common,
      ];
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Hasil Self-Check</Text>
        <Pressable style={styles.iconButton}>
          <Ionicons name="share-outline" size={24} color="#1F2937" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Result Card */}
        <View style={styles.resultCard}>
          <View style={styles.resultIconContainer}>
            <Ionicons 
              name={riskLevel === 'rendah' ? 'checkmark-circle' : riskLevel === 'sedang' ? 'alert-circle' : 'warning'} 
              size={64} 
              color={riskLevel === 'rendah' ? '#ABE7B2' : riskLevel === 'sedang' ? '#FFD580' : '#FF8A8A'}
            />
          </View>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(riskLevel) }]}>
            <View style={styles.riskCircle} />
            <Text style={styles.riskText}>{getRiskText(riskLevel)}</Text>
          </View>
          <Text style={styles.scoreText}>Skor: {score}/60</Text>
          <Text style={styles.resultDescription}>{getRiskDescription(riskLevel)}</Text>
        </View>

        {/* Risk Factors */}
        <View style={styles.factorsCard}>
          <Text style={styles.sectionTitle}>📊 Penilaian Berdasarkan</Text>
          <View style={styles.factorsList}>
            <FactorItem icon="restaurant" label="Pola Makan" percentage={65} />
            <FactorItem icon="fitness" label="Aktivitas Fisik" percentage={45} />
            <FactorItem icon="moon" label="Kualitas Tidur" percentage={70} />
            <FactorItem icon="water" label="Hidrasi" percentage={80} />
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsCard}>
          <View style={styles.recommendationsHeader}>
            <Ionicons name="bulb" size={24} color="#FFD580" />
            <Text style={styles.recommendationsTitle}>Rekomendasi untuk Anda</Text>
          </View>
          <View style={styles.recommendationsList}>
            {getRecommendations(riskLevel).map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={18} color="#ABE7B2" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Card */}
        <View style={styles.ctaCard}>
          <Ionicons name="document-text" size={32} color="#93BFC7" />
          <Text style={styles.ctaTitle}>Ingin Hasil Lebih Akurat?</Text>
          <Text style={styles.ctaDescription}>
            Upload hasil lab Anda untuk mendapatkan analisis yang lebih detail dan akurat
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              { opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => router.push('/screens/cekKesehatan/uploadLab' as any)}
          >
            <Text style={styles.ctaButtonText}>Upload Hasil Lab</Text>
            <Ionicons name="arrow-forward" size={18} color="#93BFC7" />
          </Pressable>
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
            onPress={() => router.back()}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Ulangi Self-Check</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const FactorItem = ({ icon, label, percentage }: { icon: any, label: string, percentage: number }) => (
  <View style={styles.factorItem}>
    <View style={styles.factorHeader}>
      <View style={styles.factorIconLabel}>
        <Ionicons name={icon} size={18} color="#93BFC7" />
        <Text style={styles.factorLabel}>{label}</Text>
      </View>
      <Text style={styles.factorPercentage}>{percentage}%</Text>
    </View>
    <View style={styles.factorProgressBar}>
      <View style={[styles.factorProgressFill, { width: `${percentage}%` }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
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
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultIconContainer: {
    marginBottom: 16,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    color: '#6B7280',
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
  factorsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  factorsList: {
    gap: 16,
  },
  factorItem: {
    gap: 8,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  factorPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#93BFC7',
  },
  factorProgressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  factorProgressFill: {
    height: '100%',
    backgroundColor: '#93BFC7',
    borderRadius: 4,
  },
  recommendationsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: '#78350F',
    flex: 1,
    lineHeight: 20,
  },
  ctaCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#93BFC7',
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#93BFC7',
  },
  actionsContainer: {
    gap: 12,
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
    backgroundColor: '#93BFC7',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});