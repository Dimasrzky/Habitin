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
import { ImageService } from '../../../src/services/storage/image.service';
import { PostType } from '../../../src/types/community.types';

interface PostTypeOption {
  type: PostType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const POST_TYPES: PostTypeOption[] = [
  {
    type: 'story',
    label: 'Cerita',
    icon: 'book-outline',
    color: '#10B981',
    bgColor: '#D1FAE5',
  },
  {
    type: 'progress',
    label: 'Progress',
    icon: 'trending-up-outline',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
  },
  {
    type: 'tips',
    label: 'Tips & Trick',
    icon: 'bulb-outline',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    type: 'photo',
    label: 'Foto',
    icon: 'image-outline',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const hasMetrics = () => {
    return metrics.steps.trim() !== '' ||
           metrics.calories.trim() !== '' ||
           metrics.distance.trim() !== '' ||
           metrics.duration.trim() !== '';
  };

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
      mediaTypes: ['images'],
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

  const handleSubmit = async () => {
    // Validation
    if (!content.trim()) {
      Alert.alert('Error', 'Konten postingan tidak boleh kosong');
      return;
    }

    if (postType === 'progress' && !hasMetrics()) {
      Alert.alert('Error', 'Postingan progress harus memiliki minimal satu metrik');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'Anda harus login terlebih dahulu');
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress('Mempersiapkan data...');

      console.log('🚀 Starting post creation process...');
      console.log('👤 User ID:', currentUser.uid);
      console.log('📝 Post type:', postType);
      console.log('📄 Content length:', content.trim().length);
      console.log('🖼️ Has image:', !!image);
      console.log('📊 Has metrics:', hasMetrics());

      // Prepare metrics (only for progress type)
      let metricsData: any = undefined;
      
      if (postType === 'progress' && hasMetrics()) {
        metricsData = {};
        
        if (metrics.steps.trim()) {
          const stepsNum = parseInt(metrics.steps.trim());
          if (!isNaN(stepsNum) && stepsNum > 0) {
            metricsData.steps = stepsNum;
          }
        }
        
        if (metrics.calories.trim()) {
          const caloriesNum = parseInt(metrics.calories.trim());
          if (!isNaN(caloriesNum) && caloriesNum > 0) {
            metricsData.calories = caloriesNum;
          }
        }
        
        if (metrics.distance.trim()) {
          const distanceNum = parseFloat(metrics.distance.trim());
          if (!isNaN(distanceNum) && distanceNum > 0) {
            metricsData.distance = distanceNum;
          }
        }
        
        if (metrics.duration.trim()) {
          const durationNum = parseInt(metrics.duration.trim());
          if (!isNaN(durationNum) && durationNum > 0) {
            metricsData.duration = durationNum;
          }
        }

        // Jika tidak ada metrics yang valid, set undefined
        if (Object.keys(metricsData).length === 0) {
          metricsData = undefined;
        }

        console.log('📊 Processed metrics:', metricsData);
      }

      // Upload image if exists
      let uploadedImageUrl: string | undefined = undefined;
      
      if (image) {
        setUploadProgress('Mengupload gambar...');
        console.log('📤 Uploading image to Supabase Storage...');
        console.log('📁 Image URI:', image);

        const uploadResult = await ImageService.uploadCommunityImage(
          currentUser.uid,
          image
        );

        if (uploadResult.error) {
          console.error('❌ Image upload failed:', uploadResult.error);
          throw new Error(`Gagal upload gambar: ${uploadResult.error}`);
        }

        if (!uploadResult.url) {
          throw new Error('Upload berhasil tetapi URL tidak ditemukan');
        }

        uploadedImageUrl = uploadResult.url;
        console.log('✅ Image uploaded successfully');
        console.log('🔗 Image URL:', uploadedImageUrl);
      }

      // Create post
      setUploadProgress('Membuat postingan...');
      console.log('💾 Creating post in database...');
      console.log('📦 Final data:', {
        userId: currentUser.uid,
        contentLength: content.trim().length,
        postType: postType,
        imageUrl: uploadedImageUrl,
        metricsKeys: metricsData ? Object.keys(metricsData) : []
      });

      const result = await CommunityService.createPost(
        currentUser.uid,
        content.trim(),
        postType,
        uploadedImageUrl,
        metricsData
      );

      if (result.error) {
        console.error('❌ Post creation failed:', result.error);
        throw new Error(result.error);
      }

      if (!result.data) {
        throw new Error('Post berhasil dibuat tetapi data tidak ditemukan');
      }

      console.log('✅ Post created successfully:', result.data.id);
      setUploadProgress('');

      Alert.alert(
        'Berhasil!', 
        'Postingan berhasil dibuat', 
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error creating post:', error);
      setUploadProgress('');
      
      Alert.alert(
        'Gagal Membuat Postingan', 
        error.message || 'Terjadi kesalahan tidak terduga. Silakan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedType = () => POST_TYPES.find(t => t.type === postType);

  const renderMetricsInput = () => {
    if (postType !== 'progress') return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="stats-chart" size={20} color="#059669" />
            <Text style={styles.sectionTitle}>Progress Metrics</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Tambahkan minimal satu metrik</Text>
        </View>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="footsteps" size={18} color="#3B82F6" />
            </View>
            <Text style={styles.metricLabel}>Langkah</Text>
            <TextInput
              style={styles.metricInput}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={metrics.steps}
              onChangeText={(text) =>
                setMetrics((prev) => ({ ...prev, steps: text }))
              }
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flame" size={18} color="#F59E0B" />
            </View>
            <Text style={styles.metricLabel}>Kalori</Text>
            <TextInput
              style={styles.metricInput}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={metrics.calories}
              onChangeText={(text) =>
                setMetrics((prev) => ({ ...prev, calories: text }))
              }
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="navigate" size={18} color="#10B981" />
            </View>
            <Text style={styles.metricLabel}>Jarak (km)</Text>
            <TextInput
              style={styles.metricInput}
              placeholder="0.0"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              value={metrics.distance}
              onChangeText={(text) =>
                setMetrics((prev) => ({ ...prev, distance: text }))
              }
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="time" size={18} color="#8B5CF6" />
            </View>
            <Text style={styles.metricLabel}>Durasi (menit)</Text>
            <TextInput
              style={styles.metricInput}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={metrics.duration}
              onChangeText={(text) =>
                setMetrics((prev) => ({ ...prev, duration: text }))
              }
              editable={!isSubmitting}
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
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.headerButton,
            { opacity: pressed ? 0.6 : isSubmitting ? 0.5 : 1 },
          ]}
        >
          <Ionicons name="close" size={26} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Buat Postingan Baru</Text>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          style={({ pressed }) => [
            styles.postButton,
            (!content.trim() || isSubmitting) && styles.postButtonDisabled,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.postButtonText}>Posting</Text>
          )}
        </Pressable>
      </View>

      {/* Loading Progress Indicator */}
      {isSubmitting && uploadProgress && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color="#10B981" />
          <Text style={styles.progressText}>{uploadProgress}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={!isSubmitting}
      >
        {/* Post Type Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="grid" size={20} color="#059669" />
              <Text style={styles.sectionTitle}>Tipe Postingan</Text>
              {postType && (
                <View
                  style={[
                    styles.selectedTypeBadge,
                    { backgroundColor: POST_TYPES.find((t) => t.type === postType)?.bgColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectedTypeLabel,
                      { color: POST_TYPES.find((t) => t.type === postType)?.color },
                    ]}
                  >
                    {POST_TYPES.find((t) => t.type === postType)?.label}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.typeGrid}>
            {POST_TYPES.map((option) => {
              const isSelected = postType === option.type;
              return (
                <Pressable
                  key={option.type}
                  style={({ pressed }) => [
                    styles.typeCard,
                    isSelected && styles.typeCardActive,
                    { opacity: pressed ? 0.8 : isSubmitting ? 0.5 : 1 },
                  ]}
                  onPress={() => setPostType(option.type)}
                  disabled={isSubmitting}
                >
                  <View
                    style={[
                      styles.typeIconWrapper,
                      { backgroundColor: isSelected ? option.color : option.bgColor },
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={28}
                      color={isSelected ? '#FFFFFF' : option.color}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="create" size={20} color="#059669" />
              <Text style={styles.sectionTitle}>Tulis Konten</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Bagikan {getSelectedType()?.label.toLowerCase()} Anda dengan komunitas
            </Text>
          </View>
          <View style={styles.contentCard}>
            <TextInput
              style={styles.contentInput}
              placeholder={`Ceritakan ${getSelectedType()?.label.toLowerCase()} Anda di sini...`}
              placeholderTextColor="#9CA3AF"
              multiline
              value={content}
              onChangeText={setContent}
              maxLength={1000}
              textAlignVertical="top"
              editable={!isSubmitting}
            />
            <View style={styles.contentFooter}>
              <View style={styles.characterCountContainer}>
                <Ionicons name="document-text-outline" size={14} color="#6B7280" />
                <Text style={styles.characterCount}>
                  {content.length}/1000
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Image Upload */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="image" size={20} color="#059669" />
              <Text style={styles.sectionTitle}>Foto</Text>
              <View style={styles.optionalBadge}>
                <Text style={styles.optionalText}>Opsional</Text>
              </View>
            </View>
            {image && (
              <Pressable
                onPress={handleRemoveImage}
                disabled={isSubmitting}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : isSubmitting ? 0.5 : 1,
                })}
              >
                <View style={styles.removeButton}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={styles.removeButtonText}>Hapus</Text>
                </View>
              </Pressable>
            )}
          </View>

          {image ? (
            <View style={styles.imagePreviewCard}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <Pressable
                onPress={handlePickImage}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.changeImageButton,
                  { opacity: pressed ? 0.8 : isSubmitting ? 0.5 : 1 },
                ]}
              >
                <Ionicons name="sync" size={16} color="#FFFFFF" />
                <Text style={styles.changeImageText}>Ganti Foto</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handlePickImage}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.imagePicker,
                { opacity: pressed ? 0.8 : isSubmitting ? 0.5 : 1 },
              ]}
            >
              <View style={styles.imagePickerIcon}>
                <Ionicons name="cloud-upload-outline" size={40} color="#10B981" />
              </View>
            </Pressable>
          )}
        </View>

        {/* Metrics Input (for progress type) */}
        {renderMetricsInput()}

        <View style={{ height: 24 }} />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  postButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  progressText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 28,
  },
  selectedTypeBadge: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedTypeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  typeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
  },
  typeCardActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  typeIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  contentInput: {
    padding: 16,
    fontSize: 15,
    color: '#111827',
    minHeight: 160,
    maxHeight: 300,
    lineHeight: 22,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
  },
  characterCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  optionalBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  optionalText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  removeButtonText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  imagePicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1FAE5',
    borderStyle: 'dashed',
  },
  imagePickerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imagePreview: {
    width: '100%',
    height: 240,
    backgroundColor: '#F3F4F6',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#10B981',
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  metricInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'center',
    minWidth: '100%',
  },
});