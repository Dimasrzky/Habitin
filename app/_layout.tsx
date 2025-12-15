// app/_layout.tsx

import { AuthProvider } from '@/context/AuthContext'; // ✅ Import AuthProvider
import { OnboardingProvider } from '@/context/OnboardingContext';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import "../global.css";
import { auth } from '../src/config/firebase.config';
import { checkOnboardingCompleted } from '../src/services/onboarding/onboardingService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    const checkUserOnboarding = async () => {
      const user = auth.currentUser;
      if (user) {
        console.log('🔐 [RootLayout] User detected:', user.email);
        console.log('🔐 [RootLayout] User UID:', user.uid);
        
        const isCompleted = await checkOnboardingCompleted(user.uid);
        if (!isCompleted) {
          router.replace('/onboarding/welcome');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        console.log('🔐 [RootLayout] No user logged in');
      }
    };
    
    checkUserOnboarding();
  }, [router]);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'ios') {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.warn('Notification permission not granted');
        }
      }
    };

    requestPermissions();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📩 Notification received:', notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        const reminderId = response.notification.request.content.data?.reminderId;
        
        if (reminderId) {
          router.push({
            pathname: '/screens/customReminder/editReminder',
            params: { reminderId },
          } as any);
        } else {
          router.push('/screens/customReminder/index' as any);
        }
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router]);

  return (
    // ✅ Wrap dengan AuthProvider (paling luar)
    <AuthProvider>
      <OnboardingProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </OnboardingProvider>
    </AuthProvider>
  );
}