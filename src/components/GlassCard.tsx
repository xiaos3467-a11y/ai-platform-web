/**
 * GlassCard — Universal Apple glass surface
 * — Frosted-glass card with theme-aware colors (dark + light).
 * — Used as the foundation for SectionCard, StatCard, and as a direct
 *   replacement for the `<Card style={{ borderRadius: 16, border: ...,
 *   background: ..., backdropFilter: ... }}>` pattern duplicated across
 *   every page.
 */

import React from 'react';
import { Card } from 'antd';
import type { CardProps } from 'antd';

export interface GlassCardProps extends CardProps {
  /** Apply hover lift effect (card-hover). */
  hoverable?: boolean;
  /** Apply fade-in-up entrance animation. */
  animate?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  hoverable = false,
  animate = false,
  className,
  style,
  children,
  ...rest
}) => {
  const cls = [
    'glass-card',
    hoverable && 'card-hover',
    animate && 'animate-fade-in-up',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Card
      className={cls}
      style={{
        borderRadius: 16,
        border: '0.5px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Card>
  );
};

export default GlassCard;
