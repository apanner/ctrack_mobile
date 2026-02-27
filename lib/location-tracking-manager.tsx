/**
 * Manages location tracking lifecycle when user is logged in.
 * Starts tracking if consented and not paused; stops when logged out.
 * Skips entirely on web (expo-location has limited web support).
 */
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { getLocationConsent, getLocationPaused } from './location-consent-storage';
import { startLocationTracking, stopLocationTracking } from './location-tracking';

export function LocationTrackingManager({ session }: { session: { user: { id: string } } | null }) {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!session?.user) {
      stopLocationTracking();
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const [consented, paused] = await Promise.all([
          getLocationConsent(),
          getLocationPaused(),
        ]);
        if (cancelled) return;
        if (consented && !paused) {
          await startLocationTracking();
        } else {
          stopLocationTracking();
        }
      } catch (e) {
        if (!cancelled) console.warn('Location tracking manager:', e);
      }
    }

    void run();
    return () => {
      cancelled = true;
      stopLocationTracking();
    };
  }, [session?.user?.id]);

  return null;
}
