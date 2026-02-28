import { View, Text, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { colors } from '../constants/colors';

/**
 * Small banner shown at top when device is offline.
 * Queued mutations are flushed when back online via useOfflineFlush in _layout.
 */
export function OfflineBanner() {
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false;

  if (!isOffline) return null;

  return (
    <View
      style={styles.container}
      accessibilityRole="status"
      accessibilityLabel="You are offline"
    >
      <WifiOff size={14} color={colors.text} />
      <Text style={styles.text}>Offline • Changes will sync when connected</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundTertiary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  text: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
