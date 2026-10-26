import copy from '../../_source/copy.json';
import community from '../../_source/community.json';

export type Locale = 'zh-Hant' | 'en';
export type Copy = typeof copy['zh-Hant'];

// Both locales must provide every field consumed by the shared components.
const translations: Record<Locale, Copy> = copy;

export function getCopy(locale: Locale): Copy {
  return translations[locale];
}

export function homePath(locale: Locale): string {
  return locale === 'en' ? '/en/' : '/';
}

export const origin = 'https://revtel.github.io';
export const github = 'https://github.com/revtel';
export const projects = {
  manager: {
    repo: `${github}/react-native-nfc-manager`,
    website: `${origin}/react-native-nfc-manager/`,
  },
  rewriter: {
    repo: `${github}/react-native-nfc-rewriter`,
    website: `${origin}/react-native-nfc-rewriter/`,
  },
} as const;

export { community };
