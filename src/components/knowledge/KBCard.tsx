/**
 * KBCard — glass-morphism card for a single knowledge base.
 *
 * Displays name, truncated description, doc/chunk counts, embedding
 * model, and a status pill.  Clicking the card selects it (parent
 * manages the selection highlight).
 */

import React from 'react';
import { Typography } from 'antd';
import { BookOutlined, FileTextOutlined, AppstoreOutlined } from '@ant-design/icons';
import type { KnowledgeBase } from '@/types';
import { GlassCard, StatusPill } from '@/components';
import { radius } from '@/styles/themeTokens';

const { Text } = Typography;

export interface KBCardProps {
  kb: KnowledgeBase;
  onClick: (kb: KnowledgeBase) => void;
  selected?: boolean;
}

const KBCard: React.FC<KBCardProps> = ({ kb, onClick, selected = false }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(kb)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick(kb);
      }}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <GlassCard
        hoverable
        style={{
          border: selected ? '1px solid #0a84ff' : '0.5px solid var(--border-subtle)',
          boxShadow: selected ? '0 0 0 3px rgba(10, 132, 255, 0.18)' : undefined,
        }}
        styles={{ body: { padding: '20px 22px' } }}
      >
        {/* Header: icon + name + status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.md,
              background: 'linear-gradient(135deg, rgba(10,132,255,0.15), rgba(94,92,230,0.15))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#0a84ff',
              flexShrink: 0,
            }}
          >
            <BookOutlined />
          </div>
          <StatusPill status={kb.status} />
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {kb.name}
        </div>

        {/* Description (truncated) */}
        <div
          style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: 16,
            minHeight: 20,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {kb.description || '暂无描述'}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            paddingTop: 12,
            borderTop: '0.5px solid var(--border-divider)',
          }}
        >
          <StatItem icon={<FileTextOutlined />} label="文档" value={kb.doc_count} />
          <StatItem icon={<AppstoreOutlined />} label="分块" value={kb.chunk_count} />
          <div style={{ flex: 1 }} />
          <Text
            style={{
              fontSize: 11,
              color: 'var(--text-subtle)',
              padding: '2px 8px',
              borderRadius: radius.sm,
              background: 'var(--bg-elevated)',
              height: 'fit-content',
              alignSelf: 'center',
              maxWidth: 140,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {kb.embedding_model}
          </Text>
        </div>
      </GlassCard>
    </div>
  );
};

const StatItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
}> = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ color: 'var(--text-subtle)', fontSize: 12 }}>{icon}</span>
    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </span>
  </div>
);

export default KBCard;
