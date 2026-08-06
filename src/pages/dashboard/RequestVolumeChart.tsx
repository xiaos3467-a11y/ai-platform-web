/**
 * RequestVolumeChart — 7-day bar chart of request counts.
 */

import React from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyCost } from '@/types';
import { SectionCard, SectionCardSkeleton } from '@/components';

import { radius } from '@/styles/themeTokens';
interface Props {
  loading: boolean;
  dailyCosts: DailyCost[];
}

const RequestVolumeChart: React.FC<Props> = ({ loading, dailyCosts }) => {
  if (loading) return <SectionCardSkeleton />;

  return (
    <div className="animate-fade-in-up" style={{ marginBottom: 28, animationDelay: '0.4s' }}>
      <SectionCard
        title="请求量"
        subtitle="最近 7 天"
        icon={<CheckCircleOutlined style={{ color: 'var(--color-purple, #5e5ce6)' }} />}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dailyCosts.slice(-7)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0a84ff" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#5e5ce6" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-divider)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: radius.md,
                border: '0.5px solid var(--border-subtle)',
                background: 'var(--bg-elevated)',
                boxShadow: 'var(--shadow-sm)',
                fontSize: 13,
                color: 'var(--text-primary)',
              }}
              labelStyle={{ color: 'var(--text-soft)' }}
              formatter={(v: number) => [v.toLocaleString(), '请求数']}
            />
            <Bar dataKey="requests" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="请求数" />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
};

export default RequestVolumeChart;
