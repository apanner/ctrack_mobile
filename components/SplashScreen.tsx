import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      if (onFinish) onFinish();
    });

    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

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
    outputRange: [0.5, 1]
  });

  const containerSize = 120;
  const ringSize = containerSize;
  const innerRingSize = containerSize * 0.7;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.centerContent, { width: containerSize, height: containerSize }]}>
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

          <Animated.View style={[styles.ringContainer, { width: ringSize, height: ringSize, transform: [{ rotate: spin }] }]}>
            <View style={[styles.ring, { width: ringSize, height: ringSize, borderRadius: ringSize / 2, borderTopColor: colors.accent, borderWidth: 2.5 }]} />
          </Animated.View>

          <Animated.View style={[styles.ringContainer, { width: innerRingSize, height: innerRingSize, transform: [{ rotate: reverseSpin }] }]}>
            <View style={[styles.ring, { width: innerRingSize, height: innerRingSize, borderRadius: innerRingSize / 2, borderBottomColor: colors.cyan, borderWidth: 2, opacity: 0.9 }]} />
          </Animated.View>

          <Animated.Text style={[styles.centerLetter, { fontSize: containerSize * 0.4, color: colors.accent, transform: [{ scale }] }]}>
            C
          </Animated.Text>
        </View>

        <Text style={styles.title}>CTrack</Text>
        <Text style={styles.subtitle}>VFX Artist Workspace</Text>
        <View style={styles.loaderContainer}>
          <View style={styles.loaderTrack}>
            <Animated.View style={[styles.loaderFill, { width: widthInterpolated }]} />
          </View>
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 24,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    letterSpacing: 0.4,
  },
  loaderContainer: {
    width: width * 0.6,
    alignItems: 'center',
  },
  loaderTrack: {
    width: '100%',
    height: 3,
    backgroundColor: colors.surface,
    borderRadius: 2,
    marginTop: 40,
    overflow: 'hidden',
  },
  loaderFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.meshAccent,
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
  }
});
