import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import vi from '@/locales/vi.json';
import zh from '@/locales/zh.json';

export type Language = 'en' | 'vi' | 'zh';

const resources = {
  en: { translation: en },
  vi: { translation: vi },
  zh: { translation: zh },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: (localStorage.getItem('language') as Language) || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
