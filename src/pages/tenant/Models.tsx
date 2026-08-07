/** Tenant available models — read-only display */

import React from 'react';
import { Typography, Tag, Row, Col } from 'antd';
import { CloudServerOutlined } from '@ant-design/icons';
import { useApiListQuery } from '@/hooks/useApiQuery';
import { GlassCard, TableSkeleton } from '@/components';
import type { TenantAvailableModel } from '@/types';

import { radius } from '@/styles/themeTokens';
const { Title, Text } = Typography;

const TenantModels: React.FC = () => {
  const { data: models, isLoading } = useApiListQuery<TenantAvailableModel>({
    queryKey: ['tenant', 'models'],
    endpoint: '/tenant/self/models/list',
  });

  if (isLoading) {
    return (
      <GlassCard>
        <TableSkeleton />
      </GlassCard>
    );
  }

  const items = models?.items || [];

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          可用模型
        </Title>
        <Text type="secondary">由平台管理员配置的可用 AI 模型</Text>
      </div>

      {items.length === 0 ? (
        <GlassCard>
          <span style={{ color: "var(--text-faint)", padding: 24 }}>暂无可用模型</span>
        </GlassCard>
      ) : (
        <Row gutter={[16, 16]}>
          {items.map((model) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={model.name}>
              <GlassCard
                style={{
                  padding: 20,
                  borderRadius: radius.lg,
                  background: 'var(--bg-card)',
                  border: '0.5px solid var(--border-subtle)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: radius.md,
                      background: 'linear-gradient(135deg, #5e5ce6, #bf5af2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 16,
                    }}
                  >
                    <CloudServerOutlined />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 14, display: 'block' }}>
                      {model.display_name || model.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {model.provider}
                    </Text>
                  </div>
                </div>
                <div>
                  <Tag
                    color={model.status === 'available' ? 'green' : 'default'}
                    style={{ fontSize: 11 }}
                  >
                    {model.status === 'available' ? '可用' : '不可用'}
                  </Tag>
                  {model.quota_remaining !== null && (
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                      剩余配额：{model.quota_remaining.toLocaleString()}
                    </Text>
                  )}
                </div>
                <Text code style={{ fontSize: 11 }}>
                  {model.name}
                </Text>
              </GlassCard>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default TenantModels;
