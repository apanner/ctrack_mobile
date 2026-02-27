import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  loadRemindersPreferences,
  saveRemindersPreferences,
  scheduleDailyNotification,
  scheduleIntervalNotification,
  cancelReminder,
  type RemindersPreferences,
} from '../reminders';
import { REMINDER_IDS } from '../reminders';
import { apiJson } from './client';

const REMINDERS_QUERY_KEY = ['reminders-preferences'];

export function useRemindersPreferences() {
  return useQuery({
    queryKey: REMINDERS_QUERY_KEY,
    queryFn: async () => {
      const local = await loadRemindersPreferences();
      try {
        const res = await apiJson<{ data?: { preferences?: RemindersPreferences } }>(
          '/api/v1/mobile/reminders'
        );
        const prefs = res?.data?.preferences;
        if (prefs && typeof prefs === 'object' && 'shiftStart' in prefs) return prefs;
      } catch {
        // Backend may not exist; use local
      }
      return local;
    },
    staleTime: 60_000,
  });
}

export function useUpdateRemindersPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prefs: RemindersPreferences) => {
      await saveRemindersPreferences(prefs);
      try {
        await apiJson('/api/v1/mobile/reminders', {
          method: 'POST',
          body: JSON.stringify({ preferences: prefs }),
        });
      } catch {
        // Local-only if backend fails
      }
      await applyReminderSchedules(prefs);
      return prefs;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
    },
  });
}

export async function applyReminderSchedules(prefs: RemindersPreferences): Promise<void> {
  if (prefs.shiftStart.enabled) {
    const [h, m] = prefs.shiftStart.time.split(':').map(Number);
    await scheduleDailyNotification(
      REMINDER_IDS.shift_start,
      'Shift Starting',
      "Time to start your shift. Don't forget to log in!",
      h,
      m
    );
  } else {
    await cancelReminder(REMINDER_IDS.shift_start);
  }

  if (prefs.timesheetReminder.enabled) {
    const [h, m] = prefs.timesheetReminder.time.split(':').map(Number);
    await scheduleDailyNotification(
      REMINDER_IDS.timesheet,
      'Timesheet Reminder',
      "Don't forget to submit your timesheet for today.",
      h,
      m
    );
  } else {
    await cancelReminder(REMINDER_IDS.timesheet);
  }

  if (prefs.breakReminder.enabled) {
    const minutes = parseInt(prefs.breakReminder.time, 10);
    const seconds = Number.isNaN(minutes) ? 45 * 60 : minutes * 60;
    if (seconds >= 60) {
      await scheduleIntervalNotification(
        REMINDER_IDS.break_reminder,
        'Take a Break',
        "You've been working for a while. Time for a short break!",
        seconds
      );
    } else {
      await cancelReminder(REMINDER_IDS.break_reminder);
    }
  } else {
    await cancelReminder(REMINDER_IDS.break_reminder);
  }
}
