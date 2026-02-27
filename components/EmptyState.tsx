import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bot, LucideIcon } from 'lucide-react-native';
import { colors } from '../constants/colors';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  iconColor?: string;
  accentColor?: string;
  Icon?: LucideIcon;
}

export function EmptyState({ 
  title, 
  subtitle, 
  actionLabel, 
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  iconColor = colors.accent,
  accentColor = colors.accent,
  Icon = Bot
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <LinearGradient
          colors={[colors.backgroundSecondary, colors.backgroundTertiary]}
          style={styles.circleBackground}
        />
        <Icon size={120} color={iconColor} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      <TouchableOpacity onPress={onAction} activeOpacity={0.8} style={styles.buttonWrapper}>
        <LinearGradient
          colors={[accentColor, accentColor]} // Can be gradient if needed
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {secondaryActionLabel && onSecondaryAction && (
        <TouchableOpacity 
          onPress={onSecondaryAction} 
          activeOpacity={0.7} 
          style={[styles.secondaryButton, { borderColor: accentColor }]}
        >
          <Text style={[styles.secondaryButtonText, { color: accentColor }]}>
            {secondaryActionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  imageContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  circleBackground: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 15, // 1px less for border
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

