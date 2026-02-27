import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboard } from '../../lib/api/dashboard';
import { useNotifications } from '../../lib/api/notifications';
import { useShots } from '../../lib/api/shots';
import { useCurrentUser } from '../../lib/api/profile';
import { useTimer } from '../../contexts/TimerContext';
import { DailyChecklist } from '../../components/DailyChecklist';
import { useAdaptiveLayout } from '../../lib/adaptive-layout';
import { BrandSpinner } from '../../components/BrandSpinner';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../constants/colors';
import { router } from 'expo-router';
import {
  Clock,
  Calendar,
  ListTodo,
  Play,
  LogIn,
  CalendarDays,
  Focus,
} from 'lucide-react-native';
import { format, addDays } from 'date-fns';
import { ProductivityMeter } from '../../components/ProductivityMeter';
import { MotivationCard } from '../../components/MotivationCard';

export default function HomeScreen() {
  const { spacing } = useAdaptiveLayout();
  const { data: user } = useCurrentUser();
  const { data: dashboard, isLoading: dashLoading, error: dashError } = useDashboard();
  const { data: notificationsData } = useNotifications();
  const unreadNotificationCount = notificationsData?.unreadCount ?? 0;
  const { data: shots = [], isLoading: shotsLoading } = useShots(
    user?.role === 'artist' ? { artist_id: user?.id } : undefined
  );
  const { activeTimer, setActiveTimer } = useTimer();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const todayShots = shots.filter(
    (s) => s.due_date && format(new Date(s.due_date), 'yyyy-MM-dd') === todayStr
  );
  const tomorrowShots = shots.filter(
    (s) => s.due_date && format(new Date(s.due_date), 'yyyy-MM-dd') === tomorrowStr
  );

  const todayTasks = dashboard?.pendingTasks?.filter(
    (t) => t.due_date && format(new Date(t.due_date), 'yyyy-MM-dd') === todayStr
  ) ?? [];
  const tomorrowTasks = dashboard?.pendingTasks?.filter(
    (t) => t.due_date && format(new Date(t.due_date), 'yyyy-MM-dd') === tomorrowStr
  ) ?? [];

  const displayTodayTasks = todayTasks.length > 0 ? todayTasks : todayShots;
  const displayTomorrowTasks = tomorrowTasks.length > 0 ? tomorrowTasks : tomorrowShots;

  const handleStartTimer = () => {
    const first = displayTodayTasks[0];
    const shotCode =
      (first && 'shot_code' in first ? first.shot_code : null) ??
      (first && 'title' in first ? first.title : null) ??
      'SH_120';
    const taskName =
      (first && 'title' in first ? first.title : null) ??
      (first && 'department' in first ? first.department : null) ??
      'Comp';
    setActiveTimer({
      shotCode: typeof shotCode === 'string' ? shotCode : 'SH_120',
      taskName: typeof taskName === 'string' ? taskName : 'Comp',
      startedAt: new Date(),
    });
    router.push('/(tabs)/work');
  };

  const isLoading = dashLoading || shotsLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <BrandSpinner fullScreen size="large" />
      </SafeAreaView>
    );
  }

  if (dashError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Could not load dashboard</Text>
          <Text style={styles.errorText}>{String(dashError)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
      >
        <View style={[styles.section, { marginTop: spacing.lg }]}>
          <Text style={styles.headerTitle}>Home</Text>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
          <MotivationCard />
        </View>

        <View style={[styles.kpiStrip, { paddingHorizontal: spacing.lg, marginBottom: spacing.lg }]}>
          <View style={styles.kpiItem}>
            <Clock size={16} color={colors.accent} />
            <Text style={styles.kpiValue}>{dashboard?.todayHours?.toFixed(1) ?? '0'}h</Text>
            <Text style={styles.kpiLabel}>Today</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiItem}>
            <ListTodo size={16} color={colors.cyan} />
            <Text style={styles.kpiValue}>{dashboard?.pendingCount ?? 0}</Text>
            <Text style={styles.kpiLabel}>Pending</Text>
          </View>
          <View style={styles.kpiDivider} />
          <Pressable
            style={styles.kpiItem}
            onPress={() => router.push('/notifications')}
          >
            <Calendar size={16} color={colors.purple} />
            <Text style={styles.kpiValue}>{unreadNotificationCount}</Text>
            <Text style={styles.kpiLabel}>Unread</Text>
          </Pressable>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          {activeTimer ? (
            <Pressable onPress={() => router.push('/(tabs)/work')}>
              <GlassCard>
                <View style={styles.timerCard}>
                  <View style={styles.timerHeader}>
                    <Play size={20} color={colors.accent} fill={colors.accent} />
                    <Text style={styles.timerTitle}>Active Timer</Text>
                  </View>
                  <Text style={styles.timerShot}>
                    {activeTimer.shotCode} {activeTimer.taskName}
                  </Text>
                  <TouchableOpacity style={styles.timerCta} onPress={() => router.push('/(tabs)/work')}>
                    <Text style={styles.timerCtaText}>View in Work →</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </Pressable>
          ) : (
            <Pressable onPress={handleStartTimer}>
              <GlassCard>
                <View style={styles.startTimerCard}>
                  <Play size={32} color={colors.accent} />
                  <Text style={styles.startTimerText}>Start Timer</Text>
                  <Text style={styles.startTimerSubtext}>Tap to begin tracking time</Text>
                </View>
              </GlassCard>
            </Pressable>
          )}
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg, marginTop: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
          {displayTodayTasks.length === 0 ? (
            <GlassCard>
              <Text style={styles.emptyText}>No tasks due today</Text>
            </GlassCard>
          ) : (
            displayTodayTasks.slice(0, 5).map((item: { id: string; shot_code?: string; title?: string; due_date?: string; shot_id?: string }) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  const shotId = 'shot_id' in item ? item.shot_id : item.id;
                  if (shotId) router.push(`/shot/${shotId}`);
                }}
              >
                <GlassCard style={{ marginBottom: spacing.sm }}>
                  <View style={styles.taskRow}>
                    <Text style={styles.taskCode}>
                      {'shot_code' in item ? item.shot_code : 'title' in item ? item.title : 'Task'}
                    </Text>
                    <Text style={styles.taskMeta}>
                      {item.due_date ? format(new Date(item.due_date), 'h:mm a') : ''}
                    </Text>
                  </View>
                </GlassCard>
              </Pressable>
            ))
          )}
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg, marginTop: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Tomorrow Preview</Text>
          {displayTomorrowTasks.length === 0 ? (
            <GlassCard>
              <Text style={styles.emptyText}>Nothing scheduled for tomorrow</Text>
            </GlassCard>
          ) : (
            <GlassCard>
              <View style={styles.tomorrowRow}>
                {displayTomorrowTasks.slice(0, 3).map((item: { id: string; shot_code?: string; title?: string }) => (
                  <View key={item.id} style={styles.tomorrowChip}>
                    <Text style={styles.tomorrowChipText} numberOfLines={1}>
                      {'shot_code' in item ? item.shot_code : 'title' in item ? item.title : 'Task'}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          )}
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg, marginTop: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Productivity</Text>
          <ProductivityMeter />
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg, marginTop: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => router.push('/(tabs)/work')}
              accessibilityLabel="Log time"
            >
              <LogIn size={22} color={colors.accent} />
              <Text style={styles.quickActionLabel}>Log Time</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => {}}
              accessibilityLabel="Apply leave"
            >
              <CalendarDays size={22} color={colors.cyan} />
              <Text style={styles.quickActionLabel}>Apply Leave</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => router.push('/focus-timer')}
              accessibilityLabel="Focus timer"
            >
              <Focus size={22} color={colors.purple} />
              <Text style={styles.quickActionLabel}>Focus Timer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg, marginTop: spacing.xl }]}>
          <DailyChecklist />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 20,
  },
  kpiStrip: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiItem: {
    alignItems: 'center',
    flex: 1,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  kpiLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  kpiDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  timerCard: {
    padding: 4,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  timerShot: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  timerCta: {
    alignSelf: 'flex-start',
  },
  timerCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  startTimerCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  startTimerText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  startTimerSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  taskMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tomorrowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tomorrowChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tomorrowChipText: {
    fontSize: 14,
    color: colors.text,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
