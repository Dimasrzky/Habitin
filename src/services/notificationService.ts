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

      // ✅ Setup notification channel untuk Android dengan custom sound
      if (Platform.OS === 'android') {
        // Delete old channel jika ada
        try {
          await Notifications.deleteNotificationChannelAsync('habitin-reminders');
        } catch {
          // Ignore error if channel doesn't exist
        }

        // Create new channel dengan custom sound
        const channelId = 'habitin-reminders-v2'; // New channel ID untuk force update
        await Notifications.setNotificationChannelAsync(channelId, {
          name: 'Habitin Reminders',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'notification_habitin.wav',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#ABE7B2',
          enableVibrate: true,
          enableLights: true,
          showBadge: true,
          audioAttributes: {
            usage: Notifications.AndroidAudioUsage.NOTIFICATION,
            contentType: Notifications.AndroidAudioContentType.SONIFICATION,
          },
        });

        console.log('✅ Notification channel created with custom sound: notification_habitin.wav');
      }

      return true;
    } else {
      console.warn('Must use physical device for notifications');
      return false;
    }
  },

  // ✅ FIX: Schedule dengan timezone awareness dan CALENDAR trigger untuk akurasi
  async scheduleNotification(
    title: string,
    body: string,
    triggerDate: Date,
    reminderId: string
  ): Promise<string> {
    const now = new Date();

    let trigger: Notifications.NotificationTriggerInput;

    const secondsUntilTrigger = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);

    console.log('⏰ Scheduling notification:');
    console.log('   Current time:', now.toLocaleString('id-ID'));
    console.log('   Target time:', triggerDate.toLocaleString('id-ID'));
    console.log('   Seconds until trigger:', secondsUntilTrigger);

    if (secondsUntilTrigger > 60) {
      // ✅ Use CALENDAR trigger untuk akurasi yang lebih baik (lebih dari 1 menit)
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        repeats: false,
        year: triggerDate.getFullYear(),
        month: triggerDate.getMonth() + 1, // month is 1-indexed in Calendar trigger
        day: triggerDate.getDate(),
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
        second: 0,
      };

      console.log('✅ Using CALENDAR trigger for precise timing');
    } else if (secondsUntilTrigger > 0) {
      // ✅ Use TIME_INTERVAL untuk waktu dekat (kurang dari 1 menit)
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, secondsUntilTrigger),
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

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'notification_habitin.wav',
        data: { reminderId },
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger,
      ...(Platform.OS === 'android' && {
        channelId: 'habitin-reminders-v2'
      }),
    });

    console.log('✅ Notification scheduled with ID:', notificationId);
    console.log('   Channel: habitin-reminders-v2');
    console.log('   Sound: notification_habitin.wav');

    return notificationId;
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