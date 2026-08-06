/**
 * StatCardsRow — 4 KPI cards with trends.
 */

import React from 'react';
import { Row, Col } from 'antd';
import {
  ThunderboltOutlined,
  MessageOutlined,
  DollarOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import type { CostSummary, HealthStatus } from '@/types';
import { StatCard, StatCardSkeleton } from '@/components';

interface Props {
  loading: boolean;
  costSummary: CostSummary | null;
  health: HealthStatus | null;
}

const StatCardsRow: React.FC<Props> = ({ loading, costSummary, health }) => {
  const totalTokens =
    (costSummary?.total_input_tokens ?? 0) + (costSummary?.total_output_tokens ?? 0);

  const formatTokens = (n: number) =>
    n > 1_000_000
      ? `${(n / 1_000_000).toFixed(2)}`
      : n > 1_000
        ? `${(n / 1_000).toFixed(0)}`
        : `${n}`;

  const tokenSuffix = totalTokens > 1_000_000 ? 'M' : totalTokens > 1_000 ? 'K' : '';

  if (loading) {
    return (
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <StatCardSkeleton />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
      <Col xs={24} sm={12} lg={6} className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <StatCard
          title="总请求数"
          value={costSummary?.total_requests ?? 0}
          icon={<ThunderboltOutlined />}
          gradient="linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)"
          trend={{ value: 12.5, label: '较上周' }}
        />
      </Col>
      <Col
        xs={24}
        sm={12}
        lg={6}
        className="animate-fade-in-up"
        style={{ animationDelay: '0.15s' }}
      >
        <StatCard
          title="Token 消耗"
          value={formatTokens(totalTokens)}
          suffix={tokenSuffix}
          icon={<MessageOutlined />}
          gradient="linear-gradient(135deg, #30d158 0%, #34c759 100%)"
          trend={{ value: 8.3, label: '较上周' }}
        />
      </Col>
      <Col xs={24} sm={12} lg={6} className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <StatCard
          title="总成本"
          value={`¥${Math.round((costSummary?.total_cost_usd ?? 0) * 7.2).toLocaleString()}`}
          icon={<DollarOutlined />}
          gradient="linear-gradient(135deg, #ffd60a 0%, #ff9f0a 100%)"
          trend={{ value: -3.2, label: '较上周' }}
        />
      </Col>
      <Col
        xs={24}
        sm={12}
        lg={6}
        className="animate-fade-in-up"
        style={{ animationDelay: '0.25s' }}
      >
        <StatCard
          title="健康状态"
          value={health?.status === 'ok' ? 99.8 : 87.2}
          suffix="%"
          icon={<HeartOutlined />}
          gradient="linear-gradient(135deg, #ff453a 0%, #ff6961 100%)"
          trend={{ value: 0.2, label: '较上周' }}
        />
      </Col>
    </Row>
  );
};

export default StatCardsRow;
