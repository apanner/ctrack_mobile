import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMotivations } from '../lib/api/motivations';
import { colors } from '../constants/colors';
import { GlassCard } from './GlassCard';
import { BrandSpinner } from './BrandSpinner';
import { Sparkles } from 'lucide-react-native';

const DISMISSED_KEY_PREFIX = 'ctrack_motivation_dismissed_';

interface MotivationCardProps {
  onDismiss?: () => void;
}

export function MotivationCard({ onDismiss }: MotivationCardProps) {
  const { data: motivations, isLoading, error } = useMotivations();
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());

  const loadDismissed = useCallback(async () => {
    try {
      const raw = motivations ?? [];
      const ids: string[] = [];
      for (const m of raw) {
        const val = await AsyncStorage.getItem(`${DISMISSED_KEY_PREFIX}${m.id}`);
        if (val === '1') ids.push(m.id);
      }
      setDismissedIds(new Set(ids));
    } catch {
      setDismissedIds(new Set());
    }
  }, [motivations]);

  React.useEffect(() => {
    if (motivations?.length) loadDismissed();
  }, [motivations, loadDismissed]);

  const handleDismiss = useCallback(
    async (id: string) => {
      try {
        await AsyncStorage.setItem(`${DISMISSED_KEY_PREFIX}${id}`, '1');
        setDismissedIds((prev) => new Set([...prev, id]));
        onDismiss?.();
      } catch {
        setDismissedIds((prev) => new Set([...prev, id]));
      }
    },
    [onDismiss]
  );

  if (isLoading) {
    return (
      <GlassCard>
        <View style={styles.loadingContent}>
          <BrandSpinner size="small" />
          <Text style={styles.loadingText}>Loading motivation...</Text>
        </View>
      </GlassCard>
    );
  }

  if (error || !motivations?.length) {
    return null;
  }

  const visible = motivations.filter((m) => !dismissedIds.has(m.id));
  const first = visible[0];
  if (!first) return null;

  return (
    <GlassCard>
      <View style={styles.cardContent}>
        <View style={styles.iconRow}>
          <Sparkles size={20} color={colors.accentSecondary} />
          <Text style={styles.label}>Daily motivation</Text>
        </View>
        <Text style={styles.message}>{first.message}</Text>
        <Pressable
          onPress={() => handleDismiss(first.id)}
          style={styles.dismissBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Dismiss motivation"
        >
          <Text style={styles.dismissText}>Dismiss</Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  loadingContent: {
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
  cardContent: {
    padding: 4,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  dismissBtn: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  dismissText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
