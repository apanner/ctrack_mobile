import { colors } from './colors';

export const uiTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 20,
    xlLarge: 28, // design-d --r-lg
    pill: 999,
  },
  text: {
    caption: 12,
    body: 14,
    bodyLg: 16,
    title: 20,
    headline: 28,
  },
  icon: {
    sm: 14,
    md: 18,
    lg: 24,
  },
  surface: {
    glassBackground: 'rgba(16,16,22,0.88)',
    glassBorder: colors.border,
    elevatedShadowOpacity: 0.28,
    elevatedShadowRadius: 14,
  },
} as const;

