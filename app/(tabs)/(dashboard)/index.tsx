import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDashboard } from '../../../lib/api/dashboard';
import { useNotifications } from '../../../lib/api/notifications';
import { useShots } from '../../../lib/api/shots';
import { useCurrentUser } from '../../../lib/api/profile';
import { useAdaptiveLayout } from '../../../lib/adaptive-layout';
import { BrandSpinner } from '../../../components/BrandSpinner';
import { GlassCard } from '../../../components/GlassCard';
import { colors } from '../../../constants/colors';
import { router } from 'expo-router';
import { FileText, Calendar, Target, MessageCircle } from 'lucide-react-native';
import { format } from 'date-fns';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { PrimaryActionButton } from '../../../components/ui/PrimaryActionButton';
import { uiTokens } from '../../../constants/ui-tokens';
import { useTimer, formatElapsedHMS } from '../../../contexts/TimerContext';

const QUICK_ACTIONS = [
  { key: 'log', label: 'Daily Log', icon: FileText, color: colors.tint, iconBg: colors.meshCyan, onPress: () => router.push('/(tabs)/log') },
  { key: 'leave', label: 'Leave', icon: Calendar, color: colors.purple, iconBg: colors.meshPurple, onPress: () => router.push('/leaves') },
  { key: 'focus', label: 'Focus', icon: Target, color: colors.green, iconBg: colors.meshGreen, onPress: () => router.push('/focus-timer') },
  { key: 'chat', label: 'Chat', icon: MessageCircle, color: colors.accent, iconBg: colors.meshAccent, onPress: () => router.push('/chat') },
] as const;

