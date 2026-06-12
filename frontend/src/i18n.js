import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import de from './locales/de.json';

const supportedLngs = ['en', 'hi', 'mr', 'de'];
const languageStorageKey = 'krishi_mitra_language';
const namespace = 'translation';

const getPersistedLanguage = () => {
  const stored = localStorage.getItem(languageStorageKey);
  return stored && supportedLngs.includes(stored) ? stored : null;
};

const detectBrowserLanguage = () => {
  const raw = navigator.language || navigator.userLanguage || 'en';
  const code = raw.split('-')[0];
  if (supportedLngs.includes(code)) return code;
  if (supportedLngs.includes(raw)) return raw;
  return 'en';
};

const getInitialLanguage = () => {
  return getPersistedLanguage() || detectBrowserLanguage();
};

const setHtmlLang = (lng) => {
  const normalized = lng.split('-')[0];
  if (typeof document !== 'undefined') {
    document.documentElement.lang = normalized;
  }
};

const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    lng: initialLanguage,
    fallbackLng: 'en',
    supportedLngs,
    ns: [namespace],
    defaultNS: namespace,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    resources: {
      en: {
        translation: en,
      },
      hi: {
        translation: hi,
      },
      mr: {
        translation: mr,
      },
      de: {
        translation: de,
      },
    },
  });

setHtmlLang(initialLanguage);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(languageStorageKey, lng);
  setHtmlLang(lng);
});

export default i18n;

