/**
 * Dashboard — Apple Numbers aesthetic
 * — Skeleton loading, gradient stat cards, smooth chart areas
 */

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Space, Skeleton, Alert } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  MessageOutlined,
  DollarOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { api } from '@/api/client';
import type { CostSummary, DailyCost, HealthStatus } from '@/types';

const { Title, Text } = Typography;

const COLORS = ['#0a84ff', '#30d158', '#ffd60a', '#ff453a', '#5e5ce6', '#64d2ff'];

/* ─── Skeleton loader ─────────────────────────────────────────────── */
const StatCardSkeleton: React.FC = () => (
  <Card
    style={{
      borderRadius: 16,
      border: '0.5px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(255, 255, 255, 0.04)',
    }}
    styles={{ body: { padding: '24px 28px' } }}
  >
    <Skeleton active paragraph={{ rows: 1 }} title={{ width: 100 }} />
  </Card>
);

const SectionCardSkeleton: React.FC = () => (
  <Card
    style={{
      borderRadius: 16,
      border: '0.5px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(255, 255, 255, 0.04)',
    }}
    styles={{ body: { padding: 24 } }}
  >
    <Skeleton active paragraph={{ rows: 6 }} />
  </Card>
);

/* ─── Stat card — gradient accent ─────────────────────────────────── */
const StatCard: React.FC<{
  title: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  gradient: string;
}> = ({ title, value, suffix, icon, gradient }) => (
  <Card
    className="card-hover animate-fade-in-up"
    style={{
      borderRadius: 16,
      border: '0.5px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(255, 255, 255, 0.04)',
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
            color: 'rgba(255, 255, 255, 0.45)',
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
            color: '#f5f5f7',
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
                color: 'rgba(255, 255, 255, 0.35)',
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

/* ─── Section card — clean container ──────────────────────────────── */
const SectionCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ title, subtitle, children, style }) => (
  <Card
    className="animate-fade-in-up"
    title={
      <div>
        <span
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: '#f5f5f7',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            style={{
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.35)',
              marginLeft: 12,
              fontWeight: 400,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    }
    style={{
      borderRadius: 16,
      border: '0.5px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(255, 255, 255, 0.04)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      ...style,
    }}
    styles={{
      header: {
        borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)',
        padding: '16px 24px',
        minHeight: 'auto',
      },
      body: { padding: 24 },
    }}
  >
    {children}
  </Card>
);

/* ─── Health pill ─────────────────────────────────────────────────── */
const HealthPill: React.FC<{ name: string; status: string }> = ({ name, status }) => {
  const isOk = status === 'ok';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderRadius: 10,
        background: isOk ? 'rgba(48, 209, 88, 0.08)' : 'rgba(255, 69, 58, 0.08)',
        border: `0.5px solid ${isOk ? 'rgba(48, 209, 88, 0.2)' : 'rgba(255, 69, 58, 0.2)'}`,
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: isOk ? '#30d158' : '#ff453a',
          boxShadow: isOk ? '0 0 6px rgba(48, 209, 88, 0.5)' : '0 0 6px rgba(255, 69, 58, 0.5)',
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.72)',
        }}
      >
        {name}
      </span>
    </div>
  );
};

