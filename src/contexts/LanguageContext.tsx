import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en, gr, de, fr, it, type TranslationKeys, type Language } from '@/i18n';

const translations: Record<Language, TranslationKeys> = { en, gr, de, fr, it };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'liv-tours-language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['en', 'gr', 'de', 'fr', 'it'].includes(stored)) {
        return stored as Language;
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = lang === 'gr' ? 'el' : lang;
  };

  useEffect(() => {
    document.documentElement.lang = language === 'gr' ? 'el' : language;
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
