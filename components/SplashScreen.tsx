import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clapperboard } from 'lucide-react-native';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const progress = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000, // 2 seconds loading
      useNativeDriver: false,
    }).start(() => {
      if (onFinish) onFinish();
    });
  }, []);

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2A2D35', '#1C1E26']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[colors.cyan, colors.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Clapperboard size={64} color="#FFF" />
          </LinearGradient>
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
          <Text style={styles.loadingText}>LOADING...</Text>
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
  iconContainer: {
    marginBottom: 24,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconGradient: {
    padding: 20,
    borderRadius: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 60,
    letterSpacing: 1,
  },
  loaderContainer: {
    width: width * 0.6,
    alignItems: 'center',
  },
  loaderTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
  },
});

