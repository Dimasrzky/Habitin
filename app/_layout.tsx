import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Main routes */}
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      
      {/* Login system routes */}
      <Stack.Screen name="loginSistem/landing" />
      <Stack.Screen name="loginSistem/login" />
      <Stack.Screen name="loginSistem/register" />
      
      {/* Screen routes - removed nested declaration */}
      {/* No need to declare individual screen files, Expo Router auto-discovers them */}
    </Stack>
  );
}