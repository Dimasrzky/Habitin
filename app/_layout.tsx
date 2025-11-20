import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import "../global.css";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Cek status auth saat pertama kali app dibuka
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle navigation berdasarkan auth status
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "loginSistem";
    //const inTabs = segments[0] === "(tabs)";

    // Logika routing
    if (isFirstTime && !inAuthGroup) {
      // User pertama kali → ke landing
      router.replace("loginSistem/landing" as any);
    } else if (!isFirstTime && !isLoggedIn && !inAuthGroup) {
      // Sudah pernah lihat landing tapi belum login → ke login
      router.replace("loginSistem/login" as any);
    } else if (isLoggedIn && inAuthGroup) {
      // Sudah login tapi masih di halaman auth → ke tabs (home)
      router.replace("(tabs)" as any);
    }
  }, [isLoading, isFirstTime, isLoggedIn, segments]);

  const checkAuthStatus = async () => {
    try {
      const hasSeenLanding = await AsyncStorage.getItem("hasSeenLanding");
      const userToken = await AsyncStorage.getItem("userToken");

      setIsFirstTime(hasSeenLanding === null);
      setIsLoggedIn(userToken !== null);
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsFirstTime(true);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading screen saat cek auth
  if (isLoading) {
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
        {/* Tambahkan screen loginSistem */}
        <Stack.Screen name="loginSistem/landing" />
        <Stack.Screen name="loginSistem/login" />
        <Stack.Screen name="loginSistem/register" />
        
        {/* Screen tabs yang sudah ada */}
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