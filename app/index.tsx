import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text } from 'react-native';

// Dapatkan ukuran layar
const { width, height } = Dimensions.get('window');
const screenDiagonal = Math.sqrt(width * width + height * height);

export default function IndexScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [nextRoute, setNextRoute] = useState('/loginSistem/landing');
  
  // Refs untuk animasi
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(0)).current; // Animasi pulse terpisah
  const pulseOpacity = useRef(new Animated.Value(0)).current;

  // 1. Check Auth State
  useEffect(() => {
    const initialize = async () => {
      try {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setNextRoute('/main');
          } else {
            setNextRoute('/loginSistem/landing');
          }
          setIsReady(true);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Initialization error:', error);
        setNextRoute('/loginSistem/landing');
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  // 2. Jalankan animasi setelah ready
  useEffect(() => {
    if (!isReady) return;

    Animated.sequence([
      // 1. Fade in + scale logo (800ms)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      
      // 2. Hold (1000ms)
      Animated.delay(1000),
      
      // 3. Pulse white background expansion (800ms)
      Animated.parallel([
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      
      // 4. Hold white screen (200ms)
      Animated.delay(2000),
      
      // 5. Fade out keseluruhan (500ms)
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace(nextRoute);
    });

    // Cleanup
    return () => {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
      fadeOut.setValue(1);
      pulseScale.setValue(0);
      pulseOpacity.setValue(0);
    };
  }, [isReady, router, fadeAnim, scaleAnim, fadeOut, pulseScale, pulseOpacity, nextRoute]);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeOut }]}>
      <LinearGradient
        colors={['#a3d8a6ff', '#82d18cff', '#a3d8a6ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image 
            source={require('../assets/images/Launcher_logos_RBG(1).png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Habitin</Text>
          <Text style={styles.subtitle}>Stay Healthy, Stay Happy</Text>
        </Animated.View>

        {/* Pulse White Circle - Mengisi seluruh layar */}
        <Animated.View
          style={[
            styles.pulseCircle,
            {
              opacity: pulseOpacity,
              transform: [
                {
                  scale: pulseScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, screenDiagonal / 100], // Scale dari 0 ke ukuran layar
                  }),
                },
              ],
            },
          ]}
        />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    zIndex: 2, // Logo di atas pulse
  },
  logoImage: {
    width: 160,
    height: 160,
    marginBottom: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000ff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#000000ff',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 1,
  },
  pulseCircle: {
    position: 'absolute',
    width: 130, // Size awal kecil
    height: 130,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    zIndex: 1, // Di bawah logo
  },
});