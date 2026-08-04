/** Workflows — Apple glass aesthetic */

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Tag, Space, Card, Typography,
  App, Drawer, Descriptions, Skeleton, Empty,
} from 'antd';
import {
  PlusOutlined, PlayCircleOutlined, BranchesOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SyncOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';
import type { Workflow, WorkflowExecution } from '@/types';

const { Title, Text } = Typography;

/* ─── Status pill ─────────────────────────────────────────────────── */
const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const cfg: Record<string, { bg: string; border: string; color: string; icon: React.ReactNode; text: string }> = {
    completed: { bg: 'rgba(48,209,88,0.08)', border: 'rgba(48,209,88,0.2)', color: '#30d158', icon: <CheckCircleOutlined />, text: '完成' },
    running: { bg: 'rgba(10,132,255,0.08)', border: 'rgba(10,132,255,0.2)', color: '#0a84ff', icon: <SyncOutlined spin />, text: '运行中' },
    published: { bg: 'rgba(48,209,88,0.08)', border: 'rgba(48,209,88,0.2)', color: '#30d158', icon: <CheckCircleOutlined />, text: '已发布' },
    draft: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: '#6e6e73', icon: <ClockCircleOutlined />, text: '草稿' },
    paused: { bg: 'rgba(255,214,10,0.08)', border: 'rgba(255,214,10,0.2)', color: '#ffd60a', icon: <ClockCircleOutlined />, text: '暂停' },
    failed: { bg: 'rgba(255,69,58,0.08)', border: 'rgba(255,69,58,0.2)', color: '#ff453a', icon: <CloseCircleOutlined />, text: '失败' },
    pending: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: '#6e6e73', icon: <ClockCircleOutlined />, text: '等待' },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 8,
      background: c.bg, border: `0.5px solid ${c.border}`, fontSize: 12, fontWeight: 500, color: c.color,
    }}>
      {c.icon} {c.text}
    </span>
  );
};

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

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const resp = await api.get<{ items: Workflow[]; total: number }>('/workflows/');
      setWorkflows(resp.data?.items || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchWorkflows(); }, []);

  const handleCreate = async (values: { name: string; description?: string }) => {
    try {
      const body = {
        ...values,
        nodes: [
          { id: 'start', type: 'start' },
          { id: 'llm_1', type: 'llm_call', config: { model: 'qwen-max', prompt: '{{inputs.question}}' } },
          { id: 'end', type: 'end' },
        ],
        edges: [{ source: 'start', target: 'llm_1' }, { source: 'llm_1', target: 'end' }],
      };
      await api.post('/workflows/', body);
      message.success('工作流创建成功');
      setCreateOpen(false);
      form.resetFields();
      fetchWorkflows();
    } catch { /* handled */ }
  };

  const handlePublish = async (id: string) => {
    try { await api.post(`/workflows/${id}/publish`); message.success('已发布'); fetchWorkflows(); } catch { /* handled */ }
  };

  const handleExecute = async () => {
    if (!selectedWf) return;
    try {
      const inputs = JSON.parse(execInput);
      const resp = await api.post<WorkflowExecution>(`/workflows/${selectedWf.id}/execute`, { inputs });
      setExecResult(resp.data);
      message.success(`工作流执行${resp.data?.status === 'completed' ? '完成' : '中'}`);
    } catch { message.error('执行失败'); }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', render: (name: string) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, color: '#f5f5f7' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 9,
          background: 'linear-gradient(135deg, #5e5ce6, #bf5af2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13,
        }}>
          <BranchesOutlined />
        </div>
        {name}
      </span>
    )},
    { title: '描述', dataIndex: 'description', render: (v: string) => <span style={{ color: '#a1a1a6', fontSize: 13 }}>{v || '-'}</span> },
    { title: '版本', dataIndex: 'version', render: (v: number) => (
      <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', fontSize: 12, color: '#a1a1a6', fontWeight: 500 }}>v{v}</span>
    )},
    { title: '节点', dataIndex: 'node_count', render: (v: number) => <span style={{ color: '#a1a1a6' }}>{v}</span> },
    { title: '状态', dataIndex: 'status', render: (v: string) => <StatusPill status={v} /> },
    { title: '创建时间', dataIndex: 'created_at', render: (v: string) => <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{new Date(v).toLocaleString()}</span> },
    { title: '', width: 160, render: (_: unknown, record: Workflow) => (
      <Space>
        {record.status === 'draft' && (
          <Button size="small" onClick={() => handlePublish(record.id)} style={{ borderRadius: 8, fontSize: 12 }}>发布</Button>
        )}
        <Button
          size="small"
          type="primary"
          icon={<PlayCircleOutlined />}
          disabled={record.status !== 'published'}
          onClick={() => { setSelectedWf(record); setExecOpen(true); setExecResult(null); }}
          style={{ borderRadius: 8, fontSize: 12 }}
        >
          执行
        </Button>
      </Space>
    )},
  ];

  return (
    <div>
      {/* Page title */}
      <div className="animate-fade-in-up" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, fontSize: 34, letterSpacing: '-0.04em', color: '#f5f5f7' }}>
            工作流
          </Title>
          <Text style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)', marginTop: 6, display: 'block' }}>
            编排多步骤任务流程
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)} style={{ height: 44, paddingInline: 20, borderRadius: 12, fontWeight: 500 }}>
          创建工作流
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Card style={{ borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }} styles={{ body: { padding: 24 } }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      ) : (
        <Card
          className="animate-fade-in-up"
          style={{ borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          styles={{ body: { padding: 0 } }}
        >
          {workflows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
                background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: 'rgba(255,255,255,0.15)',
              }}>
                <BranchesOutlined />
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginBottom: 8 }}>还没有工作流</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.15)', marginBottom: 24 }}>创建工作流来编排 LLM 调用、工具使用和分支逻辑</div>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>创建第一个工作流</Button>
            </div>
          ) : (
            <Table dataSource={workflows} columns={columns} rowKey="id" />
          )}
        </Card>
      )}

      {/* Create Modal */}
      <Modal title="创建工作流" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={() => form.submit()} okText="创建" cancelText="取消">
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input placeholder="如：客户问答流程" /></Form.Item>
          <Form.Item name="description" label="描述"><Input placeholder="简要描述工作流用途..." /></Form.Item>
        </Form>
      </Modal>

      {/* Execute Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 9,
              background: 'linear-gradient(135deg, #5e5ce6, #bf5af2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12,
            }}>
              <PlayCircleOutlined />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#f5f5f7' }}>执行 {selectedWf?.name}</span>
          </div>
        }
        open={execOpen}
        onClose={() => setExecOpen(false)}
        width={600}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>输入参数 (JSON)</div>
            <Input.TextArea
              value={execInput}
              onChange={(e) => setExecInput(e.target.value)}
              rows={5}
              style={{ fontFamily: 'monospace', borderRadius: 10 }}
              placeholder='{"question": "你好"}'
            />
          </div>
          <Button type="primary" onClick={handleExecute} icon={<PlayCircleOutlined />} style={{ borderRadius: 10, fontWeight: 500 }}>
            执行
          </Button>

          {execResult && (
            <Card
              style={{
                borderRadius: 12,
                border: '0.5px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
              }}
              styles={{ body: { padding: 16 } }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f7', marginBottom: 12 }}>执行结果</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>状态</span>
                  <StatusPill status={execResult.status} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>开始时间</span>
                  <span style={{ color: '#f5f5f7' }}>{execResult.started_at ? new Date(execResult.started_at).toLocaleString() : '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>完成时间</span>
                  <span style={{ color: '#f5f5f7' }}>{execResult.completed_at ? new Date(execResult.completed_at).toLocaleString() : '-'}</span>
                </div>
                {execResult.error_message && (
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,69,58,0.08)', border: '0.5px solid rgba(255,69,58,0.2)', fontSize: 13, color: '#ff453a' }}>
                    {execResult.error_message}
                  </div>
                )}
                {execResult.outputs && (
                  <pre style={{
                    fontSize: 12, fontFamily: 'monospace',
                    background: 'rgba(255,255,255,0.04)',
                    border: '0.5px solid rgba(255,255,255,0.08)',
                    padding: 12, borderRadius: 8, marginTop: 4,
                    maxHeight: 300, overflow: 'auto', color: '#a1a1a6',
                  }}>
                    {JSON.stringify(execResult.outputs, null, 2)}
                  </pre>
                )}
              </div>
            </Card>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default Workflows;
