import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useRemindersPreferences, useUpdateRemindersPreferences, applyReminderSchedules } from '../../lib/api/reminders';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../constants/colors';
import type { RemindersPreferences } from '../../lib/reminders';

function TimeInput({
  value,
  onChange,
  placeholder = 'HH:mm',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <TextInput
      style={styles.timeInput}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textTertiary}
      keyboardType="numbers-and-punctuation"
    />
  );
}

export default function RemindersScreen() {
  const { data: prefs, isLoading } = useRemindersPreferences();
  const updatePrefs = useUpdateRemindersPreferences();
  const [local, setLocal] = useState<RemindersPreferences | null>(null);

  useEffect(() => {
    if (prefs) {
      setLocal(prefs);
      applyReminderSchedules(prefs).catch(console.warn);
    }
  }, [prefs]);

  const handleToggle = (key: keyof RemindersPreferences, field: string, value: boolean) => {
    if (!local) return;
    setLocal({
      ...local,
      [key]: { ...local[key], [field]: value } as never,
    });
  };

  const handleTimeChange = (key: keyof RemindersPreferences, field: string, value: string) => {
    if (!local) return;
    setLocal({
      ...local,
      [key]: { ...local[key], [field]: value } as never,
    });
  };

  const handleThresholdChange = (value: string) => {
    if (!local) return;
    const n = parseInt(value, 10);
    setLocal({
      ...local,
      overtimeAlert: { ...local.overtimeAlert, threshold: Number.isNaN(n) ? 10 : Math.max(1, Math.min(24, n)) },
    });
  };

  const handleSave = async () => {
    if (!local) return;
    await updatePrefs.mutateAsync(local);
  };

  if (isLoading || !local) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reminders</Text>
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reminders</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <GlassCard style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Shift start</Text>
            <Switch
              value={local.shiftStart.enabled}
              onValueChange={(v) => handleToggle('shiftStart', 'enabled', v)}
              trackColor={{ false: colors.backgroundTertiary, true: colors.accent }}
            />
          </View>
          {local.shiftStart.enabled && (
            <View style={styles.row}>
              <Text style={styles.subLabel}>Time</Text>
              <TimeInput
                value={local.shiftStart.time}
                onChange={(v) => handleTimeChange('shiftStart', 'time', v)}
              />
            </View>
          )}
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Timesheet reminder</Text>
            <Switch
              value={local.timesheetReminder.enabled}
              onValueChange={(v) => handleToggle('timesheetReminder', 'enabled', v)}
              trackColor={{ false: colors.backgroundTertiary, true: colors.accent }}
            />
          </View>
          {local.timesheetReminder.enabled && (
            <View style={styles.row}>
              <Text style={styles.subLabel}>Time (e.g. 18:30)</Text>
              <TimeInput
                value={local.timesheetReminder.time}
                onChange={(v) => handleTimeChange('timesheetReminder', 'time', v)}
              />
            </View>
          )}
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Break reminder</Text>
            <Switch
              value={local.breakReminder.enabled}
              onValueChange={(v) => handleToggle('breakReminder', 'enabled', v)}
              trackColor={{ false: colors.backgroundTertiary, true: colors.accent }}
            />
          </View>
          {local.breakReminder.enabled && (
            <View style={styles.row}>
              <Text style={styles.subLabel}>Every (minutes)</Text>
              <TimeInput
                value={local.breakReminder.time}
                onChange={(v) => handleTimeChange('breakReminder', 'time', v)}
                placeholder="45"
              />
            </View>
          )}
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Overtime alert</Text>
            <Switch
              value={local.overtimeAlert.enabled}
              onValueChange={(v) => handleToggle('overtimeAlert', 'enabled', v)}
              trackColor={{ false: colors.backgroundTertiary, true: colors.accent }}
            />
          </View>
          {local.overtimeAlert.enabled && (
            <View style={styles.row}>
              <Text style={styles.subLabel}>Threshold (hours)</Text>
              <TextInput
                style={styles.timeInput}
                value={String(local.overtimeAlert.threshold)}
                onChangeText={handleThresholdChange}
                placeholder="10"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
              />
            </View>
          )}
        </GlassCard>

        <TouchableOpacity
          style={[styles.saveBtn, updatePrefs.isPending && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={updatePrefs.isPending}
        >
          {updatePrefs.isPending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  subLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 12,
  },
  timeInput: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  saveBtn: {
    marginTop: 24,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
