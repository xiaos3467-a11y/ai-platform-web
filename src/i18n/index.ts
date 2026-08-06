/**
 * i18n — Internationalization setup using react-i18next.
 *
 * Supported languages:
 *   - zh-CN (Simplified Chinese, default)
 *   - en-US (English)
 *
 * Usage in components:
 *   import { useTranslation } from 'react-i18next';
 *   const { t } = useTranslation();
 *   <h1>{t('settings.title')}</h1>
 *
 * Language is persisted in localStorage under key 'ai_platform_lang'.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en-US', label: 'English' },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code'];

const STORAGE_KEY = 'ai_platform_lang';

function getInitialLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'zh-CN' || stored === 'en-US') return stored;
  } catch {
    // localStorage may be unavailable
  }
  // Fall back to browser language, then default
  const browserLang = navigator.language;
  if (browserLang.startsWith('zh')) return 'zh-CN';
  return 'zh-CN';
}

i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    'en-US': { translation: enUS },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'zh-CN',
  interpolation: {
    escapeValue: false, // React already escapes
  },
  // Use flat key paths like "settings.title"
  defaultNS: 'translation',
});

/**
 * Persist the selected language to localStorage whenever it changes.
 */
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // ignore
  }
});

export default i18n;
