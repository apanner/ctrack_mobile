import type { Breakpoint } from '../hooks/useAdaptiveLayout';

export interface SpacingScale {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  screenPadding: number;
}

export interface TypographyScale {
  caption: number;
  body: number;
  bodyLarge: number;
  subtitle: number;
  title: number;
  header: number;
  lineHeightTight: number;
  lineHeightNormal: number;
  lineHeightRelaxed: number;
}

const SPACING_BY_BREAKPOINT: Record<Breakpoint, SpacingScale> = {
  compact: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    screenPadding: 12,
  },
  standard: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
    screenPadding: 16,
  },
  large: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
    xxl: 36,
    screenPadding: 20,
  },
  tablet: {
    xs: 8,
    sm: 12,
    md: 20,
    lg: 28,
    xl: 36,
    xxl: 48,
    screenPadding: 24,
  },
};

const TYPOGRAPHY_BY_BREAKPOINT: Record<Breakpoint, TypographyScale> = {
  compact: {
    caption: 11,
    body: 14,
    bodyLarge: 15,
    subtitle: 16,
    title: 18,
    header: 22,
    lineHeightTight: 1.2,
    lineHeightNormal: 1.4,
    lineHeightRelaxed: 1.6,
  },
  standard: {
    caption: 12,
    body: 15,
    bodyLarge: 16,
    subtitle: 17,
    title: 20,
    header: 24,
    lineHeightTight: 1.2,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.6,
  },
  large: {
    caption: 12,
    body: 16,
    bodyLarge: 17,
    subtitle: 18,
    title: 22,
    header: 26,
    lineHeightTight: 1.2,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.6,
  },
  tablet: {
    caption: 13,
    body: 17,
    bodyLarge: 18,
    subtitle: 20,
    title: 24,
    header: 30,
    lineHeightTight: 1.2,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.6,
  },
};

export function getSpacingScale(breakpoint: Breakpoint): SpacingScale {
  return SPACING_BY_BREAKPOINT[breakpoint];
}

export function getTypographyScale(breakpoint: Breakpoint): TypographyScale {
  return TYPOGRAPHY_BY_BREAKPOINT[breakpoint];
}
