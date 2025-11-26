import { Stack } from 'expo-router';
import "../global.css";

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
    </Stack>
  );
}