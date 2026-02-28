import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Constants from 'expo-constants';
import { colors } from '../../constants/colors';
import { GlassCard } from '../../components/GlassCard';
import { uiTokens } from '../../constants/ui-tokens';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>About</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={styles.card}>
          <Text style={styles.appName}>CTrack Artist Manager</Text>
          <Text style={styles.version}>Version {version}</Text>
          <Text style={styles.description}>
            CTrack is a VFX task management and collaboration mobile application for artists and managers.
          </Text>
        </GlassCard>
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
  card: {
    padding: uiTokens.spacing.xl,
  },
  appName: {
    fontSize: uiTokens.text.title,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  version: {
    fontSize: uiTokens.text.body,
    color: colors.textSecondary,
    marginBottom: uiTokens.spacing.md,
  },
  description: {
    fontSize: uiTokens.text.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
