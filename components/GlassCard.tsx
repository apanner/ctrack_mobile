import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';
import { uiTokens } from '../constants/ui-tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  noPadding?: boolean;
  /** Optional left border accent (Design H shot cards) */
  leftBorderColor?: keyof Pick<
    typeof colors,
    'accent' | 'violet' | 'cyan' | 'blue' | 'green' | 'amber'
  >;
}

export function GlassCard({
  children,
  style,
  intensity = 40,
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
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        {/* Gradient top highlight (::after style) */}
        <LinearGradient
          colors={[
            'transparent',
            'rgba(244,114,182,0.12)',
            'rgba(167,139,250,0.12)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topHighlight}
        />
        <View style={[styles.content, noPadding && styles.noPadding]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: uiTokens.surface.elevatedShadowOpacity,
    shadowRadius: uiTokens.surface.elevatedShadowRadius,
    elevation: 5,
  },
  wrapperWithBorder: {
    borderLeftWidth: 3,
  },
  blur: {
    flex: 1,
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
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
