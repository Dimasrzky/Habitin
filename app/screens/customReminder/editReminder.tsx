import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

export default function EditReminderScreen() {
  const { reminderId } = useLocalSearchParams<{ reminderId: string }>();
  const { reminders, updateReminder } = useReminders();

  // Find current reminder
  const currentReminder = reminders.find((r) => r.id === reminderId);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dueDateHours, setDueDateHours] = useState(0);
  const [repeatPattern, setRepeatPattern] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Due Date Options
  const dueDateOptions = [
    { label: 'Tidak ada', value: 0 },
    { label: '1 jam sebelumnya', value: 1 },
    { label: '3 jam sebelumnya', value: 3 },
    { label: '5 jam sebelumnya', value: 5 },
    { label: '24 jam sebelumnya', value: 24 },
  ];

  // Repeat Options
  const repeatOptions = [
    { label: 'Tidak berulang', value: 'none' },
    { label: 'Setiap hari', value: 'daily' },
    { label: 'Setiap minggu', value: 'weekly' },
    { label: 'Setiap bulan', value: 'monthly' },
  ];

  // Load reminder data
  useEffect(() => {
    if (currentReminder) {
      setTitle(currentReminder.title);
      setDescription(currentReminder.description || '');
      setReminderDate(new Date(currentReminder.reminder_time));
      setDueDateHours(currentReminder.due_date_hours);
      setRepeatPattern(currentReminder.repeat_pattern);
      setInitialLoading(false);
    }
  }, [currentReminder]);

  // Handle Date Change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDate = new Date(reminderDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setReminderDate(newDate);
    }
  };

  // Handle Time Change
  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(reminderDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setReminderDate(newDate);
    }
  };

  // Validate Form
  const validateForm = (): boolean => {
    if (title.trim().length === 0) {
      Alert.alert('Error', 'Judul reminder tidak boleh kosong');
      return false;
    }

    return true;
  };

  // Handle Submit
  const handleSubmit = async () => {
    if (!validateForm() || !reminderId) return;

    try {
      setLoading(true);

      await updateReminder(reminderId, {
        title: title.trim(),
        description: description.trim(),
        reminder_time: reminderDate.toISOString(),
        due_date_hours: dueDateHours,
        repeat_pattern: repeatPattern,
      });

      Alert.alert('Berhasil', 'Reminder berhasil diperbarui', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal memperbarui reminder');
    } finally {
      setLoading(false);
    }
  };

  // Format Date Display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format Time Display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (initialLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ABE7B2" />
      </View>
    );
  }

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
            Edit Reminder
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
                <Text
                  style={{
                    fontSize: 16,
                    color: '#000000',
                  }}
                >
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
                <Text
                  style={{
                    fontSize: 16,
                    color: '#000000',
                  }}
                >
                  {option.label}
                </Text>
                {repeatPattern === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#ABE7B2" />
                )}
              </TouchableOpacity>
            ))}
          </View>
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