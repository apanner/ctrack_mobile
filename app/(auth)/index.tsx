import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { signInWithGoogle } from '../../lib/auth';
import { getPostAuthRoute } from '../../lib/auth-redirect';
import { colors } from '../../constants/colors';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../lib/supabase';
import { LogoSplashScreen } from '../../components/LogoSplashScreen';
import { BrandSpinner } from '../../components/BrandSpinner';

export default function AuthScreen() {
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    // Check if already signed in
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth screen auth change:', event, session?.user?.id);

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        console.log('Verifying profile for user:', session.user.id);
        // Verify profile before redirecting
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, is_active')
          .eq('id', session.user.id)
          .single();

        console.log('Profile check result:', { profile, error });

        if (profile && profile.is_active) {
          const route = await getPostAuthRoute();
          router.replace(route);
        } else {
          console.log('Profile invalid or missing, signing out');
          await supabase.auth.signOut();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      console.log('Checking session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session found:', !!session);

      if (session) {
        console.log('Verifying profile in checkSession for:', session.user.id);
        // Verify profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, is_active')
          .eq('id', session.user.id)
          .single();

        console.log('Profile check result (checkSession):', { profile, error });

        if (profile && profile.is_active) {
          const route = await getPostAuthRoute();
          router.replace(route);
          return;
        } else {
          console.log('Profile invalid (checkSession), signing out');
          await supabase.auth.signOut();
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Session check error:', error);
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      const result = await signInWithGoogle();

      if (result?.url) {
        if (Platform.OS === 'web') {
          // For web, just navigate directly
          window.location.href = result.url;
        } else {
          // For native, use WebBrowser
          await WebBrowser.openAuthSessionAsync(
            result.url,
            'cinetrack://auth/callback'
          );
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setSigningIn(false);
    }
  };

  if (loading) {
    return <LogoSplashScreen />;
  }

  return (
    <View style={styles.container}>
      <SplashContent />
      <View style={styles.authSection}>
        <Text style={styles.welcomeText}>Welcome to CineTrack</Text>
        <Text style={styles.subtitleText}>Sign in to continue</Text>
        <View style={styles.buttonContainer}>
          {signingIn ? (
            <BrandSpinner size="md" />
          ) : (
            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.8}>
              <LinearGradient
                colors={[colors.accent, colors.accentSecondary]}
                style={styles.signInButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.signInButtonText}>
                  Sign in with Google
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

function SplashContent() {
  return (
    <View style={styles.splashContainer}>
      {/* Clapperboard Logo */}
      <View style={styles.logoContainer}>
        {/* Top movable part with stripes */}
        <View style={styles.clapperTop}>
          <View style={styles.stripe} />
          <View style={[styles.stripe, styles.stripeOffset]} />
        </View>

        {/* Main board with gradient */}
        <LinearGradient
          colors={[colors.purple, colors.cyan]}
          style={styles.clapperBoard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.clapperInner} />
        </LinearGradient>

        {/* Lens flare effect */}
        <View style={styles.lensFlare} />
      </View>

      {/* App Name */}
      <Text style={styles.appName}>CineTrack</Text>

      {/* Loading Bar */}
      <View style={styles.loadingBarContainer}>
        <View style={styles.loadingBarBackground}>
          <View style={styles.loadingBarFill} />
        </View>
        <Text style={styles.loadingText}>LOADING...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 120,
    height: 120,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clapperTop: {
    position: 'absolute',
    top: 0,
    width: 100,
    height: 30,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    zIndex: 2,
  },
  stripe: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: colors.cyan,
    top: 8,
  },
  stripeOffset: {
    top: 18,
    backgroundColor: colors.purple,
  },
  clapperBoard: {
    width: 100,
    height: 80,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  clapperInner: {
    width: 70,
    height: 50,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: colors.background,
    borderRadius: 4,
  },
  lensFlare: {
    position: 'absolute',
    width: 150,
    height: 4,
    backgroundColor: colors.cyan,
    opacity: 0.6,
    top: 60,
    left: -15,
    borderRadius: 2,
    zIndex: 0,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginTop: 40,
    letterSpacing: 1,
  },
  loadingBarContainer: {
    marginTop: 40,
    width: 200,
    alignItems: 'center',
  },
  loadingBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  loadingBarFill: {
    width: '40%',
    height: '100%',
    backgroundColor: colors.cyan,
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 2,
    fontWeight: '500',
  },
  authSection: {
    width: '100%',
    paddingHorizontal: 32,
    paddingBottom: 60,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  signInButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

