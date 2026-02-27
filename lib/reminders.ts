import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const REMINDERS_PREFS_KEY = 'ctrack-reminders-preferences';

export type ReminderType =
  | 'shift_start'
  | 'timesheet_incomplete'
  | 'break_reminder'
  | 'overtime_alert';

export interface ShiftStartPref {
  enabled: boolean;
  time: string; // "HH:mm"
}

export interface TimesheetReminderPref {
  enabled: boolean;
  time: string; // "HH:mm" e.g. "18:30" for 6:30pm
}

export interface BreakReminderPref {
  enabled: boolean;
  time: string; // e.g. "45" for every 45 min, or "12:00" for fixed time
}

export interface OvertimeAlertPref {
  enabled: boolean;
  threshold: number; // hours, e.g. 10
}

export interface RemindersPreferences {
  shiftStart: ShiftStartPref;
  timesheetReminder: TimesheetReminderPref;
  breakReminder: BreakReminderPref;
  overtimeAlert: OvertimeAlertPref;
}

const DEFAULT_PREFS: RemindersPreferences = {
  shiftStart: { enabled: false, time: '09:00' },
  timesheetReminder: { enabled: true, time: '18:30' },
  breakReminder: { enabled: false, time: '45' },
  overtimeAlert: { enabled: true, threshold: 10 },
};

export async function loadRemindersPreferences(): Promise<RemindersPreferences> {
  try {
    const raw = await AsyncStorage.getItem(REMINDERS_PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<RemindersPreferences>;
    return {
      shiftStart: { ...DEFAULT_PREFS.shiftStart, ...parsed.shiftStart },
      timesheetReminder: { ...DEFAULT_PREFS.timesheetReminder, ...parsed.timesheetReminder },
      breakReminder: { ...DEFAULT_PREFS.breakReminder, ...parsed.breakReminder },
      overtimeAlert: { ...DEFAULT_PREFS.overtimeAlert, ...parsed.overtimeAlert },
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function saveRemindersPreferences(prefs: RemindersPreferences): Promise<void> {
  await AsyncStorage.setItem(REMINDERS_PREFS_KEY, JSON.stringify(prefs));
}

/** Schedule daily notification at specific hour:minute */
export async function scheduleDailyNotification(
  id: string,
  title: string,
  body: string,
  hour: number,
  minute: number
): Promise<string | null> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    await Notifications.cancelScheduledNotificationAsync(id);

    return await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: { title, body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'reminders',
      },
    });
  } catch (e) {
    console.warn('Failed to schedule notification:', e);
    return null;
  }
}

/** Schedule repeating time interval (e.g. every 45 min for break) */
export async function scheduleIntervalNotification(
  id: string,
  title: string,
  body: string,
  seconds: number
): Promise<string | null> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    await Notifications.cancelScheduledNotificationAsync(id);

    return await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: { title, body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: true,
        channelId: 'reminders',
      },
    });
  } catch (e) {
    console.warn('Failed to schedule interval notification:', e);
    return null;
  }
}

export async function cancelReminder(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // ignore
  }
}

export const REMINDER_IDS = {
  shift_start: 'ctrack-reminder-shift-start',
  timesheet: 'ctrack-reminder-timesheet',
  break_reminder: 'ctrack-reminder-break',
} as const;
