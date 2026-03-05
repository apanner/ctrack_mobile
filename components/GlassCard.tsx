import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';
import { uiTokens } from '../constants/ui-tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  noPadding?: boolean;
  /** Optional left border accent */
  leftBorderColor?: keyof Pick<
    typeof colors,
    'accent' | 'violet' | 'cyan' | 'blue' | 'green' | 'amber' | 'red' | 'tint'
  >;
}

export function GlassCard({
  children,
  style,
  noPadding = false,
  leftBorderColor,
}: GlassCardProps) {
  const borderColor = leftBorderColor ? colors[leftBorderColor] : undefined;

  return (
    <View
      style={[
        styles.wrapper,
        borderColor && styles.wrapperWithBorder,
        borderColor && { borderLeftColor: borderColor },
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.surface, colors.surfaceLight, colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.highlight} />
        <View style={[styles.content, noPadding && styles.noPadding]}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  wrapperWithBorder: {
    borderLeftWidth: 4,
  },
  gradient: {
    flex: 1,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    zIndex: 1,
  },
  content: {
    padding: uiTokens.spacing.xl,
    flex: 1,
  },
  noPadding: {
    padding: 0,
  },
});
