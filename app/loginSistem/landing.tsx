// screens/loginSistem/landing.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // Ganti useNavigation dengan useRouter
import React from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Landing = () => {
  const router = useRouter();

  const handleContinue = async () => {
    try {
      // Tandai bahwa user sudah melihat landing page
      await AsyncStorage.setItem('hasSeenLanding', 'true');
      
      // Navigasi ke login
      router.push({
      pathname: '/(tabs)' as any,
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#ffffffff', '#fbfbfbff', '#99e2bbff', '#00c777ff']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Logo Area */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>HABITIN</Text>
        </View>

        {/* Illustration Area dengan Icon-icon */}
        <View style={styles.illustrationContainer}>
          {/* Circle Background */}
          <View style={styles.circleBackground}>
            {/* Icon Heart (Health) */}
            <View style={[styles.iconWrapper, styles.iconHeart]}>
              <MaterialCommunityIcons name="heart-plus" size={32} color="#FFFFFF" />
            </View>

            {/* Icon Chart (Progress) */}
            <View style={[styles.iconWrapper, styles.iconChart]}>
              <MaterialCommunityIcons name="chart-line" size={28} color="#FFFFFF" />
            </View>

            {/* Icon Trophy (Challenge) */}
            <View style={[styles.iconWrapper, styles.iconTrophy]}>
              <MaterialCommunityIcons name="trophy" size={28} color="#FFFFFF" />
            </View>

            {/* Icon Water (Hydration) */}
            <View style={[styles.iconWrapper, styles.iconWater]}>
              <MaterialCommunityIcons name="water" size={28} color="#FFFFFF" />
            </View>

            {/* Icon Run (Exercise) */}
            <View style={[styles.iconWrapper, styles.iconRun]}>
              <MaterialCommunityIcons name="run" size={28} color="#FFFFFF" />
            </View>

            {/* Decorative Dots */}
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
            <View style={[styles.dot, styles.dot4]} />
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Temani Perjalanan Sehatmu</Text>
          <Text style={styles.subtitle}>
            Pantau kondisi tubuh, ikuti tantangan sehat, dan raih hidup yang lebih baik setiap hari.
          </Text>
        </View>

        {/* Button */}
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
};

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
    color: '#54d983ff',
    letterSpacing: 8,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
  },
  circleBackground: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: 'rgba(100, 200, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconWrapper: {
    position: 'absolute',
    backgroundColor: 'rgba(100, 230, 255, 0.9)',
    borderRadius: 50,
    padding: 15,
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  iconHeart: {
    top: 10,
    left: '50%',
    marginLeft: -30,
    padding: 18,
  },
  iconChart: {
    top: 60,
    left: 20,
  },
  iconTrophy: {
    bottom: 60,
    left: 25,
  },
  iconWater: {
    top: 60,
    right: 20,
  },
  iconRun: {
    bottom: 60,
    right: 25,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(100, 230, 255, 0.6)',
  },
  dot1: {
    top: 80,
    right: 70,
  },
  dot2: {
    bottom: 80,
    left: 70,
  },
  dot3: {
    top: 40,
    left: 90,
    width: 6,
    height: 6,
  },
  dot4: {
    bottom: 40,
    right: 90,
    width: 6,
    height: 6,
  },
  handContainer: {
    position: 'absolute',
    bottom: -80,
    left: '50%',
    marginLeft: -60,
  },
  handPalm: {
    width: 120,
    height: 80,
    backgroundColor: '#FFB8A5',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  handThumb: {
    position: 'absolute',
    width: 30,
    height: 50,
    backgroundColor: '#FFB8A5',
    borderRadius: 15,
    left: -15,
    top: 20,
    transform: [{ rotate: '-30deg' }],
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#FFFFFF',
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
    color: '#4fe38aff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default Landing;