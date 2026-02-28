// design-d — Obsidian Pulse
// Dark theme: accent coral, cyan, purple, green

export const colors = {
  // Backgrounds
  background: '#050506',
  surface: 'rgba(255,255,255,0.04)',
  surfaceElevated: 'rgba(255,255,255,0.06)',

  // Borders
  border: 'rgba(255,255,255,0.07)',
  borderLight: 'rgba(255,255,255,0.08)',

  // Text
  text: '#F4F4F5',
  textSecondary: '#8B8B96',
  textTertiary: '#55555E',

  // Accents (Obsidian Pulse)
  accent: '#FF6B4A',
  cyan: '#00E5FF',
  purple: '#B18CFF',
  green: '#34D399',
  amber: '#FBBF24',
  red: '#FB7185',
  blue: '#60A5FA',

  // Aliases for compatibility
  pink: '#FF6B4A',
  violet: '#B18CFF',

  // Mesh / gradients
  meshAccent: 'rgba(255,107,74,0.12)',
  meshPurple: 'rgba(177,140,255,0.12)',
  meshCyan: 'rgba(0,229,255,0.12)',
  meshGreen: 'rgba(52,211,153,0.12)',

  // Status
  success: '#34D399',
  warning: '#FBBF24',
  error: '#FB7185',

  // Legacy
  backgroundSecondary: 'rgba(255,255,255,0.04)',
  backgroundTertiary: 'rgba(255,255,255,0.06)',
} as const;
