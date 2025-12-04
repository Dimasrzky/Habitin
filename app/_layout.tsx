import { OnboardingProvider } from '@/context/OnboardingContext';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { checkOnboardingCompleted } from '.././src/services/onboarding/onboardingService';
import "../global.css";
import { auth } from '../src/config/firebase.config';

export default function RootLayout() {
  const router = useRouter();
    useEffect(() => {
    const checkUserOnboarding = async () => {
      const user = auth.currentUser;
      if (user) {
        const isCompleted = await checkOnboardingCompleted(user.uid);
        if (!isCompleted) {
          router.replace('/onboarding/welcome');
        } else {
          router.replace('/(tabs)');
        }
      }
    };
    
    checkUserOnboarding();
  }, [router]);

  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Main routes */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
          
        {/* Login system routes */}
        <Stack.Screen name="loginSistem/landing" />
        <Stack.Screen name="loginSistem/login" />
        <Stack.Screen name="loginSistem/register" />
      </Stack>
    </OnboardingProvider>
  );
}