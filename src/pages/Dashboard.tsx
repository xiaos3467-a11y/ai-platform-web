/** Dashboard — Apple-style: airy cards, large numbers, minimal decoration */

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Tag, Space, Spin } from 'antd';
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

const COLORS = ['#0071e3', '#34c759', '#ff9f0a', '#ff3b30', '#5856d6', '#00c7be'];

/** Apple-style stat card */
const StatCard: React.FC<{
  title: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, suffix, icon, color }) => (
  <Card
    style={{
      borderRadius: 16,
      border: 'none',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
    }}
    styles={{ body: { padding: '24px 28px' } }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <Text style={{ fontSize: 13, color: '#86868b', fontWeight: 500 }}>{title}</Text>
        <div style={{ marginTop: 8, fontSize: 32, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.03em' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix && <span style={{ fontSize: 16, fontWeight: 500, color: '#86868b', marginLeft: 4 }}>{suffix}</span>}
        </div>
      </div>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: `${color}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          fontSize: 18,
        }}
      >
        {icon}
      </div>
    </div>
  </Card>
);

/** Apple-style section card */
const SectionCard: React.FC<{
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ title, children, style }) => (
  <Card
    title={
      <span style={{ fontSize: 17, fontWeight: 600, color: '#1d1d1f' }}>{title}</span>
    }
    style={{
      borderRadius: 16,
      border: 'none',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
      ...style,
    }}
    styles={{
      header: { borderBottom: '0.5px solid #f0f0f2', padding: '16px 24px', minHeight: 'auto' },
      body: { padding: 24 },
    }}
  >
    {children}
  </Card>
);

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [dailyCosts, setDailyCosts] = useState<DailyCost[]>([]);

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
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  const modelData = costSummary
    ? Object.entries(costSummary.by_model).map(([name, data]) => ({
        name: name.length > 12 ? name.slice(0, 12) + '…' : name,
        cost: data.cost_usd,
      }))
    : [];

  const totalTokens = (costSummary?.total_input_tokens ?? 0) + (costSummary?.total_output_tokens ?? 0);

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: '#1d1d1f' }}>
          仪表盘
        </Title>
        <Text style={{ fontSize: 15, color: '#86868b', marginTop: 4, display: 'block' }}>
          平台运行概览
        </Text>
      </div>

      {/* Stat cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="本月请求"
            value={costSummary?.total_requests ?? 0}
            icon={<ThunderboltOutlined />}
            color="#0071e3"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Token 消耗"
            value={totalTokens > 1000000 ? `${(totalTokens / 1000000).toFixed(1)}M` : totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(0)}K` : totalTokens}
            icon={<MessageOutlined />}
            color="#34c759"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="本月成本"
            value={`$${(costSummary?.total_cost_usd ?? 0).toFixed(2)}`}
            icon={<DollarOutlined />}
            color="#ff9f0a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="系统状态"
            value={health?.status === 'ok' ? '正常' : '异常'}
            icon={health?.status === 'ok' ? <CheckCircleOutlined /> : <WarningOutlined />}
            color={health?.status === 'ok' ? '#34c759' : '#ff3b30'}
          />
        </Col>
      </Row>

      {/* Health + Components */}
      <SectionCard title="组件状态" style={{ marginBottom: 24 }}>
        <Space size={12} wrap>
          {health?.dependencies &&
            Object.entries(health.dependencies).map(([name, status]) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: status === 'ok' ? '#f0faf4' : '#fff5f5',
                  border: `1px solid ${status === 'ok' ? '#d4edda' : '#fde2e2'}`,
                }}
              >
                {status === 'ok' ? (
                  <CheckCircleOutlined style={{ color: '#34c759', fontSize: 14 }} />
                ) : (
                  <WarningOutlined style={{ color: '#ff3b30', fontSize: 14 }} />
                )}
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f' }}>{name}</span>
              </div>
            ))}
        </Space>
      </SectionCard>

      {/* Charts */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <SectionCard title="每日成本趋势">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyCosts}>
                <defs>
                  <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0071e3" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#0071e3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#86868b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#86868b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="estimated_cost_usd"
                  stroke="#0071e3"
                  strokeWidth={2}
                  fill="url(#costGradient)"
                  name="成本 (USD)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#0071e3' }}
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
                    innerRadius={60}
                    outerRadius={95}
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
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: 13,
                    }}
                    formatter={(v: number) => `$${v.toFixed(4)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#86868b' }}>
                <ApiOutlined style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }} />
                <div>暂无数据</div>
              </div>
            )}
          </SectionCard>
        </Col>

        <Col xs={24}>
          <SectionCard title="每日请求量">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailyCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#86868b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#86868b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="requests" fill="#0071e3" radius={[6, 6, 0, 0]} name="请求数" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
