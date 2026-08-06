/**
 * ThemeToggle — Apple-style pill switch for dark ↔ light mode
 *
 * Sliding knob with sun/moon glyphs; the track subtly recolours to match
 * the active theme. Sits in the header next to the user menu.
 */

import React from 'react';
import { Tooltip } from 'antd';
import { useTheme } from '@/contexts/theme';

import { radius } from '@/styles/themeTokens';
const ThemeToggle: React.FC = () => {
  const { isDark, toggle, mode } = useTheme();

  return (
    <Tooltip title={isDark ? '切换至浅色模式' : '切换至深色模式'} placement="bottom">
      <button
        type="button"
        aria-label={`当前为${mode === 'dark' ? '深色' : '浅色'}模式，点击切换`}
        aria-pressed={!isDark}
        onClick={toggle}
        style={{
          position: 'relative',
          width: 60,
          height: 30,
          borderRadius: radius.full,
          border: isDark
            ? '0.5px solid rgba(255, 255, 255, 0.12)'
            : '0.5px solid rgba(0, 0, 0, 0.08)',
          background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
          WebkitBackdropFilter: 'saturate(180%) blur(12px)',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          transition: 'background 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s ease',
          outline: 'none',
        }}
      >
        {/* Sliding knob */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 2,
            left: isDark ? 2 : 30,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: isDark
              ? 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f5f5f7 100%)',
            boxShadow: isDark
              ? '0 1px 4px rgba(0, 0, 0, 0.5), 0 0 0 0.5px rgba(255, 255, 255, 0.08) inset'
              : '0 1px 4px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(0, 0, 0, 0.04) inset',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition:
              'left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.35s ease, box-shadow 0.35s ease',
          }}
        >
          {/* Icon — subtle crossfade between sun and moon */}
          <span
            style={{
              position: 'absolute',
              fontSize: 13,
              lineHeight: 1,
              color: isDark ? '#ffd60a' : '#ff9f0a',
              transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.6)',
              opacity: isDark ? 1 : 0,
              transition:
                'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease, color 0.3s ease',
            }}
          >
            ✨
          </span>
          <span
            style={{
              position: 'absolute',
              fontSize: 13,
              lineHeight: 1,
              color: '#ff9f0a',
              transform: isDark ? 'rotate(90deg) scale(0.6)' : 'rotate(0deg) scale(1)',
              opacity: isDark ? 0 : 1,
              transition:
                'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease, color 0.3s ease',
            }}
          >
            ☀️
          </span>
        </span>

        {/* Static glyphs on the opposite side of the knob */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 8,
            fontSize: 12,
            lineHeight: 1,
            color: isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.25)',
            transition: 'color 0.3s ease',
            pointerEvents: 'none',
          }}
        >
          ✨
        </span>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 8,
            fontSize: 12,
            lineHeight: 1,
            color: isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.25)',
            transition: 'color 0.3s ease',
            pointerEvents: 'none',
          }}
        >
          ☀️
        </span>
      </button>
    </Tooltip>
  );
};

export default ThemeToggle;
