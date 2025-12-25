// components/AvatarPicker.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AvatarPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectAvatar: (avatar: AvatarOption) => void;
  currentAvatar?: AvatarOption;
}

export interface AvatarOption {
  type: 'emoji' | 'image';
  value: string; // emoji character or image URI
}

// Koleksi avatar lucu
const AVATAR_EMOJIS = [
  '😊', '😎', '🥳', '🤗', '😺',
  '🦄', '🐶', '🐱', '🐼', '🐨',
  '🦊', '🐸', '🐯', '🦁', '🐵',
  '🌟', '⭐', '🌈', '🔥', '💪',
  '🎯', '🏆', '💎', '🎨', '🎭',
  '🎪', '🎡', '🎢', '🎸', '🎺'
];

export default function AvatarPicker({
  visible,
  onClose,
  onSelectAvatar,
  currentAvatar
}: AvatarPickerProps) {
  const [selectedTab, setSelectedTab] = useState<'emoji' | 'upload'>('emoji');

  const handlePickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Izin Diperlukan',
          'Aplikasi memerlukan izin untuk mengakses galeri foto Anda'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const avatar: AvatarOption = {
          type: 'image',
          value: result.assets[0].uri,
        };
        onSelectAvatar(avatar);
        onClose();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Gagal memilih foto');
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    const avatar: AvatarOption = {
      type: 'emoji',
      value: emoji,
    };
    onSelectAvatar(avatar);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pilih Foto Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'emoji' && styles.tabActive]}
              onPress={() => setSelectedTab('emoji')}
            >
              <Text style={[styles.tabText, selectedTab === 'emoji' && styles.tabTextActive]}>
                Avatar Lucu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'upload' && styles.tabActive]}
              onPress={() => setSelectedTab('upload')}
            >
              <Text style={[styles.tabText, selectedTab === 'upload' && styles.tabTextActive]}>
                Upload Foto
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {selectedTab === 'emoji' ? (
              <View style={styles.emojiGrid}>
                {AVATAR_EMOJIS.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.emojiItem,
                      currentAvatar?.type === 'emoji' &&
                      currentAvatar?.value === emoji &&
                      styles.emojiItemSelected
                    ]}
                    onPress={() => handleSelectEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.uploadSection}>
                <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                  <Ionicons name="cloud-upload-outline" size={48} color="#ABE7B2" />
                  <Text style={styles.uploadTitle}>Pilih Foto dari Galeri</Text>
                  <Text style={styles.uploadSubtitle}>
                    Foto akan dipotong menjadi persegi
                  </Text>
                </TouchableOpacity>

                <View style={styles.uploadInfo}>
                  <View style={styles.infoItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#ABE7B2" />
                    <Text style={styles.infoText}>Format: JPG, PNG</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#ABE7B2" />
                    <Text style={styles.infoText}>Ukuran maksimal: 5MB</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#ABE7B2" />
                    <Text style={styles.infoText}>Rasio 1:1 (persegi)</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#ECF4E8',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 20,
  },
  emojiItem: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiItemSelected: {
    borderColor: '#ABE7B2',
    backgroundColor: '#ECF4E8',
  },
  emojiText: {
    fontSize: 32,
  },
  uploadSection: {
    paddingBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  uploadInfo: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
  },
});
