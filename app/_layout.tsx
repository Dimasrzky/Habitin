// app/_layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isFirstTime === null || isLoggedIn === null) return;

    const inAuthGroup = segments[0] === 'loginSistem';

    if (isFirstTime && !inAuthGroup) {
      // ✅ Gunakan type assertion dengan 'as any' atau Href
      router.replace('loginSistem/landing' as any);
    } else if (!isFirstTime && !isLoggedIn && !inAuthGroup) {
      router.replace('loginSistem/login' as any);
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('(tabs)' as any);
    }
  }, [isFirstTime, isLoggedIn, segments]);

  const checkAuthStatus = async () => {
    try {
      const hasSeenLanding = await AsyncStorage.getItem('hasSeenLanding');
      const userToken = await AsyncStorage.getItem('userToken');
      
      setIsFirstTime(hasSeenLanding === null);
      setIsLoggedIn(userToken !== null);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsFirstTime(true);
      setIsLoggedIn(false);
    }
  };

  if (isFirstTime === null || isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6B2DD8' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="loginSistem/landing" />
      <Stack.Screen name="loginSistem/login" />
      <Stack.Screen name="loginSistem/register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}