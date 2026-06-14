/**
 * Gaea design tokens.
 *
 * The app follows a clean, Instagram-like aesthetic: white surfaces, near-black
 * text and controls, and light gray separators. Keep new UI on these tokens so
 * the look stays consistent across screens.
 */

export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#262626',
  textStrong: '#000000',
  textMuted: '#8E8E8E',
  border: '#DBDBDB',
  borderLight: '#EFEFEF',
  skeleton: '#E8E8E8',
  /** Primary action color — near-black, used for filled buttons (Guess, Upload). */
  primary: '#1A1A1A',
  onPrimary: '#FFFFFF',
  /** Map pins. */
  pinActual: '#1A1A1A',
  pinGuess: '#E0245E',
  accent: '#5E60CE',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
};
