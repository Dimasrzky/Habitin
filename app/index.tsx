import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { auth } from '../src/config/firebase.config';

export default function Index() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Small delay to ensure Firebase is ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log('Setting up auth listener...');

        const unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            if (!isMounted) return;

            console.log('Auth state:', user ? 'Logged in' : 'Not logged in');

            if (user) {
              console.log('User ID:', user.uid);
              console.log('Redirecting to tabs...');
              router.replace('/(tabs)');
            } else {
              console.log('Redirecting to landing...');
              router.replace('/loginSistem/landing');
            }
          },
          (error) => {
            console.error('Auth error:', error);
            setError(error.message);
            
            // Fallback to landing page
            if (isMounted) {
              router.replace('/loginSistem/landing');
            }
          }
        );

        return () => {
          console.log('Cleaning up auth listener');
          unsubscribe();
        };
      } catch (err: any) {
        console.error('Init auth error:', err);
        setError(err.message);
        
        // Fallback to landing page
        if (isMounted) {
          router.replace('/loginSistem/landing');
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <Text style={styles.hintText}>Redirecting to login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#667eea" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#ff0000',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  hintText: {
    fontSize: 12,
    color: '#999',
  },
});