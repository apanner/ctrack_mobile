import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Calendar, FileText } from 'lucide-react-native';
import { format } from 'date-fns';
import { useLeaves, useSubmitLeave, type Leave } from '../../lib/api/leaves';
import { BrandSpinner } from '../../components/BrandSpinner';
import { colors } from '../../constants/colors';

const LEAVE_TYPES = [
  { value: 'Annual', label: 'Annual' },
  { value: 'Sick', label: 'Sick' },
  { value: 'Personal', label: 'Personal' },
  { value: 'Other', label: 'Other' },
] as const;

export default function LeavesScreen() {
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [leaveType, setLeaveType] = useState<string>('Annual');
  const [notes, setNotes] = useState('');

  const { data: leaves = [], isLoading } = useLeaves();
  const submitLeave = useSubmitLeave();

  const handleApplyLeave = () => {
    if (new Date(endDate) < new Date(startDate)) {
      Alert.alert('Invalid dates', 'End date must be on or after start date.');
      return;
    }
    submitLeave.mutate(
      { startDate, endDate, type: leaveType, notes: notes || undefined },
      {
        onSuccess: () => {
          setShowForm(false);
          setNotes('');
        },
        onError: (err) => Alert.alert('Error', err.message),
      }
    );
  };

  const handleBack = () => router.back();

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
        {showForm ? (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Apply Leave</Text>

            <Text style={styles.label}>Date range</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                editable
              />
              <Text style={styles.dateSeparator}>to</Text>
              <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                editable
              />
            </View>

            <Text style={styles.label}>Leave type</Text>
            <View style={styles.typeRow}>
              {LEAVE_TYPES.map((t) => (
                <Pressable
                  key={t.value}
                  style={[
                    styles.typeChip,
                    leaveType === t.value && styles.typeChipActive,
                  ]}
                  onPress={() => setLeaveType(t.value)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      leaveType === t.value && styles.typeChipTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor={colors.textSecondary}
              multiline
            />

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleApplyLeave}
                disabled={submitLeave.isPending}
              >
                {submitLeave.isPending ? (
                  <BrandSpinner size="sm" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addCard}
            onPress={() => setShowForm(true)}
            activeOpacity={0.8}
          >
            <Calendar size={24} color={colors.accent} />
            <Text style={styles.addCardText}>Apply Leave</Text>
          </TouchableOpacity>
        )}

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
  formSection: {
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  dateSeparator: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}22`,
  },
  typeChipText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  typeChipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  notesInput: {
    minHeight: 80,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
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
