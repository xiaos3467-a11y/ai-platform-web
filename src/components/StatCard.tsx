/**
 * StatCard — Gradient-accent stat tile
 * — Big value + label + gradient icon badge.
 * — Extracted from Dashboard.tsx and Costs.tsx (identical pattern).
 */

import React from 'react';
import { Card, Typography } from 'antd';

const { Text } = Typography;

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient, suffix }) => (
  <Card
    className="glass-card card-hover animate-fade-in-up"
    style={{
      borderRadius: 16,
      border: '0.5px solid var(--border-subtle)',
      background: 'var(--bg-card)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}
    styles={{ body: { padding: '24px 28px' } }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <Text
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {title}
        </Text>
        <div
          style={{
            marginTop: 10,
            fontSize: 36,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix && (
            <span
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: 'var(--text-muted)',
                marginLeft: 4,
              }}
            >
              {suffix}
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 20,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        }}
      >
        {icon}
      </div>
    </div>
  </Card>
);

export default StatCard;
