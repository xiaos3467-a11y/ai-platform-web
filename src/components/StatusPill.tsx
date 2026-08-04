/**
 * StatusPill — semantic status badge
 * — Inline pill with icon + colored background/border.
 * — Includes a built-in config for common workflow / KB / request
 *   statuses; pass a custom `config` to extend or override.
 * — Extracted from Workflows.tsx and KnowledgeBases.tsx.
 *
 * Also exports HealthPill — a binary (ok / error) variant used for
 * system-dependency indicators on the Dashboard.
 */

import React from 'react';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

/* ─── StatusPill ──────────────────────────────────────────────────── */

export interface StatusPillConfig {
  bg: string;
  border: string;
  color: string;
  icon: React.ReactNode;
  text: string;
}

export const DEFAULT_STATUS_CONFIG: Record<string, StatusPillConfig> = {
  completed: {
    bg: 'rgba(48, 209, 88, 0.08)',
    border: 'rgba(48, 209, 88, 0.2)',
    color: '#30d158',
    icon: <CheckCircleOutlined />,
    text: '完成',
  },
  running: {
    bg: 'rgba(10, 132, 255, 0.08)',
    border: 'rgba(10, 132, 255, 0.2)',
    color: '#0a84ff',
    icon: <SyncOutlined spin />,
    text: '运行中',
  },
  published: {
    bg: 'rgba(48, 209, 88, 0.08)',
    border: 'rgba(48, 209, 88, 0.2)',
    color: '#30d158',
    icon: <CheckCircleOutlined />,
    text: '已发布',
  },
  ready: {
    bg: 'rgba(48, 209, 88, 0.08)',
    border: 'rgba(48, 209, 88, 0.2)',
    color: '#30d158',
    icon: <CheckCircleOutlined />,
    text: '就绪',
  },
  processing: {
    bg: 'rgba(10, 132, 255, 0.08)',
    border: 'rgba(10, 132, 255, 0.2)',
    color: '#0a84ff',
    icon: <SyncOutlined spin />,
    text: '处理中',
  },
  draft: {
    bg: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(255, 255, 255, 0.08)',
    color: '#6e6e73',
    icon: <ClockCircleOutlined />,
    text: '草稿',
  },
  paused: {
    bg: 'rgba(255, 214, 10, 0.08)',
    border: 'rgba(255, 214, 10, 0.2)',
    color: '#ffd60a',
    icon: <ClockCircleOutlined />,
    text: '暂停',
  },
  failed: {
    bg: 'rgba(255, 69, 58, 0.08)',
    border: 'rgba(255, 69, 58, 0.2)',
    color: '#ff453a',
    icon: <CloseCircleOutlined />,
    text: '失败',
  },
  pending: {
    bg: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(255, 255, 255, 0.08)',
    color: '#6e6e73',
    icon: <ClockCircleOutlined />,
    text: '等待',
  },
};

export interface StatusPillProps {
  status: string;
  /** Override / extend the built-in status map. */
  config?: Record<string, StatusPillConfig>;
}

const StatusPill: React.FC<StatusPillProps> = ({
  status,
  config = DEFAULT_STATUS_CONFIG,
}) => {
  const c = config[status] || config.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 8,
        background: c.bg,
        border: `0.5px solid ${c.border}`,
        fontSize: 12,
        fontWeight: 500,
        color: c.color,
      }}
    >
      {c.icon} {c.text}
    </span>
  );
};

export default StatusPill;

/* ─── HealthPill ──────────────────────────────────────────────────── */
/* Binary ok / error indicator used on the Dashboard. */

export interface HealthPillProps {
  name: string;
  status: string;
}

export const HealthPill: React.FC<HealthPillProps> = ({ name, status }) => {
  const isOk = status === 'ok';
  return (
    <div
      className="hover-lift"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderRadius: 10,
        background: isOk ? 'rgba(48, 209, 88, 0.08)' : 'rgba(255, 69, 58, 0.08)',
        border: `0.5px solid ${isOk ? 'rgba(48, 209, 88, 0.2)' : 'rgba(255, 69, 58, 0.2)'}`,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: isOk ? '#30d158' : '#ff453a',
          boxShadow: isOk
            ? '0 0 6px rgba(48, 209, 88, 0.5)'
            : '0 0 6px rgba(255, 69, 58, 0.5)',
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
