/**
 * ModelProviders — Apple glass aesthetic
 *
 * Enhanced: model configuration via Form.List with per-model purposes,
 * enable/disable toggles, and cost tracking.
 */

import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
  Switch,
  App,
  Tooltip,
  Tag,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ApiOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import type { Provider, ProviderCreateRequest, ModelConfig, ModelPurpose } from '@/types';
import { PURPOSE_META, ALL_PURPOSES } from '@/types';
import { GlassCard, EmptyState, TableSkeleton } from '@/components';
import { useApiQuery, useApiMutation } from '@/hooks';

import { radius } from '@/styles/themeTokens';
const { Title, Text } = Typography;
const { Option } = Select;

/* ─── Provider display metadata ──────────────────────────────────── */

const PROVIDER_META: Record<string, { label: string; gradient: string }> = {
  openai: { label: 'OpenAI', gradient: 'linear-gradient(135deg, #30d158, #34c759)' },
  anthropic: { label: 'Anthropic', gradient: 'linear-gradient(135deg, #bf5af2, #5e5ce6)' },
  qwen: { label: 'Qwen', gradient: 'linear-gradient(135deg, #0a84ff, #5e5ce6)' },
  deepseek: { label: 'DeepSeek', gradient: 'linear-gradient(135deg, #64d2ff, #0a84ff)' },
  ollama: { label: 'Ollama', gradient: 'linear-gradient(135deg, #ff9f0a, #ffd60a)' },
  vllm: { label: 'vLLM', gradient: 'linear-gradient(135deg, #ff453a, #ff6961)' },
};

const PROVIDERS_KEY = ['models', 'providers'];

/* ─── Helpers ─────────────────────────────────────────────────────── */

/** Map PURPOSE_META.color (any string) → AntD Tag color. */
function mapTagColor(c: string): string {
  const ok = new Set([
    'blue',
    'green',
    'purple',
    'orange',
    'cyan',
    'red',
    'yellow',
    'pink',
    'magenta',
    'volcano',
    'gold',
    'lime',
    'geekblue',
    'default',
  ]);
  return ok.has(c) ? c : 'default';
}

/**
 * Normalize a ModelConfig to ensure new fields have safe defaults
 * (backward compatibility with older backend data).
 */
function normalizeModel(m: ModelConfig): ModelConfig {
  return {
    ...m,
    purposes: m.purposes && m.purposes.length > 0 ? m.purposes : (['general'] as ModelPurpose[]),
    enabled: m.enabled !== undefined ? m.enabled : true,
    cost_per_1k_input: m.cost_per_1k_input,
    cost_per_1k_output: m.cost_per_1k_output,
    context_length: m.context_length,
  };
}

/* ─── Model config card (used inside Form.List) ─────────────────── */

const ModelConfigCard: React.FC<{
  fieldKey: number;
  fieldName: number;
  onRemove: () => void;
}> = ({ fieldKey, fieldName, onRemove }) => (
  <div
    style={{
      padding: 16,
      borderRadius: radius.md,
      border: '0.5px solid var(--border-subtle)',
      background: 'var(--bg-card)',
      marginBottom: 12,
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}
      >
        模型 {fieldKey + 1}
      </Text>
      <Button
        type="text"
        size="small"
        danger
        icon={<DeleteOutlined />}
        onClick={onRemove}
      />
    </div>

    {/* Row 1 — name + context length */}
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
      <Form.Item
        name={[fieldName, 'name']}
        label="模型名称"
        rules={[{ required: true, message: '请输入模型名称' }]}
        style={{ marginBottom: 12 }}
      >
        <Input placeholder="如 gpt-4o" />
      </Form.Item>
      <Form.Item
        name={[fieldName, 'context_length']}
        label="上下文长度"
        style={{ marginBottom: 12 }}
      >
        <InputNumber min={1} style={{ width: '100%' }} placeholder="128000" />
      </Form.Item>
    </div>

    {/* Row 2 — purposes */}
    <Form.Item
      name={[fieldName, 'purposes']}
      label="用途"
      initialValue={['llm']}
      style={{ marginBottom: 12 }}
    >
      <Select mode="multiple" placeholder="选择模型用途">
        {ALL_PURPOSES.map((p) => (
          <Option key={p} value={p}>
            <Tag
              color={mapTagColor(PURPOSE_META[p].color)}
              style={{ marginRight: 4, fontSize: 11 }}
            >
              {PURPOSE_META[p].label}
            </Tag>
          </Option>
        ))}
      </Select>
    </Form.Item>

    {/* Row 3 — enabled + costs */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr 1fr',
        gap: 12,
        alignItems: 'end',
      }}
    >
      <Form.Item
        name={[fieldName, 'enabled']}
        label="启用"
        valuePropName="checked"
        initialValue={true}
        style={{ marginBottom: 0 }}
      >
        <Switch size="small" />
      </Form.Item>
      <Form.Item
        name={[fieldName, 'cost_per_1k_input']}
        label="输入成本 ($/1k)"
        style={{ marginBottom: 0 }}
      >
        <InputNumber min={0} step={0.001} style={{ width: '100%' }} placeholder="0.005" />
      </Form.Item>
      <Form.Item
        name={[fieldName, 'cost_per_1k_output']}
        label="输出成本 ($/1k)"
        style={{ marginBottom: 0 }}
      >
        <InputNumber min={0} step={0.001} style={{ width: '100%' }} placeholder="0.015" />
      </Form.Item>
    </div>
  </div>
);

