import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

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
    
    console.log('🔔 ==================== SCHEDULE NOTIFICATION ====================');
    console.log('📅 Current time:', now.toLocaleString('id-ID'));
    console.log('📅 Trigger time:', triggerDate.toLocaleString('id-ID'));
    console.log('📅 Current timestamp:', now.getTime());
    console.log('📅 Trigger timestamp:', triggerDate.getTime());
    console.log('⏱️ Delay (seconds):', Math.floor((triggerDate.getTime() - now.getTime()) / 1000));
    
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

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { reminderId },
      },
      trigger,
    });

    console.log('✅ Notification scheduled with ID:', notificationId);
    console.log('🔔 ==================== END SCHEDULE ====================');

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