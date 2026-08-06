/**
 * Button — Apple-style button variants
 * — primary / secondary / ghost / danger with spring animations
 * — Sizes: sm (32px) / md (40px) / lg (48px)
 * — Design reference: design/mockups/components.html § 3
 */

import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';

import { radius } from '@/styles/themeTokens';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<AntButtonProps, 'type' | 'variant' | 'size'> {
  /** Visual variant — controls gradient, border, and color. */
  variant?: ButtonVariant;
  /** Size: sm (32px) / md (40px, default) / lg (48px). */
  size?: ButtonSize;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    height: 32,
    padding: '8px 16px',
    fontSize: 13,
    borderRadius: radius.sm,
  },
  md: {
    height: 40,
    padding: '12px 24px',
    fontSize: 14,
    borderRadius: radius.md,
  },
  lg: {
    height: 48,
    padding: '16px 32px',
    fontSize: 15,
    borderRadius: radius.md,
  },
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
    border: 'none',
    color: '#ffffff',
    boxShadow: '0 1px 4px rgba(10, 132, 255, 0.35)',
  },
  secondary: {
    background: 'var(--bg-elevated)',
    border: '0.5px solid var(--border-subtle)',
    color: 'var(--text-primary)',
  },
  ghost: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
  },
  danger: {
    background: 'linear-gradient(135deg, #ff453a 0%, #ff6961 100%)',
    border: 'none',
    color: '#ffffff',
    boxShadow: '0 1px 4px rgba(255, 69, 58, 0.35)',
  },
};

const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  loading,
  disabled,
  style,
  ...rest
}) => {
  const hoverGlow: React.CSSProperties =
    variant === 'primary'
      ? { boxShadow: '0 4px 16px rgba(10, 132, 255, 0.3)' }
      : variant === 'danger'
        ? { boxShadow: '0 4px 16px rgba(255, 69, 58, 0.3)' }
        : {};

  return (
    <AntButton
      {...rest}
      disabled={disabled}
      loading={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        fontWeight: 500,
        letterSpacing: '-0.01em',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        Object.assign(e.currentTarget.style, hoverGlow);
        if (variant === 'primary' || variant === 'danger') {
          e.currentTarget.style.filter = 'brightness(1.08)';
        }
        if (variant === 'secondary') {
          e.currentTarget.style.background = 'var(--bg-elevated-2)';
        }
        if (variant === 'ghost') {
          e.currentTarget.style.background = 'var(--bg-elevated)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = '';
        e.currentTarget.style.boxShadow = (variantStyles[variant].boxShadow as string) || '';
        if (variant === 'secondary') {
          e.currentTarget.style.background = 'var(--bg-elevated)';
        }
        if (variant === 'ghost') {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    />
  );
};

export default Button;
