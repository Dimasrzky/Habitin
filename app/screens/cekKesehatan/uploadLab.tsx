// app/(tabs)/cekKesehatan/upload-lab.tsx

import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function UploadLabScreen() {
  const router = useRouter();
  //const [isLoading, setIsLoading] = useState(false);

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Akses kamera diperlukan untuk mengambil foto.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        router.push({
          pathname: '/screens/cekKesehatan/uploadPreview' as any,
          params: { imageUri: result.assets[0].uri, type: 'photo' }
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mengambil foto');
      console.error(error);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        router.push({
          pathname: '/screens/cekKesehatan/uploadPreview' as any,
          params: { imageUri: result.assets[0].uri, type: 'gallery' }
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih gambar');
      console.error(error);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        router.push({
          pathname: '/screens/cekKesehatan/uploadPreview' as any,
          params: { 
            documentUri: result.assets[0].uri, 
            documentName: result.assets[0].name, 
            type: 'pdf' 
          }
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih dokumen');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Upload Hasil Lab</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon Section */}
        <View style={styles.iconSection}>
          <View style={styles.mainIcon}>
            <Ionicons name="cloud-upload" size={64} color="#ABE7B2" />
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Upload Hasil Laboratorium</Text>
          <Text style={styles.subtitle}>
            Format: JPG, PNG, PDF (Maksimal 5MB)
          </Text>
        </View>

        {/* Upload Options */}
        <View style={styles.optionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleTakePhoto}
          >
            <View style={styles.optionIcon}>
                <Ionicons name="camera" size={32} color="#ABE7B2" />
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Ambil Foto</Text>
              </View>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handlePickImage}
          >
            <View style={styles.optionIcon}>
                <Ionicons name="images" size={32} color="#93BFC7" />
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Pilih Galeri</Text>
              </View>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handlePickDocument}
          >
            <View style={styles.optionIcon}>
                <Ionicons name="document" size={32} color="#FFD580" />
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Upload PDF</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color="#FFD580" />
            <Text style={styles.tipsTitle}>Tips Upload</Text>
          </View>
          <View style={styles.tipsList}>
            <TipItem text="Pastikan foto jelas dan tidak blur" />
            <TipItem text="Pencahayaan cukup terang" />
            <TipItem text="Tampilkan seluruh hasil lab" />
            <TipItem text="Hindari bayangan atau refleksi" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const TipItem = ({ text }: { text: string }) => (
  <View style={styles.tipItem}>
    <Ionicons name="checkmark-circle" size={16} color="#ABE7B2" />
    <Text style={styles.tipText}>{text}</Text>
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
    paddingVertical: 23,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
    top: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    top: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  iconSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  mainIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 25,
    marginBottom: 24,
    justifyContent: 'center',
    
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIcon: {
    width: 100,
    height: 100,
    padding: 21,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 8,

  },
  optionDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#78350F',
    flex: 1,
  },
});