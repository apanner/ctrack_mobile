import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useShots } from '../../../lib/api/shots';
import { useCurrentUser } from '../../../lib/api/profile';
import { colors } from '../../../constants/colors';
import { router } from 'expo-router';
import { Clapperboard, Search, Filter } from 'lucide-react-native';
import { format } from 'date-fns';
import { useState } from 'react';
import { GlassCard } from '../../../components/GlassCard';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { uiTokens } from '../../../constants/ui-tokens';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'Not Started', label: 'Assigned' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Review' },
  { value: 'On Hold', label: 'On Hold' },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'Completed':
      return colors.success;
    case 'In Progress':
      return colors.tint;
    case 'On Hold':
      return colors.warning;
    default:
      return colors.textMuted;
  }
}

export default function ShotsListScreen() {
  const { data: user } = useCurrentUser();
  const { data: shots = [], isLoading } = useShots(
    user?.role === 'artist' ? { artist_id: user?.id } : undefined
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredShots = shots.filter((s) => {
    const matchSearch =
      !searchQuery.trim() ||
      s.shot_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.searchWrap}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search shots..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
        >
          <Filter size={18} color={showFilters ? colors.tint : colors.textMuted} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterRowContent}
        >
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setStatusFilter(f.value)}
              style={[styles.filterChip, statusFilter === f.value && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, statusFilter === f.value && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filteredShots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Clapperboard size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No shots found</Text>
            <Text style={styles.emptySubtext}>
              {shots.length === 0 ? 'Assignments will appear here' : 'Try a different filter'}
            </Text>
          </View>
        ) : (
          filteredShots.map((shot) => {
            const isOverdue = shot.due_date && new Date(shot.due_date) < new Date();
            return (
              <TouchableOpacity
                key={shot.id}
                onPress={() => router.push(`/(tabs)/shots/${shot.id}`)}
                activeOpacity={0.85}
                style={styles.shotCardWrap}
              >
                <GlassCard noPadding leftBorderColor={isOverdue ? 'red' : 'cyan'}>
                  <View style={styles.shotCard}>
                    <View style={styles.shotHeader}>
                      <Text style={styles.shotCode}>{shot.shot_code}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shot.status ?? '') + '30' }]}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(shot.status ?? '') }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(shot.status ?? '') }]}>
                          {shot.status || 'Assigned'}
                        </Text>
                      </View>
                    </View>
                    {shot.department && (
                      <Text style={styles.shotDept}>{shot.department}</Text>
                    )}
                    <View style={styles.shotFooter}>
                      <Text style={[styles.deadline, isOverdue && { color: colors.danger }]}>
                        {shot.due_date
                          ? isOverdue
                            ? `${format(new Date(shot.due_date), 'MMM d')} overdue`
                            : `Due ${format(new Date(shot.due_date), 'MMM d')}`
                          : 'No deadline'}
                      </Text>
                      <Text style={styles.hours}>
                        {shot.estimated_hours ?? 0}h est
                        {shot.actual_hours != null ? ` · ${shot.actual_hours}h actual` : ''}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uiTokens.spacing.sm,
    marginHorizontal: uiTokens.spacing.xl,
    marginBottom: uiTokens.spacing.md,
    paddingHorizontal: uiTokens.spacing.md,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 4 },
  filterBtn: { padding: 4 },
  filterBtnActive: {},
  filterRow: { marginBottom: uiTokens.spacing.md },
  filterRowContent: { gap: 8, paddingHorizontal: uiTokens.spacing.xl, flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.tint + '20',
    borderColor: colors.tint,
  },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterChipTextActive: { color: colors.tint },
  scrollView: { flex: 1 },
  listContent: { paddingHorizontal: uiTokens.spacing.xl, paddingBottom: 120 },
  shotCardWrap: { marginBottom: uiTokens.spacing.md },
  shotCard: { padding: uiTokens.spacing.lg },
  shotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  shotCode: { fontSize: 16, fontWeight: '700', color: colors.text, fontFamily: 'monospace' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  shotDept: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  shotFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deadline: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  hours: { fontSize: 11, color: colors.textMuted },
  emptyContainer: { flex: 1, alignItems: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', color: colors.textSecondary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: colors.textMuted, marginTop: 8 },
});
