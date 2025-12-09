import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

export default function CompleteScreen() {
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
  }, [checkScale, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleContinue = () => {
    console.log('✅ Onboarding completed, navigating to home');
    // Redirect to home screen
    router.replace('/(tabs)');
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

        <Text style={styles.title}>Selamat!</Text>
        <Text style={styles.subtitle}>
          Profil kesehatan Anda telah berhasil dibuat
        </Text>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Mulai Gunakan Habitin</Text>
        </TouchableOpacity>
      </View>
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
});