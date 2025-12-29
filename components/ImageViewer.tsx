import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StatusBar,
  StyleSheet,
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

  // Pan responder for gestures
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Store last values when gesture starts
        scale.setOffset(lastScale.current);
        translateX.setOffset(lastTranslateX.current);
        translateY.setOffset(lastTranslateY.current);
      },
      onPanResponderMove: (_, gestureState) => {
        // Pinch to zoom simulation (using vertical movement as scale)
        if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
          const newScale = Math.max(0.5, Math.min(3, 1 + gestureState.dy / 200));
          scale.setValue(newScale - lastScale.current);
        } else {
          // Pan when zoomed
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Flatten offset
        scale.flattenOffset();
        translateX.flattenOffset();
        translateY.flattenOffset();

        // Update last values
        scale.addListener(({ value }) => {
          lastScale.current = value;
        });
        translateX.addListener(({ value }) => {
          lastTranslateX.current = value;
        });
        translateY.addListener(({ value }) => {
          lastTranslateY.current = value;
        });

        // Check if swipe down to close
        if (gestureState.dy > 100 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
          handleClose();
        } else {
          // Reset if scale is too small
          if (lastScale.current < 1) {
            Animated.parallel([
              Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
              }),
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
              }),
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
              }),
            ]).start();
            lastScale.current = 1;
            lastTranslateX.current = 0;
            lastTranslateY.current = 0;
          }
        }
      },
    })
  ).current;

  // Show animation when modal opens
  React.useEffect(() => {
    if (visible) {
      // Reset values
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
      lastScale.current = 1;
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;

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
      // Reset transforms
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
      lastScale.current = 1;
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
    });
  };

  const handleDoubleTap = () => {
    const isZoomed = lastScale.current > 1;

    Animated.parallel([
      Animated.spring(scale, {
        toValue: isZoomed ? 1 : 2,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    lastScale.current = isZoomed ? 1 : 2;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
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
          <View style={styles.instructionRow}>
            <Ionicons name="hand-left-outline" size={16} color="#FFFFFF" />
            <Ionicons name="hand-right-outline" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
            <View style={styles.instructionText}>
              <Ionicons name="scan-outline" size={14} color="#9CA3AF" />
              <Ionicons name="expand-outline" size={14} color="#9CA3AF" style={{ marginLeft: 6 }} />
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
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  instructionText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
  },
});
