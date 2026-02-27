import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useShots } from '../../lib/api/shots';
import { useProjects } from '../../lib/api/projects';
import { useCurrentUser } from '../../lib/api/profile';
import { useTimesheets, useCreateTimeLog } from '../../lib/api/timesheets';
import { useAdaptiveLayout } from '../../lib/adaptive-layout';
import { TabControl } from '../../components/TabControl';
import { GlassCard } from '../../components/GlassCard';
import { ShotTaskCard } from '../../components/ShotTaskCard';
import { BrandSpinner } from '../../components/BrandSpinner';
import { colors } from '../../constants/colors';
import { router } from 'expo-router';
import { Calendar, Clock, ChevronDown } from 'lucide-react-native';
import { format, addDays, subDays } from 'date-fns';

export default function WorkScreen() {
  const params = useLocalSearchParams<{ focusHours?: string; taskId?: string; shotId?: string }>();
  const { spacing } = useAdaptiveLayout();
  const [segment, setSegment] = useState<'Timesheet' | 'Tasks'>('Timesheet');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [projectId, setProjectId] = useState<string | null>(null);
  const [shotId, setShotId] = useState<string | null>(params.shotId ?? null);
  const [hoursInput, setHoursInput] = useState(params.focusHours ?? '');
  const [notesInput, setNotesInput] = useState('');

  useEffect(() => {
    if (params.focusHours) {
      setSegment('Timesheet');
      setShotId(params.shotId || null);
      setHoursInput(params.focusHours);
    }
  }, [params.focusHours, params.shotId]);

  const { data: user } = useCurrentUser();
  const { data: projects = [] } = useProjects();
  const { data: shots = [], isLoading: shotsLoading } = useShots(
    projectId
      ? { project_id: projectId }
      : user?.role === 'artist'
        ? { artist_id: user?.id }
        : undefined
  );
  const { data: timesheetsData, isLoading: timesheetsLoading } = useTimesheets(
    selectedDate,
    selectedDate
  );
  const createTimeLog = useCreateTimeLog();

  const isArtist = user?.role === 'artist';
  const myShots = isArtist ? shots.filter((s) => s.artist_id === user?.id) : shots;
  const projectShots = projectId ? shots.filter((s) => s.project_id === projectId) : myShots;

  const today = new Date();
  const selectedDateObj = new Date(selectedDate);
  const isOverdue = (due: string) => new Date(due) < today && due;
  const assignedShots = myShots.filter(
    (s) => s.status === 'Not Started' || s.status === 'In Progress'
  );
  const completedShots = myShots.filter((s) => s.status === 'Completed');
  const overdueShots = assignedShots.filter((s) => isOverdue(s.due_date));

  const handleSaveTimesheet = async () => {
    const hours = parseFloat(hoursInput);
    if (!hours || hours <= 0) return;
    try {
      await createTimeLog.mutateAsync({
        workDate: selectedDate,
        projectId: projectId ?? undefined,
        shotId: shotId ?? undefined,
        taskId: params.taskId ?? undefined,
        hoursWorked: hours,
        notes: notesInput || undefined,
      });
      setHoursInput('');
      setNotesInput('');
    } catch (e) {
      console.error('Save timesheet failed:', e);
    }
  };

  if (shotsLoading && segment === 'Tasks') {
    return (
      <SafeAreaView style={styles.container}>
        <BrandSpinner fullScreen size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <Text style={styles.headerTitle}>Work</Text>
      </View>

      <TabControl
        tabs={['Timesheet', 'Tasks']}
        activeTab={segment}
        onTabChange={(t) => setSegment(t as 'Timesheet' | 'Tasks')}
      />

      {segment === 'Timesheet' ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
        >
          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <Text style={styles.sectionLabel}>Date</Text>
            <View style={styles.daySelector}>
              <TouchableOpacity
                onPress={() => setSelectedDate(format(subDays(selectedDateObj, 1), 'yyyy-MM-dd'))}
                style={styles.dayNavBtn}
              >
                <Text style={styles.dayNavText}>←</Text>
              </TouchableOpacity>
              <View style={styles.dayDisplay}>
                <Calendar size={18} color={colors.accent} />
                <Text style={styles.dayText}>{format(selectedDateObj, 'EEE, MMM d')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedDate(format(addDays(selectedDateObj, 1), 'yyyy-MM-dd'))}
                style={styles.dayNavBtn}
              >
                <Text style={styles.dayNavText}>→</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <Text style={styles.sectionLabel}>Project</Text>
            <View style={styles.picker}>
              <Text style={styles.pickerText}>
                {projectId
                  ? projects.find((p) => p.id === projectId)?.name ?? 'Select'
                  : 'Any / General'}
              </Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity
                style={[styles.chip, !projectId && styles.chipActive]}
                onPress={() => setProjectId(null)}
              >
                <Text style={[styles.chipText, !projectId && styles.chipTextActive]}>Any</Text>
              </TouchableOpacity>
              {projects.slice(0, 6).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.chip, projectId === p.id && styles.chipActive]}
                  onPress={() => {
                    setProjectId(p.id);
                    setShotId(null);
                  }}
                >
                  <Text style={[styles.chipText, projectId === p.id && styles.chipTextActive]}>
                    {p.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <Text style={styles.sectionLabel}>Shot / Task</Text>
            <View style={styles.picker}>
              <Text style={styles.pickerText}>
                {shotId
                  ? projectShots.find((s) => s.id === shotId)?.shot_code ?? 'Select'
                  : 'Optional'}
              </Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity
                style={[styles.chip, !shotId && styles.chipActive]}
                onPress={() => setShotId(null)}
              >
                <Text style={[styles.chipText, !shotId && styles.chipTextActive]}>None</Text>
              </TouchableOpacity>
              {projectShots.slice(0, 8).map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.chip, shotId === s.id && styles.chipActive]}
                  onPress={() => setShotId(s.id)}
                >
                  <Text style={[styles.chipText, shotId === s.id && styles.chipTextActive]}>
                    {s.shot_code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <Text style={styles.sectionLabel}>Hours</Text>
            <View style={styles.hoursRow}>
              <Clock size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.hoursInput}
                placeholder="0.0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                value={hoursInput}
                onChangeText={setHoursInput}
              />
            </View>
          </View>

          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <Text style={styles.sectionLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes..."
              placeholderTextColor={colors.textTertiary}
              value={notesInput}
              onChangeText={setNotesInput}
              multiline
            />
          </View>

          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <Pressable
              style={[
                styles.saveBtn,
                (!hoursInput || parseFloat(hoursInput) <= 0) && styles.saveBtnDisabled,
              ]}
              onPress={handleSaveTimesheet}
              disabled={
                !hoursInput ||
                parseFloat(hoursInput) <= 0 ||
                createTimeLog.isPending
              }
            >
              {createTimeLog.isPending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save / Submit</Text>
              )}
            </Pressable>
          </View>

          {timesheetsData?.data && timesheetsData.data.length > 0 && (
            <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
              <Text style={styles.sectionLabel}>Today&apos;s logs</Text>
              {timesheetsData.data
                .filter((t) => t.work_date === selectedDate)
                .map((t) => (
                  <GlassCard key={t.id} style={{ marginBottom: spacing.sm }}>
                    <View style={styles.logRow}>
                      <Text style={styles.logHours}>{t.hours_worked}h</Text>
                      <Text style={styles.logNotes}>{t.notes || '—'}</Text>
                    </View>
                  </GlassCard>
                ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
        >
          <View style={[styles.taskLanes, { paddingHorizontal: spacing.lg }]}>
            {overdueShots.length > 0 && (
              <View style={styles.lane}>
                <Text style={styles.laneTitle}>Overdue</Text>
                {overdueShots.map((shot) => (
                  <ShotTaskCard key={shot.id} shot={shot} variant="overdue" />
                ))}
              </View>
            )}
            <View style={styles.lane}>
              <Text style={styles.laneTitle}>Assigned</Text>
              {assignedShots
                .filter((s) => !isOverdue(s.due_date))
                .map((shot) => (
                  <ShotTaskCard key={shot.id} shot={shot} variant="default" />
                ))}
              {assignedShots.filter((s) => !isOverdue(s.due_date)).length === 0 &&
                overdueShots.length === 0 && (
                  <GlassCard>
                    <Text style={styles.emptyText}>No assigned tasks</Text>
                  </GlassCard>
                )}
            </View>
            <View style={styles.lane}>
              <Text style={styles.laneTitle}>Completed</Text>
              {completedShots.slice(0, 5).map((shot) => (
                <ShotTaskCard key={shot.id} shot={shot} variant="completed" />
              ))}
              {completedShots.length === 0 && (
                <GlassCard>
                  <Text style={styles.emptyText}>No completed tasks yet</Text>
                </GlassCard>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  daySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayNavBtn: {
    padding: 8,
  },
  dayNavText: {
    fontSize: 18,
    color: colors.accent,
    fontWeight: '600',
  },
  dayDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
  },
  chipScroll: {
    marginTop: 10,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundTertiary,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.accent,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFF',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hoursInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 14,
  },
  notesInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logHours: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  logNotes: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  taskLanes: {
    paddingBottom: 24,
  },
  lane: {
    marginBottom: 24,
  },
  laneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  taskCard: {},
  taskCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  taskMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
