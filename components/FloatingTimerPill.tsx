import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pause, Square } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useTimerPill } from '../contexts/TimerContext';

export function FloatingTimerPill() {
  const insets = useSafeAreaInsets();
  const { visible, shotCode, taskName, elapsed, onPause, onStop } = useTimerPill();

  if (!visible) return null;

  return (
    <View style={[styles.container, { top: insets.top + 12 }]} pointerEvents="box-none">
      <View style={styles.pill}>
        <View style={styles.content}>
          <View style={styles.pulseIndicator} />
          <Text style={styles.label} numberOfLines={1}>
            <Text style={styles.timeText}>{elapsed || '0m'}  </Text>
            {shotCode} {taskName ? `· ${taskName}` : ''}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onPause}
              accessibilityLabel="Pause timer"
              accessibilityRole="button"
            >
              <Pause size={14} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.stopBtn]}
              onPress={onStop}
              accessibilityLabel="Stop timer"
              accessibilityRole="button"
            >
              <Square size={12} color={colors.error} fill={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1000,
    width: 'auto',
    minWidth: 200,
    maxWidth: '90%',
  },
  pill: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1A1D26',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 12,
  },
  pulseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    flexShrink: 1,
  },
  timeText: {
    color: colors.text,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  stopBtn: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
});
