import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  async requestPermissions() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }

      // ✅ Setup notification channel untuk Android
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('habitin-reminders', {
            name: 'Habitin Reminders',
            importance: Notifications.AndroidImportance.MAX,
            sound: 'notification_habitin.wav',
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#ABE7B2',
            enableVibrate: true,
            enableLights: true,
            showBadge: true,
          });
          console.log('✅ Notification channel created with custom sound');
        } catch (error) {
          console.warn('⚠️ Failed to set custom sound, using default:', error);
          // Fallback: create channel without custom sound
          await Notifications.setNotificationChannelAsync('habitin-reminders', {
            name: 'Habitin Reminders',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#ABE7B2',
            enableVibrate: true,
            enableLights: true,
            showBadge: true,
          });
        }
      }

      return true;
    } else {
      console.warn('Must use physical device for notifications');
      return false;
    }
  },

  // ✅ FIX: Schedule dengan timezone awareness
  async scheduleNotification(
    title: string,
    body: string,
    triggerDate: Date,
    reminderId: string
  ): Promise<string> {
    const now = new Date();
    
    let trigger: Notifications.NotificationTriggerInput;

    const secondsUntilTrigger = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);

    if (secondsUntilTrigger > 5) {
      // ✅ Use DATE trigger untuk waktu yang lebih dari 5 detik
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate, // Date object dengan timezone local
      };
      
      console.log('✅ Using DATE trigger');
      console.log('📅 Trigger date object:', triggerDate);
    } else if (secondsUntilTrigger > 0) {
      // ✅ Use TIME_INTERVAL untuk waktu dekat (kurang dari 5 detik)
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilTrigger,
        repeats: false,
      };
      
      console.log(`✅ Using TIME_INTERVAL trigger: ${secondsUntilTrigger}s`);
    } else {
      // ✅ Immediate notification (waktu sudah lewat)
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        repeats: false,
      };
      
      console.warn('⚠️ Trigger time is in the past! Scheduling immediately.');
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'notification_habitin.wav',
          data: { reminderId },
        },
        trigger,
        ...(Platform.OS === 'android' && {
          channelId: 'habitin-reminders'
        }),
      });

      console.log('✅ Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Failed to schedule with custom sound, trying default:', error);

      // Fallback: schedule without custom sound
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          data: { reminderId },
        },
        trigger,
        ...(Platform.OS === 'android' && {
          channelId: 'habitin-reminders'
        }),
      });

      return notificationId;
    }
  },

  async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  },
};