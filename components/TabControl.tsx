import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { uiTokens } from '../constants/ui-tokens';

interface TabControlProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabControl({ tabs, activeTab, onTabChange }: TabControlProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabChange(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: uiTokens.spacing.xl,
    marginBottom: uiTokens.spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: uiTokens.radius.pill,
    marginHorizontal: uiTokens.spacing.lg,
    paddingVertical: uiTokens.spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: uiTokens.spacing.md,
    alignItems: 'center',
    borderRadius: uiTokens.radius.pill,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabText: {
    fontSize: uiTokens.text.bodyLg,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.text,
    fontWeight: '700',
  },
});
