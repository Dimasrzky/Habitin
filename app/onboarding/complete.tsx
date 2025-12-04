import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring
} from 'react-native-reanimated';

export default function CompleteScreen() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const scale = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    // Animation for success icon
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });

    // Animation for checkmark
    setTimeout(() => {
      checkScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
    }, 300);

    // Show upload modal after 2 seconds
    setTimeout(() => {
      setShowUploadModal(true);
    }, 2000);
  }, [scale, checkScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleUploadLater = () => {
    setShowUploadModal(false);
    router.replace('/(tabs)');
  };

  const handleUploadNow = () => {
    setShowUploadModal(false);
    router.replace('/(tabs)/upload'); // Sesuaikan dengan route upload Anda
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <View style={styles.successCircle}>
            <Animated.Text style={[styles.checkIcon, checkAnimatedStyle]}>
              ✓
            </Animated.Text>
          </View>
        </Animated.View>

        <Text style={styles.title}>Selamat! 🎉</Text>
        <Text style={styles.subtitle}>
          Profil kesehatan Anda telah berhasil dibuat
        </Text>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Apa yang bisa Anda lakukan:</Text>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>📊</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Upload Hasil Lab</Text>
              <Text style={styles.benefitDescription}>
                Scan dan analisis hasil lab Anda dengan AI
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>📈</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Monitor Kesehatan</Text>
              <Text style={styles.benefitDescription}>
                Lacak perkembangan kondisi kesehatan Anda
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>💡</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Rekomendasi Personal</Text>
              <Text style={styles.benefitDescription}>
                Dapatkan saran kesehatan yang disesuaikan untuk Anda
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => setShowUploadModal(true)}
        >
          <Text style={styles.continueButtonText}>Mulai Gunakan Habitin</Text>
        </TouchableOpacity>
      </View>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="fade"
        onRequestClose={handleUploadLater}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIcon}>📋</Text>
            </View>

            <Text style={styles.modalTitle}>Upload Hasil Lab?</Text>
            <Text style={styles.modalDescription}>
              Apakah Anda ingin mengupload hasil lab sekarang atau nanti?
            </Text>

            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={handleUploadNow}
            >
              <Text style={styles.modalPrimaryButtonText}>
                Upload Sekarang
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={handleUploadLater}
            >
              <Text style={styles.modalSecondaryButtonText}>Nanti Saja</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  checkIcon: {
    fontSize: 60,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  benefitIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalPrimaryButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSecondaryButton: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
});