import { useLabUpload } from '@/hooks/useLabUpload';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { markLabAsUploaded } from '../../../src/utils/labUploadHelper'; // ← TAMBAHKAN INI

export default function UploadPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const { processLabUpload, uploadProgress } = useLabUpload();

  const { imageUri, documentName, type } = params;

  const handleConfirm = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);

    try {
      console.log('🚀 Starting upload process...');
      
      const result = await processLabUpload(imageUri as string);
      
      console.log('📊 Upload result:', result);

      if (result.success) {
        console.log('✅ Upload process complete!');
        
        // ✅ TAMBAHKAN: Mark lab as uploaded
        try {
          await markLabAsUploaded();
          console.log('✅ Lab status updated in AsyncStorage');
        } catch (storageError) {
          console.error('⚠️ Failed to update lab status:', storageError);
          // Continue anyway, tidak perlu gagalkan proses
        }
        
        // Navigate to result screen with data
        router.replace({
          pathname: '/screens/cekKesehatan/uploadHasil',
          params: {
            imageUrl: result.imageUrl,
            riskLevel: result.riskLevel,
            labResultId: result.labResultId,
          },
        });
      } else {
        // Show error
        Alert.alert(
          'Upload Gagal',
          result.error || 'Terjadi kesalahan saat mengupload hasil lab',
          [{ text: 'OK', onPress: () => setIsProcessing(false) }]
        );
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      Alert.alert(
        'Error',
        'Terjadi kesalahan tak terduga. Silakan coba lagi.',
        [{ text: 'OK', onPress: () => setIsProcessing(false) }]
      );
    }
  };

  const handleRetake = () => {
    router.back();
  };

  // Get loading message based on progress
  const getLoadingMessage = () => {
    switch (uploadProgress) {
      case 'uploading':
        return {
          title: 'Mengupload File...',
          subtitle: 'Menyimpan gambar ke server',
          icon: 'cloud-upload' as const,
        };
      case 'ocr':
        return {
          title: 'Membaca Hasil Lab...',
          subtitle: 'Mengekstrak teks dari gambar',
          icon: 'scan' as const,
        };
      case 'analyzing':
        return {
          title: 'Menganalisis Data...',
          subtitle: 'Menghitung risiko kesehatan',
          icon: 'analytics' as const,
        };
      case 'saving':
        return {
          title: 'Menyimpan Hasil...',
          subtitle: 'Menyimpan ke database',
          icon: 'save' as const,
        };
      default:
        return {
          title: 'Memproses...',
          subtitle: 'Mohon tunggu',
          icon: 'hourglass' as const,
        };
    }
  };

  const loadingMessage = getLoadingMessage();

  // Get progress step status
  const getStepStatus = (step: number): 'completed' | 'active' | 'pending' => {
    const steps = ['uploading', 'ocr', 'analyzing', 'saving'];
    const currentStepIndex = uploadProgress ? steps.indexOf(uploadProgress) : -1;
    
    if (currentStepIndex === -1) return 'pending';
    if (step < currentStepIndex) return 'completed';
    if (step === currentStepIndex) return 'active';
    return 'pending';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Preview & Konfirmasi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview Section */}
        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Preview File</Text>
          
          {type === 'pdf' ? (
            <View style={styles.pdfPreview}>
              <Ionicons name="document" size={64} color="#FFD580" />
              <Text style={styles.pdfName} numberOfLines={1}>
                {documentName || 'Hasil Lab.pdf'}
              </Text>
              <Text style={styles.pdfSize}>PDF Document</Text>
            </View>
          ) : (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: imageUri as string }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Ionicons name="lock-closed" size={18} color="#6B7280" />
            <Text style={styles.privacyTitle}>Privasi Terjamin</Text>
          </View>
          <Text style={styles.privacyText}>
            Data hasil lab Anda akan dienkripsi dan hanya dapat diakses oleh Anda. 
            Kami tidak akan membagikan data ke pihak ketiga tanpa izin Anda.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Pressable
          style={({ pressed }) => [
            styles.retakeButton,
            { opacity: pressed ? 0.8 : 1 },
            isProcessing && styles.buttonDisabled,
          ]}
          onPress={handleRetake}
          disabled={isProcessing}
        >
          <Text style={styles.retakeText}>Ambil Ulang</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.confirmButton,
            { opacity: pressed ? 0.9 : 1 },
            isProcessing && styles.buttonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.confirmText}>Memproses...</Text>
            </>
          ) : (
            <>
              <Text style={styles.confirmText}>Konfirmasi & Analisis</Text>
            </>
          )}
        </Pressable>
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
              <ProgressStep 
                label="Upload" 
                status={getStepStatus(0)} 
              />
              <ProgressStep 
                label="OCR" 
                status={getStepStatus(1)} 
              />
              <ProgressStep 
                label="Analisis" 
                status={getStepStatus(2)} 
              />
              <ProgressStep 
                label="Simpan" 
                status={getStepStatus(3)} 
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const ProgressStep = ({ 
  label, 
  status 
}: { 
  label: string; 
  status: 'completed' | 'active' | 'pending';
}) => {
  const getColor = () => {
    if (status === 'completed') return '#ABE7B2';
    if (status === 'active') return '#ABE7B2';
    return '#E5E7EB';
  };

  return (
    <View style={styles.progressStep}>
      <View style={[styles.progressStepCircle, { backgroundColor: getColor() }]}>
        {status === 'completed' ? (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        ) : (
          <View style={[
            styles.progressStepDot, 
            { backgroundColor: status === 'active' ? '#FFFFFF' : '#9CA3AF' }
          ]} />
        )}
      </View>
      <Text style={[
        styles.progressStepLabel,
        { color: status === 'pending' ? '#9CA3AF' : '#1F2937' }
      ]}>
        {label}
      </Text>
    </View>
  );
};

// =====================================================
// STYLES
// =====================================================

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
    marginTop: 30,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  pdfPreview: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  pdfName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 12,
    maxWidth: '80%',
  },
  pdfSize: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  privacyCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  privacyText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: 25,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  retakeText: {
    fontSize: 14,
    fontWeight: '600',
    left: 30,
    bottom: 5,
    color: '#6B7280',
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ABE7B2',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '500',
    left: 90,
    bottom: 5,
    color: '#60d955ff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECF4E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  spinner: {
    marginVertical: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressStepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressStepLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});