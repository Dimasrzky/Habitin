import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../src/config/firebase.config';
import { checkOnboardingCompleted } from '../../src/services/onboarding/onboardingService';

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorModal({ visible: true, message: 'Mohon isi semua kolom' });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.email);

      // ✅ CEK STATUS ONBOARDING DARI DATABASE
      const completedOnboarding = await checkOnboardingCompleted(userCredential.user.uid);

      // ✅ REDIRECT SESUAI STATUS
      if (completedOnboarding) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding/welcome');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'Login gagal. Silakan coba lagi.';

      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Email atau password yang Anda masukkan salah';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Terlalu banyak percobaan gagal. Silakan coba lagi nanti.';
      }

      setErrorModal({ visible: true, message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModal.visible}
        onRequestClose={() => setErrorModal({ visible: false, message: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="alert-circle" size={50} color="#ef4444" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Login Gagal</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setErrorModal({ visible: false, message: '' })}
            >
              <Text style={styles.modalButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Welcome to Habitin</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={24} 
            color="#555" 
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/loginSistem/register')}
        disabled={loading}
      >
        <Text style={styles.link}>Belum memiliki akun? Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/loginSistem/landing')}
        disabled={loading}
      >
        <Text style={styles.backLink}>← Kembali ke Landing</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#256742ff',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  button: {
    backgroundColor: '#256742ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#256742ff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  backLink: {
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#256742ff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});