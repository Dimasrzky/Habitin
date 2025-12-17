// Ganti seluruh component menjadi:
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = '#E5E7EB',
  progressColor = '#10B981',
  borderRadius = 4,
}) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]); // Only depend on progress, animatedProgress is stable

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value}%`,
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor,
          borderRadius,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.progress,
          {
            backgroundColor: progressColor,
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
});