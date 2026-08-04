/**
 * Conversations — iMessage-inspired chat interface
 * — Two-panel layout, gradient bubbles, smooth message reveal
 */

import React, { useEffect, useState, useRef } from 'react';
import { Typography, Spin, Empty, App, Badge } from 'antd';
import {
  DeleteOutlined,
  MessageOutlined,
  RobotOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';
import type { Conversation, Message } from '@/types';
import { GlassCard } from '@/components';

const { Title, Text } = Typography;

/* ─── Message bubble — iMessage style ─────────────────────────────── */
const MessageBubble: React.FC<{ message: Message; index: number }> = ({
  message,
  index,
}) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isTool = message.role === 'tool';

  // System and tool messages get a muted centered style
  if (isSystem || isTool) {
    return (
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 16,
          animationDelay: `${index * 0.04}s`,
        }}
      >
        <div
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            background: 'var(--bg-card)',
            border: '0.5px solid var(--border-divider)',
            fontSize: 12,
            color: 'var(--text-muted)',
            fontWeight: 500,
            maxWidth: '80%',
            textAlign: 'center',
          }}
        >
          {isTool && <span style={{ marginRight: 6 }}>⚙️</span>}
          {message.content?.slice(0, 200) || (isTool ? '工具调用' : '系统消息')}
          {(message.content?.length ?? 0) > 200 && '…'}
        </div>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in-up"
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
        animationDelay: `${index * 0.06}s`,
        opacity: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 10,
          maxWidth: '75%',
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            background: isUser
              ? 'linear-gradient(135deg, #0a84ff, #5e5ce6)'
              : 'linear-gradient(135deg, #30d158, #34c759)',
            color: '#fff',
            boxShadow: isUser
              ? '0 2px 8px rgba(10, 132, 255, 0.25)'
              : '0 2px 8px rgba(48, 209, 88, 0.2)',
          }}
        >
          {isUser ? <UserOutlined /> : <RobotOutlined />}
        </div>

        {/* Bubble */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderRadius: isUser
                ? '18px 18px 4px 18px'
                : '18px 18px 18px 4px',
              background: isUser
                ? 'linear-gradient(135deg, #0a84ff, #0066d6)'
                : 'var(--bg-chat-user)',
              border: isUser
                ? 'none'
                : '0.5px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: 14,
              lineHeight: 1.6,
              wordBreak: 'break-word' as const,
              whiteSpace: 'pre-wrap' as const,
              boxShadow: isUser
                ? '0 2px 12px rgba(10, 132, 255, 0.2)'
                : 'none',
            }}
          >
            {message.content || '(空)'}
          </div>

          {/* Meta */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 4px',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
            }}
          >
            {message.model && (
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-tertiary)',
                  fontWeight: 500,
                }}
              >
                {message.model}
              </span>
            )}
            {message.token_count && (
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-faint)',
                }}
              >
                {message.token_count} tokens
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Conversation list item ──────────────────────────────────────── */
const ConversationItem: React.FC<{
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
}> = ({ conversation, isSelected, onClick, onDelete }) => (
  <div
    onClick={onClick}
    style={{
      padding: '14px 18px',
      borderRadius: 12,
      cursor: 'pointer',
      background: isSelected ? 'rgba(10, 132, 255, 0.12)' : 'transparent',
      border: isSelected
        ? '0.5px solid rgba(10, 132, 255, 0.2)'
        : '0.5px solid transparent',
      transition: 'all 0.2s ease',
      position: 'relative',
    }}
    onMouseEnter={(e) => {
      if (!isSelected) {
        e.currentTarget.style.background = 'var(--bg-card)';
      }
    }}
    onMouseLeave={(e) => {
      if (!isSelected) {
        e.currentTarget.style.background = 'transparent';
      }
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap' as const,
          flex: 1,
          marginRight: 8,
        }}
      >
        {conversation.title || `对话 ${conversation.id.slice(0, 8)}`}
      </Text>
      <div
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.id);
        }}
        style={{
          cursor: 'pointer',
          fontSize: 13,
          color: 'var(--text-faint)',
          padding: '4px',
          borderRadius: 6,
          transition: 'all 0.2s ease',
          opacity: 0.6,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ff453a';
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.background = 'rgba(255, 69, 58, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-faint)';
          e.currentTarget.style.opacity = '0.6';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <DeleteOutlined />
      </div>
    </div>

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 12,
        color: 'var(--text-subtle)',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <MessageOutlined style={{ fontSize: 11 }} />
        {conversation.message_count}
      </span>
      {conversation.model && (
        <span
          style={{
            padding: '1px 6px',
            borderRadius: 4,
            background: 'var(--bg-elevated)',
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          {conversation.model}
        </span>
      )}
      <span
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <ClockCircleOutlined style={{ fontSize: 10 }} />
        {new Date(conversation.created_at).toLocaleDateString()}
      </span>
    </div>
  </div>
);

/* ─── Main component ──────────────────────────────────────────────── */
const Conversations: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const { message } = App.useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const resp = await api.get<{ items: Conversation[]; total: number }>(
        '/conversations/'
      );
      setConversations(resp.data?.items || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    setMsgLoading(true);
    setMessages([]);
    try {
      const resp = await api.get<Message[]>(
        `/conversations/${convId}/messages`
      );
      setMessages(resp.data || []);
    } finally {
      setMsgLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Smooth scroll to bottom when messages load
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/conversations/${id}`);
      message.success('对话已删除');
      if (selectedConv?.id === id) setSelectedConv(null);
      fetchConversations();
    } catch {
      /* handled by interceptor */
    }
  };

  return (
    <div>
      {/* Page title */}
      <div
        className="animate-fade-in-up"
        style={{ marginBottom: 28 }}
      >
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
          对话记录
        </Title>
        <Text
          style={{
            fontSize: 17,
            color: 'var(--text-secondary)',
            marginTop: 6,
            display: 'block',
          }}
        >
          查看历史对话与消息详情
        </Text>
      </div>

      {/* Two-panel layout */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          height: 'calc(100vh - 220px)',
          minHeight: 500,
        }}
        className="animate-fade-in-up"
      >
        {/* ─── Left panel: Conversation list ──────────────────────── */}
        <GlassCard
          style={{
            width: 360,
            flexShrink: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
          styles={{ body: { padding: 0, flex: 1, overflow: 'auto' } }}
        >
          {/* Panel header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '0.5px solid var(--border-divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-label)',
              }}
            >
              全部对话
            </Text>
            <Badge
              count={conversations.length}
              style={{
                background: 'var(--bg-elevated-2)',
                color: 'var(--text-soft)',
                fontSize: 11,
                fontWeight: 600,
                boxShadow: 'none',
              }}
            />
          </div>

          {/* List */}
          <div style={{ padding: '8px 12px', overflow: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center' }}>
                <Spin size="small" />
              </div>
            ) : conversations.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: 'var(--text-subtle)' }}>
                    暂无对话
                  </span>
                }
                style={{ padding: '40px 0' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isSelected={selectedConv?.id === conv.id}
                    onClick={() => {
                      setSelectedConv(conv);
                      fetchMessages(conv.id);
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        {/* ─── Right panel: Message view ──────────────────────────── */}
        <GlassCard
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
          styles={{ body: { padding: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}
        >
          {selectedConv ? (
            <>
              {/* Chat header */}
              <div
                style={{
                  padding: '14px 24px',
                  borderBottom: '0.5px solid var(--border-divider)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: 'var(--bg-subtle)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #30d158, #34c759)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 15,
                    boxShadow: '0 2px 8px rgba(48, 209, 88, 0.2)',
                  }}
                >
                  <RobotOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      display: 'block',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {selectedConv.title || `对话 ${selectedConv.id.slice(0, 8)}`}
                  </Text>
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      fontSize: 12,
                      color: 'var(--text-subtle)',
                      marginTop: 2,
                    }}
                  >
                    {selectedConv.model && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <ApiOutlined style={{ fontSize: 10 }} />
                        {selectedConv.model}
                      </span>
                    )}
                    <span>{selectedConv.total_tokens?.toLocaleString()} tokens</span>
                    <span>{selectedConv.message_count} 条消息</span>
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <div
                style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: '24px 28px',
                }}
              >
                {msgLoading ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <Spin />
                  </div>
                ) : messages.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      gap: 12,
                    }}
                  >
                    <MessageOutlined
                      style={{
                        fontSize: 40,
                        color: 'var(--text-faint)',
                      }}
                    />
                    <Text style={{ color: 'var(--text-subtle)' }}>
                      暂无消息
                    </Text>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <MessageBubble key={msg.id} message={msg} index={idx} />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </>
          ) : (
            /* Empty state */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: 'var(--bg-card)',
                  border: '0.5px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  color: 'var(--text-faint)',
                }}
              >
                <MessageOutlined />
              </div>
              <Text
                style={{
                  fontSize: 15,
                  color: 'var(--text-subtle)',
                  fontWeight: 500,
                }}
              >
                选择一个对话查看消息
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: 'var(--text-faint)',
                }}
              >
                从左侧列表点击任意对话开始浏览
              </Text>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default Conversations;
