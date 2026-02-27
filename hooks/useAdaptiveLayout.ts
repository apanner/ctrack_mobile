import { useMemo } from 'react';
import { useWindowDimensions, Platform } from 'react-native';

export type Breakpoint = 'compact' | 'standard' | 'large' | 'tablet';

export interface AdaptiveLayoutResult {
  width: number;
  height: number;
  isCompact: boolean;
  isStandard: boolean;
  isLarge: boolean;
  isTablet: boolean;
  breakpoint: Breakpoint;
  orientation: 'portrait' | 'landscape';
  platform: string;
}

const BREAKPOINTS = {
  compact: 360,
  standard: 430,
  large: 768,
  tablet: 768,
} as const;

function getBreakpoint(width: number): Breakpoint {
  if (width <= BREAKPOINTS.compact) return 'compact';
  if (width <= BREAKPOINTS.standard) return 'standard';
  if (width <= BREAKPOINTS.large) return 'large';
  return 'tablet';
}

export function useAdaptiveLayout(): AdaptiveLayoutResult {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const effectiveWidth = Math.min(width, height);
    const breakpoint = getBreakpoint(effectiveWidth);
    const orientation = height >= width ? 'portrait' : 'landscape';

    return {
      width,
      height,
      isCompact: breakpoint === 'compact',
      isStandard: breakpoint === 'standard',
      isLarge: breakpoint === 'large',
      isTablet: breakpoint === 'tablet',
      breakpoint,
      orientation,
      platform: Platform.OS,
    };
  }, [width, height]);
}
