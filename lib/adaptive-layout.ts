import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

export type SizeClass = 'compact' | 'standard' | 'large' | 'tablet';

const BREAKPOINTS = {
  compact: 360,
  standard: 390,
  large: 430,
  tablet: 768,
} as const;

const SPACING_SCALE = {
  compact: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  standard: { xs: 4, sm: 8, md: 14, lg: 18, xl: 24, xxl: 28 },
  large: { xs: 6, sm: 10, md: 16, lg: 20, xl: 28, xxl: 32 },
  tablet: { xs: 8, sm: 12, md: 20, lg: 24, xl: 32, xxl: 40 },
} as const;

const FONT_SCALE = {
  compact: { caption: 11, body: 14, subhead: 16, title: 18, headline: 22 },
  standard: { caption: 12, body: 14, subhead: 17, title: 20, headline: 24 },
  large: { caption: 12, body: 15, subhead: 18, title: 22, headline: 26 },
  tablet: { caption: 13, body: 16, subhead: 20, title: 24, headline: 28 },
} as const;

export function getSizeClass(width: number): SizeClass {
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  if (width >= BREAKPOINTS.large) return 'large';
  if (width >= BREAKPOINTS.standard) return 'standard';
  return 'compact';
}

export function getSpacingScale(sizeClass: SizeClass) {
  return SPACING_SCALE[sizeClass];
}

export function getFontScale(sizeClass: SizeClass) {
  return FONT_SCALE[sizeClass];
}

export function useAdaptiveLayout() {
  const { width } = useWindowDimensions();
  return useMemo(() => {
    const sizeClass = getSizeClass(width);
    return {
      sizeClass,
      spacing: getSpacingScale(sizeClass),
      fonts: getFontScale(sizeClass),
      width,
      isTablet: sizeClass === 'tablet',
    };
  }, [width]);
}
