import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { colors } from '../../constants/colors';
import { GlassCard } from '../../components/GlassCard';
import { uiTokens } from '../../constants/ui-tokens';
import {
  getChatSettings,
  setChatSettings,
  type ChatSettings,
} from '../../lib/settings-storage';
import { playChatSound } from '../../lib/notification-sounds';

export default function ChatSettingsScreen() {
  const [settings, setSettings] = useState<ChatSettings | null>(null);

  const load = useCallback(async () => {
    const s = await getChatSettings();
    setSettings(s);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(async (partial: Partial<ChatSettings>) => {
    setSettings((prev) => {
      const next = prev ? { ...prev, ...partial } : null;
      if (next) setChatSettings(next);
      return next;
    });
  }, []);

  if (!settings) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Chat preferences</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sounds</Text>
          <GlassCard noPadding>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Send sound</Text>
                <Text style={styles.toggleSublabel}>Play when you send a message</Text>
              </View>
              <Switch
                value={settings.chatSendSound}
                onValueChange={(v) => update({ chatSendSound: v })}
                trackColor={{ false: colors.backgroundTertiary, true: colors.accent }}
                thumbColor="#FFF"
              />
            </View>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Receive sound</Text>
                <Text style={styles.toggleSublabel}>Play when you receive a message</Text>
              </View>
              <Switch
                value={settings.chatReceiveSound}
                onValueChange={(v) => update({ chatReceiveSound: v })}
                trackColor={{ false: colors.backgroundTertiary, true: colors.accent }}
                thumbColor="#FFF"
              />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewRow}>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={() => settings.chatSendSound && playChatSound('send')}
            >
              <Text style={styles.previewText}>Preview send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={() => settings.chatReceiveSound && playChatSound('receive')}
            >
              <Text style={styles.previewText}>Preview receive</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  },
  section: {
    marginBottom: uiTokens.spacing.xl,
  },
  sectionTitle: {
    fontSize: uiTokens.text.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: uiTokens.spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: uiTokens.spacing.md,
    paddingHorizontal: uiTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleLabel: {
    fontSize: uiTokens.text.bodyLg,
    color: colors.text,
  },
  toggleSublabel: {
    fontSize: uiTokens.text.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  previewRow: {
    flexDirection: 'row',
    gap: uiTokens.spacing.md,
  },
  previewButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
});
