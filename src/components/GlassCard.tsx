/**
 * GlassCard — Universal Apple glass surface
 * — Frosted-glass card with theme-aware colors (dark + light).
 * — Used as the foundation for SectionCard, StatCard, and as a direct
 *   replacement for the `<Card style={{ borderRadius: radius.lg, ... }}>` pattern.
 * — Enhanced with smoother hover transitions.
 */

import React, { useRef } from 'react';
import { Card } from 'antd';
import type { CardProps } from 'antd';

import { radius } from '@/styles/themeTokens';
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
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const cls = ['glass-card', animate && 'animate-fade-in-up', className].filter(Boolean).join(' ');

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      const el = e.currentTarget;
      el.style.transform = 'translateY(-2px)';
      el.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.25)';
      el.style.borderColor = 'var(--border-subtle)';
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      const el = e.currentTarget;
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = 'none';
    }
    onMouseLeave?.(e);
  };

  return (
    <Card
      ref={cardRef}
      className={cls}
      style={{
        borderRadius: radius.lg,
        border: '0.5px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: hoverable
          ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease'
          : undefined,
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </Card>
  );
};

export default GlassCard;
