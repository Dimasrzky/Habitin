// app/loginSistem/landing.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Landing() {
  const router = useRouter();

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem('hasSeenLanding', 'true');
      router.push('loginSistem/login' as any);
    } catch (error) {
      console.error('Error saving landing status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#ffffffff', '#ffffffff', '#70d19aff', '#53b37dff']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>HABITIN</Text>
        </View>

        <View style={styles.illustrationContainer}>
          <LottieView
            source={require('../../assets/json/Landing.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>Temani Perjalanan Sehatmu</Text>
          <Text style={styles.subtitle}>
            Pantau kondisi tubuh, ikuti tantangan sehat, dan raih hidup yang lebih baik setiap hari.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Lanjutkan</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.08,
  },
  logo: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 8,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
  },
  animation: {
    width: width * 1,
    height: width * 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000000ff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#ffffffff',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#256742ff',
    fontSize: 18,
    fontWeight: '700',
  },
});