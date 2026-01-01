import React, { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  showBackButton?: boolean;
  onBack?: () => void;
  children: ReactNode;
  footer: ReactNode;
  headerPaddingTop?: number;
}

export default function OnboardingLayout({
  currentStep,
  totalSteps,
  showBackButton = false,
  onBack,
  children,
  footer,
  headerPaddingTop = 10,
}: OnboardingLayoutProps) {
  const progress = (currentStep / totalSteps) * 100;

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress}%`, {
      duration: 300,
    }),
  }));

  return (
    <View style={styles.container}>
      {/* Fixed Header with Progress Bar */}
      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        {showBackButton && onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                animatedProgressStyle
              ]}
            />
          </View>
          <Text style={styles.stepText}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>
      </View>

      {/* Scrollable Content with Animation */}
      <Animated.View
        entering={FadeInRight.duration(300)}
        exiting={FadeOutLeft.duration(300)}
        style={styles.contentWrapper}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {children}
        </ScrollView>
      </Animated.View>

      {/* Fixed Footer */}
      <View style={styles.footer}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 28,
    color: '#212121',
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  stepText: {
    marginTop: 8,
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  contentWrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 20,
  },
});
