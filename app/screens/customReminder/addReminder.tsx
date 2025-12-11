import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useReminders } from '../../../src/hooks/useReminders';

export default function AddReminderScreen() {
  const { createReminder } = useReminders();

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dueDateHours, setDueDateHours] = useState(0);
  const [repeatPattern, setRepeatPattern] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [loading, setLoading] = useState(false);

  const dueDateOptions = [
    { label: 'Tidak ada', value: 0 },
    { label: '1 jam sebelumnya', value: 1 },
    { label: '3 jam sebelumnya', value: 3 },
    { label: '5 jam sebelumnya', value: 5 },
    { label: '24 jam sebelumnya', value: 24 },
  ];

  const repeatOptions = [
    { label: 'Tidak berulang', value: 'none' },
    { label: 'Setiap hari', value: 'daily' },
    { label: 'Setiap minggu', value: 'weekly' },
    { label: 'Setiap bulan', value: 'monthly' },
  ];

  // ✅ FIX: Handle Date Change dengan timezone awareness
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      // Preserve current time, update date only
      const newDate = new Date(reminderDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      
      setReminderDate(newDate);
    }
  };

  // ✅ FIX: Handle Time Change dengan timezone awareness
  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    
    if (selectedTime) {
      // Preserve current date, update time only
      const newDate = new Date(reminderDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      
      setReminderDate(newDate);
    }
  };

  const validateForm = (): boolean => {
    if (title.trim().length === 0) {
      Alert.alert('Error', 'Judul reminder tidak boleh kosong');
      return false;
    }

    const now = new Date();
    
    // ✅ FIX: Check dengan buffer 1 menit
    if (reminderDate.getTime() < now.getTime() - 60000) {
      Alert.alert(
        'Error', 
        `Waktu reminder harus di masa depan.\n\nWaktu sekarang: ${now.toLocaleString('id-ID')}\nWaktu reminder: ${reminderDate.toLocaleString('id-ID')}`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      await createReminder({
        title: title.trim(),
        description: description.trim(),
        reminder_time: reminderDate.toISOString(), // ✅ Send as ISO string
        is_active: true,
        due_date_hours: dueDateHours,
        repeat_pattern: repeatPattern,
      });

      Alert.alert('Berhasil', 'Reminder berhasil dibuat', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('❌ Submit error:', error);
      Alert.alert('Error', error.message || 'Gagal membuat reminder');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Format display dengan timezone local
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingTop: 50,
          paddingBottom: 16,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#000000" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#000000',
              marginLeft: 16,
            }}
          >
            Reminder Baru
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{ opacity: loading ? 0.5 : 1 }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#ABE7B2',
            }}
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Judul Reminder */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 8,
            }}
          >
            Judul Reminder *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Contoh: Minum obat diabetes"
            placeholderTextColor="#9CA3AF"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: '#000000',
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          />
        </View>

        {/* Deskripsi */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 8,
            }}
          >
            Deskripsi (Opsional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Tambahkan catatan..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: '#000000',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              minHeight: 80,
            }}
          />
        </View>

        {/* Tanggal */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 8,
            }}
          >
            Tanggal *
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text
                style={{
                  fontSize: 16,
                  color: '#000000',
                  marginLeft: 12,
                }}
              >
                {formatDate(reminderDate)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* Waktu */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 8,
            }}
          >
            Waktu *
          </Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text
                style={{
                  fontSize: 16,
                  color: '#000000',
                  marginLeft: 12,
                }}
              >
                {formatTime(reminderDate)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* ✅ Debug Info Card */}
        <View
          style={{
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            padding: 12,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
            🕐 Waktu Sekarang: {new Date().toLocaleString('id-ID')}
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
            ⏰ Waktu Reminder: {reminderDate.toLocaleString('id-ID')}
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280' }}>
            ⏱️ Sisa Waktu: {Math.max(0, Math.floor((reminderDate.getTime() - Date.now()) / 60000))} menit
          </Text>
        </View>

        {/* Due Date Reminder */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 8,
            }}
          >
            Pengingat Sebelumnya
          </Text>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              overflow: 'hidden',
            }}
          >
            {dueDateOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setDueDateHours(option.value)}
                style={{
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottomWidth: index < dueDateOptions.length - 1 ? 1 : 0,
                  borderBottomColor: '#F3F4F6',
                }}
              >
                <Text style={{ fontSize: 16, color: '#000000' }}>
                  {option.label}
                </Text>
                {dueDateHours === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#ABE7B2" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Repeat Pattern */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 8,
            }}
          >
            Pengulangan
          </Text>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              overflow: 'hidden',
            }}
          >
            {repeatOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setRepeatPattern(option.value as any)}
                style={{
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottomWidth: index < repeatOptions.length - 1 ? 1 : 0,
                  borderBottomColor: '#F3F4F6',
                }}
              >
                <Text style={{ fontSize: 16, color: '#000000' }}>
                  {option.label}
                </Text>
                {repeatPattern === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#ABE7B2" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Box */}
        <View
          style={{
            backgroundColor: '#EFF6FF',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            marginBottom: 24,
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#3B82F6"
            style={{ marginRight: 12, marginTop: 2 }}
          />
          <Text
            style={{
              fontSize: 13,
              color: '#1E40AF',
              lineHeight: 18,
              flex: 1,
            }}
          >
            Notifikasi akan muncul pada waktu yang ditentukan. Mungkin ada delay 1-2 menit karena sistem operasi.
          </Text>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={reminderDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={reminderDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
          is24Hour={true}
        />
      )}
    </View>
  );
}