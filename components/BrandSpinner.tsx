import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clapperboard } from 'lucide-react-native';
import { colors } from '../constants/colors';

interface BrandSpinnerProps {
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function BrandSpinner({ size = 'large', fullScreen = false }: BrandSpinnerProps) {
  const spinner = (
    <View style={styles.centerContent}>
      <View style={styles.iconWrapper}>
        <LinearGradient
          colors={[colors.cyan, colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <Clapperboard size={size === 'large' ? 32 : 24} color="#FFF" />
        </LinearGradient>
      </View>
      <ActivityIndicator size={size} color={colors.accent} style={styles.spinner} />
    </View>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{spinner}</View>;
  }
  return spinner;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: 16,
  },
  iconGradient: {
    padding: 12,
    borderRadius: 16,
  },
  spinner: {
    marginTop: 8,
  },
});
