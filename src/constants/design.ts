import type { TextStyle } from 'react-native';

export const colors = {
  background: '#F6F8FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF4FF',
  surfaceSunken: '#EFF2F7',

  primary: '#1565C0',
  primaryDark: '#0D47A1',
  primaryLight: '#E3F2FD',

  success: '#2E7D32',
  successLight: '#E7F4E8',
  successBorder: '#BBF7D0',

  danger: '#C62828',
  dangerLight: '#FDECEC',
  dangerBorder: '#FBD5D5',

  warning: '#E65100',
  warningLight: '#FFF4E5',
  warningBorder: '#FED7AA',

  text: '#1A1D21',
  textMuted: '#5B6470',
  textSoft: '#9AA3AE',

  border: '#ECEFF3',
  borderStrong: '#D7DCE3',

  // Semantic on-color tokens (use instead of inline hex on colored surfaces)
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#CFE0F7',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 22,
  pill: 999,
} as const;

/**
 * Plus Jakarta Sans family map. React Native does not synthesize weights from a
 * single family, so each weight is its own fontFamily (loaded in src/app/_layout.tsx).
 */
export const font = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

/**
 * Semantic text presets — spread these into styles instead of setting raw
 * fontSize + fontWeight. This is what gives real hierarchy and a friendly feel.
 */
export const text = {
  display: { fontFamily: font.extrabold, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  h1: { fontFamily: font.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  h2: { fontFamily: font.bold, fontSize: 21, lineHeight: 28, letterSpacing: -0.2 },
  h3: { fontFamily: font.semibold, fontSize: 17, lineHeight: 24, letterSpacing: -0.1 },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 22 },
  bodyMed: { fontFamily: font.medium, fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: font.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: font.semibold, fontSize: 13, lineHeight: 16, letterSpacing: 0.1 },
  caption: { fontFamily: font.medium, fontSize: 12, lineHeight: 16 },
} as const satisfies Record<string, TextStyle>;

/** Tabular figures keep currency digits aligned and stop jitter during count-up. */
export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };

/** Raw size scale kept for back-compat with any not-yet-migrated styles. */
export const typography = {
  h1: 28,
  h2: 22,
  h3: 18,
  body: 15,
  bodySmall: 13,
  caption: 12,
} as const;

/** Consistent elevation scale (sm → lg). `card` refines the previous single shadow. */
export const shadow = {
  sm: {
    shadowColor: '#0B1B33',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  card: {
    shadowColor: '#0B1B33',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  lg: {
    shadowColor: '#0D47A1',
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
} as const;
