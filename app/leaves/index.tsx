import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Calendar, FileText } from 'lucide-react-native';
import { format } from 'date-fns';
import { useLeaves, type Leave } from '../../lib/api/leaves';
import { BrandSpinner } from '../../components/BrandSpinner';
import { colors } from '../../constants/colors';

export default function LeavesScreen() {
  const { data: leaves = [], isLoading } = useLeaves();

  const handleBack = () => router.back();

  const handleCreateLeave = () => router.push('/leaves/new');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <BrandSpinner size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaves</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.addCard}
          onPress={handleCreateLeave}
          activeOpacity={0.8}
          accessibilityLabel="Apply leave"
          accessibilityRole="button"
        >
          <Calendar size={24} color={colors.accent} />
          <Text style={styles.addCardText}>Apply Leave</Text>
        </TouchableOpacity>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>My Leaves</Text>
          {leaves.length === 0 ? (
            <Text style={styles.emptyText}>No leave requests yet.</Text>
          ) : (
            leaves.map((item) => (
              <LeaveCard key={item.id} leave={item} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LeaveCard({ leave }: { leave: Leave }) {
  const statusColor =
    leave.status === 'Approved'
      ? colors.success
      : leave.status === 'Rejected'
        ? colors.error
        : colors.warning;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDates}>
          {format(new Date(leave.start_date), 'MMM dd')} –{' '}
          {format(new Date(leave.end_date), 'MMM dd, yyyy')}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {leave.status}
          </Text>
        </View>
      </View>
      {leave.reason && (
        <View style={styles.cardNotes}>
          <FileText size={14} color={colors.textSecondary} />
          <Text style={styles.notesText}>{leave.reason}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardDates: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
