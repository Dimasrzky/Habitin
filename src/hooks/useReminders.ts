import { useEffect, useState } from 'react';
import { auth } from '../config/firebase.config';
import { supabase } from '../config/supabase.config';
import { notificationService } from '../services/notificationService';

// ==================== TYPES ====================
export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_time: string;
  is_active: boolean;
  notification_id?: string;
  due_date_hours: number;
  repeat_pattern: 'none' | 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

export const useReminders = () => {
  // ==================== STATE ====================
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== FETCH REMINDERS ====================
  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.log('⚠️ No user authenticated');
        setReminders([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('reminder_time', { ascending: true });

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        throw fetchError;
      }

      setReminders(data || []);
    } catch (err: any) {
      console.error('❌ FETCH REMINDERS ERROR:', err);
      setError(err.message || 'Gagal mengambil data reminder');
    } finally {
      setLoading(false);
    }
  };

  // ==================== CREATE REMINDER ====================
  const createReminder = async (
    reminderData: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Request notification permission
      await notificationService.requestPermissions();

      // Schedule main notification
      const reminderDate = new Date(reminderData.reminder_time);
      
      const mainNotificationId = await notificationService.scheduleNotification(
        reminderData.title,
        reminderData.description || 'Waktunya untuk reminder!',
        reminderDate,
        'temp-id'
      );

      // Schedule due date reminder if set
      if (reminderData.due_date_hours > 0) {
        const dueDate = new Date(reminderDate);
        dueDate.setHours(dueDate.getHours() - reminderData.due_date_hours);

        await notificationService.scheduleNotification(
          `⏰ ${reminderData.title}`,
          `Akan dimulai dalam ${reminderData.due_date_hours} jam`,
          dueDate,
          'temp-due-id'
        );

        console.log('✅ Due date notification scheduled');
      }

      // Prepare data for insert
      const dataToInsert = {
        user_id: userId,
        title: reminderData.title.trim(),
        description: reminderData.description?.trim() || null,
        reminder_time: reminderData.reminder_time,
        is_active: reminderData.is_active,
        notification_id: mainNotificationId,
        due_date_hours: reminderData.due_date_hours,
        repeat_pattern: reminderData.repeat_pattern,
      };

      console.log('📤 Inserting to Supabase:', dataToInsert);

      // Insert to database
      const { data, error: insertError } = await supabase
        .from('reminders')
        .insert(dataToInsert)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Supabase insert error:', insertError);
        throw insertError;
      }

      console.log('✅ Insert SUCCESS:', {
        id: data.id,
        title: data.title,
        created_at: data.created_at,
      });

      await fetchReminders();
      
      return data;
    } catch (err: any) {
      console.error('❌ CREATE REMINDER ERROR:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
      });
      
      setError(err.message || 'Gagal membuat reminder');
      throw err;
    }
  };

  // ==================== UPDATE REMINDER ====================
  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log('🔵 ==================== START: UPDATE REMINDER ====================');
      console.log('🔄 Updating reminder:', id);
      console.log('📝 Updates:', updates);

      // Find current reminder
      const oldReminder = reminders.find((r) => r.id === id);
      
      if (!oldReminder) {
        throw new Error('Reminder not found');
      }

      if (oldReminder.user_id !== userId) {
        throw new Error('Unauthorized: Not your reminder');
      }

      console.log('📋 Current reminder:', {
        title: oldReminder.title,
        time: new Date(oldReminder.reminder_time).toLocaleString('id-ID'),
      });

      // Cancel old notification
      if (oldReminder?.notification_id) {
        console.log('🔕 Canceling old notification:', oldReminder.notification_id);
        await notificationService.cancelNotification(oldReminder.notification_id);
      }

      // Schedule new notification if time changed
      let newNotificationId = oldReminder?.notification_id;
      
      if (updates.reminder_time) {
        const newDate = new Date(updates.reminder_time);
        console.log('🔔 Scheduling new notification for:', newDate.toLocaleString('id-ID'));

        newNotificationId = await notificationService.scheduleNotification(
          updates.title || oldReminder?.title || '',
          updates.description || oldReminder?.description || '',
          newDate,
          id
        );

        console.log('✅ New notification scheduled:', newNotificationId);
      }

      // Update database
      const updateData = {
        ...updates,
        notification_id: newNotificationId,
        updated_at: new Date().toISOString(),
      };

      console.log('📤 Updating Supabase:', updateData);

      const { error: updateError } = await supabase
        .from('reminders')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Supabase update error:', updateError);
        throw updateError;
      }

      console.log('✅ Update SUCCESS');

      // Refetch
      console.log('🔄 Refreshing reminders list...');
      await fetchReminders();

      console.log('🔵 ==================== END: UPDATE REMINDER ====================');
    } catch (err: any) {
      console.error('❌ UPDATE REMINDER ERROR:', err);
      setError(err.message || 'Gagal update reminder');
      throw err;
    }
  };

  // ==================== DELETE REMINDER ====================
  const deleteReminder = async (id: string) => {
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log('🔵 ==================== START: DELETE REMINDER ====================');
      console.log('🗑️ Deleting reminder:', id);

      // Find reminder
      const reminder = reminders.find((r) => r.id === id);

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      if (reminder.user_id !== userId) {
        throw new Error('Unauthorized: Not your reminder');
      }

      console.log('📋 Reminder to delete:', {
        title: reminder.title,
        notification_id: reminder.notification_id,
      });

      // Cancel notification
      if (reminder?.notification_id) {
        console.log('🔕 Canceling notification:', reminder.notification_id);
        await notificationService.cancelNotification(reminder.notification_id);
        console.log('✅ Notification canceled');
      }

      // Delete from database
      console.log('📤 Deleting from Supabase...');

      const { error: deleteError } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Supabase delete error:', deleteError);
        throw deleteError;
      }

      console.log('✅ Delete SUCCESS');

      // Refetch
      console.log('🔄 Refreshing reminders list...');
      await fetchReminders();

      console.log('🔵 ==================== END: DELETE REMINDER ====================');
    } catch (err: any) {
      console.error('❌ DELETE REMINDER ERROR:', err);
      setError(err.message || 'Gagal hapus reminder');
      throw err;
    }
  };

  // ==================== TOGGLE ACTIVE ====================
  const toggleActive = async (id: string) => {
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log('🔵 ==================== START: TOGGLE ACTIVE ====================');
      console.log('🔄 Toggling active status for reminder:', id);

      const reminder = reminders.find((r) => r.id === id);
      
      if (!reminder) {
        throw new Error('Reminder not found');
      }

      if (reminder.user_id !== userId) {
        throw new Error('Unauthorized: Not your reminder');
      }

      const newActiveStatus = !reminder.is_active;
      console.log(`📋 Changing status from ${reminder.is_active} to ${newActiveStatus}`);

      if (newActiveStatus) {
        // Activate: schedule notification
        console.log('🔔 Activating reminder - scheduling notification...');
        
        const notificationId = await notificationService.scheduleNotification(
          reminder.title,
          reminder.description || '',
          new Date(reminder.reminder_time),
          id
        );

        console.log('✅ Notification scheduled:', notificationId);

        await supabase
          .from('reminders')
          .update({ 
            is_active: true, 
            notification_id: notificationId 
          })
          .eq('id', id)
          .eq('user_id', userId);

        console.log('✅ Reminder activated');
      } else {
        // Deactivate: cancel notification
        console.log('🔕 Deactivating reminder - canceling notification...');
        
        if (reminder.notification_id) {
          await notificationService.cancelNotification(reminder.notification_id);
          console.log('✅ Notification canceled');
        }

        await supabase
          .from('reminders')
          .update({ is_active: false })
          .eq('id', id)
          .eq('user_id', userId);

        console.log('✅ Reminder deactivated');
      }

      // Refetch
      console.log('🔄 Refreshing reminders list...');
      await fetchReminders();

      console.log('🔵 ==================== END: TOGGLE ACTIVE ====================');
    } catch (err: any) {
      console.error('❌ TOGGLE ACTIVE ERROR:', err);
      setError(err.message || 'Gagal toggle reminder');
      throw err;
    }
  };

  // ==================== INITIAL FETCH ====================
  useEffect(() => {
    fetchReminders();
  }, []);

  // ==================== RETURN ====================
  return {
    reminders,
    loading,
    error,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleActive,
    refetch: fetchReminders,
  };
};