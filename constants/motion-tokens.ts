export const motionTokens = {
  duration: {
    fast: 160,
    normal: 260,
    slow: 420,
    splash: 2400,
  },
  easing: {
    page: [0.32, 0.72, 0, 1] as const,
    standard: [0.2, 0.8, 0.2, 1] as const,
  },
  scale: {
    pressIn: 0.97,
    pressOut: 1,
  },
  opacity: {
    subtle: 0.82,
    muted: 0.6,
  },
} as const;

