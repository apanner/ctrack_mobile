import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDashboard } from '../../lib/api/dashboard';
import { useNotifications } from '../../lib/api/notifications';
import { useShots } from '../../lib/api/shots';
import { useCurrentUser } from '../../lib/api/profile';
import { useAdaptiveLayout } from '../../lib/adaptive-layout';
import { BrandSpinner } from '../../components/BrandSpinner';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../constants/colors';
import { router } from 'expo-router';
import { Timer, Calendar, Target } from 'lucide-react-native';
import { format } from 'date-fns';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { PwaInstallBanner } from '../../components/PwaInstallBanner';
import { uiTokens } from '../../constants/ui-tokens';

const WEEKLY_GOAL_HOURS = 40;

const QUICK_ACTIONS = [
  { key: 'log', label: 'Log Time', icon: Timer, color: colors.cyan, iconBg: colors.meshCyan, onPress: () => router.push('/(tabs)/work') },
  { key: 'leave', label: 'Leave', icon: Calendar, color: colors.purple, iconBg: colors.meshPurple, onPress: () => router.push('/leaves') },
  { key: 'focus', label: 'Focus', icon: Target, color: colors.green, iconBg: colors.meshGreen, onPress: () => router.push('/focus-timer') },
] as const;

export default function HomeScreen() {
  const { spacing } = useAdaptiveLayout();
  const { data: user } = useCurrentUser();
  const { data: dashboard, isLoading: dashLoading, error: dashError } = useDashboard();
  const { data: notificationsData } = useNotifications();
  const unreadNotificationCount = notificationsData?.unreadCount ?? 0;
  const { data: shots = [], isLoading: shotsLoading } = useShots(
    user?.role === 'artist' ? { artist_id: user?.id } : undefined
  );

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todayShots = shots.filter(
    (s) => s.due_date && format(new Date(s.due_date), 'yyyy-MM-dd') === todayStr
  );

  const todayTasks = dashboard?.pendingTasks?.filter(
    (t) => t.due_date && format(new Date(t.due_date), 'yyyy-MM-dd') === todayStr
  ) ?? [];

  const displayTodayTasks = todayTasks.length > 0 ? todayTasks : todayShots;
  const weekHours = dashboard?.weekHours ?? 0;
  const goalPercent = Math.min(100, Math.round((weekHours / WEEKLY_GOAL_HOURS) * 100));

  const isLoading = dashLoading || shotsLoading;

  if (isLoading) {
    return (
      <ScreenContainer>
        <BrandSpinner fullScreen size="large" />
      </ScreenContainer>
    );
  }

  if (dashError) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Could not load dashboard</Text>
          <Text style={styles.errorText}>{String(dashError)}</Text>
        </View>
      </ScreenContainer>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.full_name?.split(' ')[0] || 'Artist';
  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'A';

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl * 4 }}
      >
        <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
          <View>
            <Text style={styles.greetingText}>{greeting},</Text>
            <Text style={styles.nameText}>{firstName}</Text>
          </View>
          <Pressable
            onPress={() =>
              unreadNotificationCount > 0
                ? router.push('/notifications')
                : router.push('/(tabs)/me')
            }
            style={styles.avatarButton}
          >
            <LinearGradient
              colors={[colors.cyan, colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            {unreadNotificationCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {Platform.OS === 'web' && (
          <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
            <PwaInstallBanner />
          </View>
        )}

        {/* Weekly summary — at-a-glance */}
        <View style={[styles.summaryRow, { paddingHorizontal: spacing.lg }]}>
          <GlassCard style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{weekHours.toFixed(1)}h</Text>
            <Text style={styles.summaryLabel}>This week</Text>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <View style={styles.goalRow}>
              <View style={[styles.goalBar, { width: `${goalPercent}%` }]} />
            </View>
            <Text style={styles.summaryLabel}>{goalPercent}% of {WEEKLY_GOAL_HOURS}h</Text>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{displayTodayTasks.length}</Text>
            <Text style={styles.summaryLabel}>Today</Text>
          </GlassCard>
        </View>

        {/* Today's tasks — simple, scannable list */}
        <View style={[styles.sectionWrap, { paddingHorizontal: spacing.lg }]}>
          <SectionHeader title="Today" actionLabel="Log time" onActionPress={() => router.push('/(tabs)/work')} compact />
          {displayTodayTasks.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -spacing.lg }}
              contentContainerStyle={[styles.queueScrollContent, { paddingHorizontal: spacing.lg }]}
            >
              {displayTodayTasks.slice(0, 6).map((item) => {
                const label =
                  ('shot_code' in item && item.shot_code) ||
                  ('title' in item && item.title) ||
                  'Task';
                const shotId = 'shot_id' in item ? item.shot_id : item.id;
                const dept = 'department' in item ? item.department : 'Task';
                const isOverdue = item.due_date && new Date(item.due_date) < new Date();
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => shotId && router.push(`/shot/${shotId}`)}
                    style={styles.queueCardWrap}
                  >
                    <GlassCard noPadding>
                      <View style={styles.queueCardContent}>
                        <Text style={styles.queueCode}>{label}</Text>
                        <Text style={styles.queueDept}>{dept}</Text>
                        <Text style={[styles.queueDue, isOverdue ? { color: colors.red } : { color: colors.accent }]}>
                          {item.due_date ? `Due ${format(new Date(item.due_date), 'h:mm a')}` : '—'}
                        </Text>
                      </View>
                    </GlassCard>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <GlassCard>
              <Text style={styles.emptyText}>No tasks for today.</Text>
            </GlassCard>
          )}
        </View>

        {/* Quick actions — Log Time, Leave, Focus */}
        <View style={[styles.sectionWrap, { paddingHorizontal: spacing.lg }]}>
          <SectionHeader title="Quick actions" compact />
          <View style={styles.shortcutsRow}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.key}
                style={styles.shortcutCell}
                onPress={action.onPress}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: action.iconBg }]}>
                  <action.icon size={20} color={action.color} strokeWidth={2} />
                </View>
                <Text style={styles.shortcutLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: uiTokens.spacing.lg,
    marginBottom: uiTokens.spacing.md,
  },
  greetingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  nameText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
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
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: uiTokens.spacing.xl,
  },
  summaryCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    minHeight: 72,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  goalRow: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 4,
  },
  goalBar: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  sectionWrap: {
    marginBottom: uiTokens.spacing.xl,
  },
  queueScrollContent: {
    gap: 12,
    paddingVertical: 4,
    flexDirection: 'row',
  },
  queueCardWrap: {
    minWidth: 180,
  },
  queueCardContent: {
    padding: uiTokens.spacing.lg,
  },
  queueCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  queueDept: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  queueDue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 8,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shortcutCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shortcutLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
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
