import { useState, useEffect, useCallback } from 'react';
import {
  getLocationConsent,
  getLocationPaused,
  setLocationPaused,
  getLastSyncAt,
} from './location-consent-storage';
import {
  hasLocationPermission,
  startLocationTracking,
  stopLocationTracking,
} from './location-tracking';
import { formatDistanceToNow } from 'date-fns';

export function useLocationStatus() {
  const [consented, setConsented] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [c, p, perm, last] = await Promise.all([
        getLocationConsent(),
        getLocationPaused(),
        hasLocationPermission(),
        getLastSyncAt(),
      ]);
      setConsented(c);
      setPaused(p);
      setHasPermission(perm);
      setIsTracking(c && perm && !p);
      setLastSyncAt(
        last
          ? formatDistanceToNow(new Date(last), { addSuffix: true })
          : null
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const togglePause = useCallback(async () => {
    const newPaused = !paused;
    await setLocationPaused(newPaused);
    setPaused(newPaused);
    if (newPaused) {
      stopLocationTracking();
    } else {
      await startLocationTracking();
    }
    void refresh();
  }, [paused, refresh]);

  return {
    consented,
    paused,
    hasPermission,
    lastSyncAt,
    isTracking,
    isLoading,
    togglePause,
    refresh,
  };
}
