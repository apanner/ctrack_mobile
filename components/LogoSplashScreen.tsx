import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BrandSpinner } from './BrandSpinner';
import { colors } from '../constants/colors';

export function LogoSplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>CineTrack</Text>
      <View style={styles.spinnerWrapper}>
        <BrandSpinner size="large" />
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
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
  },
  spinnerWrapper: {
    marginTop: 40,
  },
});
