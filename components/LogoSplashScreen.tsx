import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BrandSpinner } from './BrandSpinner';

const SPLASH_BG = '#0A0A0F';

export function LogoSplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>CineTrack</Text>
      <View style={styles.spinnerWrapper}>
        <BrandSpinner size="lg" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  spinnerWrapper: {
    marginTop: 40,
  },
});
