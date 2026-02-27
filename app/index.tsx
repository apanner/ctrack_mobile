import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { getPostAuthRoute } from '../lib/auth-redirect';
import { colors } from '../constants/colors';

export default function Index() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, is_active')
            .eq('id', session.user.id)
            .single();

          if (profile?.is_active) {
            const route = await getPostAuthRoute();
            router.replace(route);
            return;
          }
          await supabase.auth.signOut();
        }
        router.replace('/(auth)');
      } catch (e) {
        console.error('Auth check failed:', e);
        router.replace('/(auth)');
      }
    };

    void checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.cyan} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});


