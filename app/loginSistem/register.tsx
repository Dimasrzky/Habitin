import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const RegisterScreen = () => {
  const router = useRouter();

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State untuk show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State untuk validasi real-time
  const [namaError, setNamaError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Validasi Nama
  const validateNama = (text: string) => {
    setNama(text);
    if (text.length === 0) {
      setNamaError('');
    } else if (text.trim().length < 3) {
      setNamaError('Nama minimal 3 karakter');
    } else {
      setNamaError('');
    }
  };

  // Validasi Email
  const validateEmail = (text: string) => {
    setEmail(text);
    if (text.length === 0) {
      setEmailError('');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(text)) {
        setEmailError('Format email tidak valid');
      } else {
        setEmailError('');
      }
    }
  };

  // Validasi Password
  const validatePassword = (text: string) => {
    setPassword(text);
    if (text.length === 0) {
      setPasswordError('');
    } else if (text.length < 6) {
      setPasswordError('Password minimal 6 karakter');
    } else {
      setPasswordError('');
    }
    
    // Check confirm password juga
    if (confirmPassword && text !== confirmPassword) {
      setConfirmPasswordError('Password tidak cocok');
    } else if (confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  // Validasi Confirm Password
  const validateConfirmPassword = (text: string) => {
    setConfirmPassword(text);
    if (text.length === 0) {
      setConfirmPasswordError('');
    } else if (text !== password) {
      setConfirmPasswordError('Password tidak cocok');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleRegister = async () => {
    // Validasi final
    if (!nama || !email || !password || !confirmPassword) {
      Alert.alert('Peringatan', 'Semua field harus diisi');
      return;
    }

    if (namaError || emailError || passwordError || confirmPasswordError) {
      Alert.alert('Peringatan', 'Mohon perbaiki kesalahan yang ada');
      return;
    }

    setLoading(true);

    try {
      // Register di Firebase
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );

      // Update display name
      await userCredential.user.updateProfile({
        displayName: nama,
      });

      // Set hasSeenLanding
      await AsyncStorage.setItem('hasSeenLanding', 'true');

      // Alert sukses
      Alert.alert(
        '🎉 Berhasil!',
        'Akun Anda berhasil dibuat. Selamat datang di Habitin!',
        [
          {
            text: 'Mulai',
            onPress: () => {
              // Navigation otomatis handle oleh _layout.tsx
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('Register error:', error);
      
      let errorMessage = 'Terjadi kesalahan saat membuat akun';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah. Gunakan kombinasi huruf dan angka.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Tidak ada koneksi internet';
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase belum dikonfigurasi dengan benar';
      }
      
      Alert.alert('Gagal Daftar', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#6B2DD8', '#8B5CF6', '#A78BFA']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={50} color="#FFF" />
            </View>
            <Text style={styles.title}>Buat Akun Baru</Text>
            <Text style={styles.subtitle}>
              Bergabunglah dengan Habitin untuk memulai perjalanan sehat Anda
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Input Nama */}
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color="#9CA3AF" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nama Lengkap"
                  placeholderTextColor="#9CA3AF"
                  value={nama}
                  onChangeText={validateNama}
                  autoComplete="name"
                  editable={!loading}
                />
                {nama.length > 0 && !namaError && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </View>
              {namaError ? (
                <Text style={styles.errorText}>{namaError}</Text>
              ) : null}
            </View>

            {/* Input Email */}
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color="#9CA3AF" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={validateEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                />
                {email.length > 0 && !emailError && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Input Password */}
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color="#9CA3AF" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={validatePassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : password.length > 0 ? (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthBar}>
                    <View 
                      style={[
                        styles.strengthFill,
                        { 
                          width: password.length < 6 ? '33%' : password.length < 8 ? '66%' : '100%',
                          backgroundColor: password.length < 6 ? '#EF4444' : password.length < 8 ? '#F59E0B' : '#10B981'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.strengthText}>
                    {password.length < 6 ? 'Lemah' : password.length < 8 ? 'Sedang' : 'Kuat'}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Input Confirm Password */}
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color="#9CA3AF" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Konfirmasi Password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={validateConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password"
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : confirmPassword.length > 0 && !confirmPasswordError ? (
                <View style={styles.successMessage}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.successText}>Password cocok</Text>
                </View>
              ) : null}
            </View>

            {/* Button Daftar */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Daftar Sekarang</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Link ke Login */}
            <TouchableOpacity 
              onPress={() => router.push('/loginSistem/login')}
              disabled={loading}
              style={styles.linkContainer}
            >
              <Text style={styles.linkText}>
                Sudah punya akun?{' '}
                <Text style={styles.linkBold}>Masuk di sini</Text>
              </Text>
            </TouchableOpacity>

            {/* Terms & Conditions */}
            <Text style={styles.terms}>
              Dengan mendaftar, Anda menyetujui{' '}
              <Text style={styles.termsLink}>Syarat & Ketentuan</Text>
              {' '}dan{' '}
              <Text style={styles.termsLink}>Kebijakan Privasi</Text>
              {' '}kami
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 4,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  passwordStrength: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 5,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 5,
  },
  successText: {
    color: '#10B981',
    fontSize: 12,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#6B2DD8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#6B2DD8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  linkContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: {
    color: '#6B7280',
    fontSize: 15,
    textAlign: 'center',
  },
  linkBold: {
    color: '#6B2DD8',
    fontWeight: '700',
  },
  terms: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: '#6B2DD8',
    fontWeight: '600',
  },
});

export default RegisterScreen;