export default function DashboardScreen() {
  const { spacing } = useAdaptiveLayout();
  const { data: user } = useCurrentUser();
  const { data: dashboard, isLoading: dashLoading, error: dashError } = useDashboard();
  const { data: notificationsData } = useNotifications();
  const unreadNotificationCount = notificationsData?.unreadCount ?? 0;
  const { data: shots = [], isLoading: shotsLoading } = useShots(
    user?.role === 'artist' ? { artist_id: user?.id } : undefined
  );

  const { activeTimer, setActiveTimer, elapsedMs } = useTimer();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todayShots = shots.filter(
    (s) => s.due_date && format(new Date(s.due_date), 'yyyy-MM-dd') === todayStr
  );

  const todayTasks = dashboard?.pendingTasks?.filter(
    (t) => t.due_date && format(new Date(t.due_date), 'yyyy-MM-dd') === todayStr
  ) ?? [];

  const displayTodayTasks = todayTasks.length > 0 ? todayTasks : todayShots;

  useEffect(() => {
    if (!activeTimer) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [activeTimer, pulseAnim]);

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
    router.push('/(tabs)/log');
  };

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
            {user?.department && (
              <View style={styles.deptBadge}>
                <Text style={styles.deptText}>{user.department}</Text>
              </View>
            )}
          </View>
          <Pressable
            onPress={() =>
              unreadNotificationCount > 0
                ? router.push('/notifications')
                : router.push('/(tabs)/profile')
            }
            style={styles.avatarButton}
          >
            <View style={[styles.avatarRing, { borderColor: colors.tint }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
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
          {[
            { value: String(shots.filter((s) => s.status === 'In Progress' || s.status === 'Not Started').length), label: 'Active' },
            { value: String(shots.filter((s) => s.status === 'Completed').length), label: 'Done' },
            { value: String(shots.filter((s) => s.status === 'On Hold' || s.status === 'Revision').length || 0), label: 'Revisions' },
            { value: '92%', label: 'Productivity' },
          ].map((kpi, i) => (
            <View key={i} style={styles.kpiPill}>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.timerBannerSection, { paddingHorizontal: spacing.lg }]}>
          <Pressable
            onPress={() => activeTimer ? router.push('/(tabs)/log') : handleStartTimer()}
            style={styles.timerBanner}
          >
            <View style={styles.timerBannerInner}>
              {activeTimer ? (
                <>
                  <View style={styles.recordingRow}>
                    <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
                    <Text style={styles.recordingText}>ACTIVE TIMER</Text>
                  </View>
                  <Text style={styles.timerBannerElapsed}>{formatElapsedHMS(elapsedMs)}</Text>
                  <Text style={styles.timerBannerMeta}>
                    {activeTimer.shotCode} · {activeTimer.taskName}
                  </Text>
                  <PrimaryActionButton label="Continue" onPress={() => router.push('/(tabs)/log')} style={styles.timerBannerBtn} />
                </>
              ) : (
                <>
                  <Text style={styles.timerBannerHint}>Submit your daily log</Text>
                  <PrimaryActionButton label="Go to Daily Log" onPress={() => router.push('/(tabs)/log')} style={styles.timerBannerBtn} />
                </>
              )}
            </View>
          </Pressable>
        </View>

        <View style={[styles.sectionWrap, { paddingHorizontal: spacing.lg }]}>
          <SectionHeader title="Urgent Shots" actionLabel="All Shots" onActionPress={() => router.push('/(tabs)/shots')} compact />
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
                    onPress={() => shotId && router.push(`/(tabs)/shots/${shotId}`)}
                    style={styles.queueCardWrap}
                  >
                    <GlassCard noPadding>
                      <View style={styles.queueCardContent}>
                        <Text style={styles.queueCode}>{label}</Text>
                        <Text style={styles.queueDept}>{dept}</Text>
                        <Text style={[styles.queueDue, isOverdue ? { color: colors.danger } : { color: colors.tint }]}>
                          {item.due_date ? `Due ${format(new Date(item.due_date), 'h:mm a')}` : 'On Track'}
                        </Text>
                      </View>
                    </GlassCard>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <GlassCard>
              <Text style={styles.emptyText}>No urgent items for today.</Text>
            </GlassCard>
          )}
        </View>

        <View style={[styles.sectionWrap, { paddingHorizontal: spacing.lg }]}>
          <SectionHeader title="Quick Actions" compact />
          <View style={styles.shortcutsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable key={action.key} style={styles.shortcutCell} onPress={action.onPress}>
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
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: uiTokens.spacing.lg,
    marginBottom: uiTokens.spacing.md,
  },
  greetingText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  nameText: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.6, marginTop: 2 },
  deptBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: colors.surfaceAccent,
  },
  deptText: { fontSize: 11, fontWeight: '600', color: colors.tint, textTransform: 'uppercase' },
  avatarButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: colors.text },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.danger,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: uiTokens.spacing.lg },
  kpiPill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  kpiValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  kpiLabel: { fontSize: 10, fontWeight: '600', color: colors.textMuted, marginTop: 4, textTransform: 'uppercase' },
  timerBannerSection: { marginBottom: uiTokens.spacing.xl },
  timerBanner: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 120,
  },
  timerBannerInner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  recordingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.tint },
  recordingText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: colors.tint },
  timerBannerElapsed: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: 8, fontVariant: ['tabular-nums'] },
  timerBannerMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  timerBannerHint: { fontSize: 15, color: colors.textSecondary, marginBottom: 12 },
  timerBannerBtn: { marginTop: 8 },
  sectionWrap: { marginBottom: uiTokens.spacing.xl },
  queueScrollContent: { gap: 12, paddingVertical: 4, flexDirection: 'row' },
  queueCardWrap: { minWidth: 160 },
  queueCardContent: { padding: uiTokens.spacing.lg },
  queueCode: { fontSize: 14, fontWeight: '700', color: colors.text, fontFamily: 'monospace' },
  queueDept: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  queueDue: { fontSize: 11, fontWeight: '600', color: colors.tint, marginTop: 8 },
  shortcutsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  shortcutCell: {
    flex: 1,
    minWidth: 140,
    maxWidth: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shortcutLabel: { fontSize: 12, fontWeight: '600', color: colors.text },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: colors.danger, marginBottom: 12 },
  errorText: { fontSize: uiTokens.text.body, color: colors.textSecondary, textAlign: 'center' },
  emptyText: { fontSize: uiTokens.text.body, color: colors.textSecondary },
});
