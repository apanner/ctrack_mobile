import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  Animated,
} from 'react-native';
import { colors } from '../../constants/colors';
import { uiTokens } from '../../constants/ui-tokens';
import { motionTokens } from '../../constants/motion-tokens';

interface PrimaryActionButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  /** Secondary (glass) variant from Design H */
  variant?: 'primary' | 'secondary';
}

export function PrimaryActionButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  variant = 'primary',
}: PrimaryActionButtonProps) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const animateScale = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: motionTokens.duration.fast,
      useNativeDriver: true,
    }).start();
  };

  if (variant === 'secondary') {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={[
            styles.buttonSecondary,
            (disabled || loading) && styles.disabled,
            style,
          ]}
          onPress={onPress}
          disabled={disabled || loading}
          activeOpacity={0.9}
          onPressIn={() => animateScale(motionTokens.scale.pressIn)}
          onPressOut={() => animateScale(motionTokens.scale.pressOut)}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text style={styles.label}>{label}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.9}
        onPressIn={() => animateScale(motionTokens.scale.pressIn)}
        onPressOut={() => animateScale(motionTokens.scale.pressOut)}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={(disabled || loading) && styles.disabled}
      >
        <View style={[styles.gradient, (disabled || loading) && styles.gradientDisabled]}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.labelGradient}>{label}</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: uiTokens.spacing.xl,
    borderRadius: 999,
    backgroundColor: colors.tint,
    shadowColor: colors.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 4,
  },
  gradientDisabled: {
    opacity: 0.45,
  },
  buttonSecondary: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: uiTokens.spacing.xl,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  labelGradient: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
