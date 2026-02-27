/**
 * Registers the device push token with the backend when user is logged in.
 * Call on login/session change.
 */
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';
import { apiJson } from './api/client';

const EAS_PROJECT_ID = require('../app.json').expo?.extra?.eas?.projectId;

async function registerPushToken(token: string, platform: 'ios' | 'android' | 'web') {
  return apiJson<{ data: unknown }>('/api/v1/mobile/notifications/register-token', {
    method: 'POST',
    body: JSON.stringify({ token, platform }),
  });
}

export function PushTokenRegistration({ session }: { session: { user: { id: string } } | null }) {
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      lastTokenRef.current = null;
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted' && status !== 'provisional') return;
        if (cancelled) return;

        const platform: 'ios' | 'android' | 'web' =
          Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
        if (platform === 'web') return;

        const pushToken = await Notifications.getExpoPushTokenAsync({
          projectId: EAS_PROJECT_ID,
        });
        const token = pushToken?.data;
        if (!token || lastTokenRef.current === token) return;
        if (cancelled) return;

        lastTokenRef.current = token;
        await registerPushToken(token, platform);
      } catch (err) {
        if (!cancelled) console.warn('Push token registration failed:', err);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return null;
}
