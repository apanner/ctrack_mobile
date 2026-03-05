import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShot, useUpdateShot } from '../../lib/api/shots';
import { useProject } from '../../lib/api/projects';
import { colors } from '../../constants/colors';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar, Clock, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

export default function ShotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: shot, isLoading } = useShot(id);
  const { data: project } = useProject(shot?.project_id || '');
  const updateShot = useUpdateShot();

  const handleStatusUpdate = async (newStatus: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed') => {
    if (!shot) return;
    try {
      await updateShot.mutateAsync({
        id: shot.id,
        updates: { status: newStatus },
      });
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
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
        return colors.cyan;
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
        return colors.error;
      case 'Medium':
        return colors.warning;
      default:
        return colors.textTertiary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.shotCode}>{shot.shot_code}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(shot.status) },
              ]}
            >
              <Text style={styles.statusText}>{shot.status}</Text>
            </View>
          </View>
        </View>

        {/* Project Info */}
        {project && (
          <View style={styles.projectInfo}>
            <Text style={styles.projectLabel}>Project</Text>
            <Text style={styles.projectName}>{project.name}</Text>
          </View>
        )}

        {/* Description */}
        {shot.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{shot.description}</Text>
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.metadataGrid}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Department</Text>
              <Text style={[styles.metadataValue, { color: colors.cyan }]}>
                {shot.department}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Priority</Text>
              <View style={styles.priorityContainer}>
                <View
                  style={[
                    styles.priorityDot,
                    { backgroundColor: getPriorityColor(shot.priority) },
                  ]}
                />
                <Text style={styles.metadataValue}>{shot.priority}</Text>
              </View>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Due Date</Text>
              <View style={styles.metaRow}>
                <Calendar size={16} color={colors.textSecondary} />
                <Text style={styles.metadataValue}>
                  {format(new Date(shot.due_date), 'MMM dd, yyyy')}
                </Text>
              </View>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Estimated Hours</Text>
              <View style={styles.metaRow}>
                <Clock size={16} color={colors.textSecondary} />
                <Text style={styles.metadataValue}>{shot.estimated_hours}h</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.actionsContainer}>
            {shot.status === 'Not Started' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleStatusUpdate('In Progress')}
              >
                <LinearGradient
                  colors={[colors.accent, '#FDBA74']}
                  style={styles.actionButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.actionButtonText}>Start Working</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            {shot.status === 'In Progress' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleStatusUpdate('On Hold')}
              >
                <View style={[styles.actionButtonOutline, { borderColor: colors.warning }]}>
                  <Text style={[styles.actionButtonText, { color: colors.warning }]}>
                    Put On Hold
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {shot.status !== 'Completed' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleStatusUpdate('Completed')}
              >
                <View style={[styles.actionButtonOutline, { borderColor: colors.success }]}>
                  <Text style={[styles.actionButtonText, { color: colors.success }]}>
                    Mark Complete
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shotCode: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.cyan,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'uppercase',
  },
  projectInfo: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  projectLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  metadataGrid: {
    gap: 12,
  },
  metadataItem: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
  },
  metadataLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metadataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonOutline: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

