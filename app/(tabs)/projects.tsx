import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProjects } from '../../lib/api/projects';
import { colors } from '../../constants/colors';
import { Image } from 'expo-image';
import { Calendar, CheckCircle2 } from 'lucide-react-native';
import { format } from 'date-fns';
import { router } from 'expo-router';

export default function ProjectsScreen() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Projects</Text>
          <Text style={styles.subtitle}>{projects?.length || 0} active projects</Text>
        </View>

        {!projects || projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>📁</Text>
            </View>
            <Text style={styles.emptyTitle}>No projects</Text>
            <Text style={styles.emptyText}>Projects will appear here when available.</Text>
          </View>
        ) : (
          <View style={styles.projectsList}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={styles.projectCard}
                onPress={() => router.push(`/project/${project.id}`)}
              >
                {project.logo_url ? (
                  <Image
                    source={{ uri: project.logo_url }}
                    style={styles.projectThumbnail}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.projectThumbnail, styles.placeholderThumbnail]}>
                    <Text style={styles.placeholderText}>{project.code}</Text>
                  </View>
                )}
                <View style={styles.projectContent}>
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            project.status === 'Active'
                              ? colors.success
                              : project.status === 'On Hold'
                                ? colors.warning
                                : colors.textTertiary,
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>{project.status}</Text>
                    </View>
                  </View>
                  {project.client_name && (
                    <Text style={styles.clientName}>{project.client_name}</Text>
                  )}
                  {project.delivery_date && (
                    <View style={styles.projectMeta}>
                      <Calendar size={14} color={colors.textSecondary} />
                      <Text style={styles.metaText}>
                        Due: {format(new Date(project.delivery_date), 'MMM dd, yyyy')}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    marginTop: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  projectsList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  projectCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  projectThumbnail: {
    width: '100%',
    height: 160,
    backgroundColor: colors.backgroundTertiary,
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textTertiary,
  },
  projectContent: {
    padding: 16,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

