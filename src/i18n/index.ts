export { en, type TranslationKeys } from './translations/en';
export { gr } from './translations/gr';
export { de } from './translations/de';
export { fr } from './translations/fr';
export { it } from './translations/it';

export type Language = 'en' | 'gr' | 'de' | 'fr' | 'it';

export const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'gr', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];
