// app/screens/Profile/EditHealthData.tsx
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EditHealthData() {
  const router = useRouter();
  const [age, setAge] = useState('19');
  const [gender, setGender] = useState('Laki-laki');
  const [height, setHeight] = useState('172');
  const [weight, setWeight] = useState('68');
  const [physicalActivity, setPhysicalActivity] = useState('Sedang (3-4x/minggu)');
  const [dietPattern, setDietPattern] = useState('Seimbang');
  const [familyHistory, setFamilyHistory] = useState(true);
  const [familyCondition, setFamilyCondition] = useState('Diabetes (Ayah)');

  const calculateBMI = () => {
    const h = parseFloat(height) / 100; // convert to meters
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return '0.0';
  };

  const handleSave = () => {
    if (!age || !height || !weight) {
      Alert.alert('Error', 'Harap isi semua data yang diperlukan');
      return;
    }

    const bmi = calculateBMI();
    
    Alert.alert(
      'Berhasil',
      `Data kesehatan berhasil diperbarui!\nBMI Anda: ${bmi}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Data Kesehatan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* BMI Card */}
        <View style={styles.bmiCard}>
          <Text style={styles.bmiLabel}>BMI Anda</Text>
          <Text style={styles.bmiValue}>{calculateBMI()}</Text>
          <Text style={styles.bmiStatus}>
            {parseFloat(calculateBMI()) < 18.5 ? 'Kurang' : 
             parseFloat(calculateBMI()) < 25 ? 'Normal' : 
             parseFloat(calculateBMI()) < 30 ? 'Berlebih' : 'Obesitas'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Umur */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Umur (tahun)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Masukkan umur"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Jenis Kelamin */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jenis Kelamin</Text>
            <View style={styles.pickerWrapper}>
              <Ionicons name="male-female-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Laki-laki" value="Laki-laki" />
                <Picker.Item label="Perempuan" value="Perempuan" />
              </Picker>
            </View>
          </View>

          {/* Tinggi Badan */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tinggi Badan (cm)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="resize-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="Masukkan tinggi badan"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Berat Badan */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Berat Badan (kg)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="fitness-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="Masukkan berat badan"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Aktivitas Fisik */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Aktivitas Fisik</Text>
            <View style={styles.pickerWrapper}>
              <Ionicons name="bicycle-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <Picker
                selectedValue={physicalActivity}
                onValueChange={(itemValue) => setPhysicalActivity(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Rendah (0-1x/minggu)" value="Rendah (0-1x/minggu)" />
                <Picker.Item label="Sedang (3-4x/minggu)" value="Sedang (3-4x/minggu)" />
                <Picker.Item label="Tinggi (5-7x/minggu)" value="Tinggi (5-7x/minggu)" />
              </Picker>
            </View>
          </View>

          {/* Pola Makan */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pola Makan</Text>
            <View style={styles.pickerWrapper}>
              <Ionicons name="restaurant-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <Picker
                selectedValue={dietPattern}
                onValueChange={(itemValue) => setDietPattern(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Seimbang" value="Seimbang" />
                <Picker.Item label="Vegetarian" value="Vegetarian" />
                <Picker.Item label="Keto" value="Keto" />
                <Picker.Item label="Lainnya" value="Lainnya" />
              </Picker>
            </View>
          </View>

          {/* Riwayat Keluarga */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Riwayat Penyakit Keluarga</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !familyHistory && styles.toggleButtonActive]}
                onPress={() => setFamilyHistory(false)}
              >
                <Text style={[styles.toggleText, !familyHistory && styles.toggleTextActive]}>
                  Tidak Ada
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, familyHistory && styles.toggleButtonActive]}
                onPress={() => setFamilyHistory(true)}
              >
                <Text style={[styles.toggleText, familyHistory && styles.toggleTextActive]}>
                  Ada
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Kondisi Keluarga (jika ada riwayat) */}
          {familyHistory && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kondisi Penyakit</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="medical-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={familyCondition}
                  onChangeText={setFamilyCondition}
                  placeholder="Contoh: Diabetes (Ayah)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bmiCard: {
    backgroundColor: '#ECF4E8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  bmiLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  bmiStatus: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ABE7B2',
  },
  form: {
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#1F2937',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#ABE7B2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});