/** Tenant dashboard — overview with stats, trends, quick actions */

import React from 'react';
import { Typography, Row, Col, Button, Space, Progress } from 'antd';
import {
  KeyOutlined,
  TeamOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  CloudServerOutlined,
  ApiOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useApiQuery } from '@/hooks/useApiQuery';
import { GlassCard, TableSkeleton } from '@/components';
import type { TenantUsageSummary, TenantUsageDataPoint } from '@/types';
import dayjs from 'dayjs';

import { radius } from '@/styles/themeTokens';
const { Title, Text } = Typography;

/** Mini sparkline chart using inline SVG */
const Sparkline: React.FC<{ data: number[]; color?: string; height?: number }> = ({
  data,
  color = '#0a84ff',
  height = 60,
}) => {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 200;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${height} ${points} ${w},${height}`}
        fill="url(#sparkGrad)"
        stroke="none"
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
};

/** Inline stat tile matching the Apple glass aesthetic */
const StatTile: React.FC<{
  title: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  gradient: string;
  percent?: number;
  strokeColor?: string;
}> = ({ title, value, suffix, icon, gradient, percent, strokeColor }) => (
  <GlassCard
    style={{
      padding: 20,
      borderRadius: radius.lg,
      background: 'var(--bg-card)',
      border: '0.5px solid var(--border-subtle)',
      height: '100%',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            fontWeight: 500,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Text>
        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            {value}
          </span>
          {suffix && (
            <span style={{ fontSize: 13, color: 'var(--text-soft)', marginLeft: 4 }}>{suffix}</span>
          )}
        </div>
      </div>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.md,
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18,
          flexShrink: 0,
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}
      >
        {icon}
      </div>
    </div>
    {percent !== undefined && (
      <Progress
        percent={Math.round(percent)}
        strokeColor={strokeColor || '#0a84ff'}
        size="small"
        style={{ marginTop: 8, marginBottom: 0 }}
      />
    )}
  </GlassCard>
);

const TenantDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: usage, isLoading } = useApiQuery<{
    summary: TenantUsageSummary;
    daily: TenantUsageDataPoint[];
  }>({
    queryKey: ['tenant', 'usage', 'summary'],
    endpoint: '/tenant/self/usage',
  });

  if (isLoading) {
    return (
      <GlassCard>
        <TableSkeleton />
      </GlassCard>
    );
  }

  const summary = usage?.summary;
  const dailyData = usage?.daily || [];
  const tokenTrend = dailyData.slice(-7).map((d) => d.tokens);

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  const progressColor = (used: number, limit: number) => {
    const ratio = limit > 0 ? used / limit : 0;
    if (ratio >= 0.9) return '#ff3b30';
    if (ratio >= 0.7) return '#ff9500';
    return '#30d158';
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          概览
        </Title>
        <Text type="secondary">欢迎使用租户控制台</Text>
      </div>

      {/* Stats row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatTile
            title="本月 Token"
            value={formatNumber(summary?.tokens_used || 0)}
            suffix={`/ ${formatNumber(summary?.tokens_limit || 0)}`}
            icon={<CloudServerOutlined />}
            gradient="linear-gradient(135deg, #0a84ff, #5e5ce6)"
            percent={
              summary && summary.tokens_limit > 0
                ? (summary.tokens_used / summary.tokens_limit) * 100
                : 0
            }
            strokeColor={summary ? progressColor(summary.tokens_used, summary.tokens_limit) : '#30d158'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatTile
            title="API 调用"
            value={formatNumber(summary?.requests_used || 0)}
            suffix={`/ ${formatNumber(summary?.requests_limit || 0)}`}
            icon={<ApiOutlined />}
            gradient="linear-gradient(135deg, #30d158, #34c759)"
            percent={
              summary && summary.requests_limit > 0
                ? (summary.requests_used / summary.requests_limit) * 100
                : 0
            }
            strokeColor={summary ? progressColor(summary.requests_used, summary.requests_limit) : '#0a84ff'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatTile
            title="活跃 App"
            value={summary?.active_apps || 0}
            suffix={`/ ${summary?.app_limit || '∞'}`}
            icon={<AppstoreOutlined />}
            gradient="linear-gradient(135deg, #ff9500, #ff6b00)"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatTile
            title="存储使用"
            value={formatNumber(summary?.storage_used || 0)}
            suffix="MB"
            icon={<DatabaseOutlined />}
            gradient="linear-gradient(135deg, #bf5af2, #af52de)"
          />
        </Col>
      </Row>

      {/* Trend chart */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <GlassCard
            style={{
              padding: 20,
              borderRadius: radius.lg,
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border-subtle)',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 15 }}>
                近 7 天 Token 消耗趋势
              </Text>
            </div>
            <div style={{ height: 200 }}>
              <Sparkline data={tokenTrend.length ? tokenTrend : [0, 0, 0, 0, 0, 0, 0]} height={200} />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8,
              }}
            >
              {dailyData.slice(-7).map((d) => (
                <Text key={d.date} style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                  {dayjs(d.date).format('MM/DD')}
                </Text>
              ))}
            </div>
          </GlassCard>
        </Col>

        {/* Quick actions */}
        <Col xs={24} lg={8}>
          <GlassCard
            style={{
              padding: 20,
              borderRadius: radius.lg,
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border-subtle)',
              height: '100%',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 15 }}>
                快速操作
              </Text>
            </div>
            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              <Button
                block
                icon={<KeyOutlined />}
                onClick={() => navigate('/tenant/api-keys')}
              >
                创建 API Key
              </Button>
              <Button
                block
                icon={<TeamOutlined />}
                onClick={() => navigate('/tenant/members')}
              >
                邀请成员
              </Button>
              <Button
                block
                icon={<BarChartOutlined />}
                onClick={() => navigate('/tenant/usage')}
              >
                查看用量详情
              </Button>
              <Button
                block
                icon={<AppstoreOutlined />}
                onClick={() => navigate('/tenant/models')}
              >
                查看可用模型
              </Button>
              <Button
                block
                icon={<ThunderboltOutlined />}
                type="primary"
                ghost
                onClick={() => navigate('/tenant/audit-logs')}
              >
                审计日志
              </Button>
            </Space>
          </GlassCard>
        </Col>
      </Row>
    </>
  );
};

export default TenantDashboard;
