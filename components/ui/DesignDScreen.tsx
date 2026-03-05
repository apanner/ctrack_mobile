import React from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { uiTokens } from '../../constants/ui-tokens';

interface DesignDScreenProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  style?: ViewStyle;
  scroll?: boolean;
  contentContainerStyle?: ViewStyle;
}

export function DesignDScreen({
  children,
  title,
  subtitle,
  headerRight,
  style,
  scroll = true,
  contentContainerStyle,
}: DesignDScreenProps) {
  const content = (
    <View style={[styles.content, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, style]} edges={['top']}>
      <View style={styles.topBand}>
        <View style={styles.headerTextWrap}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
      </View>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBand: {
    minHeight: 56,
    paddingHorizontal: uiTokens.spacing.xl,
    paddingVertical: uiTokens.spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: uiTokens.spacing.md,
  },
  headerRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: uiTokens.spacing.xxxl * 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: uiTokens.spacing.xl,
    paddingTop: uiTokens.spacing.md,
  },
});

