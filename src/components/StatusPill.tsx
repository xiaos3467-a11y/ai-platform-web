/**
 * StatusPill — semantic status badge
 * — Inline pill with icon + colored background/border.
 * — Includes a built-in config for common workflow / KB / request
 *   statuses; pass a custom `config` to extend or override.
 * — Extracted from Workflows.tsx and KnowledgeBases.tsx.
 *
 * Also exports HealthPill — used for system-dependency indicators
 * on the Dashboard. HealthPill supports 4 semantic states:
 * healthy / warning / error / info — with an animated pulsing dot.
 *
 * Design reference: design/mockups/components.html § 5
 */

import React from 'react';
import { radius } from '@/styles/themeTokens';
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

const StatusPill: React.FC<StatusPillProps> = ({ status, config = DEFAULT_STATUS_CONFIG }) => {
  const c = config[status] || config.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: radius.sm,
        background: c.bg,
        border: `0.5px solid ${c.border}`,
        fontSize: 12,
        fontWeight: 500,
        color: c.color,
        transition: 'all 0.2s ease',
      }}
    >
      {c.icon} {c.text}
    </span>
  );
};

export default StatusPill;

/* ─── HealthPill ──────────────────────────────────────────────────── */
/* 4-state semantic indicator used on the Dashboard.
   healthy = green pulsing dot
   warning = yellow dot
   error   = red dot
   info    = blue pulsing dot
*/

export type HealthState = 'healthy' | 'warning' | 'error' | 'info';

export interface HealthPillProps {
  name: string;
  status: string;
}

const HEALTH_STATE_MAP: Record<
  string,
  { color: string; bg: string; border: string; text: string; pulse: boolean }
> = {
  ok: {
    color: 'var(--color-success)',
    bg: 'rgba(48, 209, 88, 0.08)',
    border: 'rgba(48, 209, 88, 0.2)',
    text: '正常',
    pulse: true,
  },
  healthy: {
    color: 'var(--color-success)',
    bg: 'rgba(48, 209, 88, 0.08)',
    border: 'rgba(48, 209, 88, 0.2)',
    text: '服务正常',
    pulse: true,
  },
  warning: {
    color: 'var(--color-warning)',
    bg: 'rgba(255, 214, 10, 0.08)',
    border: 'rgba(255, 214, 10, 0.2)',
    text: '响应缓慢',
    pulse: false,
  },
  error: {
    color: 'var(--color-error)',
    bg: 'rgba(255, 69, 58, 0.08)',
    border: 'rgba(255, 69, 58, 0.2)',
    text: '服务中断',
    pulse: false,
  },
  info: {
    color: 'var(--color-primary)',
    bg: 'rgba(10, 132, 255, 0.08)',
    border: 'rgba(10, 132, 255, 0.2)',
    text: '维护中',
    pulse: true,
  },
};

function resolveHealthState(status: string) {
  if (HEALTH_STATE_MAP[status]) return { state: status, ...HEALTH_STATE_MAP[status] };
  if (status === 'ok') return { state: 'healthy', ...HEALTH_STATE_MAP.ok };
  if (status === 'degraded') return { state: 'warning', ...HEALTH_STATE_MAP.warning };
  if (status === 'down') return { state: 'error', ...HEALTH_STATE_MAP.error };
  if (status === 'maintenance') return { state: 'info', ...HEALTH_STATE_MAP.info };
  return { state: 'error', ...HEALTH_STATE_MAP.error };
}

export const HealthPill: React.FC<HealthPillProps> = ({ name, status }) => {
  const h = resolveHealthState(status);
  return (
    <div
      className="hover-lift"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        borderRadius: radius.sm,
        background: h.bg,
        border: `0.5px solid ${h.border}`,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.02em',
        color: h.color,
        transition: 'transform 0.2s ease',
      }}
    >
      {/* Pulsing status dot */}
      <div style={{ position: 'relative', width: 6, height: 6, flexShrink: 0 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: h.color,
            boxShadow: `0 0 6px ${h.color}`,
          }}
        />
        {h.pulse && (
          <div
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: '50%',
              background: h.color,
              opacity: 0.4,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        )}
      </div>
      <span style={{ color: 'inherit' }}>
        {name} · {h.text}
      </span>
    </div>
  );
};
