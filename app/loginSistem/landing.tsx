import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LandingScreen = () => {
  const router = useRouter();

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasSeenLanding', 'true');
      router.replace('/loginSistem/login');
    } catch (error) {
      console.error('Error setting landing flag:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/Logo_Lauch.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Selamat Datang di Habitin</Text>
      <Text style={styles.subtitle}>
        Bangun kebiasaan baik, raih tujuan Anda
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Mulai Sekarang</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#6B2DD8',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LandingScreen;