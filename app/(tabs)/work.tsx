import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useShots } from '../../lib/api/shots';
import { useProjects } from '../../lib/api/projects';
import { useCurrentUser } from '../../lib/api/profile';
import {
  useTimesheets,
  useCreateTimeLog,
  useCopyDayToDay,
  useWeekStatus,
  useSubmitWeek,
  useWeeklyReport,
  getWeekStart,
  type TimeLog,
  type EntryType,
} from '../../lib/api/timesheets';
import { useOfflineQueue, filterQueueByDate } from '../../lib/offline-queue';
import { useAdaptiveLayout } from '../../lib/adaptive-layout';
import { TabControl } from '../../components/TabControl';
import { GlassCard } from '../../components/GlassCard';
import { ShotTaskCard } from '../../components/ShotTaskCard';
import { BrandSpinner } from '../../components/BrandSpinner';
import type { SelectOption } from '../../components/SelectDropdown';
import { colors } from '../../constants/colors';
import { router } from 'expo-router';
import { Calendar, Clock, ChevronDown, Sparkles, CheckCircle } from 'lucide-react-native';
import { format, addDays, subDays } from 'date-fns';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { PrimaryActionButton } from '../../components/ui/PrimaryActionButton';
import { uiTokens } from '../../constants/ui-tokens';

const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: 'work', label: 'Work' },
  { value: 'training', label: 'Training' },
  { value: 'downtime', label: 'Downtime' },
  { value: 'power_outage', label: 'Power Outage' },
];

