/**
 * StatCard — Gradient-accent stat tile with animated number
 * — Big animated value + label + gradient icon badge
 * — Hover lift effect with enhanced shadow
 * — Used on Dashboard, Costs, and any summary view.
 *
 * Design reference: design/mockups/components.html § 1
 */

import React from 'react';
import { Card, Typography } from 'antd';
import AnimatedNumber from './AnimatedNumber';

import { radius } from '@/styles/themeTokens';
const { Text } = Typography;

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  suffix?: string;
  /** Optional trend indicator: positive = green ↑, negative = red ↓ */
  trend?: { value: number; label?: string };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient, suffix, trend }) => {
  const isNumeric = typeof value === 'number';
  const trendUp = trend && trend.value >= 0;

  return (
    <Card
      className="glass-card animate-fade-in-up card-hover"
      style={{
        borderRadius: radius.lg,
        border: '0.5px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        cursor: 'default',
        transition:
          'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
      }}
      styles={{ body: { padding: '24px 28px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Text
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Text>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {isNumeric ? (
              <AnimatedNumber
                value={value}
                duration={800}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              />
            ) : (
              value
            )}
            {suffix && (
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--text-soft)',
                  marginLeft: 2,
                }}
              >
                {suffix}
              </span>
            )}
          </div>
          {/* Optional trend indicator */}
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 12,
                  fontWeight: 600,
                  color: trendUp ? 'var(--color-success)' : 'var(--color-error)',
                  padding: '2px 8px',
                  borderRadius: radius.sm,
                  background: trendUp ? 'rgba(48, 209, 88, 0.1)' : 'rgba(255, 69, 58, 0.1)',
                }}
              >
                <span>{trendUp ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </span>
              {trend.label && (
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{trend.label}</span>
              )}
            </div>
          )}
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            flexShrink: 0,
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
