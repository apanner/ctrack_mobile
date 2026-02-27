import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const progress = new Animated.Value(0);
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Progress bar animation
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      if (onFinish) onFinish();
    });

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

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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

  const containerSize = 120;
  const ringSize = containerSize;
  const innerRingSize = containerSize * 0.7;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        {/* Animated CTrack Spinner */}
        <View style={[styles.centerContent, { width: containerSize, height: containerSize, marginBottom: 40 }]}>
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
        
        <Text style={styles.title}>CineTrack</Text>
        
        <View style={styles.loaderContainer}>
          <View style={styles.loaderTrack}>
            <Animated.View 
              style={[
                styles.loaderFill, 
                { width: widthInterpolated }
              ]} 
            />
          </View>
          <Text style={styles.loadingText}>INITIALIZING...</Text>
        </View>
      </View>
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
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 60,
    letterSpacing: -1,
  },
  loaderContainer: {
    width: width * 0.6,
    alignItems: 'center',
  },
  loaderTrack: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  loaderFill: {
    height: '100%',
    backgroundColor: colors.cyan,
    borderRadius: 2,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.cyan,
    filter: [{ blur: '30px' }] as any,
  },
  ringContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 4,
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

