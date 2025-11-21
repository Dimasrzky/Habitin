// app/screens/Profile/NotificationSettings.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function NotificationSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'daily_reminder',
      title: 'Pengingat Harian',
      description: 'Pengingat untuk mengecek kesehatan setiap hari',
      enabled: true,
      icon: 'notifications',
    },
    {
      id: 'challenge_notification',
      title: 'Notifikasi Tantangan',
      description: 'Pemberitahuan tentang tantangan baru dan progres',
      enabled: true,
      icon: 'trophy',
    },
    {
      id: 'community_updates',
      title: 'Update Komunitas',
      description: 'Notifikasi tentang aktivitas di komunitas',
      enabled: false,
      icon: 'people',
    },
    {
      id: 'achievement',
      title: 'Pencapaian',
      description: 'Notifikasi saat mendapatkan badge atau level baru',
      enabled: true,
      icon: 'star',
    },
    {
      id: 'health_tips',
      title: 'Tips Kesehatan',
      description: 'Tips kesehatan harian dari Habitin',
      enabled: true,
      icon: 'bulb',
    },
    {
      id: 'water_reminder',
      title: 'Pengingat Minum',
      description: 'Pengingat untuk minum air secara teratur',
      enabled: false,
      icon: 'water',
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(setting => 
      setting.id === id 
        ? { ...setting, enabled: !setting.enabled }
        : setting
    ));
  };

  const handleSave = () => {
    Alert.alert('Berhasil', 'Pengaturan notifikasi telah disimpan', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pengaturan Notifikasi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#93BFC7" />
          <Text style={styles.infoText}>
            Atur notifikasi sesuai preferensi Anda untuk tetap update dengan aktivitas kesehatan
          </Text>
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          {settings.map((setting, index) => (
            <View 
              key={setting.id}
              style={[
                styles.settingItem,
                index === settings.length - 1 && styles.settingItemLast
              ]}
            >
              <View style={styles.settingIcon}>
                <Ionicons name={setting.icon} size={24} color="#ABE7B2" />
              </View>
              
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: '#E5E7EB', true: '#ABE7B2' }}
                thumbColor={setting.enabled ? '#FFFFFF' : '#F3F4F6'}
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          ))}
        </View>

        {/* Notification Time */}
        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Waktu Notifikasi</Text>
          <TouchableOpacity style={styles.timeButton}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.timeText}>08:00 - 22:00</Text>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
          <Text style={styles.timeDescription}>
            Notifikasi hanya akan dikirim dalam rentang waktu ini
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Simpan Pengaturan</Text>
        </TouchableOpacity>
      </View>
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 18,
  },
  settingsList: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECF4E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  timeSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
    marginBottom: 8,
  },
  timeText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  timeDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#ABE7B2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});