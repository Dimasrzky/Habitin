import { router } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useOnboarding } from '../../src/context/OnboardingContext';

const REMINDER_FREQUENCY_OPTIONS = [
  '1 bulan sekali',
  '3 bulan sekali',
  '6 bulan sekali',
];

export default function NotificationScreen() {
  const { data, updateData } = useOnboarding();

  const handleNext = () => {
    router.push('/onboarding/consent');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
        <Text style={styles.stepText}>Step 6 of 8</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Preferensi Notifikasi</Text>
        <Text style={styles.subtitle}>
          Atur pengingat untuk membantu Anda menjaga kesehatan
        </Text>

        {/* Checkup Reminder */}
        <View style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔔</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Pengingat Cek Kesehatan</Text>
              <Text style={styles.notificationDescription}>
                Kami akan mengingatkan Anda untuk melakukan pemeriksaan kesehatan
                rutin
              </Text>
            </View>
            <Switch
              value={data.checkupReminder}
              onValueChange={(value) => updateData('checkupReminder', value)}
              trackColor={{ false: '#D1D5DB', true: '#81C784' }}
              thumbColor={data.checkupReminder ? '#4CAF50' : '#F5F5F5'}
            />
          </View>

          {/* Frequency Options */}
          {data.checkupReminder && (
            <View style={styles.frequencyContainer}>
              <Text style={styles.frequencyLabel}>Frekuensi pengingat:</Text>
              {REMINDER_FREQUENCY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.frequencyOption,
                    data.reminderFrequency === option && styles.frequencyOptionSelected,
                  ]}
                  onPress={() => updateData('reminderFrequency', option)}
                >
                  <View style={styles.radio}>
                    {data.reminderFrequency === option && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.frequencyText,
                      data.reminderFrequency === option && styles.frequencyTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Daily Tips */}
        <View style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>💡</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Tips Kesehatan Harian</Text>
              <Text style={styles.notificationDescription}>
                Dapatkan tips dan informasi kesehatan yang berguna setiap hari
              </Text>
            </View>
            <Switch
              value={data.dailyTips}
              onValueChange={(value) => updateData('dailyTips', value)}
              trackColor={{ false: '#D1D5DB', true: '#81C784' }}
              thumbColor={data.dailyTips ? '#4CAF50' : '#F5F5F5'}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ Anda dapat mengubah pengaturan notifikasi kapan saja di menu Pengaturan
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Lanjut</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 28,
    color: '#212121',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  stepText: {
    marginTop: 8,
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 30,
    lineHeight: 24,
  },
  notificationCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  frequencyContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  frequencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  frequencyOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  frequencyText: {
    fontSize: 14,
    color: '#424242',
  },
  frequencyTextSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});