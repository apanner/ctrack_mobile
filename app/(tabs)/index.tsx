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
  User,
  ArrowRight
} from 'lucide-react-native';
import { format, addDays } from 'date-fns';
import { ProductivityMeter } from '../../components/ProductivityMeter';

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

  const todayTasks = dashboard?.pendingTasks?.filter(
    (t) => t.due_date && format(new Date(t.due_date), 'yyyy-MM-dd') === todayStr
  ) ?? [];

  const displayTodayTasks = todayTasks.length > 0 ? todayTasks : todayShots;

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

  // Determine greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.full_name?.split(' ')[0] || 'Artist';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl * 4 }}
      >
        {/* Modern Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.lg, marginTop: spacing.md }]}>
          <View>
            <Text style={styles.greetingText}>{greeting},</Text>
            <Text style={styles.nameText}>{firstName}</Text>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/profile')} style={styles.avatarButton}>
            <User color={colors.text} size={24} />
          </Pressable>
        </View>

        {/* Bento Grid: Top Row */}
        <View style={[styles.bentoRow, { paddingHorizontal: spacing.lg }]}>
          {/* Hours Card */}
          <GlassCard style={styles.bentoCardSmall}>
            <View style={styles.bentoContent}>
              <View style={styles.iconCircle}>
                <Clock size={20} color={colors.cyan} />
              </View>
              <Text style={styles.bentoValue}>{dashboard?.todayHours?.toFixed(1) ?? '0'}h</Text>
              <Text style={styles.bentoLabel}>Logged Today</Text>
            </View>
          </GlassCard>

          {/* Pending Tasks Card */}
          <GlassCard style={styles.bentoCardSmall}>
            <View style={styles.bentoContent}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(167, 139, 250, 0.1)' }]}>
                <ListTodo size={20} color={colors.purple} />
              </View>
              <Text style={styles.bentoValue}>{dashboard?.pendingCount ?? 0}</Text>
              <Text style={styles.bentoLabel}>Pending Tasks</Text>
            </View>
          </GlassCard>
        </View>

        {/* Active Timer / Start Timer Bento */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
          {activeTimer ? (
            <Pressable onPress={() => router.push('/(tabs)/work')}>
              <GlassCard>
                <View style={styles.timerCard}>
                  <View style={styles.timerHeader}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.timerTitle}>ACTIVE TIMER</Text>
                  </View>
                  <Text style={styles.timerShot}>
                    {activeTimer.shotCode} {activeTimer.taskName}
                  </Text>
                </View>
              </GlassCard>
            </Pressable>
          ) : (
            <Pressable onPress={handleStartTimer}>
              <GlassCard style={styles.startTimerBorder}>
                <View style={styles.startTimerCard}>
                  <View style={styles.playButton}>
                    <Play size={24} color={colors.background} fill={colors.background} />
                  </View>
                  <View>
                    <Text style={styles.startTimerText}>Start Tracking</Text>
                    <Text style={styles.startTimerSubtext}>Tap to log your first task</Text>
                  </View>
                </View>
              </GlassCard>
            </Pressable>
          )}
        </View>

        {/* Horizontal Tasks List */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={[styles.sectionHeader, { paddingHorizontal: spacing.lg }]}>
            <Text style={styles.sectionTitle}>Today's Queue</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/work')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingRight: spacing.xl }}
            snapToInterval={220 + spacing.md}
            decelerationRate="fast"
          >
            {displayTodayTasks.length === 0 ? (
              <GlassCard style={styles.emptyTaskCard}>
                <Text style={styles.emptyText}>You're all caught up!</Text>
              </GlassCard>
            ) : (
              displayTodayTasks.map((item: { id: string; shot_code?: string; title?: string; due_date?: string; shot_id?: string }, index: number) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    const shotId = 'shot_id' in item ? item.shot_id : item.id;
                    if (shotId) router.push(`/shot/${shotId}`);
                  }}
                >
                  <GlassCard style={[styles.taskCard, { marginLeft: index > 0 ? spacing.md : 0 }]}>
                    <View style={styles.taskIconBg}>
                      <ListTodo size={20} color={colors.accent} />
                    </View>
                    <Text style={styles.taskCode} numberOfLines={1}>
                      {'shot_code' in item ? item.shot_code : 'title' in item ? item.title : 'Task'}
                    </Text>
                    <Text style={styles.taskMeta}>
                      {item.due_date ? `Due at ${format(new Date(item.due_date), 'h:mm a')}` : 'No deadline'}
                    </Text>
                  </GlassCard>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        {/* Quick Actions Horizontal */}
        <View style={{ marginTop: spacing.xl, paddingHorizontal: spacing.lg }}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
             <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/work')}
            >
              <LogIn size={24} color={colors.text} />
              <Text style={styles.quickActionLabel}>Log Time</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/leaves')}
            >
              <CalendarDays size={24} color={colors.text} />
              <Text style={styles.quickActionLabel}>Leave</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/focus-timer')}
            >
              <Focus size={24} color={colors.text} />
              <Text style={styles.quickActionLabel}>Focus</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Productivity & Checklist */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <Text style={styles.sectionTitle}>Checklist</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  bentoCardSmall: {
    flex: 1,
  },
  bentoContent: {
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  bentoValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  bentoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  timerCard: {
    paddingVertical: 8,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  timerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1,
  },
  timerShot: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  startTimerBorder: {
    borderColor: colors.accent,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 107, 74, 0.05)',
  },
  startTimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4, // Visual centering for play icon
  },
  startTimerText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  startTimerSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.cyan,
  },
  taskCard: {
    width: 220,
    height: 140,
    justifyContent: 'space-between',
  },
  emptyTaskCard: {
    width: 300,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  taskIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskCode: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  taskMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
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