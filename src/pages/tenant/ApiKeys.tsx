/** Tenant API Key management */

import React, { useState, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  App,
  Tag,
  Tooltip,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useApiListQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks/useApiMutation';
import { GlassCard, TableSkeleton } from '@/components';
import type { TenantApiKey, TenantAvailableModel } from '@/types';
import { API_KEY_PERMISSIONS } from '@/types';
import dayjs from 'dayjs';

import { radius } from '@/styles/themeTokens';
const { Title, Text } = Typography;
const { TextArea } = Input;

const TenantApiKeys: React.FC = () => {
  const { message, modal } = App.useApp();
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createOpen, setCreateOpen] = useState(false);
  const [editKey, setEditKey] = useState<TenantApiKey | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const { data: keys, isLoading } = useApiListQuery<TenantApiKey>({
    queryKey: ['tenant', 'api-keys'],
    endpoint: '/tenant/self/api-keys',
  });

  const { data: availableModels } = useApiListQuery<TenantAvailableModel>({
    queryKey: ['tenant', 'models'],
    endpoint: '/tenant/self/models',
  });

  const createMutation = useApiMutation<{ id: string; key: string }, Record<string, unknown>>({
    method: 'post',
    endpoint: '/tenant/self/api-keys',
    invalidateKeys: [['tenant', 'api-keys']],
    onSuccess: (data) => {
      message.success('API Key 创建成功');
      setCreateOpen(false);
      createForm.resetFields();
      // Show the full key once
      setRevealedKey(data.key);
    },
  });

  const updateMutation = useApiMutation<TenantApiKey, Record<string, unknown>>({
    method: 'put',
    endpoint: (vars) => `/tenant/self/api-keys/${vars.id as string}`,
    invalidateKeys: [['tenant', 'api-keys']],
    onSuccess: () => {
      message.success('API Key 已更新');
      setEditKey(null);
    },
  });

  const deleteMutation = useApiMutation<void, { id: string }>({
    method: 'delete',
    endpoint: (vars) => `/tenant/self/api-keys/${vars.id}`,
    invalidateKeys: [['tenant', 'api-keys']],
    onSuccess: () => {
      message.success('API Key 已删除');
    },
  });

  const rotateMutation = useApiMutation<{ new_key: string }, { id: string }>({
    method: 'post',
    endpoint: (vars) => `/tenant/self/api-keys/${vars.id}/rotate`,
    invalidateKeys: [['tenant', 'api-keys']],
    onSuccess: (data) => {
      message.success('API Key 已轮换，旧 Key 将在 24 小时后失效');
      setRevealedKey(data.new_key);
    },
  });

  const handleCreate = useCallback(() => {
    createForm.validateFields().then((values) => {
      const payload = {
        ...values,
        ip_whitelist: values.ip_whitelist
          ? values.ip_whitelist
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
        expires_at: values.expires_at ? values.expires_at.toISOString() : null,
      };
      createMutation.mutate(payload);
    });
  }, [createForm, createMutation]);

  const handleEdit = useCallback(() => {
    if (!editKey) return;
    editForm.validateFields().then((values) => {
      const payload = {
        id: editKey.id,
        ...values,
        ip_whitelist: values.ip_whitelist
          ? values.ip_whitelist
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
        expires_at: values.expires_at ? values.expires_at.toISOString() : null,
      };
      updateMutation.mutate(payload);
    });
  }, [editKey, editForm, updateMutation]);

  const handleDelete = useCallback(
    (key: TenantApiKey) => {
      modal.confirm({
        title: '确认删除',
        content: `确定要删除 API Key「${key.name}」吗？此操作不可恢复。`,
        okText: '删除',
        cancelText: '取消',
        okButtonProps: { danger: true },
        onOk: () => deleteMutation.mutate({ id: key.id }),
      });
    },
    [modal, deleteMutation],
  );

  const handleRotate = useCallback(
    (key: TenantApiKey) => {
      modal.confirm({
        title: '轮换 API Key',
        content: `轮换后将生成新的 Key，旧 Key 在 24 小时内仍可用。确定要轮换「${key.name}」吗？`,
        okText: '确认轮换',
        cancelText: '取消',
        onOk: () => rotateMutation.mutate({ id: key.id }),
      });
    },
    [modal, rotateMutation],
  );

  const columns: ColumnsType<TenantApiKey> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Key 前缀',
      dataIndex: 'key_prefix',
      key: 'key_prefix',
      width: 150,
      render: (prefix: string) => (
        <Text code style={{ fontSize: 12 }}>
          {prefix}***
        </Text>
      ),
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 220,
      render: (perms: string[]) => (
        <Space size={2} wrap>
          {perms.slice(0, 3).map((p) => (
            <Tag key={p} style={{ fontSize: 11 }}>
              {p}
            </Tag>
          ))}
          {perms.length > 3 && <Tag>+{perms.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_enabled',
      key: 'is_enabled',
      width: 80,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'default'}>{enabled ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '最后使用',
      dataIndex: 'last_used_at',
      key: 'last_used_at',
      width: 160,
      render: (v: string | null) =>
        v ? dayjs(v).format('YYYY-MM-DD HH:mm') : <Text type="secondary">从未使用</Text>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditKey(record);
                editForm.setFieldsValue({
                  name: record.name,
                  permissions: record.permissions,
                  allowed_models: record.allowed_models,
                  ip_whitelist: record.ip_whitelist?.join(', ') || '',
                });
              }}
            />
          </Tooltip>
          <Tooltip title="轮换">
            <Button size="small" type="text" icon={<ReloadOutlined />} onClick={() => handleRotate(record)} />
          </Tooltip>
          <Tooltip title="删除">
            <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const modelOptions = (availableModels?.items || []).map((m) => ({
    value: m.name,
    label: `${m.display_name || m.name} (${m.provider})`,
  }));

  if (isLoading) {
    return (
      <GlassCard>
        <TableSkeleton />
      </GlassCard>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            API Key 管理
          </Title>
          <Text type="secondary">管理用于调用 API 的密钥</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          创建 Key
        </Button>
      </div>

      <GlassCard>
        <Table<TenantApiKey>
          columns={columns}
          dataSource={keys?.items || []}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
          size="middle"
          locale={{ emptyText: <span style={{ color: "var(--text-faint)", padding: 24 }}>暂无 API Key</span> }}
        />
      </GlassCard>

      {/* ─── Create Modal ────────────────────────────────────────────── */}
      <Modal
        title="创建 API Key"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        confirmLoading={createMutation.isPending}
        okText="创建"
        cancelText="取消"
        width={600}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入 Key 名称' }]}
          >
            <Input placeholder="例如：Production API Key" />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="权限"
            rules={[{ required: true, message: '请选择至少一个权限' }]}
          >
            <Select
              mode="multiple"
              placeholder="选择权限"
              options={API_KEY_PERMISSIONS.map((p) => ({ value: p, label: p }))}
            />
          </Form.Item>
          <Form.Item name="allowed_models" label="可用模型">
            <Select
              mode="multiple"
              placeholder="不选则使用租户所有可用模型"
              options={modelOptions}
            />
          </Form.Item>
          <Form.Item name="expires_at" label="过期时间">
            <DatePicker showTime style={{ width: '100%' }} placeholder="不设置则永不过期" />
          </Form.Item>
          <Form.Item name="ip_whitelist" label="IP 白名单">
            <TextArea
              rows={2}
              placeholder="逗号分隔，例如：192.168.1.0/24, 10.0.0.1"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ─── Edit Modal ──────────────────────────────────────────────── */}
      <Modal
        title="编辑 API Key"
        open={!!editKey}
        onCancel={() => setEditKey(null)}
        onOk={handleEdit}
        confirmLoading={updateMutation.isPending}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="permissions" label="权限" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              options={API_KEY_PERMISSIONS.map((p) => ({ value: p, label: p }))}
            />
          </Form.Item>
          <Form.Item name="allowed_models" label="可用模型">
            <Select mode="multiple" options={modelOptions} />
          </Form.Item>
          <Form.Item name="expires_at" label="过期时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ip_whitelist" label="IP 白名单">
            <TextArea rows={2} placeholder="逗号分隔 IP 地址" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ─── Revealed Key Modal ──────────────────────────────────────── */}
      <Modal
        title="API Key 已创建"
        open={!!revealedKey}
        onCancel={() => setRevealedKey(null)}
        footer={[
          <Button
            key="copy"
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => {
              if (revealedKey) {
                navigator.clipboard.writeText(revealedKey);
                message.success('已复制到剪贴板');
              }
            }}
          >
            复制 Key
          </Button>,
          <Button key="close" onClick={() => setRevealedKey(null)}>
            关闭
          </Button>,
        ]}
      >
        <div style={{ marginTop: 12 }}>
          <Text type="warning" strong>
            ⚠️ 请立即复制保存，此 Key 仅显示一次！
          </Text>
          <div
            style={{
              marginTop: 12,
              padding: 12,
              background: 'var(--bg-elevated)',
              borderRadius: radius.sm,
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              fontSize: 13,
              border: '1px solid var(--border-subtle)',
            }}
          >
            {revealedKey}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TenantApiKeys;
