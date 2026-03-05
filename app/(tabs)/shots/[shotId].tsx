import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShot, useUpdateShot } from '../../../lib/api/shots';
import { useProject } from '../../../lib/api/projects';
import { colors } from '../../../constants/colors';
import { useLocalSearchParams } from 'expo-router';
import { Calendar, Clock, ArrowLeft } from 'lucide-react-native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function ShotDetailScreen() {
  const { shotId } = useLocalSearchParams<{ shotId: string }>();
  const { data: shot, isLoading } = useShot(shotId ?? '');
  const { data: project } = useProject(shot?.project_id || '');
  const updateShot = useUpdateShot();

  const handleStatusUpdate = async (newStatus: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed') => {
    if (!shot) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Confirm',
      `Update status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await updateShot.mutateAsync({ id: shot.id, updates: { status: newStatus } });
            } catch (error) {
              console.error('Update error:', error);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (!shot) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Shot not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return colors.success;
      case 'In Progress':
        return colors.tint;
      case 'On Hold':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
      case 'High':
        return colors.danger;
      case 'Medium':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  const estHours = shot.estimated_hours ?? 0;
  const actHours = shot.actual_hours ?? 0;
  const progress = estHours > 0 ? Math.min(actHours / estHours, 1.5) : 0;
  const isOverBudget = actHours > estHours && estHours > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.shotCode}>{shot.shot_code}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shot.status ?? '') + '30' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(shot.status ?? '') }]} />
              <Text style={[styles.statusText, { color: getStatusColor(shot.status ?? '') }]}>
                {shot.status || 'Assigned'}
              </Text>
            </View>
          </View>
          {project && (
            <Text style={styles.projectLine}>{project.name}</Text>
          )}
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Priority</Text>
            <View style={styles.metaRow}>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(shot.priority ?? '') }]} />
              <Text style={styles.metaValue}>{shot.priority || 'Medium'}</Text>
            </View>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Deadline</Text>
            <View style={styles.metaRow}>
              <Calendar size={14} color={colors.textSecondary} />
              <Text style={styles.metaValue}>
                {shot.due_date ? format(new Date(shot.due_date), 'MMM d, yyyy') : '—'}
              </Text>
            </View>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Revisions</Text>
            <Text style={styles.metaValue}>{shot.revision_count ?? 0}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Last Updated</Text>
            <Text style={styles.metaValue}>
              {shot.updated_at ? format(new Date(shot.updated_at), 'MMM d') : '—'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours tracked</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: isOverBudget ? colors.danger : colors.tint,
                },
              ]}
            />
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursText}>
              {actHours}h actual / {estHours}h estimated
            </Text>
            {isOverBudget && (
              <Text style={styles.overBudget}>Over budget</Text>
            )}
          </View>
        </View>

        {shot.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{shot.description}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionsContainer}>
            {shot.status === 'Not Started' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleStatusUpdate('In Progress')}
              >
                <LinearGradient
                  colors={[colors.tint, colors.tintDark]}
                  style={styles.actionButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.actionButtonText}>Start</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            {shot.status === 'In Progress' && (
              <TouchableOpacity
                style={[styles.actionButtonOutline, { borderColor: colors.warning }]}
                onPress={() => handleStatusUpdate('On Hold')}
              >
                <Text style={[styles.actionButtonTextOutline, { color: colors.warning }]}>
                  Hold
                </Text>
              </TouchableOpacity>
            )}
            {shot.status !== 'Completed' && (
              <TouchableOpacity
                style={[styles.actionButtonOutline, { borderColor: colors.success }]}
                onPress={() => handleStatusUpdate('Completed')}
              >
                <Text style={[styles.actionButtonTextOutline, { color: colors.success }]}>
                  Mark complete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 16, color: colors.textSecondary },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  shotCode: { fontSize: 22, fontWeight: '800', color: colors.text, fontFamily: 'monospace' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  projectLine: { fontSize: 14, color: colors.textSecondary },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  metaCard: {
    width: '47%',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase' },
  metaValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12, textTransform: 'uppercase' },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceAccent,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  hoursText: { fontSize: 13, color: colors.textSecondary },
  overBudget: { fontSize: 13, fontWeight: '600', color: colors.danger },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  actionsContainer: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  actionButton: { borderRadius: 10, overflow: 'hidden' },
  actionButtonGradient: { paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center' },
  actionButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  actionButtonOutline: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
  },
  actionButtonTextOutline: { fontSize: 15, fontWeight: '700' },
});
