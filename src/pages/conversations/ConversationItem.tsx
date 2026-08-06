/**
 * ConversationItem — single row in the conversation list panel.
 */

import React from 'react';
import { Typography } from 'antd';
import { DeleteOutlined, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { Conversation } from '@/types';

import { radius } from '@/styles/themeTokens';
const { Text } = Typography;

interface Props {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
}

const ConversationItem: React.FC<Props> = ({ conversation, isSelected, onClick, onDelete }) => (
  <div
    onClick={onClick}
    className="conversation-item"
    style={{
      padding: '14px 18px',
      borderRadius: radius.md,
      cursor: 'pointer',
      background: isSelected ? 'rgba(10, 132, 255, 0.12)' : 'transparent',
      border: isSelected ? '0.5px solid rgba(10, 132, 255, 0.2)' : '0.5px solid transparent',
      transition: 'all 0.2s ease',
      position: 'relative',
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
        className="delete-btn"
        style={{
          cursor: 'pointer',
          fontSize: 13,
          color: 'var(--text-faint)',
          padding: '4px',
          borderRadius: radius.sm,
          transition: 'all 0.2s ease',
          opacity: 0.6,
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
            borderRadius: radius.sm,
            background: 'var(--bg-elevated)',
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          {conversation.model}
        </span>
      )}
      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
        <ClockCircleOutlined style={{ fontSize: 10 }} />
        {new Date(conversation.created_at).toLocaleDateString()}
      </span>
    </div>
  </div>
);

export default ConversationItem;
