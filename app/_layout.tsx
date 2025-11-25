import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { validateConfig } from '../src/config/env.config';

export default function RootLayout() {
  useEffect(() => {
    validateConfig();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="loginSistem" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="screens" />
    </Stack>
  );
}