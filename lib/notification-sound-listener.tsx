/**
 * Listens for in-app push notifications and plays the selected sound.
 * Only runs when notification settings allow (channels, quiet hours).
 */
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getNotificationSettings } from './settings-storage';
import { playNotificationSound } from './notification-sounds';

function isInQuietHours(start: string, end: string): boolean {
  const now = new Date();
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;

  if (startMins <= endMins) {
    return nowMins >= startMins && nowMins < endMins;
  }
  return nowMins >= startMins || nowMins < endMins;
}

export function NotificationSoundListener() {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const sub = Notifications.addNotificationReceivedListener(async (notification) => {
      const settings = await getNotificationSettings();
      if (settings.notificationSound === 'none') return;

      if (settings.quietHoursEnabled && isInQuietHours(settings.quietHoursStart, settings.quietHoursEnd)) {
        return;
      }

      const type = notification.request.content.data?.type as string | undefined;
      const channelEnabled =
        (type === 'chat' && settings.chatSounds) ||
        (type === 'task' && settings.taskAlerts) ||
        (type === 'leave' && settings.leaveUpdates) ||
        (type === 'timesheet' && settings.timesheetReminders) ||
        !type;

      if (channelEnabled) {
        playNotificationSound(settings.notificationSound);
      }
    });

    return () => sub.remove();
  }, []);

  return null;
}
