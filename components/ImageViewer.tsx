import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface ImageViewerProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ImageViewer({ visible, imageUrl, onClose }: ImageViewerProps) {
  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // State for tracking
  const [isZoomed, setIsZoomed] = useState(false);
  const lastTap = useRef<number>(0);
  const scaleValue = useRef(1);
  const translateXValue = useRef(0);
  const translateYValue = useRef(0);
  const isZoomedRef = useRef(false);

  // Pan responder for gestures with improved logic
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only handle pan if zoomed or significant movement
        return isZoomedRef.current || Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // Set offset when gesture starts
        if (isZoomedRef.current) {
          translateX.setOffset(translateXValue.current);
          translateY.setOffset(translateYValue.current);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (isZoomedRef.current) {
          // Allow panning when zoomed
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
        } else {
          // Allow vertical drag to close when not zoomed
          if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
            translateY.setValue(gestureState.dy);
            // Reduce opacity as user drags down
            const dragOpacity = Math.max(0, 1 - Math.abs(gestureState.dy) / 400);
            opacity.setValue(dragOpacity);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isZoomedRef.current) {
          // Flatten offset to get absolute position
          translateX.flattenOffset();
          translateY.flattenOffset();

          // Update the ref values
          translateXValue.current += gestureState.dx;
          translateYValue.current += gestureState.dy;
        } else {
          // Check if swipe down to close (when not zoomed)
          if (gestureState.dy > 100 && Math.abs(gestureState.vy) > 0.5) {
            handleClose();
          } else {
            // Reset position if not closing
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }
      },
    })
  ).current;

  // Show animation when modal opens
  React.useEffect(() => {
    if (visible) {
      // Reset all values
      scaleValue.current = 1;
      translateXValue.current = 0;
      translateYValue.current = 0;
      isZoomedRef.current = false;
      setIsZoomed(false);

      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);

      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      opacity.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      // Reset all transforms
      scaleValue.current = 1;
      translateXValue.current = 0;
      translateYValue.current = 0;
      isZoomedRef.current = false;
      setIsZoomed(false);
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
    });
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected - toggle zoom
      const newZoomState = !isZoomedRef.current;
      const targetScale = newZoomState ? 2.5 : 1;

      scaleValue.current = targetScale;
      translateXValue.current = 0;
      translateYValue.current = 0;
      isZoomedRef.current = newZoomState;
      setIsZoomed(newZoomState);

      Animated.parallel([
        Animated.spring(scale, {
          toValue: targetScale,
          useNativeDriver: true,
          friction: 7,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 7,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 7,
        }),
      ]).start();
    }

    lastTap.current = now;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.95)" />

      <Animated.View style={[styles.container, { opacity }]}>
        {/* Close Button */}
        <View style={styles.header}>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Image Container */}
        <View style={styles.imageContainer} {...panResponder.panHandlers}>
          <Pressable onPress={handleDoubleTap} style={styles.imagePressable}>
            <Animated.Image
              source={{ uri: imageUrl }}
              style={[
                styles.image,
                {
                  transform: [
                    { scale },
                    { translateX },
                    { translateY },
                  ],
                },
              ]}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        {/* Instructions */}
        <View style={styles.footer}>
          <View style={styles.instructionContainer}>
            <View style={styles.instructionRow}>
              <Ionicons name="hand-left-outline" size={18} color="#FFFFFF" />
              <Text style={styles.instructionText}>Ketuk 2x untuk zoom</Text>
            </View>
            <View style={styles.instructionRow}>
              <Ionicons name="move-outline" size={18} color="#FFFFFF" />
              <Text style={styles.instructionText}>
                {isZoomed ? 'Geser untuk pan' : 'Swipe ke bawah untuk tutup'}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePressable: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  instructionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
});
