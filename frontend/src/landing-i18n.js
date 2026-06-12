import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import de from './locales/de.json';

const resources = { en, hi, mr, de };
const languageStorageKey = 'krishi_mitra_language';

// Detect initial language
let currentLanguage = localStorage.getItem(languageStorageKey);
if (!currentLanguage || !resources[currentLanguage]) {
  // Try browser detection
  const raw = navigator.language || navigator.userLanguage || 'en';
  const code = raw.split('-')[0];
  currentLanguage = resources[code] ? code : 'en';
}

// Expose current language globally
window.currentLanguage = currentLanguage;

// Nested translation helper
function getNestedTranslation(obj, path) {
  if (!path) return '';
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// Translate function with parameter interpolation
export function t(key, params = {}) {
  const lang = window.currentLanguage || 'en';
  const dictionary = resources[lang] || resources['en'];
  let value = getNestedTranslation(dictionary, key);
  
  if (value === undefined || value === null) {
    // Fallback to English if key is missing in active language
    value = getNestedTranslation(resources['en'], key);
  }
  
  if (value === undefined || value === null) {
    return key; // Return raw key as fallback
  }

  // Replace params
  let text = String(value);
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), v);
  }
  return text;
}

// Expose t globally
window.t = t;

// Translate the entire DOM
export function translatePage(lang) {
  if (!resources[lang]) return;
  window.currentLanguage = lang;
  
  // Set html element lang attribute
  document.documentElement.lang = lang;

  // Translate elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = t(key);
    
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = value;
    } else {
      el.innerHTML = value;
    }
  });

  // Translate elements with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  // Sync all language dropdowns on the page
  document.querySelectorAll('.language-select').forEach(select => {
    select.value = lang;
  });
}

// Expose translatePage globally
window.translatePage = translatePage;

// Initialize on DOM load
function init() {
  // Attach change listener to selectors
  document.addEventListener('change', (e) => {
    if (e.target && e.target.classList.contains('language-select')) {
      const selectedLang = e.target.value;
      localStorage.setItem(languageStorageKey, selectedLang);
      translatePage(selectedLang);
    }
  });

  // Initial translation
  translatePage(window.currentLanguage);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
