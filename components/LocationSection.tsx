import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapPin, Pause, Play } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { colors } from '../constants/colors';
import { useLocationStatus } from '../lib/use-location-status';
import { router } from 'expo-router';

export function LocationSection() {
  const {
    consented,
    paused,
    hasPermission,
    lastSyncAt,
    isTracking,
    isLoading,
    togglePause,
    refresh,
  } = useLocationStatus();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <MapPin size={22} color={colors.accent} />
          <Text style={styles.sectionTitle}>Location</Text>
        </View>
        <View style={styles.card}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      </View>
    );
  }

  const statusText = !consented
    ? 'Off (no consent)'
    : !hasPermission
      ? 'Off (permission denied)'
      : paused
        ? 'Paused'
        : isTracking
          ? 'On'
          : 'Off';

  const statusColor =
    !consented || !hasPermission
      ? colors.textTertiary
      : paused
        ? colors.warning
        : colors.success;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <MapPin size={22} color={colors.accent} />
        <Text style={styles.sectionTitle}>Location</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, { color: statusColor }]}>{statusText}</Text>
        </View>
        {lastSyncAt && (
          <View style={styles.row}>
            <Text style={styles.label}>Last sync</Text>
            <Text style={styles.value}>{lastSyncAt}</Text>
          </View>
        )}
        <Text style={styles.batteryNote}>
          GPS tracking may increase battery use. Polls every 30s when moving, 30min when stationary.
        </Text>
        <View style={styles.actions}>
          {consented && hasPermission ? (
            <TouchableOpacity style={styles.toggleButton} onPress={togglePause} activeOpacity={0.7}>
              {paused ? (
                <>
                  <Play size={18} color={colors.accent} />
                  <Text style={styles.toggleText}>Resume</Text>
                </>
              ) : (
                <>
                  <Pause size={18} color={colors.warning} />
                  <Text style={[styles.toggleText, { color: colors.warning }]}>Pause</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => router.push('/location-consent')}
              activeOpacity={0.7}
            >
              <MapPin size={18} color={colors.accent} />
              <Text style={styles.toggleText}>Enable location</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  batteryNote: {
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 18,
    marginTop: 4,
  },
  actions: {
    marginTop: 12,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
});
