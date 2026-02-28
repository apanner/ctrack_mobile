import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { colors } from '../../constants/colors';
import { GlassCard } from '../../components/GlassCard';
import { uiTokens } from '../../constants/ui-tokens';
import {
  getNotificationSettings,
  setNotificationSettings,
  type NotificationSettings,
} from '../../lib/settings-storage';
import { playNotificationSound } from '../../lib/notification-sounds';
import {
  useNotificationPreferences,
  useUpsertNotificationPreferences,
} from '../../lib/api/notifications';

const CHANNEL_MAP = {
  chatSounds: 'chat_sounds',
  taskAlerts: 'task_alerts',
  leaveUpdates: 'leave_updates',
  timesheetReminders: 'timesheet_reminders',
} as const;

function apiToSettings(prefs: { channel: string; enabled: boolean; quiet_hours_start: string | null; quiet_hours_end: string | null }[]): Partial<NotificationSettings> {
  const byChannel = Object.fromEntries(prefs.map((p) => [p.channel, p]));
  return {
    chatSounds: byChannel['chat_sounds']?.enabled ?? true,
    taskAlerts: byChannel['task_alerts']?.enabled ?? true,
    leaveUpdates: byChannel['leave_updates']?.enabled ?? true,
    timesheetReminders: byChannel['timesheet_reminders']?.enabled ?? true,
    quietHoursEnabled: Boolean((byChannel['chat_sounds'] ?? byChannel['task_alerts'])?.quiet_hours_start),
    quietHoursStart: (byChannel['chat_sounds'] ?? byChannel['task_alerts'])?.quiet_hours_start ?? '22:00',
    quietHoursEnd: (byChannel['chat_sounds'] ?? byChannel['task_alerts'])?.quiet_hours_end ?? '07:00',
  };
}

const SOUND_OPTIONS: Array<{ value: NotificationSettings['notificationSound']; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'chime', label: 'Chime' },
  { value: 'gentle', label: 'Gentle' },
  { value: 'none', label: 'None' },
];

export default function NotificationsSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const { data: apiPrefs, isLoading } = useNotificationPreferences();
  const upsertMutation = useUpsertNotificationPreferences();

  const load = useCallback(async () => {
    const local = await getNotificationSettings();
    setSettings(local);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!apiPrefs) return;
    const fromApi = apiToSettings(apiPrefs);
    setSettings((prev) => {
      const base: Partial<NotificationSettings> = prev ?? {
        notificationSound: 'default',
      };
      const next: NotificationSettings = {
        ...base,
        ...fromApi,
        notificationSound: base.notificationSound ?? 'default',
      };
      setNotificationSettings(next);
      return next;
    });
  }, [apiPrefs]);

  const syncToApi = useCallback(
    (s: NotificationSettings) => {
      upsertMutation.mutate({
        channels: [
          { channel: CHANNEL_MAP.chatSounds, enabled: s.chatSounds },
          { channel: CHANNEL_MAP.taskAlerts, enabled: s.taskAlerts },
          { channel: CHANNEL_MAP.leaveUpdates, enabled: s.leaveUpdates },
          { channel: CHANNEL_MAP.timesheetReminders, enabled: s.timesheetReminders },
        ],
        quiet_hours: s.quietHoursEnabled
          ? { start: s.quietHoursStart, end: s.quietHoursEnd }
          : undefined,
      });
    },
    [upsertMutation]
  );

  const update = useCallback(
    async (partial: Partial<NotificationSettings>) => {
      setSettings((prev) => {
        const next = prev ? { ...prev, ...partial } : null;
        if (next) {
          setNotificationSettings(next);
          syncToApi(next);
        }
        return next;
      });
    },
    [syncToApi]
  );

  const handleSoundPreview = useCallback((sound: NotificationSettings['notificationSound']) => {
    if (sound !== 'none') {
      playNotificationSound(sound);
    }
  }, []);

  if (isLoading && !settings) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <View style={styles.loadingCentered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Channels</Text>
          <GlassCard noPadding>
            <ToggleRow
              label="Chat sounds"
              value={settings.chatSounds}
              onValueChange={(v) => update({ chatSounds: v })}
            />
            <ToggleRow
              label="Task alerts"
              value={settings.taskAlerts}
              onValueChange={(v) => update({ taskAlerts: v })}
            />
            <ToggleRow
              label="Leave updates"
              value={settings.leaveUpdates}
              onValueChange={(v) => update({ leaveUpdates: v })}
            />
            <ToggleRow
              label="Timesheet reminders"
              value={settings.timesheetReminders}
              onValueChange={(v) => update({ timesheetReminders: v })}
            />
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification sound</Text>
          <GlassCard noPadding>
            {SOUND_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.soundRow}
                onPress={() => {
                  update({ notificationSound: opt.value });
                  if (opt.value !== 'none') handleSoundPreview(opt.value);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: settings.notificationSound === opt.value }}
              >
                <Text style={styles.soundLabel}>{opt.label}</Text>
                {opt.value !== 'none' ? (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleSoundPreview(opt.value);
                    }}
                    style={styles.previewButton}
                  >
                    <Text style={styles.previewText}>Preview</Text>
                  </TouchableOpacity>
                ) : null}
                {settings.notificationSound === opt.value ? (
                  <View style={styles.check} />
                ) : null}
              </TouchableOpacity>
            ))}
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet hours (optional)</Text>
          <GlassCard noPadding>
            <ToggleRow
              label="Enable quiet hours"
              value={settings.quietHoursEnabled}
              onValueChange={(v) => update({ quietHoursEnabled: v })}
            />
            {settings.quietHoursEnabled && (
              <>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Start</Text>
                  <Text style={styles.timeValue}>{settings.quietHoursStart}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>End</Text>
                  <Text style={styles.timeValue}>{settings.quietHoursEnd}</Text>
                </View>
              </>
            )}
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.backgroundTertiary, true: colors.accent }}
        thumbColor="#FFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: uiTokens.spacing.md,
    paddingVertical: uiTokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: uiTokens.radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: uiTokens.text.title,
    fontWeight: '700',
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: uiTokens.spacing.xl,
    paddingBottom: uiTokens.spacing.xxxl,
  },
  section: {
    marginBottom: uiTokens.spacing.xl,
  },
  sectionTitle: {
    fontSize: uiTokens.text.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: uiTokens.spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: uiTokens.spacing.md,
    paddingHorizontal: uiTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleLabel: {
    fontSize: uiTokens.text.bodyLg,
    color: colors.text,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: uiTokens.spacing.md,
    paddingHorizontal: uiTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  soundLabel: {
    fontSize: uiTokens.text.bodyLg,
    color: colors.text,
    flex: 1,
  },
  previewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
    marginRight: 12,
  },
  previewText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: uiTokens.spacing.sm,
    paddingHorizontal: uiTokens.spacing.md,
  },
  timeLabel: {
    fontSize: uiTokens.text.body,
    color: colors.textSecondary,
    width: 60,
  },
  timeValue: {
    fontSize: uiTokens.text.body,
    color: colors.text,
  },
  loadingCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
