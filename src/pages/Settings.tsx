/** System settings — Apple glass aesthetic */

import React, { useEffect, useState } from 'react';
import { Space, Row, Col, Button, App, Alert } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  KeyOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';
import type { HealthStatus } from '@/types';
import { SectionCard, SectionCardSkeleton, PageHeader, LanguageSwitcher } from '@/components';

import { radius } from '@/styles/themeTokens';

/* ─── Main ────────────────────────────────────────────────────────── */
const Settings: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  const fetchHealth = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const health = await api.post<HealthStatus>('/health', {}, signal);
      setHealth(health.data);
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code?: string }).code === 'ERR_CANCELED'
      )
        return;
      message.error('无法获取系统状态');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchHealth(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  const depEntries = health?.dependencies ? Object.entries(health.dependencies) : [];

  return (
    <div>
      <PageHeader
        title="系统设置"
        subtitle="服务状态与安全配置"
        breadcrumb={[{ label: '系统设置' }]}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchHealth()}
            loading={loading}
            style={{ borderRadius: radius.md }}
          >
            刷新状态
          </Button>
        }
      />

      {loading ? (
        <Row gutter={[20, 20]}>
          {[1, 2].map((i) => (
            <Col xs={24} lg={12} key={i}>
              <SectionCardSkeleton />
            </Col>
          ))}
        </Row>
      ) : (
        <>
          {/* System Info + Component Status */}
          <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
            <Col xs={24} lg={12}>
              <SectionCard title="系统信息" icon={<SettingOutlined />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: '服务名称', value: health?.service },
                    { label: '环境', value: health?.env },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '0.5px solid var(--border-divider)',
                      }}
                    >
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '0.5px solid var(--border-divider)',
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>版本</span>
                    <span
                      style={{
                        padding: '2px 10px',
                        borderRadius: radius.sm,
                        background: 'rgba(10,132,255,0.1)',
                        border: '0.5px solid rgba(10,132,255,0.2)',
                        fontSize: 13,
                        color: '#0a84ff',
                        fontWeight: 500,
                      }}
                    >
                      {health?.version}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>语言</span>
                    <LanguageSwitcher />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>整体状态</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 10px',
                        borderRadius: radius.sm,
                        background:
                          health?.status === 'ok' ? 'rgba(48,209,88,0.08)' : 'rgba(255,69,58,0.08)',
                        border: `0.5px solid ${health?.status === 'ok' ? 'rgba(48,209,88,0.2)' : 'rgba(255,69,58,0.2)'}`,
                        fontSize: 13,
                        fontWeight: 500,
                        color: health?.status === 'ok' ? '#30d158' : '#ff453a',
                      }}
                    >
                      {health?.status === 'ok' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      {health?.status === 'ok' ? '正常' : '异常'}
                    </span>
                  </div>
                </div>
              </SectionCard>
            </Col>

            <Col xs={24} lg={12}>
              <SectionCard title="组件状态">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {depEntries.map(([name, status]) => {
                    const isOk = status === 'ok';
                    return (
                      <div
                        key={name}
                        className="card-hover"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 16px',
                          borderRadius: radius.md,
                          background: isOk ? 'rgba(48,209,88,0.04)' : 'rgba(255,69,58,0.04)',
                          border: `0.5px solid ${isOk ? 'rgba(48,209,88,0.12)' : 'rgba(255,69,58,0.12)'}`,
                        }}
                      >
                        <Space>
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: isOk ? '#30d158' : '#ff453a',
                              boxShadow: isOk
                                ? '0 0 6px rgba(48,209,88,0.5)'
                                : '0 0 6px rgba(255,69,58,0.5)',
                            }}
                          />
                          <span
                            style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}
                          >
                            {name}
                          </span>
                        </Space>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: isOk ? '#30d158' : '#ff453a',
                          }}
                        >
                          {isOk ? '正常' : '异常'}
                        </span>
                      </div>
                    );
                  })}
                  {depEntries.length === 0 && (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '20px 0',
                        color: 'var(--text-tertiary)',
                        fontSize: 14,
                      }}
                    >
                      暂无组件数据
                    </div>
                  )}
                </div>
              </SectionCard>
            </Col>
          </Row>

          {/* API Keys */}
          <SectionCard title="API Key 管理" icon={<KeyOutlined />} style={{ marginBottom: 20 }}>
            <Alert
              message="API Key 安全说明"
              description="所有 API Key 通过后台管理界面添加，使用 AES-256-GCM 加密存储在数据库中。服务端运行时动态解密，密钥从不以明文形式出现在日志、环境变量或配置文件中。"
              type="info"
              showIcon
              icon={<KeyOutlined />}
              style={{
                marginBottom: 20,
                borderRadius: radius.md,
                background: 'rgba(10,132,255,0.06)',
                border: '0.5px solid rgba(10,132,255,0.15)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: '认证方式', value: 'JWT（用户级）+ API Key（应用级）双模式' },
                { label: '加密算法', value: 'AES-256-GCM（密钥由 APP_SECRET_KEY 派生）' },
                { label: '密钥管理', value: '通过 /api/v1/models/providers API 增删改查' },
                { label: '脱敏显示', value: '列表接口返回 sk-a...z789 格式' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 14px',
                    borderRadius: radius.sm,
                    background: 'var(--bg-subtle)',
                    border: '0.5px solid var(--border-divider)',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      maxWidth: '60%',
                      textAlign: 'right',
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Infrastructure */}
          <SectionCard title="基础设施" icon={<CloudServerOutlined />}>
            <Row gutter={[12, 12]}>
              {[
                {
                  name: 'PostgreSQL',
                  icon: <DatabaseOutlined />,
                  desc: '主数据库（16张表）',
                  gradient: 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
                },
                {
                  name: 'Redis',
                  icon: <DatabaseOutlined />,
                  desc: '缓存 / 限流 / 会话',
                  gradient: 'linear-gradient(135deg, #ff453a, #ff6961)',
                },
                {
                  name: 'Milvus',
                  icon: <DatabaseOutlined />,
                  desc: '向量数据库（文档 Embedding）',
                  gradient: 'linear-gradient(135deg, #30d158, #34c759)',
                },
                {
                  name: 'Elasticsearch',
                  icon: <DatabaseOutlined />,
                  desc: 'BM25 关键词检索',
                  gradient: 'linear-gradient(135deg, #ffd60a, #ff9f0a)',
                },
                {
                  name: 'LiteLLM',
                  icon: <CloudServerOutlined />,
                  desc: 'AI Gateway（模型代理）',
                  gradient: 'linear-gradient(135deg, #5e5ce6, #bf5af2)',
                },
                {
                  name: 'Langfuse',
                  icon: <CloudServerOutlined />,
                  desc: 'LLM 可观测性（Tracing）',
                  gradient: 'linear-gradient(135deg, #64d2ff, #0a84ff)',
                },
              ].map((item) => (
                <Col xs={12} sm={8} key={item.name}>
                  <div
                    className="card-hover"
                    style={{
                      padding: '16px',
                      borderRadius: radius.md,
                      background: 'var(--bg-subtle)',
                      border: '0.5px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      height: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: radius.md,
                        background: item.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </SectionCard>
        </>
      )}
    </div>
  );
};

export default Settings;
