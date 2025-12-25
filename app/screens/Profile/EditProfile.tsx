// app/screens/Profile/EditProfile.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AvatarPicker, { AvatarOption } from '../../../components/AvatarPicker';
import { auth } from '../../../src/config/firebase.config';
import { UserService } from '../../../src/services/database/user.service';

export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState('Budi Santoso');
  const [email, setEmail] = useState('budi.santoso@email.com');
  const [bio, setBio] = useState('Saya senang hidup sehat!');
  const [avatar, setAvatar] = useState<AvatarOption>({ type: 'emoji', value: '😊' });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Load user data from Supabase and AsyncStorage
  const loadUserData = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        // Load from Supabase first
        console.log('📥 Loading user data from Supabase...');
        const result = await UserService.getUserById(currentUser.uid);

        if (result.data) {
          const userData = result.data;
          setName(userData.full_name || '');
          setEmail(userData.email || currentUser.email || '');

          // Set avatar if user has avatar_url in database
          if (userData.avatar_url) {
            setAvatar({ type: 'image', value: userData.avatar_url });
          }

          console.log('✅ User data loaded from Supabase');
        } else {
          // Fallback to email from Firebase Auth
          setEmail(currentUser.email || '');
        }
      }

      // Also load from AsyncStorage for bio and other local data
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData.bio) setBio(userData.bio);

        // Only use AsyncStorage avatar if no Supabase avatar
        if (userData.avatar && !avatar.value) {
          setAvatar(userData.avatar);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Reload data when screen is focused (after coming back from another screen)
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Nama dan email harus diisi');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'User tidak terautentikasi');
      return;
    }

    try {
      // Ensure user exists in Supabase (sync from Firebase)
      const userEmail = currentUser.email || 'unknown@email.com';
      const userResult = await UserService.ensureUserExists(
        currentUser.uid,
        userEmail,
        name
      );

      if (userResult.error) {
        console.error('❌ Error ensuring user exists:', userResult.error);
        Alert.alert('Error', 'Gagal menyinkronkan data user: ' + userResult.error);
        return;
      }

      console.log('✅ User exists in database');

      // Check if avatar is a NEW image (local file URI, not http URL)
      const isNewAvatar = avatar.type === 'image' && avatar.value && !avatar.value.startsWith('http');

      if (isNewAvatar) {
        console.log('📤 Uploading new avatar to Supabase...');
        console.log('Avatar URI:', avatar.value);

        const uploadResult = await UserService.updateAvatar(currentUser.uid, avatar.value);

        if (uploadResult.error) {
          console.error('❌ Error uploading avatar:', uploadResult.error);
          Alert.alert('Error', 'Gagal upload avatar: ' + uploadResult.error);
          return; // Stop if avatar upload fails
        }

        console.log('✅ Avatar uploaded successfully');
        console.log('✅ Avatar URL saved to database:', uploadResult.data?.avatar_url);
      }

      // Update user profile (name) in Supabase
      console.log('💾 Updating user full_name in Supabase...');
      const result = await UserService.updateUser(currentUser.uid, {
        full_name: name,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      console.log('✅ Profile updated successfully');

      // Also save to AsyncStorage for local cache
      const userData = {
        name,
        email,
        bio,
        avatar,
      };
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      Alert.alert('Berhasil', 'Profile berhasil diperbarui', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('❌ Error saving profile:', error);
      Alert.alert('Error', error.message || 'Gagal menyimpan profile');
    }
  };

  const handleSelectAvatar = (selectedAvatar: AvatarOption) => {
    setAvatar(selectedAvatar);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowAvatarPicker(true)}
          >
            {avatar.type === 'emoji' ? (
              <Text style={styles.avatarEmoji}>{avatar.value}</Text>
            ) : (
              <Image source={{ uri: avatar.value }} style={styles.avatarImage} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.changeAvatarButton}
            onPress={() => setShowAvatarPicker(true)}
          >
            <Text style={styles.changeAvatarText}>Ubah Foto Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Nama Lengkap */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Masukkan email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Ceritakan tentang dirimu"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Picker Modal */}
      <AvatarPicker
        visible={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        onSelectAvatar={handleSelectAvatar}
        currentAvatar={avatar}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 30,
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
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECF4E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarEmoji: {
    fontSize: 50,
  },
  avatarImage: {
    width: 100,
    height: 100,
  },
  changeAvatarButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ABE7B2',
  },
  form: {
    paddingVertical: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
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