/**
 * DocumentList — document table + upload dragger for a single KB.
 *
 * Features:
 *  - Fetches `/knowledge-bases/{kbId}/documents` via useApiQuery.
 *  - While any document is still processing, polls every 3s.
 *  - Upload.Dragger supports multi-file drag & drop.
 *  - Per-row actions: delete (calls DELETE /documents/{doc_id}),
 *    retry (calls POST /documents/{doc_id}/retry — only for failed).
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table, Button, Upload, Progress, Typography, App, Tooltip } from 'antd';
import type { TableColumnsType, UploadProps } from 'antd';
import {
  DeleteOutlined,
  FileTextOutlined,
  InboxOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileMarkdownOutlined,
} from '@ant-design/icons';
import { useApiQuery, useApiMutation } from '@/hooks';
import { api } from '@/api/client';
import type { Document } from '@/types';
import { StatusPill, EmptyState, SectionCard } from '@/components';
import { radius } from '@/styles/themeTokens';

const { Text } = Typography;

export interface DocumentListProps {
  kbId: string;
  kbName: string;
  onQueryClick: () => void;
  /** Called when the doc list changes (so parent can refresh KB stats). */
  onChange?: () => void;
}

/** Pick an icon based on MIME type / extension. */
function fileIcon(mime: string | null, filename: string): React.ReactNode {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf') || mime === 'application/pdf')
    return <FilePdfOutlined style={{ color: '#ff453a' }} />;
  if (lower.endsWith('.docx') || lower.endsWith('.doc') || mime?.includes('word'))
    return <FileWordOutlined style={{ color: '#0a84ff' }} />;
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || mime?.includes('sheet'))
    return <FileExcelOutlined style={{ color: '#30d158' }} />;
  if (lower.endsWith('.md') || mime?.includes('markdown'))
    return <FileMarkdownOutlined style={{ color: '#6e6e73' }} />;
  return <FileTextOutlined style={{ color: '#0a84ff' }} />;
}

/** Format bytes → human readable. */
function formatSize(bytes: number | null): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DocumentList: React.FC<DocumentListProps> = ({ kbId, kbName, onQueryClick, onChange }) => {
  const { message, modal } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(false);

  // Fetch documents — refetch every 3s while any doc is processing
  const {
    data: docs = [],
    isLoading,
    refetch,
  } = useApiQuery<Document[]>({
    queryKey: ['kb-documents', kbId],
    endpoint: '/knowledge-bases/documents/list',
    params: { knowledge_base_id: kbId },
    refetchInterval: shouldPoll ? 3000 : false,
  });

  // React to data changes to enable/disable polling
  useEffect(() => {
    const hasProcessing = docs.some((d) => d.status === 'processing');
    setShouldPoll(hasProcessing);
  }, [docs]);

  // Delete mutation (dynamic endpoint — built manually)
  const handleDelete = useCallback(
    (doc: Document) => {
      modal.confirm({
        title: `删除文档 "${doc.filename}"？`,
        content: '删除后无法恢复。',
        okText: '删除',
        okButtonProps: { danger: true },
        cancelText: '取消',
        onOk: async () => {
          await api.post('/knowledge-bases/documents/delete', { knowledge_base_id: kbId, document_id: doc.id });
          message.success('文档已删除');
          refetch();
          onChange?.();
        },
      });
    },
    [kbId, modal, message, refetch, onChange],
  );

  // Retry mutation
  const retryMutation = useApiMutation<unknown, { knowledge_base_id: string; document_id: string }>({
    endpoint: '/knowledge-bases/documents/retry',
    onSuccess: () => {
      message.success('已重新提交处理');
      refetch();
    },
  });

  // Upload handler
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    accept: '.pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls',
    beforeUpload: async (file) => {
      setUploading(true);
      try {
        await api.upload('/knowledge-bases/documents/upload', file, { knowledge_base_id: kbId });
        message.success(`${file.name} 上传成功，正在处理...`);
        refetch();
        onChange?.();
      } catch {
        /* handled by interceptor */
      } finally {
        setUploading(false);
      }
      return false; // prevent antd default upload
    },
  };

  const columns = useMemo<TableColumnsType<Document>>(
    () => [
      {
        title: '文件名',
        dataIndex: 'filename',
        render: (name: string, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {fileIcon(record.mime_type, name)}
            <Text style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{name}</Text>
          </div>
        ),
      },
      {
        title: '大小',
        dataIndex: 'file_size',
        width: 100,
        render: (v: number | null) => (
          <Text
            style={{ color: 'var(--text-muted)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}
          >
            {formatSize(v)}
          </Text>
        ),
      },
      {
        title: '分块',
        dataIndex: 'chunk_count',
        width: 80,
        render: (v: number) => (
          <Text style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {v}
          </Text>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 200,
        render: (_: unknown, record: Document) => {
          if (record.status === 'processing' && record.processing_progress) {
            const p = record.processing_progress;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <Text style={{ color: '#0a84ff' }}>{p.message || p.stage}</Text>
                  <Text style={{ color: 'var(--text-subtle)', fontVariantNumeric: 'tabular-nums' }}>
                    {p.percent}%
                  </Text>
                </div>
                <Progress
                  percent={p.percent}
                  showInfo={false}
                  size="small"
                  strokeColor="#0a84ff"
                  style={{ margin: 0 }}
                />
              </div>
            );
          }
          return <StatusPill status={record.status} />;
        },
      },
      {
        title: '操作',
        width: 100,
        align: 'right',
        render: (_: unknown, record: Document) => (
          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
            {record.status === 'failed' && (
              <Tooltip title="重试">
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  loading={retryMutation.isPending}
                  onClick={() => retryMutation.mutate({ knowledge_base_id: kbId, document_id: record.id })}
                />
              </Tooltip>
            )}
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    [retryMutation, handleDelete],
  );

  return (
    <SectionCard
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
            {kbName}
          </span>
          <Text style={{ fontSize: 13, color: 'var(--text-subtle)' }}>文档管理</Text>
        </div>
      }
      extra={
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<InboxOutlined />}
            onClick={onQueryClick}
            style={{ borderRadius: radius.md }}
          >
            查询测试
          </Button>
        </div>
      }
      style={{ marginTop: 20 }}
    >
      {/* Upload dragger */}
      <div style={{ marginBottom: 20 }}>
        <Upload.Dragger {...uploadProps} disabled={uploading}>
          <p style={{ marginBottom: 8 }}>
            <InboxOutlined style={{ fontSize: 32, color: 'var(--text-subtle)' }} />
          </p>
          <p
            style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4 }}
          >
            {uploading ? '上传中...' : '点击或拖拽文件到此处上传'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            支持 PDF、Word、TXT、Markdown、Excel 等格式
          </p>
        </Upload.Dragger>
      </div>

      {/* Documents table */}
      {docs.length === 0 && !isLoading ? (
        <EmptyState
          icon={<FileTextOutlined />}
          title="暂无文档"
          description="上传文档后，系统会自动进行分块和向量化处理"
        />
      ) : (
        <Table<Document>
          dataSource={docs}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={docs.length > 10 ? { pageSize: 10, size: 'small' } : false}
          loading={isLoading}
        />
      )}
    </SectionCard>
  );
};

export default DocumentList;
