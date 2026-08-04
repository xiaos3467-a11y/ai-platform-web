/** Model Providers — Apple glass aesthetic */

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Space,
  Typography, Switch, App, Tooltip,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, ReloadOutlined,
  EyeOutlined, EyeInvisibleOutlined, ApiOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';
import type { Provider, ProviderCreateRequest } from '@/types';
import { GlassCard, EmptyState, TableSkeleton } from '@/components';

const { Title, Text } = Typography;
const { Option } = Select;

const PROVIDER_META: Record<string, { label: string; gradient: string }> = {
  openai: { label: 'OpenAI', gradient: 'linear-gradient(135deg, #30d158, #34c759)' },
  anthropic: { label: 'Anthropic', gradient: 'linear-gradient(135deg, #bf5af2, #5e5ce6)' },
  qwen: { label: 'Qwen', gradient: 'linear-gradient(135deg, #0a84ff, #5e5ce6)' },
  deepseek: { label: 'DeepSeek', gradient: 'linear-gradient(135deg, #64d2ff, #0a84ff)' },
  ollama: { label: 'Ollama', gradient: 'linear-gradient(135deg, #ff9f0a, #ffd60a)' },
  vllm: { label: 'vLLM', gradient: 'linear-gradient(135deg, #ff453a, #ff6961)' },
};

const ModelProviders: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();

  const fetchProviders = async () => {
    setLoading(true);
    try { const resp = await api.get<Provider[]>('/models/providers'); setProviders(resp.data || []); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleCreate = async (values: ProviderCreateRequest) => {
    try {
      await api.post('/models/providers', values);
      message.success('Provider 添加成功（API Key 已加密存储）');
      setModalOpen(false);
      form.resetFields();
      fetchProviders();
    } catch { /* handled */ }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try { await api.put(`/models/providers/${id}/toggle?enabled=${enabled}`); message.success(enabled ? '已启用' : '已禁用'); fetchProviders(); } catch { /* */ }
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: '删除 Provider',
      content: '确认删除此提供商？所有相关模型配置将一并移除。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => { await api.delete(`/models/providers/${id}`); message.success('已删除'); fetchProviders(); },
    });
  };

  const columns = [
    { title: '提供商', dataIndex: 'provider_name', render: (name: string) => {
      const meta = PROVIDER_META[name] || { label: name, gradient: 'linear-gradient(135deg, #6e6e73, #a1a1a6)' };
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, color: '#f5f5f7' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 9, background: meta.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12,
          }}>
            <ApiOutlined />
          </div>
          {meta.label}
        </span>
      );
    }},
    { title: '显示名称', dataIndex: 'display_name', render: (v: string) => <span style={{ color: '#a1a1a6' }}>{v || '-'}</span> },
    { title: 'API 地址', dataIndex: 'api_base_url', render: (v: string) => (
      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>{v || '-'}</span>
    )},
    { title: 'API Key', dataIndex: 'api_key_display', render: (key: string, record: Provider) => {
      if (!key) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>-</span>;
      const visible = showKeys[record.id];
      return (
        <Space>
          <code style={{ fontSize: 12, color: '#a1a1a6', fontFamily: 'monospace', padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)' }}>
            {visible ? key : key.replace(/[^.…]/g, '•')}
          </code>
          <Tooltip title={visible ? '隐藏' : '显示'}>
            <Button
              type="text"
              size="small"
              icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => setShowKeys({ ...showKeys, [record.id]: !visible })}
              style={{ color: 'rgba(255,255,255,0.3)' }}
            />
          </Tooltip>
        </Space>
      );
    }},
    { title: '模型', dataIndex: 'models', render: (models: { name: string }[]) => (
      <span style={{ color: '#a1a1a6', fontSize: 13 }}>{models?.length || 0} 个</span>
    )},
    { title: '优先级', dataIndex: 'priority', width: 80, render: (v: number) => <span style={{ color: '#a1a1a6' }}>{v}</span> },
    { title: '状态', dataIndex: 'is_enabled', width: 80, render: (enabled: boolean, record: Provider) => (
      <Switch checked={enabled} onChange={(v) => handleToggle(record.id, v)} size="small" />
    )},
    { title: '', width: 50, render: (_: unknown, record: Provider) => (
      <div
        onClick={() => handleDelete(record.id)}
        className="icon-action icon-action--muted icon-action--red"
      >
        <DeleteOutlined />
      </div>
    )},
  ];

  return (
    <div>
      {/* Page title */}
      <div className="animate-fade-in-up" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, fontSize: 34, letterSpacing: '-0.04em', color: '#f5f5f7' }}>模型提供商</Title>
          <Text style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)', marginTop: 6, display: 'block' }}>配置 LLM API 接入</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchProviders} style={{ borderRadius: 10 }}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ height: 44, paddingInline: 20, borderRadius: 12, fontWeight: 500 }}>
            添加 Provider
          </Button>
        </Space>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <GlassCard animate styles={{ body: { padding: 0 } }}>
          {providers.length === 0 ? (
            <EmptyState
              icon={<ApiOutlined />}
              title="还没有配置提供商"
              description="添加一个 LLM 提供商来开始使用 AI 功能"
              actionText="添加第一个 Provider"
              onAction={() => setModalOpen(true)}
            />
          ) : (
            <Table dataSource={providers} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
          )}
        </GlassCard>
      )}

      {/* Create Modal */}
      <Modal
        title="添加模型提供商"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        width={600}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="provider_name" label="提供商" rules={[{ required: true }]}>
            <Select placeholder="选择提供商">
              {Object.entries(PROVIDER_META).map(([value, meta]) => (
                <Option key={value} value={value}>{meta.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="display_name" label="显示名称">
            <Input placeholder="如：公司私有 Qwen" />
          </Form.Item>
          <Form.Item name="api_base_url" label="API Base URL">
            <Input placeholder="留空使用默认地址" style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item name="api_key" label="API Key" extra="密钥将通过 AES-256-GCM 加密存储">
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue={0}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelProviders;