/* ─── Model chips for the table "模型" column ───────────────────── */

const ModelChipsInTable: React.FC<{
  models: ModelConfig[];
  providerId: string;
  onToggle: (modelName: string, enabled: boolean) => void;
}> = ({ models, providerId, onToggle }) => {
  if (!models || models.length === 0) {
    return <Text style={{ color: 'var(--text-faint)', fontSize: 12 }}>暂无模型</Text>;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        maxWidth: 420,
      }}
    >
      {models.map((m) => {
        const enabled = m.enabled !== false;
        const purposes: ModelPurpose[] =
          m.purposes && m.purposes.length > 0 ? m.purposes : ['general'];

        return (
          <div
            key={m.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 10px',
              borderRadius: radius.sm,
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border-subtle)',
              opacity: enabled ? 1 : 0.55,
              transition: 'opacity 0.2s ease',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-primary)',
                textDecoration: enabled ? 'none' : 'line-through',
                flexShrink: 0,
              }}
            >
              {m.name}
            </Text>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
              {purposes.slice(0, 3).map((p) => {
                const meta = PURPOSE_META[p];
                if (!meta) return null;
                return (
                  <Tag
                    key={p}
                    color={mapTagColor(meta.color)}
                    style={{
                      marginRight: 0,
                      fontSize: 10,
                      lineHeight: '16px',
                      padding: '0 5px',
                    }}
                  >
                    {meta.label}
                  </Tag>
                );
              })}
            </div>
            <Tooltip title={enabled ? '点击禁用' : '点击启用'}>
              <Switch
                size="small"
                checked={enabled}
                onChange={(v) => onToggle(m.name, v)}
                style={{ flexShrink: 0 }}
              />
            </Tooltip>
          </div>
        );
      })}
      {models.some((m) => !m.purposes || m.purposes.length === 0) && (
        <Text style={{ fontSize: 10, color: 'var(--text-faint)' }}>
          旧数据 — 用途视为"通用"
        </Text>
      )}
      {/* hidden key so React reconciler keys on provider */}
      <span key={providerId} style={{ display: 'none' }} />
    </div>
  );
};

/* ─── Main page ─────────────────────────────────────────────────── */

