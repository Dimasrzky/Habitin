// app/components/SwipeToStartButton.tsx

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_WIDTH = SCREEN_WIDTH - 32;
const SLIDER_SIZE = 60;
const SWIPE_THRESHOLD = BUTTON_WIDTH - SLIDER_SIZE - 8;

interface SwipeToStartButtonProps {
  onComplete: () => void;
  text?: string;
  gradientColors?: string[];
  sliderColor?: string;
  enableHaptic?: boolean;
  backgroundColor?: string;
}

export default function SwipeToStartButton({
  onComplete,
  text = 'Geser untuk Mulai',
  sliderColor = '#FFFFFF',
  enableHaptic = true,
}: SwipeToStartButtonProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const widthAnim = useRef(new Animated.Value(0)).current;
  const [completed, setCompleted] = React.useState(false);
  const gradientColors = ['#4CAF50', '#81C784'] as const;


  useEffect(() => {
  Animated.timing(widthAnim, {
    toValue: 200,
    duration: 800,
    useNativeDriver: false, // ✅ aman
  }).start();
}, [widthAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !completed,
      onMoveShouldSetPanResponder: () => !completed,
      onPanResponderGrant: () => {
        translateX.stopAnimation();
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx >= 0 && gestureState.dx <= SWIPE_THRESHOLD) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= SWIPE_THRESHOLD * 0.8) {
          if (enableHaptic && Platform.OS !== 'web') {
            Vibration.vibrate(50);
          }

          Animated.spring(translateX, {
            toValue: SWIPE_THRESHOLD,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start(() => {
            setCompleted(true);
            setTimeout(() => {
              onComplete();
            }, 300);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

  const textOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
    outputRange: [1, 0.5, 0],
  });

  const iconScale = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
    outputRange: [1, 1.3, 1.5],
  });

  const iconRotate = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, BUTTON_WIDTH],
  });

  const chevronOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD / 3],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.trackContainer}>
        {/* Perbaikan LinearGradient — gunakan { x, y } bukan array */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.track}
        >
          {/* Progress Overlay */}
          <Animated.View
            style={[
              styles.progressOverlay,
              {
                width: progressWidth,
                opacity: 0.3,
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Success Background */}
          {completed && (
            <View style={styles.successOverlay}>
              <LinearGradient
                colors={['#ABE7B2', '#CBF3BB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          )}

          {/* Text */}
          <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
            <Text style={styles.text}>{text}</Text>
          </Animated.View>

          {/* Chevron Hints */}
          <Animated.View
            style={[
              styles.chevronContainer,
              {
                opacity: chevronOpacity,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgba(255, 255, 255, 0.5)"
              style={{ marginLeft: -8 }}
            />
            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgba(255, 255, 255, 0.6)"
              style={{ marginLeft: -8 }}
            />
          </Animated.View>

          {/* Success Text */}
          {completed && (
            <Animated.View style={styles.successTextContainer}>
              <Text style={styles.successText}>✓ Berhasil!</Text>
            </Animated.View>
          )}
        </LinearGradient>

        {/* Slider */}
        <Animated.View
          style={[
            styles.slider,
            {
              backgroundColor: sliderColor,
              transform: [{ translateX }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={{
              transform: [{ scale: iconScale }, { rotate: iconRotate }],
            }}
          >
            <Ionicons
              name={completed ? 'checkmark' : 'arrow-forward'}
              size={28}
              color={completed ? '#ABE7B2' : gradientColors[0]}
            />
          </Animated.View>

          {/* Shimmer Effect */}
          {!completed && (
            <View style={styles.sliderShimmer}>
              <Animated.View
                style={[
                  styles.shimmerGradient,
                  {
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [0.3, 0.6],
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(147, 191, 199, 0.2)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Hint Text */}
      {!completed && (
        <Animated.View style={{ opacity: textOpacity }}>
          <Text style={styles.hintText}>Geser tombol ke kanan untuk memulai →</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  trackContainer: {
    width: '100%',
    height: 64,
    position: 'relative',
  },
  track: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  progressOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 32,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },
  textContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  chevronContainer: {
    position: 'absolute',
    right: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successTextContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  slider: {
    width: SLIDER_SIZE,
    height: SLIDER_SIZE,
    borderRadius: SLIDER_SIZE / 2,
    position: 'absolute',
    left: 4,
    top: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  sliderShimmer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SLIDER_SIZE / 2,
  },
  shimmerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  hintText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
