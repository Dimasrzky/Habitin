// app/screens/cekKesehatan/uploadPreview.tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function UploadPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  const { imageUri, documentName, type } = params;

  const handleConfirm = async () => {
    setIsProcessing(true);
    
    // Simulate API call untuk OCR processing
    setTimeout(() => {
      setIsProcessing(false);
      router.replace('/screens/cekKesehatan/uploadHasil' as any);
    }, 3000);
  };

  const handleRetake = () => {
    router.back();
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

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#93BFC7" />
            <Text style={styles.infoTitle}>Yang Akan Dianalisis</Text>
          </View>
          <View style={styles.infoList}>
            <InfoItem text="Kadar Gula Darah" />
            <InfoItem text="Kolesterol Total" />
            <InfoItem text="Kolesterol LDL" />
            <InfoItem text="Kolesterol HDL" />
            <InfoItem text="Trigliserida" />
            <InfoItem text="HbA1c (jika ada)" />
          </View>
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
          ]}
          onPress={handleRetake}
          disabled={isProcessing}
        >
          <Ionicons name="refresh" size={20} color="#6B7280" />
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
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.confirmText}>Konfirmasi & Analisis</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const InfoItem = ({ text }: { text: string }) => (
  <View style={styles.infoItem}>
    <Ionicons name="checkmark" size={16} color="#ABE7B2" />
    <Text style={styles.infoItemText}>{text}</Text>
  </View>
);

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
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoItemText: {
    fontSize: 13,
    color: '#374151',
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
    padding: 16,
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
    fontSize: 15,
    fontWeight: '600',
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
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});