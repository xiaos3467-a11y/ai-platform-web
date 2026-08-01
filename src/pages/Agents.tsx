/** Agent management */

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space,
  Card, Typography, Popconfirm, App, Drawer,
} from 'antd';
import { PlusOutlined, DeleteOutlined, PlayCircleOutlined, RobotOutlined } from '@ant-design/icons';
import { api } from '@/api/client';
import type { Agent, AgentCreateRequest, Tool } from '@/types';

const { Title } = Typography;
const { TextArea } = Input;

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
  const { message } = App.useApp();

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
    await api.post('/agents/', values);
    message.success('Agent 创建成功');
    setCreateOpen(false);
    form.resetFields();
    fetchAgents();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/agents/${id}`);
    message.success('已删除');
    fetchAgents();
  };

  const handleChat = async () => {
    if (!selectedAgent || !chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const resp = await api.post<{ answer: string }>(`/agents/${selectedAgent.id}/run`, {
        input: chatInput,
        stream: false,
      });
      const answer = resp.data?.answer || '（无响应）';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: '（执行失败）' }]);
    } finally { setChatLoading(false); }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', render: (name: string) => (
      <Space><RobotOutlined />{name}</Space>
    )},
    { title: '模型', dataIndex: 'model', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '工具', dataIndex: 'tools', render: (tools: string[]) => (
      <Space wrap>{tools?.map((t) => <Tag key={t}>{t}</Tag>)}</Space>
    )},
    { title: '最大步数', dataIndex: 'max_steps', width: 100 },
    { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={v === 'active' ? 'success' : 'default'}>{v}</Tag> },
    { title: '创建时间', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleString() },
    { title: '操作', width: 120, render: (_: unknown, record: Agent) => (
      <Space>
        <Button type="text" icon={<PlayCircleOutlined />} onClick={() => { setSelectedAgent(record); setChatOpen(true); setChatMessages([]); }} />
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Agent 管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>创建 Agent</Button>
      </div>

      <Card>
        <Table dataSource={agents} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="创建 Agent" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={() => form.submit()} width={600}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><Input /></Form.Item>
          <Form.Item name="system_prompt" label="System Prompt" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="你是一个专业的..." />
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

      <Drawer
        title={selectedAgent ? `与 ${selectedAgent.name} 对话` : 'Agent 对话'}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        width={500}
      >
        <div style={{ marginBottom: 16, maxHeight: 400, overflowY: 'auto' }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: msg.role === 'user' ? '#e6f4ff' : '#f6ffed' }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{msg.role === 'user' ? '你' : selectedAgent?.name}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            </div>
          ))}
          {chatLoading && <div style={{ color: '#999' }}>思考中...</div>}
        </div>
        <Space.Compact style={{ width: '100%' }}>
          <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onPressEnter={handleChat} placeholder="输入消息..." />
          <Button type="primary" onClick={handleChat} loading={chatLoading}>发送</Button>
        </Space.Compact>
      </Drawer>
    </div>
  );
};

export default Agents;
