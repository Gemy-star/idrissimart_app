import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

const LANG_KEY = 'app_language';

import ar from '@/locales/ar.json';
import en from '@/locales/en.json';

// Enforce RTL synchronously before any layout renders
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
  });

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => Promise<void>;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(
    (i18n.language.startsWith('ar') ? 'ar' : 'en') as Language
  );

  // Restore persisted language on mount
  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((saved) => {
      if ((saved === 'en' || saved === 'ar') && saved !== i18n.language) {
        i18n.changeLanguage(saved);
        setLanguage(saved as Language);
      }
    });
  }, []);

  const changeLanguage = async (lang: Language) => {
    try {
      await i18n.changeLanguage(lang);
      setLanguage(lang);
      await AsyncStorage.setItem(LANG_KEY, lang);

      // Handle RTL for Arabic
      const isRTL = lang === 'ar';
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
        // Note: Changing RTL requires app restart for full effect
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const t = (key: string, options?: any): string => {
    const result = i18n.t(key, options);
    return typeof result === 'string' ? result : String(result);
  };

  const value: LanguageContextType = {
    language,
    changeLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
