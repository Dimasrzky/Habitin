// app/_layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkFirstTimeAndAuth();
  }, []);

  const checkFirstTimeAndAuth = async () => {
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

  // Loading state
  if (isFirstTime === null || isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6B2DD8" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isFirstTime ? (
        // Jika pertama kali, tampilkan landing
        <Stack.Screen name="screens/loginSistem/landing" />
      ) : !isLoggedIn ? (
        // Jika sudah pernah lihat landing tapi belum login
        <Stack.Screen name="screens/loginSistem/login" />
      ) : (
        // Jika sudah login, tampilkan tabs (home)
        <Stack.Screen name="(tabs)" />
      )}
      
      {/* Daftarkan semua screen lainnya */}
      <Stack.Screen name="screens/loginSistem/landing" />
      <Stack.Screen name="screens/loginSistem/login" />
      <Stack.Screen name="screens/loginSistem/register" />
    </Stack>
  );
}