/**
 * Input — Apple-style input field
 * — Default / Focus (blue glow) / Error (red border) / Disabled states
 * — Supports prefix/suffix icons and large size
 * — Design reference: design/mockups/components.html § 4
 */

import React from 'react';

import { radius } from '@/styles/themeTokens';
export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'prefix'
> {
  /** Optional label shown above the input. */
  label?: string;
  /** Optional error message shown below the input. */
  error?: string;
  /** Leading icon (rendered inside the input). */
  prefixIcon?: React.ReactNode;
  /** Trailing icon (rendered inside the input). */
  suffixIcon?: React.ReactNode;
  /** Large size (48px height). */
  large?: boolean;
  /** Wrapper className */
  wrapperClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  prefixIcon,
  suffixIcon,
  large,
  disabled,
  wrapperClassName,
  style,
  ...rest
}) => {
  const height = large ? 48 : 40;
  const hasError = !!error;

  return (
    <div className={wrapperClassName} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-label)',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefixIcon && (
          <span
            style={{
              position: 'absolute',
              left: 14,
              color: 'var(--text-tertiary)',
              fontSize: 14,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {prefixIcon}
          </span>
        )}
        <input
          disabled={disabled}
          style={{
            width: '100%',
            height,
            fontFamily: 'inherit',
            fontSize: large ? 15 : 14,
            color: 'var(--text-primary)',
            background: 'var(--bg-elevated)',
            border: `0.5px solid ${hasError ? 'var(--color-error)' : 'var(--border-subtle)'}`,
            borderRadius: radius.md,
            paddingLeft: prefixIcon ? 38 : 16,
            paddingRight: suffixIcon ? 38 : 16,
            outline: 'none',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: disabled ? 0.4 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
            ...style,
          }}
          onFocus={(e) => {
            if (hasError) {
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 69, 58, 0.1)';
            } else {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 132, 255, 0.15)';
            }
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = hasError
              ? 'var(--color-error)'
              : 'var(--border-subtle)';
            e.currentTarget.style.boxShadow = 'none';
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {suffixIcon && (
          <span
            style={{
              position: 'absolute',
              right: 14,
              color: 'var(--text-tertiary)',
              fontSize: 14,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {suffixIcon}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 2 }}>{error}</span>
      )}
    </div>
  );
};

export default Input;
