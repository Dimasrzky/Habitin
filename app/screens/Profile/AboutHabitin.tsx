// app/screens/Profile/AboutHabitin.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function AboutHabitin() {
  const router = useRouter();
  const appVersion = '1.0.0';
  const buildNumber = '100';

  const handleOpenWebsite = () => {
    Linking.openURL('https://habitin.com');
  };

  const handleTerms = () => {
    Linking.openURL('https://habitin.com/terms');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://habitin.com/privacy');
  };

  const handleSocialMedia = (platform: string) => {
    const urls: { [key: string]: string } = {
      instagram: 'https://instagram.com/habitin',
      twitter: 'https://twitter.com/habitin',
      facebook: 'https://facebook.com/habitin',
      youtube: 'https://youtube.com/habitin',
    };
    Linking.openURL(urls[platform]);
  };

  const handleRateApp = () => {
    // URL untuk Play Store atau App Store
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/habitin',
      android: 'https://play.google.com/store/apps/details?id=com.habitin',
    });
    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tentang Habitin</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo & Info */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="fitness" size={60} color="#ABE7B2" />
          </View>
          <Text style={styles.appName}>HABITIN</Text>
          <Text style={styles.tagline}>Temani Perjalanan Sehatmu</Text>
          <Text style={styles.version}>Versi {appVersion} (Build {buildNumber})</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tentang Kami</Text>
          <View style={styles.card}>
            <Text style={styles.description}>
              Habitin adalah aplikasi kesehatan digital yang membantu Anda memantau kondisi tubuh, 
              mengikuti tantangan sehat, dan meraih hidup yang lebih baik setiap hari.
              {'\n\n'}
              Dengan fitur gamifikasi yang menarik, Habitin membuat perjalanan hidup sehat Anda 
              menjadi lebih menyenangkan dan termotivasi.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitur Utama</Text>
          <View style={styles.card}>
            {[
              { icon: 'pulse', title: 'Pemantauan Kesehatan', desc: 'Lacak kondisi tubuh Anda secara real-time' },
              { icon: 'trophy', title: 'Tantangan Sehat', desc: 'Ikuti berbagai tantangan untuk hidup lebih sehat' },
              { icon: 'people', title: 'Komunitas', desc: 'Bergabung dengan komunitas kesehatan yang suportif' },
              { icon: 'ribbon', title: 'Reward & Badge', desc: 'Dapatkan pencapaian dan badge eksklusif' },
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon as any} size={24} color="#ABE7B2" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ikuti Kami</Text>
          <View style={styles.socialGrid}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialMedia('instagram')}
            >
              <Ionicons name="logo-instagram" size={28} color="#E4405F" />
              <Text style={styles.socialLabel}>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialMedia('twitter')}
            >
              <Ionicons name="logo-twitter" size={28} color="#1DA1F2" />
              <Text style={styles.socialLabel}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialMedia('facebook')}
            >
              <Ionicons name="logo-facebook" size={28} color="#4267B2" />
              <Text style={styles.socialLabel}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialMedia('youtube')}
            >
              <Ionicons name="logo-youtube" size={28} color="#FF0000" />
              <Text style={styles.socialLabel}>YouTube</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkItem} onPress={handleOpenWebsite}>
              <Ionicons name="globe-outline" size={20} color="#6B7280" />
              <Text style={styles.linkText}>Website Resmi</Text>
              <Ionicons name="open-outline" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem} onPress={handleTerms}>
              <Ionicons name="document-text-outline" size={20} color="#6B7280" />
              <Text style={styles.linkText}>Syarat & Ketentuan</Text>
              <Ionicons name="open-outline" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.linkItem, { borderBottomWidth: 0 }]} onPress={handlePrivacyPolicy}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" />
              <Text style={styles.linkText}>Kebijakan Privasi</Text>
              <Ionicons name="open-outline" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Rate App */}
        <TouchableOpacity style={styles.rateButton} onPress={handleRateApp}>
          <Ionicons name="star" size={24} color="#FFD580" />
          <View style={styles.rateContent}>
            <Text style={styles.rateTitle}>Suka dengan Habitin?</Text>
            <Text style={styles.rateDescription}>Beri kami rating di store</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>

        {/* Team Info */}
        <View style={styles.teamSection}>
          <Text style={styles.teamTitle}>Dibuat dengan ❤️ oleh Tim Habitin</Text>
          <Text style={styles.teamDescription}>
            © 2025 Habitin. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

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
    marginTop: 30,
    backgroundColor: '#FFFFFF',
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
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECF4E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 8,
  },
  version: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECF4E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  socialButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  socialLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 8,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 12,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  rateContent: {
    flex: 1,
    marginLeft: 12,
  },
  rateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  rateDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  teamSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  teamTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  teamDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});