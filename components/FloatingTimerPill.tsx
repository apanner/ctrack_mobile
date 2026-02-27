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
    <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
      <BlurView intensity={60} tint="dark" style={styles.pill}>
        <View style={styles.content}>
          <Text style={styles.label} numberOfLines={1}>
            {shotCode} {taskName ? ` ${taskName}` : ''} | {elapsed || '0m'}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onPause}
              accessibilityLabel="Pause timer"
              accessibilityRole="button"
            >
              <Pause size={18} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.stopBtn]}
              onPress={onStop}
              accessibilityLabel="Stop timer"
              accessibilityRole="button"
            >
              <Square size={16} color={colors.error} fill={colors.error} />
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
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  pill: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  stopBtn: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
});
