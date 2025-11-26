require('dotenv').config();

module.exports = {
  expo: {
    name: 'Habitin',
    slug: 'habitin',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/Launcher_logos.jpeg',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.yourcompany.habitin',
    },
    android: {
      package: 'com.anonymous.Habitin',
      googleServicesFile: './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/images/Launcher_logos.jpeg',
        backgroundColor: '#ffffff',
      },
    },
    extra: {
      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      },
      supabase: {
        url: process.env.EXPO_PUBLIC_SUPABASE_URL,
        anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      },
    },
    plugins: [
      'expo-router',
      // ← HAPUS expo-build-properties untuk sekarang
    ],
  },
};