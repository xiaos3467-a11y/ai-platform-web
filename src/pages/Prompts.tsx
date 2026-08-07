/** Prompt management — Apple glass aesthetic */

import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Space, Typography, App, Drawer } from 'antd';
import {
  PlusOutlined,
  HistoryOutlined,
  CodeOutlined,
  SwapOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';
import type { PromptTemplate, PromptVersion } from '@/types';
import { GlassCard, EmptyState, TableSkeleton } from '@/components';

import { radius } from '@/styles/themeTokens';
const { Title, Text } = Typography;
const { TextArea } = Input;

/* ─── Version timeline item ───────────────────────────────────────── */
const VersionItem: React.FC<{ v: PromptVersion; isCurrent: boolean }> = ({ v, isCurrent }) => (
  <div
    style={{
      padding: '12px 16px',
      borderRadius: radius.md,
      background: isCurrent ? 'rgba(10,132,255,0.06)' : 'var(--bg-subtle)',
      border: `0.5px solid ${isCurrent ? 'rgba(10,132,255,0.15)' : 'var(--border-divider)'}`,
      marginBottom: 8,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span
        style={{
          padding: '2px 8px',
          borderRadius: radius.sm,
          fontSize: 12,
          fontWeight: 500,
          background: isCurrent ? 'rgba(10,132,255,0.15)' : 'var(--bg-elevated-2)',
          color: isCurrent ? '#0a84ff' : '#a1a1a6',
        }}
      >
        v{v.version}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
        {new Date(v.created_at).toLocaleString()}
      </span>
      {isCurrent && (
        <span style={{ fontSize: 11, color: '#0a84ff', fontWeight: 500 }}>当前版本</span>
      )}
    </div>
    {v.change_note && (
      <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 6 }}>
        {v.change_note}
      </div>
    )}
    <pre
      style={{
        fontSize: 11,
        fontFamily: 'monospace',
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-divider)',
        padding: 8,
        borderRadius: radius.sm,
        maxHeight: 100,
        overflow: 'auto',
        color: 'var(--text-muted)',
        margin: 0,
      }}
    >
      {v.content.slice(0, 200)}
      {v.content.length > 200 ? '...' : ''}
    </pre>
  </div>
);

