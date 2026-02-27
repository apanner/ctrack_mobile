import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Battery, Eye } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { setLocationConsent } from '../lib/location-consent-storage';
import { requestLocationPermission, startLocationTracking } from '../lib/location-tracking';

export default function LocationConsentScreen() {
  const handleAccept = async () => {
    await setLocationConsent(true);
    const granted = await requestLocationPermission();
    if (granted) {
      await startLocationTracking();
    }
    router.back();
  };

  const handleDecline = async () => {
    await setLocationConsent(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconWrapper}>
          <MapPin size={48} color={colors.accent} />
        </View>
        <Text style={styles.title}>Location tracking</Text>
        <Text style={styles.subtitle}>
          Enable GPS tracking so supervisors can see your location during shift hours. This helps with
          safety and workload visibility.
        </Text>

        <View style={styles.bulletSection}>
          <View style={styles.bulletRow}>
            <MapPin size={20} color={colors.textSecondary} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>When:</Text> Polls every 30 seconds when moving, every 30
              minutes when stationary. Stops when shift ends.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Battery size={20} color={colors.textSecondary} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Battery:</Text> Uses GPS in the background. May have
              noticeable impact on battery life during active tracking.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Eye size={20} color={colors.textSecondary} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Who sees it:</Text> Only admins and supervisors. Used for
              route replay and last-known position during work hours.
            </Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          You can pause or disable tracking anytime from the Me tab.
        </Text>

        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept} activeOpacity={0.8}>
          <Text style={styles.acceptButtonText}>Enable location tracking</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.declineButton} onPress={handleDecline} activeOpacity={0.8}>
          <Text style={styles.declineButtonText}>No thanks</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  bulletSection: {
    gap: 20,
    marginBottom: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: colors.text,
  },
  disclaimer: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 32,
  },
  acceptButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  declineButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
