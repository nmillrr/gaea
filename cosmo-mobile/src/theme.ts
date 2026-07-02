import { Platform } from 'react-native';

/**
 * Gaea design tokens — aligned to the Claude Design prototype
 * (`geoguessr-social-app-design/project/Gaea Prototype.dc.html`).
 *
 * Clean, Instagram-like surfaces (white, near-black text, light gray
 * separators) with a serif wordmark and a purple accent used for links,
 * onboarding, active states, and stat highlights.
 */

export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  /** App shell / device bezel background from the prototype. */
  shell: '#ECEBE7',
  text: '#262626',
  textStrong: '#111111',
  textMuted: '#8E8E8E',
  border: '#DBDBDB',
  borderLight: '#EFEFEF',
  divider: '#F4F4F4',
  skeleton: '#E8E8E8',
  skeletonHighlight: '#F2F2F2',
  avatar: '#E4E4E4',
  /** Primary action color — near-black, used for filled buttons (Guess, Share, Log in). */
  primary: '#1A1A1A',
  onPrimary: '#FFFFFF',
  /** Purple accent: links, onboarding art, active dots, "THIS WEEK" card, comment Post. */
  accent: '#5E60CE',
  accentSoft: '#F2F1FB',
  accentSoftAlt: '#F1F0FB',
  accentSoftBar: '#B9B7EA',
  /** Map pins. The dropped guess pin on the guessing map is pink; on the result
   *  map the user's guess is black and the true location is pink. */
  pinDrop: '#E0245E',
  pinYourGuess: '#1A1A1A',
  pinActual: '#E0245E',
  /** Leaderboard rank medals. */
  medalGold: '#E8B84B',
  medalSilver: '#C7CBD1',
  medalBronze: '#D6A57C',
  /** Leaderboard weekly delta. */
  deltaPositive: '#1F8A5B',
  deltaNegative: '#C0392B',
};

/**
 * Font families. The `gaea` wordmark is a serif (Georgia on iOS, the platform
 * serif elsewhere); everything else uses the system UI font.
 */
export const fonts = {
  brand: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
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
