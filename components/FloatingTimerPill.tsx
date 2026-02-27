import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
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
      <BlurView intensity={80} tint="dark" style={styles.pill}>
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
      </BlurView>
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
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.4)', // iOS Dynamic Island feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stopBtn: {
    backgroundColor: 'rgba(239,68,68,0.25)',
  },
});
