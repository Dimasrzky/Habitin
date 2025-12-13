// app/screens/cekKesehatan/uploadCrop.tsx

import { uploadLabResultWithProgress } from '@/services/health/healthAPI';
import { Ionicons } from '@expo/vector-icons';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =====================================================
// TYPES
// =====================================================

interface LoadingMessage {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

interface ProgressStepProps {
  label: string;
  status: 'pending' | 'active' | 'completed';
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function UploadCropScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // =====================================================
  // LOADING MESSAGES
  // =====================================================

  const loadingMessages: Record<number, LoadingMessage> = {
    0: {
      icon: 'cloud-upload-outline',
      title: 'Mengunggah Hasil Lab',
      subtitle: 'Mengamankan file Anda ke server...',
    },
    1: {
      icon: 'scan-outline',
      title: 'Memindai Dokumen',
      subtitle: 'Mengekstrak teks dari gambar...',
    },
    2: {
      icon: 'analytics-outline',
      title: 'Menganalisis Data',
      subtitle: 'Menghitung tingkat risiko kesehatan...',
    },
    3: {
      icon: 'save-outline',
      title: 'Menyimpan Hasil',
      subtitle: 'Menyimpan analisis ke database...',
    },
  };

  const loadingMessage = loadingMessages[currentStep];

  // =====================================================
  // HELPER: GET STEP STATUS
  // =====================================================

  const getStepStatus = (stepIndex: number): 'pending' | 'active' | 'completed' => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  // =====================================================
  // HANDLE CONFIRM & ANALYZE
  // =====================================================

  const handleConfirmAndAnalyze = async () => {
    try {
      setIsProcessing(true);
      setCurrentStep(0);

      console.log('🖼️ Compressing image...');
      
      // Step 1: Compress image
      const compressedImage = await manipulateAsync(
        imageUri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      console.log('✅ Image compressed');

      // Step 2: Upload & Analyze (dengan progress callback)
      console.log('🚀 Starting upload & analysis...');
      
      const result = await uploadLabResultWithProgress(
        compressedImage.uri,
        (step: number) => {
          console.log(`📊 Progress: Step ${step}`);
          setCurrentStep(step);
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Upload gagal');
      }

      // Success - Navigate to preview
      console.log('✅ Upload complete, navigating to preview...');
      
      router.replace({
        pathname: '/screens/cekKesehatan/uploadPreview' as any,
        params: {
          labResultId: result.labResultId,
          imageUrl: result.imageUrl,
          riskLevel: result.riskLevel,
        },
      });

    } catch (error) {
      console.error('❌ Error in upload process:', error);
      setIsProcessing(false);
      
      Alert.alert(
        'Upload Gagal',
        error instanceof Error ? error.message : 'Terjadi kesalahan saat mengunggah',
        [
          {
            text: 'Coba Lagi',
            style: 'default',
          },
        ]
      );
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          disabled={isProcessing}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Crop Gambar</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Image Preview */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <View style={styles.instructionRow}>
          <Ionicons name="checkmark-circle" size={20} color="#ABE7B2" />
          <Text style={styles.instructionText}>
            Pastikan semua teks terlihat jelas
          </Text>
        </View>
        <View style={styles.instructionRow}>
          <Ionicons name="checkmark-circle" size={20} color="#ABE7B2" />
          <Text style={styles.instructionText}>
            Hindari bayangan atau pantulan cahaya
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {/* Retake Button */}
        <TouchableOpacity
          style={[styles.retakeButton, isProcessing && styles.buttonDisabled]}
          onPress={() => router.back()}
          disabled={isProcessing}
        >
          <Ionicons name="camera-outline" size={20} color="#64748B" />
          <Text style={styles.retakeText}>Ambil Ulang</Text>
        </TouchableOpacity>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, isProcessing && styles.buttonDisabled]}
          onPress={handleConfirmAndAnalyze}
          disabled={isProcessing}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.confirmText}>Konfirmasi & Analisis</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            {/* Icon Container */}
            <View style={styles.loadingIconContainer}>
              <Ionicons name={loadingMessage.icon} size={40} color="#ABE7B2" />
            </View>

            {/* Spinner */}
            <ActivityIndicator size="large" color="#ABE7B2" style={styles.spinner} />

            {/* Title & Subtitle */}
            <Text style={styles.loadingTitle}>{loadingMessage.title}</Text>
            <Text style={styles.loadingSubtitle}>{loadingMessage.subtitle}</Text>

            {/* Progress Steps */}
            <View style={styles.progressSteps}>
              <ProgressStep label="Upload" status={getStepStatus(0)} />
              <ProgressStep label="OCR" status={getStepStatus(1)} />
              <ProgressStep label="Analisis" status={getStepStatus(2)} />
              <ProgressStep label="Simpan" status={getStepStatus(3)} />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// =====================================================
// PROGRESS STEP COMPONENT
// =====================================================

function ProgressStep({ label, status }: ProgressStepProps) {
  return (
    <View style={styles.stepContainer}>
      <View
        style={[
          styles.stepDot,
          status === 'completed' && styles.stepDotCompleted,
          status === 'active' && styles.stepDotActive,
        ]}
      >
        {status === 'completed' && (
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        )}
        {status === 'active' && <View style={styles.stepDotInner} />}
      </View>
      <Text
        style={[
          styles.stepLabel,
          status === 'active' && styles.stepLabelActive,
          status === 'completed' && styles.stepLabelCompleted,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  
  // Image Preview
  imageContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  
  // Instructions
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  
  // Action Buttons
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    gap: 8,
  },
  retakeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2aaa39ff',
    gap: 8,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: SCREEN_WIDTH - 64,
    alignItems: 'center',
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  spinner: {
    marginVertical: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // Progress Steps
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  stepContainer: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#ABE7B2',
  },
  stepDotCompleted: {
    backgroundColor: '#22C55E',
  },
  stepDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#ABE7B2',
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: '#22C55E',
    fontWeight: '500',
  },
});