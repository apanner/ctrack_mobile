import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GlassCard } from './GlassCard';
import { colors } from '../constants/colors';
import { ChevronDown } from 'lucide-react-native';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useUpdateShot } from '../lib/api/shots';
import type { Shot } from '../types';

interface ShotTaskCardProps {
  shot: Shot;
  variant?: 'default' | 'overdue' | 'completed';
}

const STATUS_OPTIONS: Array<{ value: Shot['status']; label: string }> = [
  { value: 'Not Started', label: 'Not Started' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Completed', label: 'Review Ready' },
];

export function ShotTaskCard({ shot, variant = 'default' }: ShotTaskCardProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const updateShot = useUpdateShot();

  const handleStatusChange = async (newStatus: Shot['status']) => {
    setShowStatusMenu(false);
    try {
      await updateShot.mutateAsync({ id: shot.id, updates: { status: newStatus } });
    } catch (e) {
      console.error('Shot status update failed:', e);
    }
  };

  const canChangeStatus = shot.status === 'In Progress' || shot.status === 'Not Started' || shot.status === 'On Hold';
  const isOverdue = variant === 'overdue';
  const isCompleted = variant === 'completed';

  return (
    <Pressable onPress={() => router.push(`/shot/${shot.id}`)}>
      <GlassCard style={{ marginBottom: 12 }}>
        <View style={styles.taskCard}>
          <View style={styles.mainRow}>
            <Text
              style={[
                styles.taskCode,
                isOverdue && { color: colors.error },
                isCompleted && { color: colors.textSecondary },
              ]}
            >
              {shot.shot_code}
            </Text>
            {canChangeStatus && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setShowStatusMenu(!showStatusMenu);
                }}
                style={styles.statusToggle}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.statusBadge}>{shot.status}</Text>
                <ChevronDown size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.taskMeta}>
            Due {format(new Date(shot.due_date), 'MMM dd')} · {shot.department}
          </Text>
          {showStatusMenu && canChangeStatus && (
            <View style={styles.statusMenu}>
              {STATUS_OPTIONS.filter((o) => o.value !== shot.status).map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.statusOption}
                  onPress={() => handleStatusChange(opt.value)}
                  disabled={updateShot.isPending}
                >
                  {updateShot.isPending ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : (
                    <Text style={styles.statusOptionText}>{opt.label}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  taskCard: {},
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  taskMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusMenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    minWidth: 100,
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
