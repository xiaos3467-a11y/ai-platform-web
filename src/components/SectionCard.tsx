/**
 * SectionCard — Glass container with title bar
 * — A glass-morphism card with a standardized header (title + optional
 *   subtitle / icon) and a consistent body padding.
 * — Extracted from Dashboard.tsx, Costs.tsx, Settings.tsx, Evaluations.tsx.
 */

import React from 'react';
import { Card } from 'antd';
import type { CardProps } from 'antd';

export interface SectionCardProps extends Omit<CardProps, 'title'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Leading icon rendered before the title (Settings-style). */
  icon?: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  icon,
  style,
  children,
  className,
  ...rest
}) => {
  const cls = ['animate-fade-in-up', className].filter(Boolean).join(' ');

  const titleNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {icon && <span style={{ color: '#0a84ff', fontSize: 16 }}>{icon}</span>}
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
            marginLeft: 4,
            fontWeight: 400,
          }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );

  return (
    <Card
      className={cls}
      title={titleNode}
      style={{
        borderRadius: 16,
        border: '0.5px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
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
      {...rest}
    >
      {children}
    </Card>
  );
};

export default SectionCard;