/* ─── Main ────────────────────────────────────────────────────────── */
const Prompts: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [renderOpen, setRenderOpen] = useState(false);
  const [newVersionOpen, setNewVersionOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [rendered, setRendered] = useState('');
  const [renderVars, setRenderVars] = useState('{}');
  const [renderLoading, setRenderLoading] = useState(false);
  const [form] = Form.useForm();
  const [newVersionForm] = Form.useForm();
  const { message } = App.useApp();

  const fetchPrompts = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const resp = await api.post<{ items: PromptTemplate[]; total: number }>(
        '/prompts/list',
        {},
        signal,
      );
      setPrompts(resp.data?.items || []);
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code?: string }).code === 'ERR_CANCELED'
      )
        return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchPrompts(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  const handleCreate = async (values: { name: string; content: string; description?: string }) => {
    try {
      await api.post('/prompts/create', values);
      message.success('Prompt 模板创建成功');
      setCreateOpen(false);
      form.resetFields();
      fetchPrompts();
    } catch {
      /* handled */
    }
  };

  const handleCreateVersion = async (values: { content: string; change_note?: string }) => {
    if (!selectedPrompt) return;
    try {
      await api.post(`/prompts/versions/create`, {
        prompt_id: selectedPrompt.id,
        content: values.content,
        change_note: values.change_note || '从管理后台更新',
      });
      message.success('新版本创建成功');
      setNewVersionOpen(false);
      newVersionForm.resetFields();
      fetchVersions(selectedPrompt.id);
      fetchPrompts();
    } catch {
      /* handled */
    }
  };

  const fetchVersions = async (promptId: string) => {
    try {
      const resp = await api.post<PromptVersion[]>(`/prompts/versions/list`, { prompt_id: promptId });
      setVersions(resp.data || []);
    } catch {
      /* */
    }
  };

  const handleRender = async () => {
    if (!selectedPrompt) return;
    try {
      const vars = JSON.parse(renderVars);
      setRenderLoading(true);
      const resp = await api.post<{ rendered: string }>(`/prompts/render`, {
        prompt_id: selectedPrompt.id,
        variables: vars,
      });
      setRendered(resp.data?.rendered || '');
    } catch (e) {
      if (e instanceof SyntaxError) message.error('变量格式错误，请使用合法的 JSON');
    } finally {
      setRenderLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: '名称',
        dataIndex: 'name',
        render: (name: string) => (
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
                background: 'linear-gradient(135deg, #ff9f0a, #ffd60a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 13,
              }}
            >
              <FileTextOutlined />
            </div>
            {name}
          </span>
        ),
      },
      {
        title: '描述',
        dataIndex: 'description',
        render: (v: string) => (
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{v || '-'}</span>
        ),
      },
      {
        title: '版本',
        dataIndex: 'current_version',
        render: (v: number) => (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: radius.sm,
              background: 'rgba(10,132,255,0.1)',
              border: '0.5px solid rgba(10,132,255,0.2)',
              fontSize: 12,
              color: '#0a84ff',
              fontWeight: 500,
            }}
          >
            v{v}
          </span>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        render: (v: string) => (
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {new Date(v).toLocaleString()}
          </span>
        ),
      },
      {
        title: '',
        width: 160,
        render: (_: unknown, record: PromptTemplate) => (
          <Space>
            <Button
              size="small"
              icon={<CodeOutlined />}
              onClick={() => {
                setSelectedPrompt(record);
                setRenderOpen(true);
                setRendered('');
              }}
              style={{ borderRadius: radius.sm, fontSize: 12 }}
            >
              渲染
            </Button>
            <Button
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => {
                setSelectedPrompt(record);
                setVersionsOpen(true);
                fetchVersions(record.id);
              }}
              style={{ borderRadius: radius.sm, fontSize: 12 }}
            >
              版本
            </Button>
          </Space>
        ),
      },
    ],
    [],
  );

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
            Prompt 管理
          </Title>
          <Text
            style={{ fontSize: 17, color: 'var(--text-secondary)', marginTop: 6, display: 'block' }}
          >
            模板化提示词，版本化管理
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
          style={{ height: 44, paddingInline: 20, borderRadius: radius.md, fontWeight: 500 }}
        >
          创建模板
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <GlassCard animate styles={{ body: { padding: 0 } }}>
          {prompts.length === 0 ? (
            <EmptyState
              icon={<FileTextOutlined />}
              title="还没有 Prompt 模板"
              description="创建模板来复用提示词，支持变量替换"
              actionText="创建第一个模板"
              onAction={() => setCreateOpen(true)}
            />
          ) : (
            <Table dataSource={prompts} columns={columns} rowKey="id" />
          )}
        </GlassCard>
      )}

      {/* Create Modal */}
      <Modal
        title="创建 Prompt 模板"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        width={700}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="如：客服回复模板" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="模板用途描述..." />
          </Form.Item>
          <Form.Item
            name="content"
            label="模板内容 (Jinja2)"
            rules={[{ required: true }]}
            extra="支持 {{variable}}、{% if %}、{% for %} 语法"
          >
            <TextArea
              rows={10}
              placeholder="你是一个{{role}}。请回答：{{question}}"
              style={{ fontFamily: 'monospace', borderRadius: radius.md }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Versions Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HistoryOutlined style={{ fontSize: 16, color: '#0a84ff' }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedPrompt?.name} — 版本历史
            </span>
          </div>
        }
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              newVersionForm.resetFields();
              setNewVersionOpen(true);
            }}
            style={{ borderRadius: radius.md }}
          >
            创建新版本
          </Button>
        </div>
        {versions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-subtle)' }}>
            暂无版本记录
          </div>
        ) : (
          versions.map((v) => (
            <VersionItem
              key={v.version}
              v={v}
              isCurrent={v.version === selectedPrompt?.current_version}
            />
          ))
        )}
      </Drawer>

      {/* New Version Modal */}
      <Modal
        title={`创建新版本 — ${selectedPrompt?.name || ''}`}
        open={newVersionOpen}
        onCancel={() => setNewVersionOpen(false)}
        onOk={() => newVersionForm.submit()}
        width={700}
        okText="创建"
        cancelText="取消"
      >
        <Form form={newVersionForm} layout="vertical" onFinish={handleCreateVersion}>
          <Form.Item
            name="content"
            label="模板内容"
            rules={[{ required: true, message: '请输入模板内容' }]}
          >
            <TextArea
              rows={10}
              placeholder="模板内容..."
              style={{ fontFamily: 'monospace', borderRadius: radius.md }}
            />
          </Form.Item>
          <Form.Item name="change_note" label="变更说明">
            <Input placeholder="简述本次变更..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Render Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SwapOutlined style={{ fontSize: 16, color: '#0a84ff' }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              渲染 {selectedPrompt?.name}
            </span>
          </div>
        }
        open={renderOpen}
        onClose={() => setRenderOpen(false)}
        width={600}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-soft)', marginBottom: 8 }}
            >
              变量 (JSON)
            </div>
            <TextArea
              value={renderVars}
              onChange={(e) => setRenderVars(e.target.value)}
              rows={5}
              style={{ fontFamily: 'monospace', borderRadius: radius.md }}
              placeholder='{"role": "助手", "question": "什么是AI？"}'
            />
          </div>
          <Button
            type="primary"
            onClick={handleRender}
            icon={<SwapOutlined />}
            loading={renderLoading}
            style={{ borderRadius: radius.md, fontWeight: 500 }}
          >
            渲染
          </Button>
          <div>
            <div
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-soft)', marginBottom: 8 }}
            >
              渲染结果
            </div>
            <pre
              style={{
                background: 'var(--bg-card)',
                border: '0.5px solid var(--border-subtle)',
                padding: 16,
                borderRadius: radius.md,
                whiteSpace: 'pre-wrap',
                minHeight: 100,
                fontSize: 13,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {rendered || '（点击渲染查看结果）'}
            </pre>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Prompts;
