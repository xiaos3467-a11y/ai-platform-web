/**
 * ModelTable — static mock table of model usage, styled with CSS hover classes.
 */

import React from 'react';
import { ThunderboltOutlined } from '@ant-design/icons';
import { SectionCard } from '@/components';
import { HealthPill } from '@/components';

import { radius } from '@/styles/themeTokens';
const MOCK_MODELS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    code: 'gpt-4o-2024-08-06',
    provider: 'OpenAI',
    providerColor: 'blue' as const,
    icon: '🧠',
    gradient: 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
    requests: 524301,
    tokens: '3.2M',
    cost: '¥1,247.50',
    status: 'ok',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    code: 'claude-3-5-sonnet',
    provider: 'Anthropic',
    providerColor: 'green' as const,
    icon: '🤖',
    gradient: 'linear-gradient(135deg, #30d158, #34c759)',
    requests: 412887,
    tokens: '2.8M',
    cost: '¥987.30',
    status: 'ok',
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    code: 'gemini-1-5-pro',
    provider: 'Google',
    providerColor: 'yellow' as const,
    icon: '✨',
    gradient: 'linear-gradient(135deg, #ffd60a, #ff9f0a)',
    requests: 198422,
    tokens: '1.4M',
    cost: '¥423.80',
    status: 'warning',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    code: 'deepseek-v3',
    provider: 'DeepSeek',
    providerColor: 'red' as const,
    icon: '🔥',
    gradient: 'linear-gradient(135deg, #ff453a, #ff6961)',
    requests: 148893,
    tokens: '0.98M',
    cost: '¥189.20',
    status: 'error',
  },
];

const PROVIDER_TAG_STYLES: Record<string, React.CSSProperties> = {
  blue: {
    color: '#0a84ff',
    background: 'rgba(10, 132, 255, 0.1)',
    border: '0.5px solid rgba(10, 132, 255, 0.2)',
  },
  green: {
    color: '#30d158',
    background: 'rgba(48, 209, 88, 0.1)',
    border: '0.5px solid rgba(48, 209, 88, 0.2)',
  },
  yellow: {
    color: '#ffd60a',
    background: 'rgba(255, 214, 10, 0.1)',
    border: '0.5px solid rgba(255, 214, 10, 0.2)',
  },
  red: {
    color: '#ff453a',
    background: 'rgba(255, 69, 58, 0.1)',
    border: '0.5px solid rgba(255, 69, 58, 0.2)',
  },
};

const ModelTable: React.FC = () => (
  <div className="animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
    <SectionCard
      title="模型列表"
      subtitle="按请求数排序"
      icon={<ThunderboltOutlined style={{ color: 'var(--color-primary)' }} />}
    >
      <div style={{ overflowX: 'auto', margin: '-8px -24px -8px', padding: '0 24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr>
              {['模型', '提供商', '请求数', 'Token', '成本', '状态', '操作'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '14px 16px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: 'var(--bg-elevated)',
                    borderBottom: '0.5px solid var(--border-divider)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_MODELS.map((m) => (
              <tr
                key={m.id}
                className="model-table-row"
                style={{ transition: 'background 0.2s ease' }}
              >
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '0.5px solid var(--border-divider)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: radius.sm,
                        background: m.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {m.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{m.code}</div>
                    </div>
                  </div>
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '0.5px solid var(--border-divider)',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      padding: '3px 8px',
                      borderRadius: radius.sm,
                      ...PROVIDER_TAG_STYLES[m.providerColor],
                    }}
                  >
                    {m.provider}
                  </span>
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '0.5px solid var(--border-divider)',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  {m.requests.toLocaleString()}
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '0.5px solid var(--border-divider)',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  {m.tokens}
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '0.5px solid var(--border-divider)',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  {m.cost}
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '0.5px solid var(--border-divider)',
                  }}
                >
                  <HealthPill name="" status={m.status} />
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '0.5px solid var(--border-divider)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      title="编辑"
                      className="icon-btn-edit"
                      style={{
                        padding: 4,
                        borderRadius: radius.sm,
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        fontSize: 14,
                        transition: 'all 0.2s ease',
                        background: 'none',
                        border: 'none',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      title="删除"
                      className="icon-btn-delete"
                      style={{
                        padding: 4,
                        borderRadius: radius.sm,
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        fontSize: 14,
                        transition: 'all 0.2s ease',
                        background: 'none',
                        border: 'none',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  </div>
);

export default ModelTable;
