/**
 * Skeleton loaders — Glass-card–backed loading placeholders
 * — CardSkeleton: generic card placeholder (table / section containers).
 * — StatCardSkeleton: stat-tile placeholder.
 * — SectionCardSkeleton: section-card placeholder (taller paragraph).
 * — TableSkeleton: same as CardSkeleton with standard table padding.
 *
 * Extracted from Dashboard, Costs, KnowledgeBases, and the inline
 * loading state duplicated on Agents, Users, Roles, Prompts, and
 * ModelProviders.
 */

import React from 'react';
import { Card, Skeleton } from 'antd';

const glassCardBase: React.CSSProperties = {
  borderRadius: 16,
  border: '0.5px solid var(--border-subtle)',
  background: 'var(--bg-card)',
};

export const CardSkeleton: React.FC = () => (
  <Card style={glassCardBase} styles={{ body: { padding: 24 } }}>
    <Skeleton active paragraph={{ rows: 6 }} />
  </Card>
);

export const StatCardSkeleton: React.FC = () => (
  <Card style={glassCardBase} styles={{ body: { padding: '24px 28px' } }}>
    <Skeleton active paragraph={{ rows: 1 }} title={{ width: 100 }} />
  </Card>
);

export const SectionCardSkeleton: React.FC = () => (
  <Card style={glassCardBase} styles={{ body: { padding: 24 } }}>
    <Skeleton active paragraph={{ rows: 6 }} />
  </Card>
);

export const TableSkeleton: React.FC = () => (
  <Card style={glassCardBase} styles={{ body: { padding: 24 } }}>
    <Skeleton active paragraph={{ rows: 6 }} />
  </Card>
);

export default CardSkeleton;
