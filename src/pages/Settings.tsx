/** System settings */

import React, { useEffect, useState } from 'react';
import {
  Card, Typography, Descriptions, Tag, Space, Row, Col, Spin,
  Table, Button, App, Form, Input, Divider, Alert,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined,
  KeyOutlined, DatabaseOutlined, CloudServerOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';
import type { HealthStatus } from '@/types';

const { Title, Text } = Typography;

const Settings: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const resp = await api.get<HealthStatus>('/health');
      setHealth(resp.data);
    } catch {
      message.error('无法获取系统状态');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchHealth(); }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  }

  const depEntries = health?.dependencies ? Object.entries(health.dependencies) : [];
  const allOk = depEntries.every(([, status]) => status === 'ok');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>系统设置</Title>
        <Button icon={<ReloadOutlined />} onClick={fetchHealth}>刷新状态</Button>
      </div>

      {/* System Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="系统信息">
            <Descriptions column={1}>
              <Descriptions.Item label="服务名称">{health?.service}</Descriptions.Item>
              <Descriptions.Item label="版本">
                <Tag color="blue">{health?.version}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="环境">
                <Tag color={health?.env === 'production' ? 'red' : 'green'}>{health?.env}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="整体状态">
                <Tag
                  color={health?.status === 'ok' ? 'success' : 'error'}
                  icon={health?.status === 'ok' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                >
                  {health?.status === 'ok' ? '正常' : '异常'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="组件状态">
            <Space direction="vertical" style={{ width: '100%' }}>
              {depEntries.map(([name, status]) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: status === 'ok' ? '#f6ffed' : '#fff2f0',
                    border: `1px solid ${status === 'ok' ? '#b7eb8f' : '#ffa39e'}`,
                  }}
                >
                  <Space>
                    {status === 'ok' ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    )}
                    <Text strong>{name}</Text>
                  </Space>
                  <Tag color={status === 'ok' ? 'success' : 'error'}>
                    {status === 'ok' ? '正常' : '异常'}
                  </Tag>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* API Keys */}
      <Card title="API Key 管理" style={{ marginTop: 16 }}>
        <Alert
          message="API Key 安全说明"
          description="所有 API Key 通过后台管理界面添加，使用 AES-256-GCM 加密存储在数据库中。服务端运行时动态解密，密钥从不以明文形式出现在日志、环境变量或配置文件中。"
          type="info"
          showIcon
          icon={<KeyOutlined />}
          style={{ marginBottom: 16 }}
        />
        <Descriptions column={1} size="small">
          <Descriptions.Item label="认证方式">JWT（用户级）+ API Key（应用级）双模式</Descriptions.Item>
          <Descriptions.Item label="加密算法">AES-256-GCM（密钥由 APP_SECRET_KEY 派生）</Descriptions.Item>
          <Descriptions.Item label="密钥管理">通过 /api/v1/models/providers API 增删改查</Descriptions.Item>
          <Descriptions.Item label="脱敏显示">列表接口返回 sk-a...z789 格式</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Infrastructure */}
      <Card title="基础设施" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          {[
            { name: 'PostgreSQL', icon: <DatabaseOutlined />, desc: '主数据库（16张表）' },
            { name: 'Redis', icon: <DatabaseOutlined />, desc: '缓存 / 限流 / 会话' },
            { name: 'Milvus', icon: <DatabaseOutlined />, desc: '向量数据库（文档 Embedding）' },
            { name: 'Elasticsearch', icon: <DatabaseOutlined />, desc: 'BM25 关键词检索' },
            { name: 'LiteLLM', icon: <CloudServerOutlined />, desc: 'AI Gateway（模型代理）' },
            { name: 'Langfuse', icon: <CloudServerOutlined />, desc: 'LLM 可观测性（Tracing）' },
          ].map((item) => (
            <Col xs={12} sm={8} key={item.name} style={{ marginBottom: 12 }}>
              <Card size="small">
                <Space>
                  {item.icon}
                  <div>
                    <Text strong>{item.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default Settings;
