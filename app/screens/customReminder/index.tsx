import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ReminderCard } from '../../../components/customReminder/ReminderCard';
import { useReminders } from '../../../src/hooks/useReminders';
import { REMINDER_EVENTS, reminderEvents } from '../../../src/utils/eventEmitter';

export default function CustomReminderScreen() {
  const { reminders, loading, deleteReminder, toggleActive, refetch } = useReminders();
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Listen to CRUD events untuk auto refresh
  useEffect(() => {
    console.log('📡 Setting up event listeners...');

    const handleReminderCreated = (data: any) => {
      console.log('🆕 Reminder created event received:', data?.id);
      refetch();
    };

    const handleReminderUpdated = (data: any) => {
      console.log('📝 Reminder updated event received:', data?.id);
      refetch();
    };

    const handleReminderDeleted = (id: string) => {
      console.log('🗑️ Reminder deleted event received:', id);
      refetch();
    };

    const handleReminderToggled = (data: any) => {
      console.log('🔄 Reminder toggled event received:', data?.id);
      refetch();
    };

    // Subscribe to events
    reminderEvents.on(REMINDER_EVENTS.CREATED, handleReminderCreated);
    reminderEvents.on(REMINDER_EVENTS.UPDATED, handleReminderUpdated);
    reminderEvents.on(REMINDER_EVENTS.DELETED, handleReminderDeleted);
    reminderEvents.on(REMINDER_EVENTS.TOGGLED, handleReminderToggled);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up event listeners...');
      reminderEvents.off(REMINDER_EVENTS.CREATED, handleReminderCreated);
      reminderEvents.off(REMINDER_EVENTS.UPDATED, handleReminderUpdated);
      reminderEvents.off(REMINDER_EVENTS.DELETED, handleReminderDeleted);
      reminderEvents.off(REMINDER_EVENTS.TOGGLED, handleReminderToggled);
    };
  }, [refetch]);

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Hapus Reminder',
      `Yakin ingin menghapus "${title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReminder(id);
              Alert.alert('Berhasil', 'Reminder berhasil dihapus');
              // ✅ Refresh akan otomatis via event
            } catch (err) {
              console.error('Delete error:', err);
              Alert.alert('Error', 'Gagal menghapus reminder');
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && reminders.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#ABE7B2" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Memuat data...</Text>
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
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#000000',
                marginLeft: 16,
              }}
            >
              Custom Reminder
            </Text>
          </View>
          
          {/* Manual Refresh Button */}
          <TouchableOpacity 
            onPress={onRefresh}
            disabled={refreshing}
            style={{ opacity: refreshing ? 0.5 : 1 }}
          >
            <Ionicons 
              name="refresh" 
              size={24} 
              color="#6B7280" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
            <Text
              style={{
                fontSize: 16,
                color: '#9CA3AF',
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              Belum ada reminder.{'\n'}Tap tombol + untuk membuat.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ReminderCard
            reminder={item}
            onToggle={() => toggleActive(item.id)}
            onEdit={() =>
              router.push({
                pathname: '/screens/customReminder/editReminder',
                params: { reminderId: item.id },
              } as any)
            }
            onDelete={() => handleDelete(item.id, item.title)}
          />
        )}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#ABE7B2',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,
        }}
        onPress={() => router.push('/screens/customReminder/addReminder' as any)}
      >
        <Ionicons name="add" size={32} color="#1F2937" />
      </TouchableOpacity>
    </View>
  );
}