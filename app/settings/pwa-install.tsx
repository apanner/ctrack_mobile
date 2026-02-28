import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Smartphone, Share } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { colors } from '../../constants/colors';
import { GlassCard } from '../../components/GlassCard';
import { uiTokens } from '../../constants/ui-tokens';
import { getPwaSettings, setPwaSettings } from '../../lib/settings-storage';

export default function PwaInstallScreen() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);

  const load = useCallback(async () => {
    const pwa = await getPwaSettings();
    if (pwa.installPromptDismissed || pwa.pwaInstalled) {
      setShowPrompt(false);
      return;
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const ua = window.navigator.userAgent;
      const isIPad = ua.includes('iPad') || (ua.includes('Mac') && 'ontouchend' in document);
      const isIOSDevice = /iPhone|iPod|iPad/.test(ua) || isIPad;
      setIsIOS(isIOSDevice);

      const beforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', beforeInstall);

      if ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone) {
        await setPwaSettings({ pwaInstalled: true });
        setShowPrompt(false);
      }

      return () => window.removeEventListener('beforeinstallprompt', beforeInstall);
    }

    setShowPrompt(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleInstall = useCallback(async () => {
    if (Platform.OS === 'web' && deferredPrompt) {
      const e = deferredPrompt as { prompt?: () => Promise<void> };
      if (e.prompt) {
        await e.prompt();
        await setPwaSettings({ installPromptDismissed: true });
        setShowPrompt(false);
      }
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(async () => {
    await setPwaSettings({ installPromptDismissed: true });
    setShowPrompt(false);
    router.back();
  }, []);

  const handleOpenSettings = useCallback(() => {
    if (Platform.OS === 'web' && isIOS) {
      Linking.openURL('https://support.apple.com/guide/iphone/add-a-web-app-to-your-home-screen-iph42ab402f8/ios');
    }
  }, [isIOS]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Add to Home Screen</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <Smartphone size={64} color={colors.accent} />
        </View>

        <Text style={styles.headline}>Install CTrack</Text>
        <Text style={styles.subtext}>
          Add CTrack to your home screen for quick access and a full-screen app experience.
        </Text>

        {Platform.OS === 'web' && isIOS ? (
          <GlassCard style={styles.instructions}>
            <Text style={styles.instructionsTitle}>iOS / Safari</Text>
            <Text style={styles.instructionsStep}>1. Tap the Share button</Text>
            <Text style={styles.instructionsStep}>2. Scroll and tap "Add to Home Screen"</Text>
            <Text style={styles.instructionsStep}>3. Tap "Add"</Text>
            <TouchableOpacity onPress={handleOpenSettings} style={styles.linkButton}>
              <Share size={16} color={colors.accent} />
              <Text style={styles.linkText}>View Apple support guide</Text>
            </TouchableOpacity>
          </GlassCard>
        ) : showPrompt && deferredPrompt ? (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.installButton} onPress={handleInstall}>
              <Smartphone size={20} color="#FFF" />
              <Text style={styles.installButtonText}>Install now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
              <Text style={styles.dismissText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.alreadyText}>
            Your browser doesn't support "Add to Home Screen" or you've already installed the app.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: uiTokens.spacing.md,
    paddingVertical: uiTokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: uiTokens.radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: uiTokens.text.title,
    fontWeight: '700',
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: uiTokens.spacing.xl,
    paddingBottom: uiTokens.spacing.xxxl,
    alignItems: 'center',
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: uiTokens.spacing.xl,
    marginBottom: uiTokens.spacing.lg,
  },
  headline: {
    fontSize: uiTokens.text.headline,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: uiTokens.spacing.sm,
  },
  subtext: {
    fontSize: uiTokens.text.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: uiTokens.spacing.xl,
  },
  instructions: {
    padding: uiTokens.spacing.lg,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: uiTokens.text.bodyLg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: uiTokens.spacing.md,
  },
  instructionsStep: {
    fontSize: uiTokens.text.body,
    color: colors.textSecondary,
    marginBottom: uiTokens.spacing.sm,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: uiTokens.spacing.md,
  },
  linkText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    gap: uiTokens.spacing.md,
  },
  installButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  installButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  dismissButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dismissText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  alreadyText: {
    fontSize: uiTokens.text.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
