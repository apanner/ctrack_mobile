import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useProductivity } from '../lib/api/productivity';
import { colors } from '../constants/colors';
import { GlassCard } from './GlassCard';
import { BrandSpinner } from './BrandSpinner';

/** Color bands: 90-100 green, 70-89 amber, 50-69 orange, <50 red */
function getScoreColor(score: number): string {
  if (score >= 90) return colors.success;
  if (score >= 70) return '#F59E0B'; // amber
  if (score >= 50) return '#F97316'; // orange
  return colors.error;
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs Focus';
}

interface ProductivityMeterProps {
  onPress?: () => void;
}

export function ProductivityMeter({ onPress }: ProductivityMeterProps) {
  const { data, isLoading, error } = useProductivity();
  const [detailVisible, setDetailVisible] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setDetailVisible(true);
    }
  };

  const score = data?.snapshot?.composite_score ?? 0;
  const bandColor = getScoreColor(score);
  const label = getScoreLabel(score);

  if (isLoading) {
    return (
      <View style={styles.pillWrapper}>
        <GlassCard>
          <View style={styles.pillContent}>
            <BrandSpinner size="small" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.pill, { borderLeftColor: colors.textSecondary }]}>
        <Text style={styles.value}>--</Text>
        <Text style={styles.status}>Unable to load</Text>
      </View>
    );
  }

  return (
    <>
      <Pressable
        onPress={handlePress}
        style={[styles.pill, { borderLeftColor: bandColor }]}
        accessibilityLabel={`Productivity score ${score}. Tap for details.`}
        accessibilityRole="button"
      >
        <Text style={styles.value}>{score}%</Text>
        <Text style={styles.status}>{label}</Text>
      </Pressable>

      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDetailVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Productivity Details</Text>
              <TouchableOpacity
                onPress={() => setDetailVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Composite Score</Text>
                <View style={[styles.scoreBadge, { backgroundColor: `${getScoreColor(score)}22` }]}>
                  <Text style={[styles.scoreBadgeText, { color: bandColor }]}>{score}%</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Velocity (bid vs actual)</Text>
                <Text style={styles.detailValue}>{data?.snapshot?.velocity_score ?? 0}%</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Deadline hit rate</Text>
                <Text style={styles.detailValue}>{data?.snapshot?.deadline_hit_rate ?? 0}%</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Consistency</Text>
                <Text style={styles.detailValue}>{data?.snapshot?.consistency_index ?? 0}%</Text>
              </View>

              <Text style={styles.sectionTitle}>Recent Tasks (Bid vs Actual)</Text>
              {(data?.task_details ?? []).slice(0, 10).map((t) => (
                <View key={t.id} style={styles.taskRow}>
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {t.shot_code ? `${t.shot_code} - ` : ''}{t.title}
                  </Text>
                  <Text style={styles.taskMeta}>
                    {t.bid_hours}h bid / {t.actual_hours}h actual
                  </Text>
                </View>
              ))}
              {(!data?.task_details || data.task_details.length === 0) && (
                <Text style={styles.emptyText}>No task data yet</Text>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pillWrapper: {
    marginBottom: 8,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  status: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  taskMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
