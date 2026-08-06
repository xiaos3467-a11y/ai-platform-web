/**
 * LanguageSwitcher — Vitest tests
 *
 * Coverage targets:
 *   - Renders segmented control with language options
 *   - Shows current language as selected
 *   - Calls i18n.changeLanguage when an option is clicked
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import LanguageSwitcher from '../LanguageSwitcher';
import i18n from '@/i18n';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    // Reset to zh-CN before each test
    i18n.changeLanguage('zh-CN');
  });

  it('renders the segmented control with both language options', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText('简体中文')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('reflects the current language', () => {
    render(<LanguageSwitcher />);
    // The current language should be zh-CN by default (from i18n config)
    expect(i18n.language).toBe('zh-CN');
  });

  it('changes language when English option is clicked', () => {
    render(<LanguageSwitcher />);
    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);
    expect(i18n.language).toBe('en-US');
  });

  it('changes language back to Chinese when clicked', () => {
    i18n.changeLanguage('en-US');
    render(<LanguageSwitcher />);
    const chineseOption = screen.getByText('简体中文');
    fireEvent.click(chineseOption);
    expect(i18n.language).toBe('zh-CN');
  });
});
