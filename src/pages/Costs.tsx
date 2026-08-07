/** Cost analysis — Apple glass aesthetic */

import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, InputNumber, Button, App } from 'antd';
import {
  DollarOutlined,
  ThunderboltOutlined,
  AlertOutlined,
  MessageOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '@/api/client';
import type { CostSummary, DailyCost } from '@/types';
import { StatCard, SectionCard, CardSkeleton, VirtualTable } from '@/components';
import type { VirtualTableColumn } from '@/components';

import { radius } from '@/styles/themeTokens';
const { Title, Text } = Typography;

const COLORS = ['#0a84ff', '#30d158', '#ffd60a', '#ff453a', '#5e5ce6', '#64d2ff', '#bf5af2'];

/* ─── Model Breakdown sub-component (virtualized) ───────────────── */

interface ModelRow {
  name: string;
  cost_usd?: number;
  requests?: number;
  input_tokens?: number;
  output_tokens?: number;
}

const ModelBreakdownTable: React.FC<{ modelData: ModelRow[]; totalCost: number }> = ({
  modelData,
  totalCost,
}) => {
  const columns: VirtualTableColumn<ModelRow>[] = [
    {
      title: '模型',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (_v, record) => (
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{record.name}</span>
      ),
    },
    {
      title: '费用',
      dataIndex: 'cost_usd',
      key: 'cost_usd',
      width: 100,
      align: 'right',
      render: (v) => (
        <span style={{ fontWeight: 600, color: '#0a84ff', fontVariantNumeric: 'tabular-nums' }}>
          ${((v as number) || 0).toFixed(4)}
        </span>
      ),
    },
    {
      title: '请求',
      dataIndex: 'requests',
      key: 'requests',
      width: 90,
      align: 'right',
      render: (v) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {((v as number) || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Tokens',
      key: 'tokens',
      width: 110,
      align: 'right',
      render: (_v, record) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {((record.input_tokens || 0) + (record.output_tokens || 0)).toLocaleString()}
        </span>
      ),
    },
    {
      title: '占比',
      key: 'pct',
      width: 80,
      align: 'right',
      render: (_v, record) => {
        const pct = ((record.cost_usd || 0) / totalCost) * 100;
        return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pct.toFixed(1)}%</span>;
      },
    },
  ];

  return (
    <VirtualTable<ModelRow>
      columns={columns}
      dataSource={modelData}
      rowKey="name"
      rowHeight={48}
      maxHeight={360}
    />
  );
};

/* ─── Main ────────────────────────────────────────────────────────── */
const Costs: React.FC = () => {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [daily, setDaily] = useState<DailyCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState(100);
  const [budgetResult, setBudgetResult] = useState<{
    monthly_budget_usd: number;
    spent_usd: number;
    remaining_usd: number;
    usage_percentage: number;
    alerts: string[];
  } | null>(null);
  const { message } = App.useApp();

  useEffect(() => {
    const ctrl = new AbortController();
    const fetchData = async () => {
      try {
        const [summaryResp, dailyResp] = await Promise.allSettled([
          api.post<CostSummary>('/costs/summary', {}, ctrl.signal),
          api.post<DailyCost[]>('/costs/daily', { days: 30 }, ctrl.signal),
        ]);
        if (summaryResp.status === 'fulfilled') setSummary(summaryResp.value.data);
        if (dailyResp.status === 'fulfilled') setDaily(dailyResp.value.data || []);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    };
    fetchData();
    return () => ctrl.abort();
  }, []);

  const checkBudget = async () => {
    try {
      const resp = await api.post<typeof budgetResult>('/costs/budget-check', {
        monthly_budget_usd: budget,
      });
      setBudgetResult(resp.data);
    } catch {
      message.error('预算检查失败');
    }
  };

  const modelData = summary
    ? Object.entries(summary.by_model).map(([name, data]) => ({ name, ...data }))
    : [];
  const modelPieData = modelData.map((m) => ({
    name: m.name.length > 12 ? m.name.slice(0, 12) + '…' : m.name,
    value: m.cost_usd,
  }));

  const totalTokens = (summary?.total_input_tokens ?? 0) + (summary?.total_output_tokens ?? 0);

  const tooltipStyle = {
    borderRadius: radius.md,
    border: '0.5px solid var(--border-subtle)',
    background: 'var(--bg-elevated)',
    boxShadow: 'var(--shadow-card)',
    fontSize: 13,
    color: 'var(--text-primary)',
  };

  return (
    <div>
      {/* Page title */}
      <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
        <Title
          level={2}
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
          }}
        >
          成本分析
        </Title>
        <Text
          style={{ fontSize: 17, color: 'var(--text-secondary)', marginTop: 6, display: 'block' }}
        >
          Token 消耗与费用追踪
        </Text>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} sm={8} key={i}>
              <CardSkeleton />
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <StatCard
              title="本月总成本"
              value={`$${(summary?.total_cost_usd ?? 0).toFixed(2)}`}
              icon={<DollarOutlined />}
              gradient="linear-gradient(135deg, #ffd60a, #ff9f0a)"
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              title="Token 消耗"
              value={
                totalTokens > 1000000
                  ? `${(totalTokens / 1000000).toFixed(1)}M`
                  : totalTokens > 1000
                    ? `${(totalTokens / 1000).toFixed(0)}K`
                    : totalTokens
              }
              icon={<MessageOutlined />}
              gradient="linear-gradient(135deg, #30d158, #34c759)"
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              title="总请求数"
              value={(summary?.total_requests ?? 0).toLocaleString()}
              icon={<ThunderboltOutlined />}
              gradient="linear-gradient(135deg, #0a84ff, #5e5ce6)"
            />
          </Col>
        </Row>
      )}

      <Row gutter={[20, 20]}>
        {/* Cost Trend */}
        <Col xs={24} lg={16}>
          {loading ? (
            <CardSkeleton />
          ) : (
            <SectionCard title="每日成本趋势" subtitle="近 30 天">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={daily}>
                  <defs>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
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
                    tick={{ fontSize: 11, fill: 'var(--text-subtle)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: 'var(--text-subtle)' }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                    tickFormatter={(v) => `$${v.toFixed(2)}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: 'var(--text-subtle)' }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-soft)' }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="estimated_cost_usd"
                    name="成本 (USD)"
                    stroke="#0a84ff"
                    strokeWidth={2}
                    fill="url(#costGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#0a84ff' }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="requests"
                    name="请求数"
                    stroke="#30d158"
                    strokeWidth={2}
                    fill="transparent"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </SectionCard>
          )}
        </Col>

        {/* Model Cost Pie */}
        <Col xs={24} lg={8}>
          {loading ? (
            <CardSkeleton />
          ) : (
            <SectionCard title="模型成本分布">
              {modelPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={modelPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={64}
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {modelPieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v: number) => `$${v.toFixed(4)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <ApiOutlined
                    style={{ fontSize: 36, color: 'var(--text-faint)', marginBottom: 12 }}
                  />
                  <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>暂无数据</div>
                </div>
              )}
            </SectionCard>
          )}
        </Col>

        {/* Token Trend */}
        <Col xs={24}>
          {loading ? (
            <CardSkeleton />
          ) : (
            <SectionCard title="每日 Token 消耗">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={daily}>
                  <defs>
                    <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5e5ce6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#5e5ce6" stopOpacity={0.4} />
                    </linearGradient>
                    <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#64d2ff" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#64d2ff" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-divider)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--text-subtle)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--text-subtle)' }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                    tickFormatter={(v) => (v > 1000 ? `${(v / 1000).toFixed(0)}K` : v)}
                  />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-soft)' }} />
                  <Bar
                    dataKey="input_tokens"
                    name="输入 Token"
                    fill="url(#barGrad1)"
                    stackId="a"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="output_tokens"
                    name="输出 Token"
                    fill="url(#barGrad2)"
                    stackId="a"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          )}
        </Col>

        {/* Budget Check */}
        <Col xs={24} lg={12}>
          {loading ? (
            <CardSkeleton />
          ) : (
            <SectionCard title="预算检查">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--text-soft)',
                      marginBottom: 8,
                    }}
                  >
                    月度预算 (USD)
                  </div>
                  <InputNumber
                    value={budget}
                    onChange={(v) => setBudget(v || 0)}
                    min={1}
                    style={{ width: '100%', borderRadius: radius.md }}
                  />
                </div>
                <Button
                  type="primary"
                  onClick={checkBudget}
                  icon={<AlertOutlined />}
                  style={{ borderRadius: radius.md, height: 40, fontWeight: 500 }}
                >
                  检查
                </Button>
              </div>

              {budgetResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Progress bar */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>已使用</span>
                      <span
                        style={{
                          color: budgetResult.usage_percentage >= 80 ? '#ff453a' : '#0a84ff',
                          fontWeight: 600,
                        }}
                      >
                        {budgetResult.usage_percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: 'var(--bg-elevated)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: 3,
                          width: `${Math.min(budgetResult.usage_percentage, 100)}%`,
                          background:
                            budgetResult.usage_percentage >= 80
                              ? 'linear-gradient(90deg, #ff453a, #ff6961)'
                              : 'linear-gradient(90deg, #0a84ff, #5e5ce6)',
                          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    {[
                      {
                        label: '预算',
                        value: `$${budgetResult.monthly_budget_usd}`,
                        color: 'var(--text-muted)',
                      },
                      { label: '已花费', value: `$${budgetResult.spent_usd}`, color: '#ffd60a' },
                      {
                        label: '剩余',
                        value: `$${budgetResult.remaining_usd}`,
                        color: budgetResult.remaining_usd > 0 ? '#30d158' : '#ff453a',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: radius.md,
                          background: 'var(--bg-card)',
                          border: '0.5px solid var(--border-divider)',
                        }}
                      >
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: item.color,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {budgetResult.alerts.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {budgetResult.alerts.map((a, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '8px 12px',
                            borderRadius: radius.sm,
                            background: 'rgba(255,69,58,0.08)',
                            border: '0.5px solid rgba(255,69,58,0.2)',
                            fontSize: 13,
                            color: '#ff453a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <AlertOutlined /> {a}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          )}
        </Col>

        {/* Model Breakdown Table — VirtualTable for efficient large-list rendering */}
        <Col xs={24} lg={12}>
          {loading ? (
            <CardSkeleton />
          ) : (
            <SectionCard title="模型成本明细">
              <ModelBreakdownTable
                modelData={modelData}
                totalCost={summary?.total_cost_usd || 1}
              />
            </SectionCard>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Costs;
