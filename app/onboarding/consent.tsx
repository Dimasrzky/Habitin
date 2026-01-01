import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import { auth } from '../../src/config/firebase.config';
import { useOnboarding } from '../../src/context/OnboardingContext';
import { saveOnboardingData } from '../../src/services/onboarding/onboardingService';

export default function ConsentScreen() {
  const { data, updateData, resetData } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const toggleConsent = (field: 'privacyConsent' | 'dataAnalysisConsent' | 'ageConsent') => {
    updateData(field, !data[field]);
  };

  const allConsentsGiven =
    data.privacyConsent && data.dataAnalysisConsent && data.ageConsent;

  const handleSubmit = async () => {
    if (!allConsentsGiven) {
      Alert.alert('Perhatian', 'Anda harus menyetujui semua persyaratan untuk melanjutkan');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User tidak ditemukan. Silakan login kembali.');
      return;
    }

    setLoading(true);

    try {
      const result = await saveOnboardingData(user.uid, data);

      if (result.success) {
        resetData();
        router.replace('/onboarding/complete');
      } else {
        Alert.alert('Error', result.error || 'Gagal menyimpan data. Coba lagi.');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPrivacyPolicy = () => {
    // Ganti dengan URL kebijakan privasi Anda
    Linking.openURL('https://habitin.com/privacy-policy');
  };

  return (
    <OnboardingLayout
      currentStep={7}
      totalSteps={8}
      showBackButton={true}
      onBack={() => router.back()}
      footer={
        <TouchableOpacity
          style={[styles.submitButton, !allConsentsGiven && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!allConsentsGiven || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Selesai & Mulai</Text>
          )}
        </TouchableOpacity>
      }
    >
        <Text style={styles.title}>Privasi & Persetujuan</Text>
        <Text style={styles.subtitle}>
          Keamanan dan privasi data Anda adalah prioritas kami
        </Text>

        <View style={styles.securityBadge}>
          <Text style={styles.securityIcon}>🔒</Text>
          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>Data Anda Aman</Text>
            <Text style={styles.securityDescription}>
              Kami menggunakan enkripsi standar industri untuk melindungi informasi
              kesehatan Anda
            </Text>
          </View>
        </View>

        {/* Privacy Consent */}
        <TouchableOpacity
          style={[
            styles.consentCard,
            data.privacyConsent && styles.consentCardSelected,
          ]}
          onPress={() => toggleConsent('privacyConsent')}
        >
          <View style={styles.checkbox}>
            {data.privacyConsent && <View style={styles.checkboxInner} />}
          </View>
          <View style={styles.consentContent}>
            <Text style={styles.consentText}>
              Saya memahami bahwa data kesehatan saya akan disimpan dengan aman dan tidak
              akan dibagikan kepada pihak ketiga tanpa izin saya
            </Text>
          </View>
        </TouchableOpacity>

        {/* Data Analysis Consent */}
        <TouchableOpacity
          style={[
            styles.consentCard,
            data.dataAnalysisConsent && styles.consentCardSelected,
          ]}
          onPress={() => toggleConsent('dataAnalysisConsent')}
        >
          <View style={styles.checkbox}>
            {data.dataAnalysisConsent && <View style={styles.checkboxInner} />}
          </View>
          <View style={styles.consentContent}>
            <Text style={styles.consentText}>
              Saya mengizinkan Habitin menganalisis data lab saya untuk memberikan
              insight kesehatan yang personal dan akurat
            </Text>
          </View>
        </TouchableOpacity>

        {/* Privacy Policy */}
        <TouchableOpacity
          style={[
            styles.consentCard,
            data.ageConsent && styles.consentCardSelected,
          ]}
          onPress={() => toggleConsent('ageConsent')}
        >
          <View style={styles.checkbox}>
            {data.ageConsent && <View style={styles.checkboxInner} />}
          </View>
          <View style={styles.consentContent}>
            <Text style={styles.consentText}>
              Saya berusia minimal 17 tahun dan telah membaca{' '}
              <Text style={styles.link} onPress={openPrivacyPolicy}>
                Kebijakan Privasi
              </Text>
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>⚕️ Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            Habitin adalah alat bantu monitoring kesehatan dan bukan pengganti konsultasi
            medis profesional. Untuk diagnosis dan pengobatan, selalu konsultasikan
            dengan dokter atau tenaga medis yang berkualifikasi.
          </Text>
        </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 24,
    lineHeight: 24,
  },
  securityBadge: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  securityIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: '#558B2F',
    lineHeight: 20,
  },
  consentCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  consentCardSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  consentContent: {
    flex: 1,
  },
  consentText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22,
  },
  link: {
    color: '#4CAF50',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  disclaimerBox: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#F57C00',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});