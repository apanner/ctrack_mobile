import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { uiTokens } from '../../constants/ui-tokens';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  /** Use design-d section label style (small, uppercase) */
  compact?: boolean;
}

export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
  compact = false,
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      {actionLabel && onActionPress ? (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: uiTokens.spacing.md,
  },
  title: {
    fontSize: uiTokens.text.title,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  titleCompact: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.08,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  action: {
    fontSize: uiTokens.text.body,
    fontWeight: '600',
    color: colors.tint,
  },
});

