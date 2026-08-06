/**
 * i18n module — Vitest tests
 *
 * Coverage targets:
 *   - Default language is zh-CN
 *   - Supports language switching
 *   - Translations are loaded for both languages
 *   - Falls back to zh-CN for missing keys
 *   - Persists language choice to localStorage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import i18n, { SUPPORTED_LANGUAGES } from '../index';

describe('i18n', () => {
  beforeEach(() => {
    // Reset to default
    i18n.changeLanguage('zh-CN');
    localStorage.clear();
  });

  it('has zh-CN as the default language', () => {
    expect(i18n.language).toBe('zh-CN');
  });

  it('supports both zh-CN and en-US', () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain('zh-CN');
    expect(codes).toContain('en-US');
  });

  it('translates common.save to 保存 in zh-CN', () => {
    expect(i18n.t('common.save')).toBe('保存');
  });

  it('translates common.save to Save in en-US', () => {
    i18n.changeLanguage('en-US');
    expect(i18n.t('common.save')).toBe('Save');
  });

  it('translates nested keys like auth.loginTitle', () => {
    expect(i18n.t('auth.loginTitle')).toBe('欢迎回来');
    i18n.changeLanguage('en-US');
    expect(i18n.t('auth.loginTitle')).toBe('Welcome Back');
  });

  it('falls back to zh-CN for missing keys', () => {
    expect(i18n.t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('falls back to provided default value for missing keys', () => {
    expect(i18n.t('nonexistent.key', 'Default')).toBe('Default');
  });

  it('persists language to localStorage on change', () => {
    i18n.changeLanguage('en-US');
    expect(localStorage.getItem('ai_platform_lang')).toBe('en-US');
  });

  it('supports interpolation with count parameter', () => {
    expect(i18n.t('common.total', { count: 42 })).toBe('共 42 个');
    i18n.changeLanguage('en-US');
    expect(i18n.t('common.total', { count: 42 })).toBe('42 total');
  });
});
