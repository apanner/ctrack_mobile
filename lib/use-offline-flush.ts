import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { flushQueue } from './offline-queue';

/**
 * Sets up NetInfo listener to flush offline mutation queue when connectivity returns.
 * Call this once at app root (e.g. in _layout.tsx).
 */
export function useOfflineFlush() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected === true) {
        flushQueue().then(({ success }) => {
          if (success > 0) {
            queryClient.invalidateQueries({ queryKey: ['timesheets'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['offline-queue'] });
          }
        });
      }
    });

    return () => unsubscribe();
  }, [queryClient]);
}
