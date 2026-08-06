/**
 * Tag — Colored tag / chip for categorization
 * — 6 variants: blue / green / yellow / red / purple / gray
 * — Optional close button
 * — Design reference: design/mockups/components.html § 5
 */

import React from 'react';
import { CloseOutlined } from '@ant-design/icons';

import { radius } from '@/styles/themeTokens';
export type TagColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';

export interface TagProps {
  color?: TagColor;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const colorStyles: Record<TagColor, React.CSSProperties> = {
  blue: {
    color: 'var(--color-primary)',
    background: 'rgba(10, 132, 255, 0.1)',
    border: '0.5px solid rgba(10, 132, 255, 0.2)',
  },
  green: {
    color: 'var(--color-success)',
    background: 'rgba(48, 209, 88, 0.1)',
    border: '0.5px solid rgba(48, 209, 88, 0.2)',
  },
  yellow: {
    color: 'var(--color-warning)',
    background: 'rgba(255, 214, 10, 0.1)',
    border: '0.5px solid rgba(255, 214, 10, 0.2)',
  },
  red: {
    color: 'var(--color-error)',
    background: 'rgba(255, 69, 58, 0.1)',
    border: '0.5px solid rgba(255, 69, 58, 0.2)',
  },
  purple: {
    color: 'var(--color-purple, #5e5ce6)',
    background: 'rgba(94, 92, 230, 0.1)',
    border: '0.5px solid rgba(94, 92, 230, 0.2)',
  },
  gray: {
    color: 'var(--text-soft)',
    background: 'var(--bg-elevated)',
    border: '0.5px solid var(--border-subtle)',
  },
};

const Tag: React.FC<TagProps> = ({ color = 'blue', children, onClose, className, style }) => {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.02em',
        padding: '3px 8px',
        borderRadius: radius.sm,
        ...colorStyles[color],
        ...style,
      }}
    >
      {children}
      {onClose && (
        <CloseOutlined
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            fontSize: 10,
            cursor: 'pointer',
            opacity: 0.7,
            marginLeft: 2,
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
        />
      )}
    </span>
  );
};

export default Tag;
