// app/screens/community/CreatePost.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { auth } from '../../../src/config/firebase.config';
import { CommunityService } from '../../../src/services/database/community.service';
import { UserService } from '../../../src/services/database/user.service';
import { PostType } from '../../../src/types/community.types';

interface PostTypeOption {
  type: PostType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const POST_TYPES: PostTypeOption[] = [
  {
    type: 'story',
    label: 'Cerita',
    icon: 'book-outline',
    color: '#ABE7B2',
  },
  {
    type: 'progress',
    label: 'Progress',
    icon: 'trending-up-outline',
    color: '#3B82F6',
  },
  {
    type: 'tips',
    label: 'Tips & Trick',
    icon: 'bulb-outline',
    color: '#F59E0B',
  },
  {
    type: 'photo',
    label: 'Foto',
    icon: 'image-outline',
    color: '#10B981',
  },
];

export default function CreatePostScreen() {
  const router = useRouter();
  const [postType, setPostType] = useState<PostType>('story');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    steps: '',
    calories: '',
    distance: '',
    duration: '',
  });
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Kami membutuhkan izin untuk mengakses galeri foto Anda.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Konten tidak boleh kosong');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'User tidak terautentikasi');
      return;
    }

    try {
      setUploading(true);

      // Ensure user exists in Supabase (sync from Firebase)
      const userEmail = currentUser.email || 'unknown@email.com';
      const userName = currentUser.displayName || undefined;
      const userResult = await UserService.ensureUserExists(
        currentUser.uid,
        userEmail,
        userName
      );

      if (userResult.error) {
        throw new Error('Gagal menyinkronkan data user: ' + userResult.error);
      }

      let imageUrl: string | null = null;

      // Upload image if exists
      if (image) {
        const fileName = `post_${Date.now()}.jpg`;
        const uploadResult = await CommunityService.uploadImage(
          currentUser.uid,
          image,
          fileName
        );

        if (uploadResult.error) {
          throw new Error(uploadResult.error);
        }

        imageUrl = uploadResult.data;
      }

      // Prepare metrics data (only for progress type)
      let metricsData = null;
      if (postType === 'progress') {
        const hasMetrics =
          metrics.steps ||
          metrics.calories ||
          metrics.distance ||
          metrics.duration;

        if (hasMetrics) {
          metricsData = {
            steps: metrics.steps ? parseInt(metrics.steps) : undefined,
            calories: metrics.calories ? parseInt(metrics.calories) : undefined,
            distance: metrics.distance ? parseFloat(metrics.distance) : undefined,
            duration: metrics.duration ? parseInt(metrics.duration) : undefined,
          };
        }
      }

      // Create post
      const postData = {
        user_id: currentUser.uid,
        post_type: postType,
        content: content.trim(),
        image_url: imageUrl,
        metrics: metricsData,
      };

      console.log('📝 Creating post with data:', JSON.stringify(postData, null, 2));
      console.log('📝 Post type:', postType, '| Type:', typeof postType, '| Length:', postType.length);

      const result = await CommunityService.createPost(postData);

      if (result.error) {
        throw new Error(result.error);
      }

      Alert.alert('Berhasil', 'Postingan Anda telah dibagikan!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'Gagal membuat postingan');
    } finally {
      setUploading(false);
    }
  };

  const renderMetricsInput = () => {
    if (postType !== 'progress') return null;

    return (
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Metrics (Opsional)</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricInput}>
            <Text style={styles.metricLabel}>Langkah</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={metrics.steps}
              onChangeText={(text) =>
                setMetrics((prev) => ({ ...prev, steps: text }))
              }
            />
          </View>

          <View style={styles.metricInput}>
            <Text style={styles.metricLabel}>Kalori</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={metrics.calories}
              onChangeText={(text) =>
                setMetrics((prev) => ({ ...prev, calories: text }))
              }
            />
          </View>

          <View style={styles.metricInput}>
            <Text style={styles.metricLabel}>Jarak (km)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              keyboardType="decimal-pad"
              value={metrics.distance}
              onChangeText={(text) =>
                setMetrics((prev) => ({ ...prev, distance: text }))
              }
            />
          </View>

          <View style={styles.metricInput}>
            <Text style={styles.metricLabel}>Durasi (menit)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={metrics.duration}
              onChangeText={(text) =>
                setMetrics((prev) => ({ ...prev, duration: text }))
              }
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="close" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Buat Postingan</Text>
        <Pressable
          onPress={handlePost}
          disabled={uploading || !content.trim()}
          style={({ pressed }) => [
            styles.postButton,
            { opacity: pressed || uploading || !content.trim() ? 0.7 : 1 },
          ]}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#ABE7B2" />
          ) : (
            <Text
              style={[
                styles.postButtonText,
                (!content.trim() || uploading) && styles.postButtonTextDisabled,
              ]}
            >
              Posting
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Post Type Selector */}
        <View style={styles.typeSelector}>
          <Text style={styles.sectionTitle}>Tipe Postingan</Text>
          <View style={styles.typeOptions}>
            {POST_TYPES.map((option) => (
              <Pressable
                key={option.type}
                style={({ pressed }) => [
                  styles.typeOption,
                  postType === option.type && styles.typeOptionActive,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => setPostType(option.type)}
              >
                <View
                  style={[
                    styles.typeIconContainer,
                    { backgroundColor: `${option.color}20` },
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={option.color}
                  />
                </View>
                <Text style={styles.typeLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Content Input */}
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Konten</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Bagikan cerita, progress, atau tips kesehatan Anda..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {content.length}/1000 karakter
          </Text>
        </View>

        {/* Image Upload */}
        <View style={styles.imageContainer}>
          <View style={styles.imageTitleRow}>
            <Text style={styles.sectionTitle}>Foto (Opsional)</Text>
            {image && (
              <Pressable
                onPress={handleRemoveImage}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </Pressable>
            )}
          </View>

          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <Pressable
              onPress={handlePickImage}
              style={({ pressed }) => [
                styles.imagePicker,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="camera-outline" size={32} color="#ABE7B2" />
              <Text style={styles.imagePickerText}>Tap untuk upload foto</Text>
            </Pressable>
          )}
        </View>

        {/* Metrics Input (for progress type) */}
        {renderMetricsInput()}

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  postButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ABE7B2',
  },
  postButtonTextDisabled: {
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  typeSelector: {
    marginBottom: 24,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  typeOptionActive: {
    borderColor: '#ABE7B2',
    backgroundColor: '#F0FDF4',
  },
  typeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  contentContainer: {
    marginBottom: 24,
  },
  contentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 6,
  },
  imageContainer: {
    marginBottom: 24,
  },
  imageTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  metricsContainer: {
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricInput: {
    flex: 1,
    minWidth: '45%',
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
