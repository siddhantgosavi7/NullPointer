import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const supportedLngs = ['en', 'hi', 'mr', 'de'];
const languageStorageKey = 'krishi_mitra_language';
const localeFiles = import.meta.glob('./locales/*.json');
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

const getLocaleLoader = (lng) => {
  const normalized = lng.split('-')[0];
  return localeFiles[`./locales/${normalized}.json`];
};

const loadLocale = async (lng) => {
  const normalized = lng.split('-')[0];
  if (!supportedLngs.includes(normalized)) return;
  if (i18n.hasResourceBundle(normalized, namespace)) return;

  const loader = getLocaleLoader(normalized);
  if (!loader) return;

  const resource = await loader();
  const translations = resource.default || resource;
  i18n.addResourceBundle(normalized, namespace, translations, true, true);
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
        translation: {},
      },
      hi: {
        translation: {},
      },
      mr: {
        translation: {},
      },
      de: {
        translation: {},
      },
    },
  });

loadLocale(initialLanguage)
  .then(() => i18n.changeLanguage(initialLanguage))
  .catch((err) => {
    console.error('Failed to load translation files:', err);
  });

setHtmlLang(initialLanguage);

i18n.on('languageChanged', async (lng) => {
  localStorage.setItem(languageStorageKey, lng);
  await loadLocale(lng);
  setHtmlLang(lng);
});

export default i18n;
