/** Conversations management */

import React, { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Button, Drawer, Space, Spin, Empty } from 'antd';
import { MessageOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '@/api/client';
import type { Conversation, Message } from '@/types';

const { Title } = Typography;

const roleColors: Record<string, string> = {
  system: 'default', user: 'blue', assistant: 'green', tool: 'orange',
};

const Conversations: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const resp = await api.get<{ items: Conversation[]; total: number }>('/conversations/');
      setConversations(resp.data?.items || []);
    } finally { setLoading(false); }
  };

  const fetchMessages = async (convId: string) => {
    setMsgLoading(true);
    try {
      const resp = await api.get<Message[]>(`/conversations/${convId}/messages`);
      setMessages(resp.data || []);
    } finally { setMsgLoading(false); }
  };

  useEffect(() => { fetchConversations(); }, []);

  const handleDelete = async (id: string) => {
    await api.delete(`/conversations/${id}`);
    fetchConversations();
  };

  const columns = [
    { title: '标题', dataIndex: 'title', render: (title: string, record: Conversation) => (
      <a onClick={() => { setSelectedConv(record); fetchMessages(record.id); }}>
        {title || `对话 ${record.id.slice(0, 8)}`}
      </a>
    )},
    { title: '模型', dataIndex: 'model', render: (v: string) => v ? <Tag>{v}</Tag> : '-' },
    { title: '消息数', dataIndex: 'message_count' },
    { title: 'Token 消耗', dataIndex: 'total_tokens', render: (v: number) => v?.toLocaleString() || 0 },
    { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={v === 'active' ? 'success' : 'default'}>{v}</Tag> },
    { title: '创建时间', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleString() },
    { title: '操作', width: 60, render: (_: unknown, record: Conversation) => (
      <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)} />
    )},
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>对话记录</Title>
      <Card>
        <Table dataSource={conversations} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </Card>

      <Drawer
        title={selectedConv?.title || '对话详情'}
        open={!!selectedConv}
        onClose={() => setSelectedConv(null)}
        width={600}
      >
        {msgLoading ? (
          <div style={{ textAlign: 'center', padding: 50 }}><Spin /></div>
        ) : messages.length === 0 ? (
          <Empty description="暂无消息" />
        ) : (
          <div>
            {messages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 8, background: msg.role === 'user' ? '#e6f4ff' : msg.role === 'assistant' ? '#f6ffed' : '#fafafa', border: '1px solid #f0f0f0' }}>
                <div style={{ marginBottom: 4 }}>
                  <Tag color={roleColors[msg.role] || 'default'}>{msg.role}</Tag>
                  {msg.model && <Tag>{msg.model}</Tag>}
                  {msg.token_count && <span style={{ fontSize: 12, color: '#999' }}>{msg.token_count} tokens</span>}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.content || '(空)'}</div>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Conversations;
