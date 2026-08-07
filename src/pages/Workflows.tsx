/** Workflows — Apple glass aesthetic */

import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Space, Typography, App, Drawer } from 'antd';
import { PlusOutlined, PlayCircleOutlined, BranchesOutlined } from '@ant-design/icons';
import { api } from '@/api/client';
import type { Workflow, WorkflowExecution } from '@/types';
import { GlassCard, StatusPill, EmptyState, TableSkeleton } from '@/components';

import { radius } from '@/styles/themeTokens';
const { Title, Text } = Typography;

/* ─── Main ────────────────────────────────────────────────────────── */
const Workflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedWf, setSelectedWf] = useState<Workflow | null>(null);
  const [execResult, setExecResult] = useState<WorkflowExecution | null>(null);
  const [execOpen, setExecOpen] = useState(false);
  const [execInput, setExecInput] = useState('{}');
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const fetchWorkflows = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const resp = await api.post<{ items: Workflow[]; total: number }>(
        '/workflows/list',
        {},
        signal,
      );
      setWorkflows(resp.data?.items || []);
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
    fetchWorkflows(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  const handleCreate = async (values: { name: string; description?: string }) => {
    try {
      const body = {
        ...values,
        nodes: [
          { id: 'start', type: 'start' },
          {
            id: 'llm_1',
            type: 'llm_call',
            config: { model: 'qwen-max', prompt: '{{inputs.question}}' },
          },
          { id: 'end', type: 'end' },
        ],
        edges: [
          { source: 'start', target: 'llm_1' },
          { source: 'llm_1', target: 'end' },
        ],
      };
      await api.post('/workflows/create', body);
      message.success('工作流创建成功');
      setCreateOpen(false);
      form.resetFields();
      fetchWorkflows();
    } catch {
      /* handled */
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.post(`/workflows/publish`, { id });
      message.success('已发布');
      fetchWorkflows();
    } catch {
      /* handled */
    }
  };

  const handleExecute = async () => {
    if (!selectedWf) return;
    try {
      const inputs = JSON.parse(execInput);
      const resp = await api.post<WorkflowExecution>(`/workflows/execute`, {
        id: selectedWf.id,
        inputs,
      });
      setExecResult(resp.data);
      message.success(`工作流执行${resp.data?.status === 'completed' ? '完成' : '中'}`);
    } catch {
      message.error('执行失败');
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
                background: 'linear-gradient(135deg, #5e5ce6, #bf5af2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 13,
              }}
            >
              <BranchesOutlined />
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
        dataIndex: 'version',
        render: (v: number) => (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: radius.sm,
              background: 'var(--bg-elevated)',
              fontSize: 12,
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            v{v}
          </span>
        ),
      },
      {
        title: '节点',
        dataIndex: 'node_count',
        render: (v: number) => <span style={{ color: 'var(--text-muted)' }}>{v}</span>,
      },
      { title: '状态', dataIndex: 'status', render: (v: string) => <StatusPill status={v} /> },
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
        render: (_: unknown, record: Workflow) => (
          <Space>
            {record.status === 'draft' && (
              <Button
                size="small"
                onClick={() => handlePublish(record.id)}
                style={{ borderRadius: radius.sm, fontSize: 12 }}
              >
                发布
              </Button>
            )}
            <Button
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
              disabled={record.status !== 'published'}
              onClick={() => {
                setSelectedWf(record);
                setExecOpen(true);
                setExecResult(null);
              }}
              style={{ borderRadius: radius.sm, fontSize: 12 }}
            >
              执行
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
            工作流
          </Title>
          <Text
            style={{ fontSize: 17, color: 'var(--text-secondary)', marginTop: 6, display: 'block' }}
          >
            编排多步骤任务流程
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
          style={{ height: 44, paddingInline: 20, borderRadius: radius.md, fontWeight: 500 }}
        >
          创建工作流
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <GlassCard animate styles={{ body: { padding: 0 } }}>
          {workflows.length === 0 ? (
            <EmptyState
              icon={<BranchesOutlined />}
              title="还没有工作流"
              description="创建工作流来编排 LLM 调用、工具使用和分支逻辑"
              actionText="创建第一个工作流"
              onAction={() => setCreateOpen(true)}
            />
          ) : (
            <Table dataSource={workflows} columns={columns} rowKey="id" />
          )}
        </GlassCard>
      )}

      {/* Create Modal */}
      <Modal
        title="创建工作流"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="如：客户问答流程" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="简要描述工作流用途..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Execute Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: radius.sm,
                background: 'linear-gradient(135deg, #5e5ce6, #bf5af2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
              }}
            >
              <PlayCircleOutlined />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              执行 {selectedWf?.name}
            </span>
          </div>
        }
        open={execOpen}
        onClose={() => setExecOpen(false)}
        width={600}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-soft)', marginBottom: 8 }}
            >
              输入参数 (JSON)
            </div>
            <Input.TextArea
              value={execInput}
              onChange={(e) => setExecInput(e.target.value)}
              rows={5}
              style={{ fontFamily: 'monospace', borderRadius: radius.md }}
              placeholder='{"question": "你好"}'
            />
          </div>
          <Button
            type="primary"
            onClick={handleExecute}
            icon={<PlayCircleOutlined />}
            style={{ borderRadius: radius.md, fontWeight: 500 }}
          >
            执行
          </Button>

          {execResult && (
            <GlassCard style={{ borderRadius: radius.md }} styles={{ body: { padding: 16 } }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 12,
                }}
              >
                执行结果
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>状态</span>
                  <StatusPill status={execResult.status} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>开始时间</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {execResult.started_at ? new Date(execResult.started_at).toLocaleString() : '-'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>完成时间</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {execResult.completed_at
                      ? new Date(execResult.completed_at).toLocaleString()
                      : '-'}
                  </span>
                </div>
                {execResult.error_message && (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: radius.sm,
                      background: 'rgba(255,69,58,0.08)',
                      border: '0.5px solid rgba(255,69,58,0.2)',
                      fontSize: 13,
                      color: '#ff453a',
                    }}
                  >
                    {execResult.error_message}
                  </div>
                )}
                {execResult.outputs && (
                  <pre
                    style={{
                      fontSize: 12,
                      fontFamily: 'monospace',
                      background: 'var(--bg-card)',
                      border: '0.5px solid var(--border-subtle)',
                      padding: 12,
                      borderRadius: radius.sm,
                      marginTop: 4,
                      maxHeight: 300,
                      overflow: 'auto',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {JSON.stringify(execResult.outputs, null, 2)}
                  </pre>
                )}
              </div>
            </GlassCard>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default Workflows;
