import { Stack } from 'expo-router';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from '../components/SplashScreen';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { TimerProvider } from '../contexts/TimerContext';
import { FocusTimerProvider } from '../contexts/FocusTimerContext';
import { useOfflineFlush } from '../lib/use-offline-flush';
import { PushTokenRegistration } from '../lib/push-token-registration';
import { LocationTrackingManager } from '../lib/location-tracking-manager';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { validateEnv } from '../lib/env-validation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'ctrack-mobile-cache',
});

function OfflineFlushListener() {
  useOfflineFlush();
  return null;
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [splashComplete, setSplashComplete] = useState(false);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Root layout auth change:', event);
      
      // If signed in, verify user has profile (same security as web)
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, is_active')
          .eq('id', session.user.id)
          .single();
        
        // Only set session if user has valid profile
        if (profile && profile.is_active) {
          setSession(session);
        } else {
          // No profile or inactive - sign out
          await supabase.auth.signOut();
          setSession(null);
        }
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => validateEnv(), []);

  if (loading || !splashComplete) {
    return <SplashScreen onFinish={() => setSplashComplete(true)} />;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <PushTokenRegistration session={session} />
        <LocationTrackingManager session={session} />
        <OfflineFlushListener />
        <View style={{ flex: 1 }}>
          <OfflineIndicator />
          <TimerProvider>
            <FocusTimerProvider>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#2A2D35',
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                  fontWeight: '600',
                },
              }}
            >
                  <Stack.Screen
                name="(auth)"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="shot/[id]"
                options={{ title: 'Shot Details' }}
              />
              <Stack.Screen
                name="project/[id]"
                options={{ title: 'Project Tasks', headerShown: false }}
              />
              <Stack.Screen
                name="leaves/index"
                options={{ title: 'Leaves', headerShown: false }}
              />
              <Stack.Screen
                name="expenses/index"
                options={{ title: 'Expenses', headerShown: false }}
              />
              <Stack.Screen
                name="expenses/new"
                options={{ title: 'New Expense', headerShown: false }}
              />
              <Stack.Screen
                name="chat/[roomId]"
                options={{ title: 'Chat', headerShown: false }}
              />
              <Stack.Screen
                name="notifications/index"
                options={{ title: 'Notifications' }}
              />
              <Stack.Screen
                name="reminders/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="focus-timer"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="location-consent"
                options={{ title: 'Location Tracking' }}
              />
              <Stack.Screen
                name="+not-found"
                options={{ title: 'Not Found' }}
              />
            </Stack>
            </FocusTimerProvider>
          </TimerProvider>
        </View>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
    </ErrorBoundary>
  );
}

