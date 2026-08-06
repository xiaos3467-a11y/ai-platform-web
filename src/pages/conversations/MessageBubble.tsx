/**
 * MessageBubble — iMessage-style chat bubble.
 */

import React from 'react';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import type { Message } from '@/types';

import { radius } from '@/styles/themeTokens';
interface Props {
  message: Message;
  index: number;
}

const MessageBubble: React.FC<Props> = ({ message, index }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isTool = message.role === 'tool';

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
            borderRadius: radius.sm,
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
            borderRadius: radius.md,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: isUser
                ? 'linear-gradient(135deg, #0a84ff, #0066d6)'
                : 'var(--bg-chat-user)',
              border: isUser ? 'none' : '0.5px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: 14,
              lineHeight: 1.6,
              wordBreak: 'break-word' as const,
              whiteSpace: 'pre-wrap' as const,
              boxShadow: isUser ? '0 2px 12px rgba(10, 132, 255, 0.2)' : 'none',
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
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                {message.model}
              </span>
            )}
            {message.token_count && (
              <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                {message.token_count} tokens
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
