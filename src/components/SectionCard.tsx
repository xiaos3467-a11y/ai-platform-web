/**
 * SectionCard — Glass container with title bar
 * — A glass-morphism card with a standardized header (title + optional
 *   subtitle / icon) and a consistent body padding.
 * — Enhanced hover effect, better typography, and optional gradient top-border accent.
 * — Used on Dashboard, Costs, Settings, Evaluations, KnowledgeBases.
 */

import React, { useRef } from 'react';
import { Card } from 'antd';
import type { CardProps } from 'antd';

import { radius } from '@/styles/themeTokens';
export interface SectionCardProps extends Omit<CardProps, 'title'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Leading icon rendered before the title (Settings-style). */
  icon?: React.ReactNode;
  /** Gradient accent line at the top of the card. */
  accentGradient?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  icon,
  accentGradient,
  style,
  children,
  className,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const cls = ['animate-fade-in-up', className].filter(Boolean).join(' ');

  const titleNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {icon && (
        <span
          style={{
            color: '#0a84ff',
            fontSize: 16,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </span>
      )}
      <span
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </span>
      {subtitle && (
        <span
          style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            marginLeft: 2,
            fontWeight: 400,
          }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );

  return (
    <div style={{ position: 'relative' }} ref={cardRef}>
      {/* Optional gradient accent line at top */}
      {accentGradient && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 24,
            right: 24,
            height: 2,
            borderRadius: '0 0 2px 2px',
            background: accentGradient,
            opacity: 0.6,
            zIndex: 1,
          }}
        />
      )}
      <Card
        className={cls}
        title={titleNode}
        style={{
          borderRadius: radius.lg,
          border: '0.5px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          WebkitBackdropFilter: 'blur(20px)',
          transition:
            'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
          ...style,
        }}
        styles={{
          header: {
            borderBottom: '0.5px solid var(--border-divider)',
            padding: '16px 24px',
            minHeight: 'auto',
          },
          body: { padding: 24 },
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(-1px)';
          el.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.25)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = 'none';
        }}
        {...rest}
      >
        {children}
      </Card>
    </div>
  );
};

export default SectionCard;
