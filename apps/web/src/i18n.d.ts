// i18n type declarations
import 'react-i18next';

// Define your translation resources structure
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof import('./locales/en.json');
    };
  }
}
