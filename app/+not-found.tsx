import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, Stack, router } from 'expo-router';
import { colors } from '../constants/colors';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function NotFoundScreen() {
  useEffect(() => {
    // Check if user is authenticated and redirect accordingly
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)');
      }
    };
    checkAuth();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>This screen doesn't exist.</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session) {
                router.replace('/(tabs)');
              } else {
                router.replace('/(auth)');
              }
            });
          }}
        >
          <Text style={styles.buttonText}>Go to home screen</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

