/** Workflow management */

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Tag, Space, Card, Typography,
  App, Drawer, Steps, Timeline, Descriptions, Badge, Select,
} from 'antd';
import {
  PlusOutlined, PlayCircleOutlined, BranchesOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SyncOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';
import type { Workflow, WorkflowExecution } from '@/types';

const { Title } = Typography;

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  completed: { color: 'success', icon: <CheckCircleOutlined /> },
  running: { color: 'processing', icon: <SyncOutlined spin /> },
  paused: { color: 'warning', icon: <ClockCircleOutlined /> },
  failed: { color: 'error', icon: <CloseCircleOutlined /> },
  pending: { color: 'default', icon: <ClockCircleOutlined /> },
};

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
    // Create a simple default workflow
    const body = {
      ...values,
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'llm_1', type: 'llm_call', config: { model: 'qwen-max', prompt: '{{inputs.question}}' } },
        { id: 'end', type: 'end' },
      ],
      edges: [
        { source: 'start', target: 'llm_1' },
        { source: 'llm_1', target: 'end' },
      ],
    };
    await api.post('/workflows/', body);
    message.success('工作流创建成功');
    setCreateOpen(false);
    form.resetFields();
    fetchWorkflows();
  };

  const handlePublish = async (id: string) => {
    await api.post(`/workflows/${id}/publish`);
    message.success('已发布');
    fetchWorkflows();
  };

  const handleExecute = async () => {
    if (!selectedWf) return;
    try {
      const inputs = JSON.parse(execInput);
      const resp = await api.post<WorkflowExecution>(`/workflows/${selectedWf.id}/execute`, { inputs });
      setExecResult(resp.data);
      message.success(`工作流执行${resp.data?.status === 'completed' ? '完成' : '中'}`);
    } catch {
      message.error('执行失败');
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', render: (name: string) => (
      <Space><BranchesOutlined />{name}</Space>
    )},
    { title: '描述', dataIndex: 'description', render: (v: string) => v || '-' },
    { title: '版本', dataIndex: 'version', render: (v: number) => <Tag>v{v}</Tag> },
    { title: '节点数', dataIndex: 'node_count' },
    { title: '状态', dataIndex: 'status', render: (v: string) => (
      <Tag color={v === 'published' ? 'success' : 'default'}>{v}</Tag>
    )},
    { title: '创建时间', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleString() },
    { title: '操作', width: 180, render: (_: unknown, record: Workflow) => (
      <Space>
        {record.status === 'draft' && (
          <Button size="small" onClick={() => handlePublish(record.id)}>发布</Button>
        )}
        <Button
          size="small"
          type="primary"
          icon={<PlayCircleOutlined />}
          disabled={record.status !== 'published'}
          onClick={() => { setSelectedWf(record); setExecOpen(true); setExecResult(null); }}
        >
          执行
        </Button>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>工作流管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>创建工作流</Button>
      </div>

      <Card>
        <Table dataSource={workflows} columns={columns} rowKey="id" loading={loading} />
      </Card>

      <Modal title="创建工作流" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input placeholder="如：客户问答流程" /></Form.Item>
          <Form.Item name="description" label="描述"><Input /></Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={selectedWf ? `执行 ${selectedWf.name}` : '执行工作流'}
        open={execOpen}
        onClose={() => setExecOpen(false)}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="输入参数 (JSON)">
            <Input.TextArea
              value={execInput}
              onChange={(e) => setExecInput(e.target.value)}
              rows={5}
              style={{ fontFamily: 'monospace' }}
              placeholder='{"question": "你好"}'
            />
          </Form.Item>
          <Button type="primary" onClick={handleExecute} icon={<PlayCircleOutlined />} style={{ marginBottom: 16 }}>
            执行
          </Button>
        </Form>

        {execResult && (
          <Card title="执行结果" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="状态">
                <Badge status={statusConfig[execResult.status]?.color as 'success'} text={execResult.status} />
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">{execResult.started_at ? new Date(execResult.started_at).toLocaleString() : '-'}</Descriptions.Item>
              <Descriptions.Item label="完成时间">{execResult.completed_at ? new Date(execResult.completed_at).toLocaleString() : '-'}</Descriptions.Item>
              {execResult.error_message && (
                <Descriptions.Item label="错误">{execResult.error_message}</Descriptions.Item>
              )}
            </Descriptions>
            {execResult.outputs && (
              <pre style={{ fontSize: 11, background: '#f5f5f5', padding: 12, borderRadius: 4, marginTop: 8, maxHeight: 300, overflow: 'auto' }}>
                {JSON.stringify(execResult.outputs, null, 2)}
              </pre>
            )}
          </Card>
        )}
      </Drawer>
    </div>
  );
};

export default Workflows;
