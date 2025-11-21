// app/loginSistem/login.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ========== DATA DUMMY UNTUK LOGIN ==========
const DUMMY_USERS = [
  {
    email: 'admin@habitin.com',
    password: 'admin123',
    name: 'Admin Habitin',
    role: 'admin'
  },
  {
    email: 'user@habitin.com',
    password: 'user123',
    name: 'User Demo',
    role: 'user'
  },
  {
    email: 'test@gmail.com',
    password: 'test123',
    name: 'Test User',
    role: 'user'
  },
  {
    email: 'demo@habitin.com',
    password: 'demo123',
    name: 'Demo Account',
    role: 'user'
  },
];
// =============================================

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Quick fill untuk testing
  const fillDemoAccount = () => {
    setEmail('demo@habitin.com');
    setPassword('demo123');
  };

  const handleLogin = async () => {
    // Validasi input kosong
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Format email tidak valid');
      return;
    }

    setIsLoading(true);

    // Simulasi delay network request
    setTimeout(async () => {
      try {
        // Cek apakah user ada di database dummy
        const user = DUMMY_USERS.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (user) {
          // Login berhasil
          const userData = {
            id: Date.now().toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            loginAt: new Date().toISOString(),
          };

          // Simpan token dan data user
          await AsyncStorage.setItem('userToken', 'token_' + Date.now());
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          await AsyncStorage.setItem('hasSeenLanding', 'true');

          Alert.alert(
            'Login Berhasil!',
            `Selamat datang, ${user.name}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Redirect ke home
                  router.replace('(tabs)' as any);
                }
              }
            ]
          );
        } else {
          // Login gagal
          Alert.alert(
            'Login Gagal',
            'Email atau password salah. Silakan coba lagi.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Login error:', error);
        Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    }, 1000); // Simulasi loading 1 detik
  };

  const handleRegister = () => {
    router.push('loginSistem/register' as any);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Lupa Password',
      'Silakan hubungi admin untuk reset password atau gunakan akun demo:\n\nEmail: demo@habitin.com\nPassword: demo123'
    );
  };

  const showDemoAccounts = () => {
    const accountsList = DUMMY_USERS.map(
      user => `Email: ${user.email}\nPassword: ${user.password}\nRole: ${user.role}`
    ).join('\n\n');

    Alert.alert(
      '📋 Akun Demo untuk Testing',
      accountsList,
      [
        { text: 'Tutup', style: 'cancel' },
        { text: 'Gunakan Demo', onPress: fillDemoAccount }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#ffffffff', '#acf59cff']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>HABITIN</Text>
            <Text style={styles.tagline}>Temani Perjalanan Sehatmu</Text>
          </View>

          {/* Demo Button */}
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={showDemoAccounts}
          >
            <MaterialCommunityIcons name="information" size={16} color="#FFFFFF" />
            <Text style={styles.demoButtonText}>Lihat Akun Demo</Text>
          </TouchableOpacity>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons 
                name="email-outline" 
                size={20} 
                color="#666" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons 
                name="lock-outline" 
                size={20} 
                color="#666" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <MaterialCommunityIcons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.loginButtonText}>Memproses...</Text>
              ) : (
                <Text style={styles.loginButtonText}>Masuk</Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Login Demo */}
            <TouchableOpacity 
              style={styles.quickLoginButton}
              onPress={fillDemoAccount}
              disabled={isLoading}
            >
              <MaterialCommunityIcons name="flash" size={20} color="#FFD580" />
              <Text style={styles.quickLoginText}>Login Cepat (Demo)</Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <TouchableOpacity 
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.registerLink}>Daftar Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#ABE7B2" />
            <Text style={styles.infoText}>
              Data Anda aman dan terenkripsi
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 6,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 30,
    gap: 6,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#6B2DD8',
    fontSize: 16,
    fontWeight: '700',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 15,
    fontSize: 14,
  },
  quickLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 213, 128, 0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 213, 128, 0.5)',
  },
  quickLoginText: {
    color: '#FFD580',
    fontSize: 15,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  registerLink: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    gap: 8,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
});