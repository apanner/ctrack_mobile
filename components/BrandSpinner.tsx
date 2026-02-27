import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';

interface BrandSpinnerProps {
  size?: 'small' | 'large' | 'huge';
  fullScreen?: boolean;
}

export function BrandSpinner({ size = 'large', fullScreen = false }: BrandSpinnerProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous rotation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Subtle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const reverseSpin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg']
  });

  const scale = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05]
  });

  const opacity = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1]
  });

  const sizeMap = {
    small: 32,
    large: 64,
    huge: 120
  };

  const containerSize = sizeMap[size];
  const ringSize = containerSize;
  const innerRingSize = containerSize * 0.7;

  const spinner = (
    <View style={[styles.centerContent, { width: containerSize, height: containerSize }]}>
      {/* Background Glow */}
      <Animated.View 
        style={[
          styles.glow, 
          { 
            width: containerSize * 1.5, 
            height: containerSize * 1.5,
            opacity: opacity,
            transform: [{ scale }]
          }
        ]} 
      />

      {/* Outer spinning gradient ring */}
      <Animated.View style={[styles.ringContainer, { width: ringSize, height: ringSize, transform: [{ rotate: spin }] }]}>
        <View style={[styles.ring, { width: ringSize, height: ringSize, borderRadius: ringSize / 2, borderTopColor: colors.cyan }]} />
      </Animated.View>

      {/* Inner reverse spinning ring */}
      <Animated.View style={[styles.ringContainer, { width: innerRingSize, height: innerRingSize, transform: [{ rotate: reverseSpin }] }]}>
        <View style={[styles.ring, { width: innerRingSize, height: innerRingSize, borderRadius: innerRingSize / 2, borderBottomColor: '#24E1B1', borderLeftColor: '#24E1B1', opacity: 0.8 }]} />
      </Animated.View>

      {/* Center 'C' */}
      <Animated.Text style={[styles.centerLetter, { fontSize: containerSize * 0.4, transform: [{ scale }] }]}>
        C
      </Animated.Text>
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
    backgroundColor: colors.background,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.cyan,
    opacity: 0.15,
    filter: [{ blur: '20px' }] as any, // Works on web
  },
  ringContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'absolute',
  },
  centerLetter: {
    position: 'absolute',
    fontWeight: '900',
    color: colors.cyan,
    textShadowColor: 'rgba(0, 240, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  }
});
