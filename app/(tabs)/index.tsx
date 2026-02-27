import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useDashboard } from '../../lib/api/dashboard';
import { useNotifications } from '../../lib/api/notifications';
import { useShots } from '../../lib/api/shots';
import { useCurrentUser } from '../../lib/api/profile';
import { useTimer } from '../../contexts/TimerContext';
import { useAdaptiveLayout } from '../../lib/adaptive-layout';
import { BrandSpinner } from '../../components/BrandSpinner';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../constants/colors';
import { router } from 'expo-router';
import {
  Clock,
  ListTodo,
  Bell,
} from 'lucide-react-native';
import { format } from 'date-fns';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { PrimaryActionButton } from '../../components/ui/PrimaryActionButton';
import { uiTokens } from '../../constants/ui-tokens';

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
    <ScreenContainer>
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <View>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.nameText}>{firstName}</Text>
        </View>
        <Pressable
          onPress={() => router.push('/notifications')}
          style={styles.notificationButton}
        >
          <Bell color={colors.text} size={uiTokens.icon.lg} />
          {unreadNotificationCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={[styles.kpiRow, { paddingHorizontal: spacing.lg }]}>
        <View style={styles.kpiCell}>
          <Clock size={uiTokens.icon.md} color={colors.cyan} />
          <Text style={styles.kpiValue}>{dashboard?.todayHours?.toFixed(1) ?? '0'}h</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiCell}>
          <ListTodo size={uiTokens.icon.md} color={colors.purple} />
          <Text style={styles.kpiValue}>{dashboard?.pendingCount ?? 0}</Text>
        </View>
      </View>

      <View style={[styles.primaryActionWrap, { paddingHorizontal: spacing.lg }]}>
        {activeTimer ? (
          <GlassCard>
            <View style={styles.activeTimerCard}>
              <Text style={styles.activeLabel}>Active timer</Text>
              <Text style={styles.activeText}>
                {activeTimer.shotCode} · {activeTimer.taskName}
              </Text>
              <PrimaryActionButton
                label="Continue in Work"
                onPress={() => router.push('/(tabs)/work')}
              />
            </View>
          </GlassCard>
        ) : (
          <GlassCard>
            <View style={styles.activeTimerCard}>
              <Text style={styles.activeLabel}>Today</Text>
              <Text style={styles.activeText}>Ready to start your first log?</Text>
              <PrimaryActionButton label="Start Timer" onPress={handleStartTimer} />
            </View>
          </GlassCard>
        )}
      </View>

      <View style={[styles.sectionWrap, { paddingHorizontal: spacing.lg }]}>
        <SectionHeader
          title="Today's Tasks"
          actionLabel="Open Work"
          onActionPress={() => router.push('/(tabs)/work')}
        />
        <FlatList
          data={displayTodayTasks.slice(0, 3)}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: uiTokens.spacing.md }} />}
          ListEmptyComponent={
            <GlassCard>
              <Text style={styles.emptyText}>No urgent items for today.</Text>
            </GlassCard>
          }
          renderItem={({ item }) => {
            const label =
              ('shot_code' in item && item.shot_code) ||
              ('title' in item && item.title) ||
              'Task';
            const shotId = 'shot_id' in item ? item.shot_id : item.id;

            return (
              <Pressable onPress={() => shotId && router.push(`/shot/${shotId}`)}>
                <GlassCard>
                  <View style={styles.taskItem}>
                    <Text style={styles.taskTitle} numberOfLines={1}>
                      {label}
                    </Text>
                    <Text style={styles.taskMeta}>
                      {item.due_date
                        ? format(new Date(item.due_date), 'h:mm a')
                        : 'No due time'}
                    </Text>
                  </View>
                </GlassCard>
              </Pressable>
            );
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: uiTokens.spacing.lg,
    marginBottom: uiTokens.spacing.lg,
  },
  greetingText: {
    fontSize: uiTokens.text.bodyLg,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  nameText: {
    fontSize: uiTokens.text.headline,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: uiTokens.radius.pill,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  badgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  kpiRow: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: uiTokens.radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: uiTokens.spacing.lg,
  },
  kpiCell: {
    flex: 1,
    alignItems: 'center',
    gap: uiTokens.spacing.xs,
  },
  kpiValue: {
    fontSize: uiTokens.text.title,
    fontWeight: '700',
    color: colors.text,
  },
  kpiDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: uiTokens.spacing.sm,
  },
  primaryActionWrap: {
    marginTop: uiTokens.spacing.lg,
  },
  activeTimerCard: {
    gap: uiTokens.spacing.md,
  },
  activeLabel: {
    fontSize: uiTokens.text.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  activeText: {
    fontSize: uiTokens.text.title,
    fontWeight: '700',
    color: colors.text,
  },
  sectionWrap: {
    marginTop: uiTokens.spacing.xl,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: uiTokens.spacing.md,
  },
  taskTitle: {
    flex: 1,
    fontSize: uiTokens.text.bodyLg,
    fontWeight: '600',
    color: colors.text,
  },
  taskMeta: {
    fontSize: uiTokens.text.caption,
    color: colors.textSecondary,
    fontWeight: '600',
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
    fontSize: uiTokens.text.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: uiTokens.text.body,
    color: colors.textSecondary,
  },
});