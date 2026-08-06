/**
 * EmptyState — Zero-data placeholder with illustration
 * — Centered layout with a rounded glass icon badge, a title, an
 *   optional description, and an optional CTA.
 * — Enhanced with a subtle floating animation on the icon.
 * — Used on: Agents, Users, Roles, ModelProviders, Prompts,
 *   KnowledgeBases, Workflows, Evaluations (8 pages).
 */

import React from 'react';
import Button from './Button';

import { radius } from '@/styles/themeTokens';
export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  /** Optional gradient for the icon badge. */
  iconGradient?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  iconGradient,
}) => (
  <div
    style={{
      textAlign: 'center',
      padding: '80px 24px',
    }}
  >
    {/* Icon badge with subtle float animation */}
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: radius.xl,
        margin: '0 auto 20px',
        background: iconGradient || 'var(--bg-card)',
        border: '0.5px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 30,
        color: iconGradient ? '#fff' : 'var(--text-faint)',
        boxShadow: iconGradient
          ? '0 8px 24px rgba(0, 0, 0, 0.25)'
          : '0 4px 12px rgba(0, 0, 0, 0.15)',
        animation: 'float 4s ease-in-out infinite',
      }}
    >
      {icon}
    </div>
    <div
      style={{
        fontSize: 16,
        color: 'var(--text-subtle)',
        fontWeight: 600,
        marginBottom: 8,
        letterSpacing: '-0.01em',
      }}
    >
      {title}
    </div>
    {description && (
      <div
        style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          marginBottom: 28,
          maxWidth: 320,
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.6,
        }}
      >
        {description}
      </div>
    )}
    {actionText && onAction && (
      <Button
        variant="primary"
        onClick={onAction}
        style={{ height: 44, paddingInline: 24, borderRadius: radius.md, fontWeight: 600 }}
      >
        {actionText}
      </Button>
    )}
  </div>
);

export default EmptyState;
