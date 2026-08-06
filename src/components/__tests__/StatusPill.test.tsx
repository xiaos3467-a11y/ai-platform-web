/**
 * StatusPill & HealthPill — semantic status badges.
 *
 * StatusPill:
 *   - Known statuses render the correct icon + text.
 *   - Unknown statuses fall back to the "pending" config.
 *   - Custom config overrides the default map.
 *
 * HealthPill:
 *   - ok / healthy / warning / error / info state mapping.
 *   - Aliases: ok → healthy, degraded → warning, down → error, maintenance → info.
 *   - Unknown status → error (defensive).
 *   - Pulse animation only for certain states.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import StatusPill, { HealthPill, DEFAULT_STATUS_CONFIG } from '../StatusPill';
import type { StatusPillConfig } from '../StatusPill';

// ── StatusPill ──────────────────────────────────────────────────────

describe('StatusPill', () => {
  it('renders "完成" for status=completed', () => {
    render(<StatusPill status="completed" />);
    expect(screen.getByText(/完成/)).toBeInTheDocument();
  });

  it('renders "运行中" for status=running', () => {
    render(<StatusPill status="running" />);
    expect(screen.getByText(/运行中/)).toBeInTheDocument();
  });

  it('renders "已发布" for status=published', () => {
    render(<StatusPill status="published" />);
    expect(screen.getByText(/已发布/)).toBeInTheDocument();
  });

  it('renders "失败" for status=failed', () => {
    render(<StatusPill status="failed" />);
    expect(screen.getByText(/失败/)).toBeInTheDocument();
  });

  it('renders "草稿" for status=draft', () => {
    render(<StatusPill status="draft" />);
    expect(screen.getByText(/草稿/)).toBeInTheDocument();
  });

  it('renders "暂停" for status=paused', () => {
    render(<StatusPill status="paused" />);
    expect(screen.getByText(/暂停/)).toBeInTheDocument();
  });

  it('renders "等待" for status=pending', () => {
    render(<StatusPill status="pending" />);
    expect(screen.getByText(/等待/)).toBeInTheDocument();
  });

  it('renders "处理中" for status=processing', () => {
    render(<StatusPill status="processing" />);
    expect(screen.getByText(/处理中/)).toBeInTheDocument();
  });

  it('renders "就绪" for status=ready', () => {
    render(<StatusPill status="ready" />);
    expect(screen.getByText(/就绪/)).toBeInTheDocument();
  });

  it('falls back to pending config for unknown status', () => {
    render(<StatusPill status="something_new" />);
    expect(screen.getByText(/等待/)).toBeInTheDocument();
  });

  it('accepts custom config overriding defaults', () => {
    const custom: Record<string, StatusPillConfig> = {
      ...DEFAULT_STATUS_CONFIG,
      custom_status: {
        bg: 'rgb(0, 0, 0)',
        border: 'rgb(0, 0, 0)',
        color: 'rgb(255, 255, 255)',
        icon: <span>★</span>,
        text: '自定义',
      },
    };
    render(<StatusPill status="custom_status" config={custom} />);
    expect(screen.getByText(/自定义/)).toBeInTheDocument();
    expect(screen.getByText('★')).toBeInTheDocument();
  });

  it('uses pending fallback from custom config when status missing', () => {
    const custom: Record<string, StatusPillConfig> = {
      pending: {
        bg: '#eee',
        border: '#ccc',
        color: '#333',
        icon: <span>○</span>,
        text: 'Fallback',
      },
    };
    render(<StatusPill status="anything" config={custom} />);
    expect(screen.getByText(/Fallback/)).toBeInTheDocument();
  });

  it('applies the color from the config to the pill text', () => {
    const { container } = render(<StatusPill status="completed" />);
    const pill = container.querySelector('span') as HTMLElement;
    expect(pill.style.color).toBe('rgb(48, 209, 88)');
  });
});

// ── HealthPill ──────────────────────────────────────────────────────

describe('HealthPill', () => {
  it('renders name and "正常" for status=ok', () => {
    render(<HealthPill name="API Gateway" status="ok" />);
    expect(screen.getByText(/API Gateway/)).toBeInTheDocument();
    expect(screen.getByText(/正常/)).toBeInTheDocument();
  });

  it('renders "服务正常" for status=healthy', () => {
    render(<HealthPill name="DB" status="healthy" />);
    expect(screen.getByText(/服务正常/)).toBeInTheDocument();
  });

  it('renders "响应缓慢" for status=warning', () => {
    render(<HealthPill name="Cache" status="warning" />);
    expect(screen.getByText(/响应缓慢/)).toBeInTheDocument();
  });

  it('renders "服务中断" for status=error', () => {
    render(<HealthPill name="LLM" status="error" />);
    expect(screen.getByText(/服务中断/)).toBeInTheDocument();
  });

  it('renders "维护中" for status=info', () => {
    render(<HealthPill name="Worker" status="info" />);
    expect(screen.getByText(/维护中/)).toBeInTheDocument();
  });

  it('maps "degraded" alias to warning', () => {
    render(<HealthPill name="Proxy" status="degraded" />);
    expect(screen.getByText(/响应缓慢/)).toBeInTheDocument();
  });

  it('maps "down" alias to error', () => {
    render(<HealthPill name="Proxy" status="down" />);
    expect(screen.getByText(/服务中断/)).toBeInTheDocument();
  });

  it('maps "maintenance" alias to info', () => {
    render(<HealthPill name="Proxy" status="maintenance" />);
    expect(screen.getByText(/维护中/)).toBeInTheDocument();
  });

  it('unknown status defaults to error', () => {
    render(<HealthPill name="Mystery" status="???" />);
    expect(screen.getByText(/服务中断/)).toBeInTheDocument();
  });

  it('renders name with separator', () => {
    render(<HealthPill name="API" status="ok" />);
    expect(screen.getByText(/API · 正常/)).toBeInTheDocument();
  });
});
