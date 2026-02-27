import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { BarChart3, Clock, Wifi } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { setHasSeenOnboarding } from '../lib/onboarding-storage';

const { width } = Dimensions.get('window');

interface SlideData {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const SLIDES: SlideData[] = [
  {
    title: 'What is CTrack?',
    subtitle: 'Your all-in-one studio companion for tasks, time logging, and team collaboration.',
    icon: <BarChart3 size={48} color={colors.cyan} />,
  },
  {
    title: 'Log time in seconds',
    subtitle: 'One-tap time logging. Log hours by project, shot, and task. Works offline too.',
    icon: <Clock size={48} color={colors.accent} />,
  },
  {
    title: 'Stay connected',
    subtitle: 'Get task updates, reminders, and team messages. Never miss a deadline.',
    icon: <Wifi size={48} color={colors.purple} />,
  },
];

export default function OnboardingScreen() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('18:00');
  const [step, setStep] = useState<'slides' | 'permissions' | 'shift'>('slides');

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = e.nativeEvent.contentOffset.x;
      const index = Math.round(offset / width);
      if (index >= 0 && index < SLIDES.length) setSlideIndex(index);
    },
    []
  );

  const handleNextSlide = useCallback(() => {
    if (slideIndex < SLIDES.length - 1) {
      setSlideIndex((i) => i + 1);
    } else {
      setStep('permissions');
    }
  }, [slideIndex]);

  const goToShift = useCallback(() => setStep('shift'), []);

  const handleRequestNotifications = useCallback(async () => {
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    } catch (e) {
      console.warn('Notification permission:', e);
    }
    goToShift();
  }, [goToShift]);

  const handleRequestLocation = useCallback(() => {
    router.push('/location-consent');
  }, []);

  const handleSkipPermissions = useCallback(() => {
    setStep('shift');
  }, []);

  const handleShiftSetup = useCallback(async () => {
    // Store shift hours in AsyncStorage if needed (optional per task)
    await setHasSeenOnboarding();
    router.replace('/(tabs)');
  }, []);

  const handleSkipShift = useCallback(async () => {
    await setHasSeenOnboarding();
    router.replace('/(tabs)');
  }, []);

  if (step === 'permissions') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.permissionContent}>
          <Text style={styles.permissionTitle}>Optional permissions</Text>
          <Text style={styles.permissionSubtitle}>
            Enable notifications to get task reminders and updates. Location helps with GPS tracking
            for shift hours (consent-based).
          </Text>

          <TouchableOpacity style={styles.permissionButton} onPress={handleRequestNotifications}>
            <Text style={styles.permissionButtonText}>Enable notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.permissionButton} onPress={handleRequestLocation}>
            <Text style={styles.permissionButtonText}>Enable location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkipPermissions}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'shift') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.shiftContent}>
          <Text style={styles.shiftTitle}>Shift hours (optional)</Text>
          <Text style={styles.shiftSubtitle}>
            Set your default work hours for better time suggestions.
          </Text>

          <View style={styles.shiftRow}>
            <View style={styles.shiftField}>
              <Text style={styles.shiftLabel}>Start</Text>
              <Text style={styles.shiftValue}>{shiftStart}</Text>
            </View>
            <View style={styles.shiftField}>
              <Text style={styles.shiftLabel}>End</Text>
              <Text style={styles.shiftValue}>{shiftEnd}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleShiftSetup} activeOpacity={0.8}>
            <LinearGradient
              colors={[colors.accent, colors.accentSecondary]}
              style={styles.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkipShift}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
            <View style={styles.iconWrapper}>{slide.icon}</View>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, slideIndex === i && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleNextSlide} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.accent, colors.accentSecondary]}
            style={styles.nextButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>
              {slideIndex < SLIDES.length - 1 ? 'Next' : 'Get started'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 48,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  slideSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 24,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  permissionContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  permissionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  skipButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  shiftContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  shiftTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  shiftSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  shiftRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  shiftField: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
  },
  shiftLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  shiftValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
