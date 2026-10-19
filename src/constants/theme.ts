/**
 * Brand theme, taken from carinadorca.com.
 * Change colours here and the whole app follows.
 */

export const Colors = {
  // Backgrounds
  cream: '#F4ECDD', // page background
  creamLight: '#FAF6EE', // cards
  creamDark: '#EAE0CC', // dividers, pressed states

  // Brand
  sage: '#8A9A6B', // primary buttons, highlights
  sageDark: '#6E7D52', // pressed buttons, italic accent words
  sageLight: '#DDE3CF', // soft fills
  lavender: '#9A7DB8', // eyebrow labels, quotes
  lavenderLight: '#ECE4F3',

  // Text
  ink: '#3B3A33', // headings
  text: '#5A5850', // body
  muted: '#8C887C', // secondary

  white: '#FFFFFF',
  danger: '#B5674D',

  // Nervous System Weather
  calm: '#E9C46A',
  wired: '#7B8FA6',
  shutdown: '#A9A49A',
} as const;

export const Fonts = {
  serif: 'CormorantGaramond_500Medium',
  serifItalic: 'CormorantGaramond_500Medium_Italic',
  sans: 'Jost_400Regular',
  sansLight: 'Jost_300Light',
  sansMedium: 'Jost_500Medium',
  sansBold: 'Jost_600SemiBold',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  card: 20,
  pill: 999,
  arch: 160,
} as const;
