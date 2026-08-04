/** Agents — Apple glass aesthetic */

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Space,
  Typography, App, Drawer,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, PlayCircleOutlined, RobotOutlined,
  SendOutlined, MessageOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';
import type { Agent, AgentCreateRequest, Tool } from '@/types';
import { GlassCard, EmptyState, TableSkeleton } from '@/components';

const { Title, Text } = Typography;
const { TextArea } = Input;

/* ─── Chat bubble (dark iMessage style) ───────────────────────────── */
const ChatBubble: React.FC<{ role: string; content: string; agentName?: string }> = ({ role, content }) => {
  const isUser = role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8, maxWidth: '85%', flexDirection: isUser ? 'row-reverse' : 'row' }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: 9, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
            background: isUser ? 'linear-gradient(135deg, #0a84ff, #5e5ce6)' : 'linear-gradient(135deg, #30d158, #34c759)',
            color: '#fff',
          }}
        >
          {isUser ? '你' : <RobotOutlined />}
        </div>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: isUser ? 'linear-gradient(135deg, #0a84ff, #0066d6)' : 'var(--bg-chat-user)',
            border: isUser ? 'none' : '0.5px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: 13,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap' as const,
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
};

/* ─── Main ────────────────────────────────────────────────────────── */
const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const [agentResp, toolResp] = await Promise.allSettled([
        api.get<{ items: Agent[] }>('/agents/'),
        api.get<Tool[]>('/agents/tools'),
      ]);
      if (agentResp.status === 'fulfilled') setAgents(agentResp.value.data?.items || []);
      if (toolResp.status === 'fulfilled') setTools(toolResp.value.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleCreate = async (values: AgentCreateRequest) => {
    try {
      await api.post('/agents/', values);
      message.success('Agent 创建成功');
      setCreateOpen(false);
      form.resetFields();
      fetchAgents();
    } catch { /* handled */ }
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: '删除 Agent',
      content: '确认删除此 Agent？此操作不可恢复。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        await api.delete(`/agents/${id}`);
        message.success('已删除');
        fetchAgents();
      },
    });
  };

  const handleChat = async () => {
    if (!selectedAgent || !chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const resp = await api.post<{ answer: string }>(`/agents/${selectedAgent.id}/run`, { input: chatInput, stream: false });
      setChatMessages((prev) => [...prev, { role: 'assistant', content: resp.data?.answer || '（无响应）' }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: '（执行失败）' }]);
    } finally { setChatLoading(false); }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', render: (name: string) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, color: 'var(--text-primary)' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 9,
          background: 'linear-gradient(135deg, #0a84ff, #5e5ce6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13,
        }}>
          <RobotOutlined />
        </div>
        {name}
      </span>
    )},
    { title: '模型', dataIndex: 'model', render: (v: string) => (
      <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(10,132,255,0.1)', border: '0.5px solid rgba(10,132,255,0.2)', fontSize: 12, color: '#0a84ff', fontWeight: 500 }}>{v}</span>
    )},
    { title: '工具', dataIndex: 'tools', render: (t: string[]) => (
      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t?.length || 0} 个</span>
    )},
    { title: '最大步数', dataIndex: 'max_steps', width: 100, render: (v: number) => <span style={{ color: 'var(--text-muted)' }}>{v}</span> },
    { title: '状态', dataIndex: 'status', render: (v: string) => (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 8,
        background: v === 'active' ? 'rgba(48,209,88,0.08)' : 'var(--bg-card)',
        border: `0.5px solid ${v === 'active' ? 'rgba(48,209,88,0.2)' : 'var(--border-subtle)'}`,
        fontSize: 12, fontWeight: 500, color: v === 'active' ? '#30d158' : '#6e6e73',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: v === 'active' ? '#30d158' : '#6e6e73' }} />
        {v}
      </span>
    )},
    { title: '创建时间', dataIndex: 'created_at', render: (v: string) => <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(v).toLocaleString()}</span> },
    { title: '', width: 100, render: (_: unknown, record: Agent) => (
      <Space>
        <div
          onClick={() => { setSelectedAgent(record); setChatOpen(true); setChatMessages([]); }}
          className="icon-action icon-action--default icon-action--blue"
        >
          <PlayCircleOutlined />
        </div>
        <div
          onClick={() => handleDelete(record.id)}
          className="icon-action icon-action--muted icon-action--red"
        >
          <DeleteOutlined />
        </div>
      </Space>
    )},
  ];

  return (
    <div>
      {/* Page title */}
      <div className="animate-fade-in-up" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, fontSize: 34, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
            Agent 管理
          </Title>
          <Text style={{ fontSize: 17, color: 'var(--text-secondary)', marginTop: 6, display: 'block' }}>
            创建可调用工具的智能助手
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
          style={{ height: 44, paddingInline: 20, borderRadius: 12, fontWeight: 500 }}
        >
          创建 Agent
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <GlassCard animate styles={{ body: { padding: 0 } }}>
          {agents.length === 0 ? (
            <EmptyState
              icon={<RobotOutlined />}
              title="还没有 Agent"
              description="创建 Agent 来执行复杂的多步骤任务"
              actionText="创建第一个 Agent"
              onAction={() => setCreateOpen(true)}
            />
          ) : (
            <Table dataSource={agents} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
          )}
        </GlassCard>
      )}

      {/* Create Modal */}
      <Modal title="创建 Agent" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={() => form.submit()} width={600} okText="创建" cancelText="取消">
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input placeholder="如：客户支持助手" /></Form.Item>
          <Form.Item name="description" label="描述"><Input placeholder="简要描述 Agent 的职责..." /></Form.Item>
          <Form.Item name="system_prompt" label="System Prompt" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="你是一个专业的..." style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item name="model" label="模型" initialValue="qwen-max" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="qwen-max">Qwen Max</Select.Option>
              <Select.Option value="gpt-4o">GPT-4o</Select.Option>
              <Select.Option value="claude-sonnet-4-20250514">Claude Sonnet</Select.Option>
              <Select.Option value="deepseek-chat">DeepSeek Chat</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="tools" label="工具" initialValue={[]}>
            <Select mode="multiple" placeholder="选择可用工具">
              {tools.map((t) => <Select.Option key={t.name} value={t.name}>{t.name} — {t.description.slice(0, 50)}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="max_steps" label="最大步数" initialValue={10}>
            <InputNumber min={1} max={50} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Chat Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 9,
              background: 'linear-gradient(135deg, #30d158, #34c759)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12,
            }}>
              <RobotOutlined />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedAgent?.name || 'Agent 对话'}
            </span>
          </div>
        }
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        width={500}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chatMessages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <MessageOutlined style={{ fontSize: 36, color: 'var(--text-faint)', marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: 'var(--text-subtle)' }}>发送消息开始对话</div>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <ChatBubble key={i} role={msg.role} content={msg.content} agentName={selectedAgent?.name} />
              ))
            )}
            {chatLoading && (
              <div style={{ padding: '8px 14px', fontSize: 13, color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                思考中...
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onPressEnter={handleChat}
              placeholder="输入消息..."
              style={{ flex: 1, borderRadius: 10 }}
            />
            <Button
              type="primary"
              onClick={handleChat}
              loading={chatLoading}
              icon={<SendOutlined />}
              style={{ borderRadius: 10 }}
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Agents;
