/**
 * LanguageSwitcher — toggle between zh-CN and en-US.
 *
 * Uses a compact Segmented control that matches the Apple aesthetic.
 * Persists the user's choice via i18next (which writes to localStorage).
 */

import React from 'react';
import { Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import { radius } from '@/styles/themeTokens';

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();

  const options = SUPPORTED_LANGUAGES.map((lang) => ({
    label: lang.label,
    value: lang.code,
  }));

  return (
    <Segmented
      className={className}
      value={i18n.language}
      options={options}
      onChange={(value) => i18n.changeLanguage(value as string)}
      style={{
        borderRadius: radius.md,
        background: 'var(--bg-subtle)',
        padding: 2,
      }}
    />
  );
};

export default LanguageSwitcher;
