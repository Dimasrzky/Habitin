import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import "../global.css";

// Import Firebase - CARA YANG BENAR
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  
  const segments = useSegments();
  const router = useRouter();

  // Firebase auth state listener
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setIsLoggedIn(firebaseUser !== null);
      
      if (initializing) setInitializing(false);
    });

    return subscriber; // Unsubscribe on unmount
  }, [initializing]);

  // Cek status auth saat pertama kali app dibuka
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle navigation berdasarkan auth status
  useEffect(() => {
    if (isLoading || initializing) return;

    const inAuthGroup = segments[0] === "loginSistem";

    // Logika routing
    if (isFirstTime && !inAuthGroup) {
      router.replace("/loginSistem/landing" as any);
    } else if (!isFirstTime && !isLoggedIn && !inAuthGroup) {
      router.replace("/loginSistem/login" as any);
    } else if (isLoggedIn && inAuthGroup) {
      router.replace("/(tabs)" as any);
    }
  }, [isLoading, initializing, isFirstTime, isLoggedIn, segments, router]);

  const checkAuthStatus = async () => {
    try {
      const hasSeenLanding = await AsyncStorage.getItem("hasSeenLanding");
      const currentUser = auth().currentUser;
      
      setIsFirstTime(hasSeenLanding === null);
      setIsLoggedIn(currentUser !== null);
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsFirstTime(true);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading screen saat cek auth
  if (isLoading || initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#6B2DD8",
        }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="loginSistem/landing" />
        <Stack.Screen name="loginSistem/login" />
        <Stack.Screen name="loginSistem/register" />
        
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}