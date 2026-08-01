/** Prompt management */

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Tag, Space, Card, Typography,
  App, Drawer, Timeline, Descriptions, InputNumber,
} from 'antd';
import { PlusOutlined, EditOutlined, HistoryOutlined, CodeOutlined, SwapOutlined } from '@ant-design/icons';
import { api } from '@/api/client';
import type { PromptTemplate, PromptVersion } from '@/types';

const { Title } = Typography;
const { TextArea } = Input;

const Prompts: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [renderOpen, setRenderOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [rendered, setRendered] = useState('');
  const [renderVars, setRenderVars] = useState('{}');
  const [form] = Form.useForm();
  const [renderForm] = Form.useForm();
  const { message } = App.useApp();

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const resp = await api.get<{ items: PromptTemplate[]; total: number }>('/prompts/');
      setPrompts(resp.data?.items || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPrompts(); }, []);

  const handleCreate = async (values: { name: string; content: string; description?: string }) => {
    await api.post('/prompts/', values);
    message.success('Prompt 模板创建成功');
    setCreateOpen(false);
    form.resetFields();
    fetchPrompts();
  };

  const handleCreateVersion = async (content: string) => {
    if (!selectedPrompt) return;
    await api.post(`/prompts/${selectedPrompt.id}/versions`, {
      content,
      change_note: '从管理后台更新',
    });
    message.success('新版本创建成功');
    fetchVersions(selectedPrompt.id);
    fetchPrompts();
  };

  const fetchVersions = async (promptId: string) => {
    const resp = await api.get<PromptVersion[]>(`/prompts/${promptId}/versions`);
    setVersions(resp.data || []);
  };

  const handleRender = async () => {
    if (!selectedPrompt) return;
    try {
      const vars = JSON.parse(renderVars);
      const resp = await api.post<{ rendered: string }>(`/prompts/${selectedPrompt.id}/render`, {
        variables: vars,
      });
      setRendered(resp.data?.rendered || '');
    } catch (e) {
      message.error('变量格式错误，请使用 JSON 格式');
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name' },
    { title: '描述', dataIndex: 'description', render: (v: string) => v || '-' },
    { title: '当前版本', dataIndex: 'current_version', render: (v: number) => <Tag color="blue">v{v}</Tag> },
    { title: '创建时间', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleString() },
    { title: '操作', width: 200, render: (_: unknown, record: PromptTemplate) => (
      <Space>
        <Button size="small" icon={<CodeOutlined />} onClick={() => { setSelectedPrompt(record); setRenderOpen(true); setRendered(''); }}>
          渲染
        </Button>
        <Button size="small" icon={<HistoryOutlined />} onClick={() => {
          setSelectedPrompt(record); setVersionsOpen(true); fetchVersions(record.id);
        }}>
          版本
        </Button>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Prompt 管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>创建模板</Button>
      </div>

      <Card>
        <Table dataSource={prompts} columns={columns} rowKey="id" loading={loading} />
      </Card>

      {/* Create Modal */}
      <Modal title="创建 Prompt 模板" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={() => form.submit()} width={700}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><Input /></Form.Item>
          <Form.Item name="content" label="模板内容 (Jinja2)" rules={[{ required: true }]}
            extra="支持 {{variable}}、{% if %}、{% for %} 语法"
          >
            <TextArea rows={10} placeholder="你是一个{{role}}。请回答：{{question}}" style={{ fontFamily: 'monospace' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Versions Drawer */}
      <Drawer
        title={selectedPrompt ? `${selectedPrompt.name} — 版本历史` : '版本历史'}
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        width={600}
      >
        {versions.length > 0 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" onClick={() => {
                const content = prompt('输入新版本内容：');
                if (content) handleCreateVersion(content);
              }}>
                创建新版本
              </Button>
            </div>
            <Timeline
              items={versions.map((v) => ({
                color: v.version === selectedPrompt?.current_version ? 'green' : 'gray',
                children: (
                  <div>
                    <Space>
                      <Tag color={v.version === selectedPrompt?.current_version ? 'green' : 'default'}>v{v.version}</Tag>
                      <span style={{ fontSize: 12, color: '#999' }}>{new Date(v.created_at).toLocaleString()}</span>
                    </Space>
                    {v.change_note && <div style={{ fontSize: 12, marginTop: 4 }}>{v.change_note}</div>}
                    <pre style={{ fontSize: 11, background: '#f5f5f5', padding: 8, borderRadius: 4, marginTop: 4, maxHeight: 100, overflow: 'auto' }}>
                      {v.content.slice(0, 200)}{v.content.length > 200 ? '...' : ''}
                    </pre>
                  </div>
                ),
              }))}
            />
          </>
        )}
      </Drawer>

      {/* Render Drawer */}
      <Drawer
        title={selectedPrompt ? `渲染 ${selectedPrompt.name}` : '渲染模板'}
        open={renderOpen}
        onClose={() => setRenderOpen(false)}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="变量 (JSON)">
            <TextArea
              value={renderVars}
              onChange={(e) => setRenderVars(e.target.value)}
              rows={5}
              style={{ fontFamily: 'monospace' }}
              placeholder='{"role": "助手", "question": "什么是AI？"}'
            />
          </Form.Item>
          <Button type="primary" onClick={handleRender} icon={<SwapOutlined />} style={{ marginBottom: 16 }}>
            渲染
          </Button>
          <Form.Item label="渲染结果">
            <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap', minHeight: 100 }}>
              {rendered || '（点击渲染查看结果）'}
            </pre>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Prompts;
