/**
 * Dashboard — Apple Numbers-inspired overview page
 *
 * Orchestrates the sub-components defined in ./dashboard/*.
 * All data fetching is done in `useDashboardData` via React Query.
 */

import React from 'react';
import { Alert } from 'antd';
import DashboardHeader from './dashboard/DashboardHeader';
import StatCardsRow from './dashboard/StatCardsRow';
import ChartsRow from './dashboard/ChartsRow';
import RequestVolumeChart from './dashboard/RequestVolumeChart';
import ModelTable from './dashboard/ModelTable';
import { HealthPill } from '@/components';
import { useDashboardData } from './dashboard/useDashboardData';

import { radius } from '@/styles/themeTokens';
const Dashboard: React.FC = () => {
  const { health, costSummary, dailyCosts, isLoading, error } = useDashboardData();

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
            borderRadius: radius.md,
            background: 'rgba(255, 214, 10, 0.06)',
            border: '0.5px solid rgba(255, 214, 10, 0.15)',
          }}
        />
      )}

      <DashboardHeader />

      {/* Health Pills */}
      <div
        className="animate-fade-in-up"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 28,
          animationDelay: '0.05s',
        }}
      >
        {health?.dependencies && Object.keys(health.dependencies).length > 0 ? (
          Object.entries(health.dependencies).map(([name, status]) => (
            <HealthPill key={name} name={name} status={status} />
          ))
        ) : (
          <>
            <HealthPill name="API Gateway" status="ok" />
            <HealthPill name="OpenAI" status="ok" />
            <HealthPill name="Anthropic" status="ok" />
            <HealthPill name="Google AI" status="warning" />
            <HealthPill name="DeepSeek" status="error" />
            <HealthPill name="本地 LLM" status="info" />
          </>
        )}
      </div>

      <StatCardsRow loading={isLoading} costSummary={costSummary} health={health} />
      <ChartsRow loading={isLoading} dailyCosts={dailyCosts} costSummary={costSummary} />
      <RequestVolumeChart loading={isLoading} dailyCosts={dailyCosts} />
      <ModelTable />
    </div>
  );
};

export default Dashboard;
