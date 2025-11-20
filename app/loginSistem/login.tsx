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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }

    try {
      await AsyncStorage.setItem('userToken', 'dummy-token-123');
      
      // ✅ Gunakan type assertion
      router.replace('/screens/HomeScreen' as any);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Gagal login. Silakan coba lagi.');
    }
  };

  const handleRegister = () => {
    // ✅ Gunakan type assertion
    router.push('loginSistem/register' as any);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#ffffffff', '#99e2bbff']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>HABITIN</Text>
            <Text style={styles.tagline}>Temani Perjalanan Sehatmu</Text>
          </View>

          <View style={styles.formContainer}>
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
              />
            </View>

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
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Masuk</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>Daftar Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logo: { fontSize: 40, fontWeight: '700', color: '#000000ff', letterSpacing: 6, marginBottom: 10 },
  tagline: { fontSize: 14, color: 'rgba(0, 0, 0, 0.8)' },
  formContainer: { width: '100%' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#333' },
  eyeIcon: { padding: 5 },
  loginButton: { backgroundColor: '#FFFFFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  loginButtonText: { color: '#00a849ff', fontSize: 16, fontWeight: '700' },
  forgotPassword: { alignItems: 'center', marginTop: 15 },
  forgotPasswordText: { color: 'rgba(0, 0, 0, 0.8)', fontSize: 14 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  dividerText: { color: 'rgba(255, 255, 255, 0.8)', paddingHorizontal: 15, fontSize: 14 },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 },
  registerLink: { color: '#000000ff', fontSize: 14, fontWeight: '700' },
});