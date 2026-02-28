/**
 * Configure TanStack Query's OnlineManager to use NetInfo for React Native.
 * Call once at app startup (e.g. in _layout before QueryClientProvider).
 */
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

export function setupOnlineManager(): void {
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(state.isConnected === true);
    });
  });
}
