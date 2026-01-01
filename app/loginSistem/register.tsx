import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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
import { supabase } from '../../src/config/supabase.config';

function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  const handleRegister = async () => {
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      setErrorModal({ visible: true, message: 'Mohon isi semua kolom' });
      return;
    }

    if (password !== confirmPassword) {
      setErrorModal({ visible: true, message: 'Password tidak cocok' });
      return;
    }

    if (password.length < 6) {
      setErrorModal({ visible: true, message: 'Password harus minimal 6 karakter' });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating Firebase user...');

      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log('Firebase user created:', user.uid);

      // Step 2: Update display name
      await updateProfile(user, {
        displayName: fullName,
      });

      console.log('Display name updated');

      // Step 3: Create Supabase user record
      console.log('Creating Supabase user record...');
      const { error: supabaseError } = await supabase
        .from('users')
        .insert({
          id: user.uid,
          email: user.email,
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        // Don't block registration if Supabase fails
        console.warn('User created in Firebase but not in Supabase');
      } else {
        console.log('Supabase user record created');
      }

      setSuccessModal(true);
    } catch (error: any) {
      console.error('Registration error:', error);

      let errorMessage = 'Registrasi gagal. Silakan coba lagi.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email ini sudah terdaftar.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Alamat email tidak valid.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah. Gunakan minimal 6 karakter.';
      }

      setErrorModal({ visible: true, message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModal(false);
    router.replace('/loginSistem/login');
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModal}
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={60} color="#22c55e" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Registrasi Berhasil!</Text>
            <Text style={styles.modalMessage}>
              Akun Anda telah berhasil dibuat. Silakan login untuk melanjutkan.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSuccessModalClose}
            >
              <Text style={styles.modalButtonText}>Lanjut ke Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModal.visible}
        onRequestClose={() => setErrorModal({ visible: false, message: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="alert-circle" size={60} color="#ef4444" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Registrasi Gagal</Text>
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

      <Text style={styles.title}>Register</Text>
      <Text style={styles.subtitle}>Create your Habitin account</Text>

      <TextInput
        style={styles.input}
        placeholder="Nama Panggilan"
        value={fullName}
        onChangeText={setFullName}
        editable={!loading}
      />

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

      <TextInput
        style={styles.input}
        placeholder="Konfirmasi Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/loginSistem/login')}
        disabled={loading}
      >
        <Text style={styles.link}>Sudah memiliki akun? Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        disabled={loading}
      >
      </TouchableOpacity>
    </View>
  );
}

export default Register;

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
  eyeText: {
    fontSize: 20,
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
    fontSize: 22,
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
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#256742ff',
    paddingVertical: 14,
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