import { Stack } from 'expo-router';
import React from 'react';
import { OnboardingProvider } from '../../src/context/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="personal" />
        <Stack.Screen name="physical" />
        <Stack.Screen name="lifestyle" />
        <Stack.Screen name="symptoms" />
        <Stack.Screen name="notification" />
        <Stack.Screen name="consent" />
        <Stack.Screen name="complete" />
      </Stack>
    </OnboardingProvider>
  );
}