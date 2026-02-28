import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useShots } from '../../lib/api/shots';
import { useCurrentUser } from '../../lib/api/profile';
import { useAdaptiveLayout } from '../../lib/adaptive-layout';
import { ShotTaskCard } from '../../components/ShotTaskCard';
import { GlassCard } from '../../components/GlassCard';
import { BrandSpinner } from '../../components/BrandSpinner';
import { colors } from '../../constants/colors';
import { ScreenContainer } from '../../components/ui/ScreenContainer';

export default function TasksScreen() {
  const { spacing } = useAdaptiveLayout();
  const { data: user } = useCurrentUser();
  const { data: shots = [], isLoading } = useShots(
    user?.role === 'artist' ? { artist_id: user?.id } : undefined
  );

  const today = new Date();
  const isOverdue = (due: string) => new Date(due) < today && due;
  const assignedShots = shots.filter(
    (s) => s.status === 'Not Started' || s.status === 'In Progress'
  );
  const completedShots = shots.filter((s) => s.status === 'Completed');
  const overdueShots = assignedShots.filter((s) => isOverdue(s.due_date));

  if (isLoading) {
    return (
      <ScreenContainer>
        <BrandSpinner fullScreen size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <Text style={styles.headerTitle}>Tasks</Text>
      </View>

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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