/* ─── Dashboard ───────────────────────────────────────────────────── */
const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [dailyCosts, setDailyCosts] = useState<DailyCost[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthResp, costResp, dailyResp] = await Promise.allSettled([
          api.get<HealthStatus>('/health'),
          api.get<CostSummary>('/costs/summary'),
          api.get<DailyCost[]>('/costs/daily?days=14'),
        ]);
        if (healthResp.status === 'fulfilled') setHealth(healthResp.value.data);
        if (costResp.status === 'fulfilled') setCostSummary(costResp.value.data);
        if (dailyResp.status === 'fulfilled') setDailyCosts(dailyResp.value.data || []);

        const allFailed = [healthResp, costResp, dailyResp].every((r) => r.status === 'rejected');
        if (allFailed) setError('无法连接到后端服务，请检查网络或联系管理员');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const modelData = costSummary
    ? Object.entries(costSummary.by_model).map(([name, data]) => ({
        name: name.length > 12 ? name.slice(0, 12) + '…' : name,
        cost: data.cost_usd,
      }))
    : [];

  const totalTokens = (costSummary?.total_input_tokens ?? 0) + (costSummary?.total_output_tokens ?? 0);

  return (
    <div>
      {error && (
        <Alert
          message="数据加载异常"
          description={error}
          type="warning"
          showIcon
          style={{
            marginBottom: 20,
            borderRadius: 12,
            background: 'rgba(255, 214, 10, 0.06)',
            border: '0.5px solid rgba(255, 214, 10, 0.15)',
          }}
        />
      )}

      {/* Page title */}
      <div
        className="animate-fade-in-up"
        style={{ marginBottom: 32 }}
      >
        <Title
          level={2}
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: '-0.04em',
            color: '#f5f5f7',
          }}
        >
          仪表盘
        </Title>
        <Text
          style={{
            fontSize: 17,
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: 6,
            display: 'block',
            fontWeight: 400,
          }}
        >
          平台运行概览
        </Text>
      </div>

      {/* ─── Stat cards ─────────────────────────────────────────── */}
      {loading ? (
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <StatCardSkeleton />
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="本月请求"
              value={costSummary?.total_requests ?? 0}
              icon={<ThunderboltOutlined />}
              gradient="linear-gradient(135deg, #0a84ff, #5e5ce6)"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
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
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="本月成本"
              value={`$${(costSummary?.total_cost_usd ?? 0).toFixed(2)}`}
              icon={<DollarOutlined />}
              gradient="linear-gradient(135deg, #ffd60a, #ff9f0a)"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="系统状态"
              value={health?.status === 'ok' ? '正常' : '异常'}
              icon={health?.status === 'ok' ? <CheckCircleOutlined /> : <WarningOutlined />}
              gradient={
                health?.status === 'ok'
                  ? 'linear-gradient(135deg, #30d158, #34c759)'
                  : 'linear-gradient(135deg, #ff453a, #ff6961)'
              }
            />
          </Col>
        </Row>
      )}

      {/* ─── Health + Components ────────────────────────────────── */}
      {loading ? (
        <SectionCardSkeleton />
      ) : (
        <SectionCard title="组件状态" style={{ marginBottom: 24 }}>
          <Space size={10} wrap>
            {health?.dependencies &&
            Object.entries(health.dependencies).length > 0 ? (
              Object.entries(health.dependencies).map(([name, status]) => (
                <HealthPill key={name} name={name} status={status} />
              ))
            ) : (
              <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 14 }}>
                暂无组件数据
              </Text>
            )}
          </Space>
        </SectionCard>
      )}

      {/* ─── Charts ─────────────────────────────────────────────── */}
      {loading ? (
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={16}>
            <SectionCardSkeleton />
          </Col>
          <Col xs={24} lg={8}>
            <SectionCardSkeleton />
          </Col>
        </Row>
      ) : (
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={16}>
            <SectionCard title="每日成本趋势" subtitle="近 14 天">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dailyCosts}>
                  <defs>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0a84ff" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#0a84ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.3)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.3)' }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                    tickFormatter={(v) => `$${v.toFixed(2)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '0.5px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(28, 28, 30, 0.95)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                      fontSize: 13,
                      color: '#f5f5f7',
                    }}
                    labelStyle={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="estimated_cost_usd"
                    stroke="#0a84ff"
                    strokeWidth={2}
                    fill="url(#costGradient)"
                    name="成本 (USD)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: '#0a84ff',
                      stroke: 'rgba(0, 0, 0, 0.3)',
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </SectionCard>
          </Col>

          <Col xs={24} lg={8}>
            <SectionCard title="模型成本分布">
              {modelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={modelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={64}
                      outerRadius={100}
                      dataKey="cost"
                      nameKey="name"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {modelData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '0.5px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(28, 28, 30, 0.95)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        fontSize: 13,
                        color: '#f5f5f7',
                      }}
                      formatter={(v: number) => `$${v.toFixed(4)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 0',
                    color: 'rgba(255, 255, 255, 0.25)',
                  }}
                >
                  <ApiOutlined
                    style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}
                  />
                  <div style={{ fontSize: 14 }}>暂无数据</div>
                </div>
              )}
            </SectionCard>
          </Col>

          <Col xs={24}>
            <SectionCard title="每日请求量" subtitle="近 14 天">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dailyCosts}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0a84ff" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#5e5ce6" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.3)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.3)' }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '0.5px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(28, 28, 30, 0.95)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                      fontSize: 13,
                      color: '#f5f5f7',
                    }}
                    labelStyle={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  />
                  <Bar
                    dataKey="requests"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    name="请求数"
                  />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dashboard;
