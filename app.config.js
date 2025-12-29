require('dotenv').config();

module.exports = {
  expo: {
    name: 'Habitin',
    slug: 'habitin',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/Launcher_logos.jpeg',
    userInterfaceStyle: 'light',
    scheme: "habitin",
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
      permissions: [
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.VIBRATE",
        "android.permission.SCHEDULE_EXACT_ALARM"
      ],
      softwareKeyboardLayoutMode: "pan"
    },
    notification: {
      icon: "./assets/images/Launcher_logos.jpeg",
      color: "#ABE7B2",
      androidMode: "default",
      androidCollapsedTitle: "Habitin Reminder",
      sounds: ["./assets/sound/Notification-habitin.wav"]
    },
    plugins: [
      'expo-router',
      [
        "expo-notifications",
        {
          icon: "./assets/images/Launcher_logos.jpeg",
          color: "#ABE7B2",
          sounds: ["./assets/sound/Notification-habitin.wav"]
        }
      ]
    ],

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
      eas: {
        projectId: "65a2803d-fb97-470d-a9ff-61804c1f1d39"
      }
    }
  },
};
