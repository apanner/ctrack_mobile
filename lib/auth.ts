import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Complete auth session for better UX
WebBrowser.maybeCompleteAuthSession();

// Get the correct redirect URL based on platform
function getRedirectUrl(): string {
  // For web (browser), use the current origin
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    // Fallback for SSR or when window is not available
    return 'http://localhost:8081/auth/callback';
  }
  
  // For native mobile apps, use deep link
  // The scheme is defined in app.json as "cinetrack"
  return 'cinetrack://auth/callback';
}

// Simplified auth - using Supabase's built-in OAuth
export async function signInWithGoogle() {
  try {
    const redirectTo = getRedirectUrl();
    
    console.log('🔐 Starting Google OAuth with redirectTo:', redirectTo);
    console.log('🌐 Platform:', Platform.OS);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('❌ Google OAuth error:', error);
      throw error;
    }
    
    console.log('✅ OAuth URL generated:', data?.url ? 'Yes' : 'No');
    return data;
  } catch (error) {
    console.error('❌ Google sign in error:', error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