export default function WorkScreen() {
  const params = useLocalSearchParams<{ focusHours?: string; taskId?: string; shotId?: string }>();
  const { spacing } = useAdaptiveLayout();
  const [segment, setSegment] = useState<'Timesheet' | 'Tasks'>('Timesheet');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [projectId, setProjectId] = useState<string | null>(null);
  const [shotId, setShotId] = useState<string | null>(params.shotId ?? null);
  const [entryType, setEntryType] = useState<EntryType>('work');
  const [hoursInput, setHoursInput] = useState(params.focusHours ?? '');
  const [notesInput, setNotesInput] = useState('');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [shotModalOpen, setShotModalOpen] = useState(false);
  const quickHourPresets = ['0.5', '1', '2', '4', '8'];

  const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate]);

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
    projectId ? { project_id: projectId } : user?.role === 'artist' ? { artist_id: user?.id } : undefined
  );
  const { data: timesheetsData } = useTimesheets(selectedDate, selectedDate);
  const createTimeLog = useCreateTimeLog();
  const copyDayToDay = useCopyDayToDay();
  const { data: weekStatus } = useWeekStatus(weekStart);
  const submitWeek = useSubmitWeek();
  const { data: weeklyReport } = useWeeklyReport(weekStart);
  const { data: offlineQueue = [] } = useOfflineQueue();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const { data: yesterdayData } = useTimesheets(
    selectedDate === todayStr ? yesterdayStr : selectedDate,
    selectedDate === todayStr ? yesterdayStr : selectedDate
  );
  const yesterdayEntries = (selectedDate === todayStr ? yesterdayData?.data ?? [] : []) as TimeLog[];

  const queuedForDate = useMemo(
    () =>
      filterQueueByDate(offlineQueue, selectedDate).map((q) => ({
        id: q.id,
        work_date: q.payload.workDate,
        hours_worked: q.payload.hoursWorked,
        project_id: q.payload.projectId ?? null,
        shot_id: q.payload.shotId ?? null,
        task_id: q.payload.taskId ?? null,
        notes: q.payload.notes ?? null,
        entry_type: (q.payload.entryType ?? 'work') as EntryType,
        _pending: true,
      })),
    [offlineQueue, selectedDate]
  );
  const displayedLogs = useMemo(() => {
    const server = (timesheetsData?.data ?? []).filter((t) => t.work_date === selectedDate);
    const serverIds = new Set(server.map((s) => s.id));
    const fromQueue = queuedForDate.filter((q) => !serverIds.has(q.id));
    return [...server, ...fromQueue];
  }, [timesheetsData?.data, selectedDate, queuedForDate]);

  const isArtist = user?.role === 'artist';
  const myShots = isArtist ? shots.filter((s) => s.artist_id === user?.id) : shots;
  const projectShots = projectId ? shots.filter((s) => s.project_id === projectId) : myShots;

  const isWeekLocked = weekStatus?.submitted ?? false;
  const showProjectShot = entryType === 'work' || entryType === 'training';
  const forceNoProjectShot = entryType === 'downtime' || entryType === 'power_outage';

  useEffect(() => {
    if (forceNoProjectShot) {
      setProjectId(null);
      setShotId(null);
    }
  }, [forceNoProjectShot]);

  const projectOptions: SelectOption<string | null>[] = useMemo(
    () => [
      { value: null, label: 'General / Non-billable' },
      ...projects.map((p) => ({ value: p.id, label: `${p.code} – ${p.name}` })),
    ],
    [projects]
  );

  const shotOptions: SelectOption<string | null>[] = useMemo(() => {
    if (!projectId) return [{ value: null, label: 'None' }];
    return [
      { value: null, label: 'None' },
      ...projectShots.map((s) => ({ value: s.id, label: s.shot_code })),
    ];
  }, [projectId, projectShots]);

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
    if (isWeekLocked) return;
    try {
      await createTimeLog.mutateAsync({
        workDate: selectedDate,
        projectId: forceNoProjectShot ? null : (projectId ?? undefined),
        shotId: forceNoProjectShot ? null : (shotId ?? undefined),
        taskId: params.taskId ?? undefined,
        hoursWorked: hours,
        notes: notesInput || undefined,
        entryType,
      });
      setHoursInput('');
      setNotesInput('');
    } catch (e) {
      console.error('Save timesheet failed:', e);
    }
  };

  const handleSubmitWeek = async () => {
    if (isWeekLocked) return;
    try {
      await submitWeek.mutateAsync(weekStart);
    } catch (e) {
      console.error('Submit week failed:', e);
    }
  };

  const handleProjectSelect = (id: string | null) => {
    setProjectId(id);
    setShotId(null);
    setProjectModalOpen(false);
  };

  const handleShotSelect = (id: string | null) => {
    setShotId(id);
    setShotModalOpen(false);
  };

  if (shotsLoading && segment === 'Tasks') {
    return (
      <ScreenContainer>
        <BrandSpinner fullScreen size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.topBand}>
        <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
          <Text style={styles.headerTitle}>Work</Text>
          <Text style={styles.headerSub}>Timesheets and tasks</Text>
        </View>
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
          contentContainerStyle={{ paddingBottom: spacing.xxl * 4 }}
        >
          {/* Week status banner */}
          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            {isWeekLocked ? (
              <GlassCard leftBorderColor="green">
                <View style={styles.weekSubmittedRow}>
                  <CheckCircle size={20} color={colors.success} />
                  <Text style={styles.weekSubmittedText}>Week submitted ✓</Text>
                </View>
              </GlassCard>
            ) : (
              <View style={styles.submitWeekRow}>
                <GlassCard style={{ flex: 1 }}>
                  <Text style={styles.weekLabel}>
                    Week of {format(new Date(weekStart), 'MMM d')}
                  </Text>
                  <PrimaryActionButton
                    label="Submit Week"
                    onPress={handleSubmitWeek}
                    loading={submitWeek.isPending}
                  />
                </GlassCard>
              </View>
            )}
          </View>

          {/* Weekly report summary */}
          {weeklyReport && (weeklyReport.totalHours > 0 || isWeekLocked) && (
            <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
              <SectionHeader title="Week Summary" />
              <GlassCard>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Total hours</Text>
                  <Text style={styles.reportValue}>{weeklyReport.totalHours.toFixed(1)}h</Text>
                </View>
                {weeklyReport.byEntryType.length > 0 && (
                  <View style={styles.reportBreakdown}>
                    {weeklyReport.byEntryType.map(({ type, hours }) => (
                      <Text key={type} style={styles.reportBreakdownText}>
                        {type}: {hours.toFixed(1)}h
                      </Text>
                    ))}
                  </View>
                )}
              </GlassCard>
            </View>
          )}

          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <GlassCard>
              <View style={styles.heroWrap}>
                <View style={styles.heroIcon}>
                  <Sparkles size={uiTokens.icon.md} color={colors.cyan} />
                </View>
                <View style={styles.heroTextWrap}>
                  <Text style={styles.heroTitle}>Quick Log</Text>
                  <Text style={styles.heroSubtitle}>
                    Pick project, shot, and hours in under a minute.
                  </Text>
                </View>
              </View>
            </GlassCard>
          </View>

          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <SectionHeader title="1. Select Date" />
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
            {/* Copy Yesterday — only when today selected, week not locked, yesterday has entries */}
            {selectedDate === todayStr &&
              !isWeekLocked &&
              yesterdayEntries.length > 0 && (
                <TouchableOpacity
                  style={styles.copyYesterdayBtn}
                  onPress={() =>
                    copyDayToDay.mutate({
                      toDate: selectedDate,
                      entries: yesterdayEntries,
                    })
                  }
                  disabled={copyDayToDay.isPending}
                >
                  <Text style={styles.copyYesterdayText}>
                    {copyDayToDay.isPending
                      ? 'Copying…'
                      : `Copy yesterday (${yesterdayEntries.length} entries)`}
                  </Text>
                </TouchableOpacity>
              )}
          </View>

          {/* Entry type */}
          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <SectionHeader title="2. Entry Type" />
            <View style={styles.entryTypeRow}>
              {ENTRY_TYPES.map(({ value, label }) => {
                const isActive = entryType === value;
                return (
                  <Pressable
                    key={value}
                    style={[styles.entryTypeChip, isActive && styles.entryTypeChipActive]}
                    onPress={() => !isWeekLocked && setEntryType(value)}
                    disabled={isWeekLocked}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={[colors.accent, colors.purple]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.entryTypeGradient}
                      >
                        <Text style={styles.entryTypeTextActive}>{label}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.entryTypeText}>{label}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Project + Shot dropdowns (only when work or training) */}
          {showProjectShot && (
            <>
              <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
                <SectionHeader title="3. Choose Project" />
                <Pressable
                  style={[styles.picker, isWeekLocked && styles.pickerDisabled]}
                  onPress={() => !isWeekLocked && setProjectModalOpen(true)}
                  disabled={isWeekLocked}
                >
                  <Text style={styles.pickerText} numberOfLines={1}>
                    {projectId
                      ? projects.find((p) => p.id === projectId)?.name ?? 'Select'
                      : 'General / Non-billable'}
                  </Text>
                  <ChevronDown size={18} color={colors.textSecondary} />
                </Pressable>
                <Modal
                  visible={projectModalOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setProjectModalOpen(false)}
                >
                  <Pressable style={styles.modalOverlay} onPress={() => setProjectModalOpen(false)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Choose Project</Text>
                        <TouchableOpacity onPress={() => setProjectModalOpen(false)} hitSlop={12}>
                          <Text style={styles.modalClose}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <FlatList
                        data={projectOptions}
                        keyExtractor={(o) => (o.value == null ? '__none__' : o.value)}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleProjectSelect(item.value)}
                          >
                            <Text style={styles.modalOptionText}>{item.label}</Text>
                          </TouchableOpacity>
                        )}
                        style={styles.modalList}
                      />
                    </Pressable>
                  </Pressable>
                </Modal>
              </View>

              <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
                <SectionHeader title="4. Select Shot (Optional)" />
                <Pressable
                  style={[styles.picker, isWeekLocked && styles.pickerDisabled]}
                  onPress={() => !isWeekLocked && setShotModalOpen(true)}
                  disabled={isWeekLocked}
                >
                  <Text style={styles.pickerText} numberOfLines={1}>
                    {shotId
                      ? projectShots.find((s) => s.id === shotId)?.shot_code ?? 'Select'
                      : 'None'}
                  </Text>
                  <ChevronDown size={18} color={colors.textSecondary} />
                </Pressable>
                <Modal
                  visible={shotModalOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShotModalOpen(false)}
                >
                  <Pressable style={styles.modalOverlay} onPress={() => setShotModalOpen(false)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Shot</Text>
                        <TouchableOpacity onPress={() => setShotModalOpen(false)} hitSlop={12}>
                          <Text style={styles.modalClose}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <FlatList
                        data={shotOptions}
                        keyExtractor={(o) => (o.value == null ? '__none__' : o.value)}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleShotSelect(item.value)}
                          >
                            <Text style={styles.modalOptionText}>{item.label}</Text>
                          </TouchableOpacity>
                        )}
                        style={styles.modalList}
                      />
                    </Pressable>
                  </Pressable>
                </Modal>
              </View>
            </>
          )}

          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <SectionHeader title={showProjectShot ? '5. Add Hours' : '3. Add Hours'} />
            <View style={styles.hoursRow}>
              <Clock size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.hoursInput, isWeekLocked && styles.inputDisabled]}
                placeholder="0.0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                value={hoursInput}
                onChangeText={setHoursInput}
                editable={!isWeekLocked}
              />
            </View>
            <View style={styles.presetRow}>
              {quickHourPresets.map((value) => {
                const isActive = hoursInput === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => !isWeekLocked && setHoursInput(value)}
                    style={({ pressed }) => [
                      styles.presetChip,
                      isActive && styles.presetChipActive,
                      pressed && !isActive && styles.presetChipPressed,
                      isWeekLocked && styles.presetChipDisabled,
                    ]}
                    disabled={isWeekLocked}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={[colors.accent, colors.purple]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.presetChipGradient}
                      >
                        <Text style={styles.presetChipTextActive}>{value}h</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.presetChipText}>{value}h</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <SectionHeader title={showProjectShot ? '6. Notes (Optional)' : '4. Notes (Optional)'} />
            <TextInput
              style={[styles.notesInput, isWeekLocked && styles.inputDisabled]}
              placeholder="Add notes..."
              placeholderTextColor={colors.textTertiary}
              value={notesInput}
              onChangeText={setNotesInput}
              multiline
              editable={!isWeekLocked}
            />
          </View>

          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <PrimaryActionButton
              label="Save Time Entry"
              onPress={handleSaveTimesheet}
              disabled={
                isWeekLocked ||
                !hoursInput ||
                parseFloat(hoursInput) <= 0
              }
              loading={createTimeLog.isPending}
            />
          </View>

          {displayedLogs.length > 0 && (
            <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
              <Text style={styles.sectionLabel}>Today&apos;s logs</Text>
              {displayedLogs.map((t, i) => {
                const borderColors = ['green', 'violet', 'blue'] as const;
                const entryLabel = ENTRY_TYPES.find((e) => e.value === (t.entry_type ?? 'work'))?.label ?? 'Work';
                const isPending = '_pending' in t && (t as TimeLog & { _pending?: boolean })._pending;
                return (
                  <GlassCard
                    key={t.id}
                    style={{ marginBottom: spacing.sm }}
                    leftBorderColor={borderColors[i % 3]}
                  >
                    <View style={styles.logRow}>
                      <Text style={styles.logHours}>{t.hours_worked}h</Text>
                      <View style={styles.logMeta}>
                        <Text style={styles.logType}>{entryLabel}</Text>
                        <Text style={styles.logNotes}>{t.notes || '—'}</Text>
                        {isPending && (
                          <Text style={styles.pendingBadge}>Pending sync</Text>
                        )}
                      </View>
                    </View>
                  </GlassCard>
                );
              })}
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  topBand: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    marginBottom: uiTokens.spacing.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4,
  },
  headerSub: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: uiTokens.text.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: uiTokens.spacing.sm,
    textTransform: 'uppercase',
  },
  heroWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uiTokens.spacing.md,
  },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: uiTokens.radius.md,
    backgroundColor: 'rgba(34,211,238,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: uiTokens.text.bodyLg,
    fontWeight: '700',
    color: colors.text,
  },
  heroSubtitle: {
    fontSize: uiTokens.text.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  weekSubmittedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weekSubmittedText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  submitWeekRow: {
    gap: 8,
  },
  weekLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reportValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  reportBreakdown: {
    marginTop: 8,
  },
  reportBreakdownText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  daySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
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
  copyYesterdayBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  copyYesterdayText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.cyan,
  },
  entryTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  entryTypeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: uiTokens.radius.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  entryTypeChipActive: {
    borderColor: 'transparent',
    padding: 0,
  },
  entryTypeGradient: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: uiTokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  entryTypeTextActive: {
    color: '#FFF',
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerDisabled: {
    opacity: 0.6,
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  modalList: {
    maxHeight: 280,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
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
  inputDisabled: {
    opacity: 0.6,
  },
  presetRow: {
    flexDirection: 'row',
    marginTop: uiTokens.spacing.md,
    gap: uiTokens.spacing.sm,
    flexWrap: 'wrap',
  },
  presetChip: {
    paddingHorizontal: uiTokens.spacing.md,
    paddingVertical: uiTokens.spacing.sm,
    borderRadius: uiTokens.radius.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    overflow: 'hidden',
    borderColor: 'transparent',
    padding: 0,
  },
  presetChipDisabled: {
    opacity: 0.6,
  },
  presetChipGradient: {
    paddingHorizontal: uiTokens.spacing.md,
    paddingVertical: uiTokens.spacing.sm,
    borderRadius: uiTokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipPressed: {
    opacity: 0.8,
  },
  presetChipText: {
    color: colors.textSecondary,
    fontSize: uiTokens.text.body,
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#FFF',
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logMeta: {
    flex: 1,
    marginLeft: 12,
  },
  logHours: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  logType: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  logNotes: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pendingBadge: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 4,
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
