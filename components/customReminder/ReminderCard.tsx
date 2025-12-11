import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { Reminder } from '../../src/hooks/useReminders';

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const reminderDate = new Date(reminder.reminder_time);
  const formattedDate = reminderDate.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = reminderDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: reminder.is_active ? '#ABE7B2' : '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Left: Time & Title */}
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: reminder.is_active ? '#000000' : '#9CA3AF',
              marginBottom: 4,
            }}
          >
            {formattedTime}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#6B7280',
              marginBottom: 8,
            }}
          >
            {formattedDate}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: reminder.is_active ? '#000000' : '#9CA3AF',
            }}
          >
            {reminder.title}
          </Text>
          {reminder.description && (
            <Text
              style={{
                fontSize: 13,
                color: '#9CA3AF',
                marginTop: 4,
              }}
            >
              {reminder.description}
            </Text>
          )}

          {/* Due Date Badge */}
          {reminder.due_date_hours > 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Ionicons name="time-outline" size={14} color="#93BFC7" />
              <Text
                style={{
                  fontSize: 12,
                  color: '#93BFC7',
                  marginLeft: 4,
                }}
              >
                Reminder {reminder.due_date_hours}h sebelumnya
              </Text>
            </View>
          )}
        </View>

        {/* Right: Switch & Actions */}
        <View style={{ alignItems: 'flex-end' }}>
          <Switch
            value={reminder.is_active}
            onValueChange={onToggle}
            trackColor={{ false: '#D1D5DB', true: '#ABE7B2' }}
            thumbColor="#FFFFFF"
          />

          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <TouchableOpacity onPress={onEdit} style={{ marginRight: 12 }}>
              <Ionicons name="create-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};