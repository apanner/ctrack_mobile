import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../constants/colors';
import { uiTokens } from '../constants/ui-tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  noPadding?: boolean;
}

export function GlassCard({ children, style, intensity = 40, noPadding = false }: GlassCardProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        <View style={[styles.content, noPadding && styles.noPadding]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: uiTokens.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: uiTokens.surface.glassBorder,
    backgroundColor: uiTokens.surface.glassBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: uiTokens.surface.elevatedShadowOpacity,
    shadowRadius: uiTokens.surface.elevatedShadowRadius,
    elevation: 5,
  },
  blur: {
    flex: 1,
  },
  content: {
    padding: uiTokens.spacing.xl,
    flex: 1,
  },
  noPadding: {
    padding: 0,
  },
});
