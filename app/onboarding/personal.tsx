import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import { useOnboarding } from '../../src/context/OnboardingContext';

const GENDER_OPTIONS = ['Pria', 'Wanita', 'Lainnya'];
const BLOOD_TYPE_OPTIONS = ['A', 'B', 'AB', 'O', 'Tidak tahu'];

export default function PersonalScreen() {
  const { data, updateData } = useOnboarding();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateData('dateOfBirth', selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Pilih tanggal lahir';
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const canProceed =
    data.fullName.trim() !== '' && data.dateOfBirth !== null && data.gender !== '';

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={8}
      showBackButton={true}
      onBack={() => router.back()}
      footer={
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={() => canProceed && router.push('/onboarding/physical')}
          disabled={!canProceed}
        >
          <Text style={styles.nextButtonText}>Lanjut</Text>
        </TouchableOpacity>
      }
    >
        <Text style={styles.title}>Informasi Personal</Text>
        <Text style={styles.subtitle}>
          Masukkan data diri Anda 
        </Text>

        {/* Full Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput
            style={styles.input}
            value={data.fullName}
            onChangeText={(text) => updateData('fullName', text)}
            placeholder="Masukkan nama lengkap Anda"
            placeholderTextColor="#BDBDBD"
          />
        </View>

        {/* Date of Birth */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tanggal Lahir</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={[styles.dateText, !data.dateOfBirth && styles.placeholderText]}
            >
              {formatDate(data.dateOfBirth)}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={data.dateOfBirth || new Date()}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1940, 0, 1)}
            />
          )}
        </View>

        {/* Gender */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Jenis Kelamin</Text>
          <View style={styles.optionRow}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderButton,
                  data.gender === option && styles.optionButtonSelected,
                ]}
                onPress={() => updateData('gender', option)}
              >
                <Text
                  style={[
                    styles.genderText,
                    data.gender === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Blood Type */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Golongan Darah (Opsional)</Text>
          <View style={styles.bloodTypeRow}>
            {BLOOD_TYPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.bloodTypeButton,
                  data.bloodType === option && styles.optionButtonSelected,
                ]}
                onPress={() => updateData('bloodType', option)}
              >
                <Text
                  style={[
                    styles.bloodTypeText,
                    data.bloodType === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 16,
    color: '#212121',
  },
  placeholderText: {
    color: '#BDBDBD',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  genderText: {
    fontSize: 15,
    color: '#424242',
  },
  optionTextSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  bloodTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bloodTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bloodTypeText: {
    fontSize: 15,
    color: '#424242',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});