/**
 * EmptyState — Zero-data placeholder
 * — Centered layout with a rounded glass icon badge, a title, an
 *   optional description, and an optional CTA.
 * — Used on: Agents, Users, Roles, ModelProviders, Prompts,
 *   KnowledgeBases, Workflows, Evaluations (8 pages).
 */

import React from 'react';
import { Button } from 'antd';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => (
  <div style={{ textAlign: 'center', padding: '80px 24px' }}>
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 20,
        margin: '0 auto 16px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '0.5px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        color: 'rgba(255, 255, 255, 0.15)',
      }}
    >
      {icon}
    </div>
    <div
      style={{
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.3)',
        fontWeight: 500,
        marginBottom: 8,
      }}
    >
      {title}
    </div>
    {description && (
      <div
        style={{
          fontSize: 13,
          color: 'rgba(255, 255, 255, 0.15)',
          marginBottom: 24,
        }}
      >
        {description}
      </div>
    )}
    {actionText && onAction && (
      <Button type="primary" onClick={onAction}>
        {actionText}
      </Button>
    )}
  </div>
);

export default EmptyState;
