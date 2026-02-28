import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Smartphone } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { colors } from '../constants/colors';
import { GlassCard } from './GlassCard';
import { uiTokens } from '../constants/ui-tokens';
import { getPwaSettings, setPwaSettings } from '../lib/settings-storage';

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    let mounted = true;

    const check = async () => {
      const pwa = await getPwaSettings();
      if (pwa.installPromptDismissed || pwa.pwaInstalled) {
        if (mounted) setVisible(false);
        return;
      }

      const ua = window.navigator.userAgent;
      const isIPad = ua.includes('iPad') || (ua.includes('Mac') && 'ontouchend' in document);
      const isIOSDevice = /iPhone|iPod|iPad/.test(ua) || isIPad;

      if (mounted) {
        setIsIOS(isIOSDevice);
        setVisible(true);
      }

      const beforeInstall = (e: Event) => {
        e.preventDefault();
        if (mounted) setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', beforeInstall);

      if ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone) {
        await setPwaSettings({ pwaInstalled: true });
        if (mounted) setVisible(false);
      }

      return () => {
        mounted = false;
        window.removeEventListener('beforeinstallprompt', beforeInstall);
      };
    };

    check();
  }, []);

  const handlePress = async () => {
    if (deferredPrompt) {
      const e = deferredPrompt as { prompt?: () => Promise<void> };
      if (e.prompt) {
        await e.prompt();
        await setPwaSettings({ installPromptDismissed: true });
        setVisible(false);
      }
    } else {
      router.push('/settings/pwa-install');
    }
  };

  const handleDismiss = async () => {
    await setPwaSettings({ installPromptDismissed: true });
    setVisible(false);
  };

  if (!visible || Platform.OS !== 'web') return null;

  return (
    <GlassCard style={styles.banner}>
      <View style={styles.bannerContent}>
        <View style={styles.iconWrap}>
          <Smartphone size={20} color={colors.accent} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Add to Home Screen</Text>
          <Text style={styles.subtitle}>
            {deferredPrompt
              ? 'Install CTrack for quick access'
              : 'Tap for install instructions'}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.installButton} onPress={handlePress}>
          <Text style={styles.installText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDismiss} style={styles.dismiss}>
          <Text style={styles.dismissText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: uiTokens.spacing.md,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: uiTokens.spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: uiTokens.spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: uiTokens.text.bodyLg,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: uiTokens.text.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  installButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  installText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  dismiss: {
    paddingVertical: 8,
  },
  dismissText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
