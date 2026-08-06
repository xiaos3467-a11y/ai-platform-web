/**
 * ChartsRow — Cost trend area chart + model distribution pie chart.
 */

import React, { useMemo } from 'react';
import { Row, Col, Space } from 'antd';
import { ThunderboltOutlined, MessageOutlined } from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { CostSummary, DailyCost } from '@/types';
import { SectionCard, SectionCardSkeleton } from '@/components';
import Button from '@/components/Button';

import { radius } from '@/styles/themeTokens';
const MODEL_COLORS = ['#0a84ff', '#30d158', '#ffd60a', '#ff453a', '#5e5ce6', '#64d2ff'];

interface Props {
  loading: boolean;
  dailyCosts: DailyCost[];
  costSummary: CostSummary | null;
}

const tooltipStyle: React.CSSProperties = {
  borderRadius: radius.md,
  border: '0.5px solid var(--border-subtle)',
  background: 'var(--bg-elevated)',
  boxShadow: 'var(--shadow-sm)',
  fontSize: 13,
  color: 'var(--text-primary)',
};

const ChartsRow: React.FC<Props> = ({ loading, dailyCosts, costSummary }) => {
  const modelData = useMemo(
    () =>
      costSummary
        ? Object.entries(costSummary.by_model).map(([name, data]) => ({
            name: name.length > 12 ? name.slice(0, 12) + '…' : name,
            cost: data.cost_usd,
            tokens: data.input_tokens + data.output_tokens,
          }))
        : [],
    [costSummary],
  );

  if (loading) {
    return (
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} lg={16}>
          <SectionCardSkeleton />
        </Col>
        <Col xs={24} lg={8}>
          <SectionCardSkeleton />
        </Col>
      </Row>
    );
  }

  return (
    <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
      <Col xs={24} lg={16} className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <SectionCard
          title="成本趋势"
          subtitle="最近 7 天"
          icon={<ThunderboltOutlined style={{ color: 'var(--color-primary)' }} />}
          extra={
            <Space size={6}>
              <Button size="sm" variant="secondary">
                7天
              </Button>
              <Button size="sm" variant="ghost">
                30天
              </Button>
            </Space>
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={dailyCosts.slice(-7)}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="costGradientBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0a84ff" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0a84ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-divider)"
                vertical={false}
              />
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
                tickFormatter={(v) => `¥${(v * 7.2).toFixed(0)}`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: 'var(--text-soft)' }}
                formatter={(v: number) => [`¥${(v * 7.2).toFixed(2)}`, '成本']}
              />
              <Area
                type="monotone"
                dataKey="estimated_cost_usd"
                stroke="#0a84ff"
                strokeWidth={2}
                fill="url(#costGradientBlue)"
                name="成本"
                dot={{ r: 3, fill: '#0a84ff', stroke: '#0a84ff', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#0a84ff', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </Col>

      <Col xs={24} lg={8} className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
        <SectionCard
          title="模型使用分布"
          subtitle="按 Token 消耗"
          icon={<MessageOutlined style={{ color: 'var(--color-success)' }} />}
        >
          {modelData.length > 0 ? (
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
            >
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={modelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="tokens"
                    nameKey="name"
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {modelData.map((_, i) => (
                      <Cell key={i} fill={MODEL_COLORS[i % MODEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {modelData.slice(0, 4).map((m, i) => {
                  const total = modelData.reduce((s, x) => s + x.tokens, 0);
                  const pct = total > 0 ? ((m.tokens / total) * 100).toFixed(0) : '0';
                  return (
                    <div
                      key={m.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: 13,
                        color: 'var(--text-soft)',
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: MODEL_COLORS[i % MODEL_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <span>{m.name}</span>
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {(m.tokens / 1_000_000).toFixed(2)}M
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--text-tertiary)',
                          width: 40,
                          textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
              <MessageOutlined style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: 14 }}>暂无数据</div>
            </div>
          )}
        </SectionCard>
      </Col>
    </Row>
  );
};

export default ChartsRow;
