/**
 * QueryPanel — RAG query interface for a knowledge base.
 *
 * Layout:
 *  - Input + send button at top
 *  - Answer area (markdown-style text)
 *  - Collapsible source chunks list below the answer
 *
 * Calls `POST /knowledge-bases/{kbId}/query` with `{ question }`
 * and expects `{ answer, sources[] }` where each source has
 * `{ content, score, source, filename? }`.
 */

import React, { useState } from 'react';
import { Input, Button, Typography, Collapse, Tag, Tooltip } from 'antd';
import {
  SendOutlined,
  SearchOutlined,
  CloseOutlined,
  FileTextOutlined,
  LoadingOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';
import type { QueryResponse } from '@/types';
import { SectionCard } from '@/components';
import { radius } from '@/styles/themeTokens';

const { Text, Paragraph } = Typography;

export interface QueryPanelProps {
  kbId: string;
  kbName: string;
  onClose: () => void;
}

interface ChatTurn {
  question: string;
  answer?: string;
  sources?: QueryResponse['sources'];
  error?: string;
  loading?: boolean;
}

const QueryPanel: React.FC<QueryPanelProps> = ({ kbId, kbName, onClose }) => {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const q = question.trim();
    if (!q) return;

    const turn: ChatTurn = { question: q, loading: true };
    setHistory((prev) => [...prev, turn]);
    setQuestion('');
    setLoading(true);

    try {
      const resp = await api.post<QueryResponse>(`/knowledge-bases/${kbId}/query/`, {
        question: q,
        top_k: 5,
      });
      const data = resp.data;
      setHistory((prev) =>
        prev.map((t, i) =>
          i === prev.length - 1
            ? { ...t, answer: data.answer, sources: data.sources, loading: false }
            : t,
        ),
      );
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      const errorMsg = detail || (err instanceof Error ? err.message : '查询失败，请稍后重试');
      setHistory((prev) =>
        prev.map((t, i) =>
          i === prev.length - 1 ? { ...t, error: errorMsg, loading: false } : t,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BulbOutlined style={{ color: '#0a84ff', fontSize: 16 }} />
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
            查询测试 — {kbName}
          </span>
        </div>
      }
      extra={
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          aria-label="关闭"
          size="small"
        />
      }
      style={{ marginTop: 20 }}
    >
      {/* History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
        {history.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '32px 24px',
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            <SearchOutlined
              style={{
                fontSize: 28,
                marginBottom: 12,
                display: 'block',
                color: 'var(--text-faint)',
              }}
            />
            输入问题，基于知识库内容进行 RAG 检索回答
          </div>
        )}

        {history.map((turn, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: 16,
              borderRadius: radius.md,
              background: 'var(--bg-elevated)',
              border: '0.5px solid var(--border-divider)',
            }}
          >
            {/* Question */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  padding: '8px 14px',
                  borderRadius: radius.md,
                  background: 'rgba(10, 132, 255, 0.12)',
                  color: '#0a84ff',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {turn.question}
              </div>
            </div>

            {/* Answer */}
            {turn.loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0a84ff' }}>
                <LoadingOutlined />
                <Text style={{ color: '#0a84ff', fontSize: 13 }}>正在检索...</Text>
              </div>
            )}

            {turn.error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: radius.md,
                  background: 'rgba(255, 69, 58, 0.08)',
                  border: '0.5px solid rgba(255, 69, 58, 0.2)',
                  color: '#ff453a',
                  fontSize: 13,
                }}
              >
                {turn.error}
              </div>
            )}

            {turn.answer && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: radius.md,
                  background: 'var(--bg-card)',
                  border: '0.5px solid var(--border-divider)',
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {turn.answer}
              </div>
            )}

            {/* Sources */}
            {turn.sources && turn.sources.length > 0 && (
              <Collapse
                size="small"
                ghost
                items={[
                  {
                    key: '1',
                    label: (
                      <Text style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                        引用来源 ({turn.sources.length})
                      </Text>
                    ),
                    children: (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {turn.sources.map((src, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '10px 12px',
                              borderRadius: radius.sm,
                              background: 'var(--bg-elevated)',
                              border: '0.5px solid var(--border-divider)',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 6,
                              }}
                            >
                              <FileTextOutlined
                                style={{ color: 'var(--text-subtle)', fontSize: 12 }}
                              />
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {src.filename || src.source}
                              </Text>
                              <Tag
                                style={{
                                  marginLeft: 'auto',
                                  fontSize: 11,
                                  borderRadius: radius.sm,
                                }}
                              >
                                {(src.score * 100).toFixed(1)}%
                              </Tag>
                            </div>
                            <Paragraph
                              style={{
                                fontSize: 12,
                                color: 'var(--text-muted)',
                                margin: 0,
                                lineHeight: 1.6,
                              }}
                              ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}
                            >
                              {src.content}
                            </Paragraph>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          size="large"
          placeholder="输入你的问题..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onPressEnter={() => !loading && handleSend()}
          disabled={loading}
          style={{ borderRadius: radius.md }}
          prefix={<SearchOutlined style={{ color: 'var(--text-subtle)' }} />}
        />
        <Tooltip title="发送">
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            loading={loading}
            onClick={handleSend}
            disabled={!question.trim()}
            style={{ width: 52, borderRadius: radius.md }}
          />
        </Tooltip>
      </div>
    </SectionCard>
  );
};

export default QueryPanel;
