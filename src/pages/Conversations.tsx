/**
 * Conversations — iMessage-inspired chat interface
 *
 * Responsive layout:
 *   - ≥768px (md+): dual-panel — list on left, messages on right
 *   - <768px (mobile): single-panel — shows list or detail with a back button
 *
 * Orchestrates sub-components from ./conversations/*.
 * Data fetching via React Query in useConversations.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Typography, Spin, Empty, App, Badge, Button, Grid } from 'antd';
import {
  MessageOutlined,
  RobotOutlined,
  ApiOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { Conversation } from '@/types';
import { GlassCard, PageHeader } from '@/components';
import MessageBubble from './conversations/MessageBubble';
import ConversationItem from './conversations/ConversationItem';
import { radius } from '@/styles/themeTokens';
import {
  useConversations,
  useConversationMessages,
  CONVERSATIONS_KEY,
} from './conversations/useConversations';

const { Text } = Typography;

const Conversations: React.FC = () => {
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const { message } = App.useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Responsive breakpoint — md (≥768px) triggers dual-panel
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  // On mobile, track whether we're viewing the list or the detail panel
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const { data: convData, isLoading: convLoading } = useConversations();
  const conversations = convData?.items ?? [];

  const { data: messages = [], isLoading: msgLoading } = useConversationMessages(
    selectedConv?.id ?? null,
  );

  // Smooth scroll to bottom when messages load
  useEffect(() => {
    if (messages.length > 0) {
      const t = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [messages]);

  // When a conversation is selected on mobile, switch to detail view
  const handleSelectConv = (conv: Conversation) => {
    setSelectedConv(conv);
    if (isMobile) setMobileView('detail');
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  const handleDelete = async (id: string) => {
    try {
      await api.post('/conversations/delete', { id });
      message.success('对话已删除');
      if (selectedConv?.id === id) {
        setSelectedConv(null);
        if (isMobile) setMobileView('list');
      }
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    } catch {
      /* handled by interceptor */
    }
  };

  /* ── Shared panel content ──────────────────────────────────────── */

  const listPanel = (
    <GlassCard
      style={{
        width: isMobile ? '100%' : 360,
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...(isMobile ? { flex: 1 } : {}),
      }}
      styles={{ body: { padding: 0, flex: 1, overflow: 'auto' } }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '0.5px solid var(--border-divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-label)' }}>
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

      <div style={{ padding: '8px 12px', overflow: 'auto', flex: 1 }}>
        {convLoading ? (
          <div style={{ padding: 20, textAlign: 'center' }}>
            <Spin size="small" />
          </div>
        ) : conversations.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ color: 'var(--text-subtle)' }}>暂无对话</span>}
            style={{ padding: '40px 0' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={selectedConv?.id === conv.id}
                onClick={() => handleSelectConv(conv)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );

  const detailPanel = (
    <GlassCard
      style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...(isMobile ? { width: '100%' } : {}),
      }}
      styles={{
        body: {
          padding: 0,
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {selectedConv ? (
        <>
          {/* Chat header */}
          <div
            style={{
              padding: isMobile ? '10px 16px' : '14px 24px',
              borderBottom: '0.5px solid var(--border-divider)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: 'var(--bg-subtle)',
            }}
          >
            {isMobile && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToList}
                aria-label="返回列表"
                style={{ padding: '4px 8px' }}
              />
            )}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: radius.md,
                background: 'linear-gradient(135deg, #30d158, #34c759)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 15,
                boxShadow: '0 2px 8px rgba(48, 209, 88, 0.2)',
                flexShrink: 0,
              }}
            >
              <RobotOutlined />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'block',
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
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
              padding: isMobile ? '16px' : '24px 28px',
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
                <MessageOutlined style={{ fontSize: 40, color: 'var(--text-faint)' }} />
                <Text style={{ color: 'var(--text-subtle)' }}>暂无消息</Text>
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
              borderRadius: radius.xl,
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
          <Text style={{ fontSize: 15, color: 'var(--text-subtle)', fontWeight: 500 }}>
            选择一个对话查看消息
          </Text>
          <Text style={{ fontSize: 13, color: 'var(--text-faint)' }}>
            从列表点击任意对话开始浏览
          </Text>
        </div>
      )}
    </GlassCard>
  );

  /* ── Layout ───────────────────────────────────────────────────── */

  return (
    <div>
      <PageHeader
        title="对话记录"
        subtitle="查看历史对话与消息详情"
        breadcrumb={[{ label: '对话记录' }]}
      />

      {isMobile ? (
        // Single-panel mobile layout
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 220px)',
            minHeight: 400,
          }}
          className="animate-fade-in-up"
        >
          {mobileView === 'list' || !selectedConv ? listPanel : detailPanel}
        </div>
      ) : (
        // Dual-panel desktop layout
        <div
          style={{
            display: 'flex',
            gap: 20,
            height: 'calc(100vh - 220px)',
            minHeight: 500,
          }}
          className="animate-fade-in-up"
        >
          {listPanel}
          {detailPanel}
        </div>
      )}
    </div>
  );
};

export default Conversations;
