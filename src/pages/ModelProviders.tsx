/** Model Providers management — CRUD table */

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space,
  Card, Typography, Switch, Popconfirm, App, Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { api } from '@/api/client';
import type { Provider, ProviderCreateRequest } from '@/types';

const { Title } = Typography;
const { Option } = Select;

const PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI', color: 'green' },
  { value: 'anthropic', label: 'Anthropic (Claude)', color: 'purple' },
  { value: 'qwen', label: '通义千问 (Qwen)', color: 'blue' },
  { value: 'deepseek', label: 'DeepSeek', color: 'cyan' },
  { value: 'ollama', label: 'Ollama (本地)', color: 'orange' },
  { value: 'vllm', label: 'vLLM (私有部署)', color: 'volcano' },
];

const ModelProviders: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const resp = await api.get<Provider[]>('/models/providers');
      setProviders(resp.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleCreate = async (values: ProviderCreateRequest) => {
    try {
      await api.post('/models/providers', values);
      message.success('Provider 添加成功（API Key 已加密存储）');
      setModalOpen(false);
      form.resetFields();
      fetchProviders();
    } catch {
      // error handled by interceptor
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await api.put(`/models/providers/${id}/toggle?enabled=${enabled}`);
    message.success(enabled ? '已启用' : '已禁用');
    fetchProviders();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/models/providers/${id}`);
    message.success('已删除');
    fetchProviders();
  };

  const columns = [
    {
      title: '提供商',
      dataIndex: 'provider_name',
      render: (name: string) => {
        const opt = PROVIDER_OPTIONS.find((p) => p.value === name);
        return <Tag color={opt?.color}>{opt?.label || name}</Tag>;
      },
    },
    { title: '显示名称', dataIndex: 'display_name' },
    { title: 'API 地址', dataIndex: 'api_base_url', render: (v: string) => v || '-' },
    {
      title: 'API Key',
      dataIndex: 'api_key_display',
      render: (key: string, record: Provider) => {
        if (!key) return '-';
        const visible = showKeys[record.id];
        return (
          <Space>
            <code>{visible ? key : key.replace(/[^.…]/g, '•')}</code>
            <Tooltip title={visible ? '隐藏' : '显示'}>
              <Button
                type="text"
                size="small"
                icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setShowKeys({ ...showKeys, [record.id]: !visible })}
              />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: '模型',
      dataIndex: 'models',
      render: (models: { name: string }[]) => (
        <Space wrap>
          {models?.map((m) => (
            <Tag key={m.name}>{m.name}</Tag>
          ))}
        </Space>
      ),
    },
    { title: '优先级', dataIndex: 'priority', width: 80 },
    {
      title: '状态',
      dataIndex: 'is_enabled',
      width: 100,
      render: (enabled: boolean, record: Provider) => (
        <Switch checked={enabled} onChange={(v) => handleToggle(record.id, v)} />
      ),
    },
    {
      title: '操作',
      width: 80,
      render: (_: unknown, record: Provider) => (
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>模型提供商</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchProviders}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            添加 Provider
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          dataSource={providers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="添加模型提供商"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="provider_name" label="提供商" rules={[{ required: true }]}>
            <Select placeholder="选择提供商">
              {PROVIDER_OPTIONS.map((p) => (
                <Option key={p.value} value={p.value}>{p.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="display_name" label="显示名称">
            <Input placeholder="如：公司私有 Qwen" />
          </Form.Item>
          <Form.Item name="api_base_url" label="API Base URL">
            <Input placeholder="留空使用默认地址" />
          </Form.Item>
          <Form.Item
            name="api_key"
            label="API Key"
            extra="密钥将通过 AES-256-GCM 加密后存储在数据库中"
          >
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
