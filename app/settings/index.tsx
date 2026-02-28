import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronRight,
  Bell,
  MessageCircle,
  Smartphone,
  Info,
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { GlassCard } from '../../components/GlassCard';
import { uiTokens } from '../../constants/ui-tokens';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress: () => void;
}

function SettingsRow({ icon, label, sublabel, onPress }: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <GlassCard noPadding>
        <View style={styles.row}>
          <View style={styles.iconWrap}>{icon}</View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>{label}</Text>
            {sublabel ? (
              <Text style={styles.rowSublabel} numberOfLines={1}>
                {sublabel}
              </Text>
            ) : null}
          </View>
          <ChevronRight size={20} color={colors.textTertiary} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingsRow
            icon={<Bell size={22} color={colors.accent} />}
            label="Notifications"
            sublabel="Sounds, alerts & quiet hours"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingsRow
            icon={<MessageCircle size={22} color={colors.accent} />}
            label="Chat preferences"
            sublabel="Sounds & emoji"
            onPress={() => router.push('/settings/chat')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <SettingsRow
            icon={<Smartphone size={22} color={colors.accent} />}
            label="PWA Install"
            sublabel="Add to home screen"
            onPress={() => router.push('/settings/pwa-install')}
          />
          <SettingsRow
            icon={<Info size={22} color={colors.accent} />}
            label="About"
            sublabel="Version & info"
            onPress={() => router.push('/settings/about')}
          />
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: uiTokens.spacing.xl,
    paddingBottom: uiTokens.spacing.xxxl,
  },
  title: {
    fontSize: uiTokens.text.headline,
    fontWeight: '800',
    color: colors.text,
    marginTop: uiTokens.spacing.lg,
    marginBottom: uiTokens.spacing.xl,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: uiTokens.spacing.md,
    paddingHorizontal: uiTokens.spacing.md,
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
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: uiTokens.text.bodyLg,
    fontWeight: '600',
    color: colors.text,
  },
  rowSublabel: {
    fontSize: uiTokens.text.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
