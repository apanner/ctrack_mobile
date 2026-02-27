import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';

/**
 * OAuth callback at /auth/callback - matches redirect_to in signInWithGoogle.
 * Supabase redirects here with ?code=... after Google sign-in.
 * detectSessionInUrl (web) handles the code exchange automatically.
 */
export default function AuthCallback() {
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleUserVerification = async (session: { user?: { id: string } } | null) => {
      if (!session?.user) {
        setStatus('No session found');
        setTimeout(() => router.replace('/(auth)'), 2000);
        return;
      }

      setStatus('Verifying profile...');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, is_active')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        setStatus('Access denied. Your email is not authorized.');
        await supabase.auth.signOut();
        setTimeout(() => router.replace('/(auth)'), 2000);
        return;
      }

      if (!profile.is_active) {
        setStatus('Your account is inactive.');
        await supabase.auth.signOut();
        setTimeout(() => router.replace('/(auth)'), 2000);
        return;
      }

      setStatus('Redirecting...');
      router.replace('/(tabs)');
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await handleUserVerification(session);
      } else if (event === 'SIGNED_OUT') {
        setStatus('Authentication failed');
        setTimeout(() => router.replace('/(auth)'), 2000);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        await handleUserVerification(session);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        void handleUserVerification(session);
      } else {
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              void handleUserVerification(session);
            } else {
              setStatus('No session found. Redirecting...');
              setTimeout(() => router.replace('/(auth)'), 2000);
            }
          });
        }, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.cyan} />
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