const ModelProviders: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Provider | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();

  // ─── Data fetching ─────────────────────────────────────────────
  const { data: providers = [], isLoading } = useApiQuery<Provider[]>({
    queryKey: PROVIDERS_KEY,
    endpoint: '/models/providers',
  });

  // ─── Mutations ─────────────────────────────────────────────────
  const createMutation = useApiMutation<Provider, ProviderCreateRequest>({
    method: 'post',
    endpoint: '/models/providers',
    invalidateKeys: [PROVIDERS_KEY],
  });

  const updateMutation = useApiMutation<Provider, { id: string; data: Partial<Provider> }>({
    method: 'put',
    endpoint: (v) => `/models/providers/${v.id}`,
    invalidateKeys: [PROVIDERS_KEY],
  });

  const toggleMutation = useApiMutation<Provider, { id: string; enabled: boolean }>({
    method: 'put',
    endpoint: ({ id, enabled }) => `/models/providers/${id}/toggle?enabled=${enabled}`,
    invalidateKeys: [PROVIDERS_KEY],
  });

  const deleteMutation = useApiMutation<Provider, string>({
    method: 'delete',
    endpoint: (id) => `/models/providers/${id}`,
    invalidateKeys: [PROVIDERS_KEY],
  });

  /** Toggle an individual model within a provider. */
  const toggleModelMutation = useApiMutation<
    unknown,
    { providerId: string; modelName: string; enabled: boolean }
  >({
    method: 'post',
    endpoint: ({ providerId, modelName }) =>
      `/models/providers/${providerId}/models/${modelName}/toggle`,
    invalidateKeys: [PROVIDERS_KEY],
  });

  // ─── Handlers ──────────────────────────────────────────────────
  const handleCreate = async (values: ProviderCreateRequest) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        message.success('Provider 添加成功（API Key 已加密存储）');
        setModalOpen(false);
        form.resetFields();
      },
    });
  };

  const openEdit = (record: Provider) => {
    setEditTarget(record);
    setEditModalOpen(true);
  };

  const handleEdit = async (values: {
    display_name?: string;
    api_base_url?: string;
    models?: ModelConfig[];
    priority?: number;
  }) => {
    if (!editTarget) return;
    updateMutation.mutate(
      {
        id: editTarget.id,
        data: {
          display_name: values.display_name,
          api_base_url: values.api_base_url,
          models: values.models,
          priority: values.priority,
        } as Partial<Provider>,
      },
      {
        onSuccess: () => {
          message.success('Provider 更新成功');
          setEditModalOpen(false);
          setEditTarget(null);
          editForm.resetFields();
        },
      },
    );
  };

  const handleToggle = (id: string, enabled: boolean) => {
    toggleMutation.mutate(
      { id, enabled },
      {
        onSuccess: () => message.success(enabled ? '已启用' : '已禁用'),
      },
    );
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: '删除 Provider',
      content: '确认删除此提供商？所有相关模型配置将一并移除。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () =>
        new Promise<void>((resolve) => {
          deleteMutation.mutate(id, {
            onSuccess: () => {
              message.success('已删除');
              resolve();
            },
            onError: () => resolve(),
          });
        }),
    });
  };

  const handleModelToggle = (providerId: string, modelName: string, enabled: boolean) => {
    toggleModelMutation.mutate(
      { providerId, modelName, enabled },
      {
        onSuccess: () => message.success(enabled ? `已启用 ${modelName}` : `已禁用 ${modelName}`),
      },
    );
  };

  const columns = useMemo(
    () => [
      {
        title: '提供商',
        dataIndex: 'provider_name',
        render: (name: string) => {
          const meta = PROVIDER_META[name] || {
            label: name,
            gradient: 'linear-gradient(135deg, #6e6e73, #a1a1a6)',
          };
          return (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radius.sm,
                  background: meta.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 12,
                }}
              >
                <ApiOutlined />
              </div>
              {meta.label}
            </span>
          );
        },
      },
      {
        title: '显示名称',
        dataIndex: 'display_name',
        render: (v: string) => <span style={{ color: 'var(--text-muted)' }}>{v || '-'}</span>,
      },
      {
        title: 'API 地址',
        dataIndex: 'api_base_url',
        render: (v: string) => (
          <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            {v || '-'}
          </span>
        ),
      },
      {
        title: 'API Key',
        dataIndex: 'api_key_display',
        render: (key: string, record: Provider) => {
          if (!key) return <span style={{ color: 'var(--text-faint)' }}>-</span>;
          const visible = showKeys[record.id];
          return (
            <Space>
              <code
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                  padding: '2px 6px',
                  borderRadius: radius.sm,
                  background: 'var(--bg-card)',
                }}
              >
                {visible ? key : key.replace(/[^.…]/g, '•')}
              </code>
              <Tooltip title={visible ? '隐藏' : '显示'}>
                <Button
                  type="text"
                  size="small"
                  icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => setShowKeys({ ...showKeys, [record.id]: !visible })}
                  style={{ color: 'var(--text-subtle)' }}
                />
              </Tooltip>
            </Space>
          );
        },
      },
      {
        title: '模型',
        dataIndex: 'models',
        render: (models: ModelConfig[], record: Provider) => (
          <ModelChipsInTable
            models={models}
            providerId={record.id}
            onToggle={(name, enabled) => handleModelToggle(record.id, name, enabled)}
          />
        ),
      },
      {
        title: '已启用',
        width: 100,
        render: (_: unknown, record: Provider) => {
          const total = record.models?.length ?? 0;
          const enabled =
            record.models?.filter((m) => m.enabled !== false).length ?? 0;
          return (
            <Text
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: enabled > 0 ? 'var(--color-success, #30d158)' : 'var(--text-muted)',
              }}
            >
              {enabled}/{total}
            </Text>
          );
        },
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        width: 80,
        render: (v: number) => <span style={{ color: 'var(--text-muted)' }}>{v}</span>,
      },
      {
        title: '状态',
        dataIndex: 'is_enabled',
        width: 80,
        render: (enabled: boolean, record: Provider) => (
          <Switch checked={enabled} onChange={(v) => handleToggle(record.id, v)} size="small" />
        ),
      },
      {
        title: '',
        width: 90,
        render: (_: unknown, record: Provider) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              aria-label="编辑"
              onClick={() => openEdit(record)}
            />
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              aria-label="删除"
              danger
              onClick={() => handleDelete(record.id)}
            />
          </div>
        ),
      },
    ],
    [showKeys],
  );

  /* Edit form default values — computed from editTarget */
  const editInitialValues = useMemo(() => {
    if (!editTarget) return {};
    return {
      display_name: editTarget.display_name,
      api_base_url: editTarget.api_base_url,
      priority: editTarget.priority,
      models: (editTarget.models ?? []).map(normalizeModel),
    };
  }, [editTarget]);

  return (
    <div>
      {/* Page title */}
      <div
        className="animate-fade-in-up"
        style={{
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
            }}
          >
            模型提供商
          </Title>
          <Text
            style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              marginTop: 6,
              display: 'block',
            }}
          >
            配置 LLM API 接入与模型用途
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => queryClient.invalidateQueries({ queryKey: PROVIDERS_KEY })}
            style={{ borderRadius: radius.md }}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
            style={{
              height: 44,
              paddingInline: 20,
              borderRadius: radius.md,
              fontWeight: 500,
            }}
          >
            添加 Provider
          </Button>
        </Space>
      </div>

      {/* Table */}
      {isLoading ? (
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
            <Table
              dataSource={providers}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </GlassCard>
      )}

      {/* ─── Create Modal ────────────────────────────────────────── */}
      <Modal
        title="添加模型提供商"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={680}
        okText="添加"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ priority: 0, models: [] }}
        >
          <Form.Item name="provider_name" label="提供商" rules={[{ required: true }]}>
            <Select placeholder="选择提供商">
              {Object.entries(PROVIDER_META).map(([value, meta]) => (
                <Option key={value} value={value}>
                  {meta.label}
                </Option>
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

          <Divider style={{ margin: '8px 0 16px' }}>
            <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>模型配置</Text>
          </Divider>

          <Form.List name="models">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <ModelConfigCard
                    key={field.key}
                    fieldKey={field.key}
                    fieldName={field.name}
                    onRemove={() => remove(field.name)}
                  />
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{ borderRadius: radius.md }}
                >
                  添加模型
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* ─── Edit Modal ──────────────────────────────────────────── */}
      <Modal
        title="编辑模型提供商"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditTarget(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        width={680}
        okText="保存"
        cancelText="取消"
        /* Force remount when editTarget changes so initialValues populate Form.List correctly */
        key={editTarget?.id ?? 'new'}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
          initialValues={editInitialValues}
        >
          <Form.Item label="提供商">
            <Input
              value={editTarget?.provider_name}
              disabled
              style={{
                background: 'var(--bg-subtle)',
                color: 'var(--text-secondary)',
              }}
            />
          </Form.Item>
          <Form.Item name="display_name" label="显示名称">
            <Input placeholder="如：公司私有 Qwen" />
          </Form.Item>
          <Form.Item name="api_base_url" label="API Base URL">
            <Input placeholder="留空使用默认地址" style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Divider style={{ margin: '8px 0 16px' }}>
            <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>模型配置</Text>
          </Divider>

          <Form.List name="models">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <ModelConfigCard
                    key={field.key}
                    fieldKey={field.key}
                    fieldName={field.name}
                    onRemove={() => remove(field.name)}
                  />
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{ borderRadius: radius.md }}
                >
                  添加模型
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelProviders;
