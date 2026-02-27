import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing authentication...');
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const handleUserVerification = async (session: any) => {
      if (!session?.user) {
        setStatus('No session found');
        setTimeout(() => {
          router.replace('/(auth)');
        }, 2000);
        return;
      }

      setStatus('Verifying profile...');

      // Check if user has a profile in database (CRITICAL - same as web version)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        setStatus('Access denied. Your email is not authorized.');
        // Sign out to ensure session is cleared
        await supabase.auth.signOut();
        setTimeout(() => {
          router.replace('/(auth)');
        }, 2000);
        return;
      }

      // Check if profile is active
      if (!profile.is_active) {
        setStatus('Your account is inactive.');
        await supabase.auth.signOut();
        setTimeout(() => {
          router.replace('/(auth)');
        }, 2000);
        return;
      }

      // User is authenticated and has valid profile
      setStatus('Redirecting...');
      setHasSession(true);
      router.replace('/(tabs)');
    };

    // Listen for auth state changes - Supabase will automatically process the callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        await handleUserVerification(session);
      } else if (event === 'SIGNED_OUT') {
        setStatus('Authentication failed');
        setTimeout(() => {
          router.replace('/(auth)');
        }, 2000);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        await handleUserVerification(session);
      }
    });

    // Also try to get session immediately (in case it's already processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleUserVerification(session);
      } else {
        // Wait a bit for the callback to process
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              handleUserVerification(session);
            } else {
              setStatus('No session found. Redirecting...');
              setTimeout(() => {
                router.replace('/(auth)');
              }, 2000);
            }
          });
        }, 1000);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.statusText}>{status}</Text>
      <Text style={styles.subtitleText}>Please wait...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  subtitleText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

