/** Tenant usage statistics */

import React, { useState } from 'react';
import { Typography, Row, Col, Segmented, Table, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useApiQuery } from '@/hooks/useApiQuery';
import { GlassCard, TableSkeleton } from '@/components';
import type { TenantUsage, TenantUsageDataPoint, TenantUsageByDimension } from '@/types';
import dayjs from 'dayjs';

import { radius } from '@/styles/themeTokens';
const { Title, Text } = Typography;

/** Simple bar chart using divs */
const BarChart: React.FC<{ data: TenantUsageDataPoint[]; dataKey: 'tokens' | 'requests' }> = ({
  data,
  dataKey,
}) => {
  if (!data.length) return <Text type="secondary">暂无数据</Text>;
  const max = Math.max(...data.map((d) => d[dataKey]), 1);
  const color = dataKey === 'tokens' ? '#0a84ff' : '#30d158';

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 180, padding: '0 4px' }}>
      {data.map((d) => {
        const h = (d[dataKey] / max) * 160;
        return (
          <div
            key={d.date}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 10, color: 'var(--text-faint)' }}>
              {d[dataKey] >= 1000 ? `${(d[dataKey] / 1000).toFixed(1)}K` : d[dataKey]}
            </Text>
            <div
              style={{
                width: '100%',
                maxWidth: 40,
                height: h,
                background: color,
                borderRadius: '4px 4px 0 0',
                opacity: 0.8,
                transition: 'height 0.3s ease',
              }}
            />
            <Text style={{ fontSize: 10, color: 'var(--text-faint)' }}>
              {dayjs(d.date).format('MM/DD')}
            </Text>
          </div>
        );
      })}
    </div>
  );
};

const TenantUsage: React.FC = () => {
  const [period, setPeriod] = useState<string>('日');

  const { data: usage, isLoading } = useApiQuery<TenantUsage>({
    queryKey: ['tenant', 'usage', period],
    endpoint: '/tenant/self/usage',
    params: { period },
  });

  const byAppColumns: ColumnsType<TenantUsageByDimension> = [
    { title: 'App', dataIndex: 'dimension', key: 'dimension' },
    {
      title: 'Token 消耗',
      dataIndex: 'tokens',
      key: 'tokens',
      render: (v: number) => v.toLocaleString(),
      sorter: (a, b) => a.tokens - b.tokens,
    },
    {
      title: '请求次数',
      dataIndex: 'requests',
      key: 'requests',
      render: (v: number) => v.toLocaleString(),
      sorter: (a, b) => a.requests - b.requests,
    },
  ];

  const byModelColumns: ColumnsType<TenantUsageByDimension> = [
    { title: '模型', dataIndex: 'dimension', key: 'dimension' },
    {
      title: 'Token 消耗',
      dataIndex: 'tokens',
      key: 'tokens',
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: '请求次数',
      dataIndex: 'requests',
      key: 'requests',
      render: (v: number) => v.toLocaleString(),
    },
  ];

  if (isLoading) {
    return (
      <GlassCard>
        <TableSkeleton />
      </GlassCard>
    );
  }

  const summary = usage?.summary;

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          用量统计
        </Title>
        <Text type="secondary">查看租户资源使用情况</Text>
      </div>

      {/* Summary cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <GlassCard
            style={{
              padding: 20,
              borderRadius: radius.lg,
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border-subtle)',
            }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>
              Token 使用量
            </Text>
            <div style={{ margin: '12px 0 8px' }}>
              <Text strong style={{ fontSize: 24 }}>
                {(summary?.tokens_used || 0).toLocaleString()}
              </Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                / {(summary?.tokens_limit || 0).toLocaleString()}
              </Text>
            </div>
            <Progress
              percent={
                summary && summary.tokens_limit > 0
                  ? Math.round((summary.tokens_used / summary.tokens_limit) * 100)
                  : 0
              }
              strokeColor="#0a84ff"
              size="small"
            />
          </GlassCard>
        </Col>
        <Col xs={24} sm={8}>
          <GlassCard
            style={{
              padding: 20,
              borderRadius: radius.lg,
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border-subtle)',
            }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>
              API 调用次数
            </Text>
            <div style={{ margin: '12px 0 8px' }}>
              <Text strong style={{ fontSize: 24 }}>
                {(summary?.requests_used || 0).toLocaleString()}
              </Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                / {(summary?.requests_limit || 0).toLocaleString()}
              </Text>
            </div>
            <Progress
              percent={
                summary && summary.requests_limit > 0
                  ? Math.round((summary.requests_used / summary.requests_limit) * 100)
                  : 0
              }
              strokeColor="#30d158"
              size="small"
            />
          </GlassCard>
        </Col>
        <Col xs={24} sm={8}>
          <GlassCard
            style={{
              padding: 20,
              borderRadius: radius.lg,
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border-subtle)',
            }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>
              存储使用
            </Text>
            <div style={{ margin: '12px 0 8px' }}>
              <Text strong style={{ fontSize: 24 }}>
                {(summary?.storage_used || 0).toLocaleString()}
              </Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                MB / {(summary?.storage_limit || 0).toLocaleString()} MB
              </Text>
            </div>
            <Progress
              percent={
                summary && summary.storage_limit > 0
                  ? Math.round((summary.storage_used / summary.storage_limit) * 100)
                  : 0
              }
              strokeColor="#bf5af2"
              size="small"
            />
          </GlassCard>
        </Col>
      </Row>

      {/* Trend chart */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <GlassCard
            style={{
              padding: 20,
              borderRadius: radius.lg,
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text strong>用量趋势</Text>
              <Segmented
                options={['日', '周', '月']}
                value={period}
                onChange={(v) => setPeriod(v as string)}
                size="small"
              />
            </div>
            <BarChart data={usage?.daily || []} dataKey="tokens" />
          </GlassCard>
        </Col>
      </Row>

      {/* Drilldown tables */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <GlassCard
            style={{
              padding: 20,
              borderRadius: radius.lg,
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border-subtle)',
            }}
          >
            <Text strong style={{ display: 'block', marginBottom: 12 }}>
              按 App 维度
            </Text>
            <Table<TenantUsageByDimension>
              columns={byAppColumns}
              dataSource={usage?.by_app || []}
              rowKey="dimension"
              pagination={false}
              size="small"
            />
          </GlassCard>
        </Col>
        <Col xs={24} lg={12}>
          <GlassCard
            style={{
              padding: 20,
              borderRadius: radius.lg,
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border-subtle)',
            }}
          >
            <Text strong style={{ display: 'block', marginBottom: 12 }}>
              按模型维度
            </Text>
            <Table<TenantUsageByDimension>
              columns={byModelColumns}
              dataSource={usage?.by_model || []}
              rowKey="dimension"
              pagination={false}
              size="small"
            />
          </GlassCard>
        </Col>
      </Row>
    </>
  );
};

export default TenantUsage;
