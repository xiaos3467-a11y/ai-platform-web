/** Knowledge Bases — Apple glass aesthetic */

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Upload, Tag, Space, Card, Typography,
  App, Descriptions, Empty, Skeleton,
} from 'antd';
import {
  PlusOutlined, UploadOutlined, DeleteOutlined, FileTextOutlined,
  CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, ClockCircleOutlined,
  BookOutlined, InboxOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';
import type { KnowledgeBase, Document } from '@/types';

const { Title, Text } = Typography;

/* ─── Status badge ────────────────────────────────────────────────── */
const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const cfg: Record<string, { bg: string; border: string; color: string; icon: React.ReactNode; text: string }> = {
    ready: { bg: 'rgba(48, 209, 88, 0.08)', border: 'rgba(48, 209, 88, 0.2)', color: '#30d158', icon: <CheckCircleOutlined />, text: '就绪' },
    processing: { bg: 'rgba(10, 132, 255, 0.08)', border: 'rgba(10, 132, 255, 0.2)', color: '#0a84ff', icon: <SyncOutlined spin />, text: '处理中' },
    pending: { bg: 'rgba(255, 255, 255, 0.04)', border: 'rgba(255, 255, 255, 0.08)', color: '#6e6e73', icon: <ClockCircleOutlined />, text: '等待中' },
    failed: { bg: 'rgba(255, 69, 58, 0.08)', border: 'rgba(255, 69, 58, 0.2)', color: '#ff453a', icon: <CloseCircleOutlined />, text: '失败' },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 8,
        background: c.bg,
        border: `0.5px solid ${c.border}`,
        fontSize: 12,
        fontWeight: 500,
        color: c.color,
      }}
    >
      {c.icon} {c.text}
    </span>
  );
};

/* ─── Skeleton ────────────────────────────────────────────────────── */
const TableSkeleton: React.FC = () => (
  <Card
    style={{
      borderRadius: 16,
      border: '0.5px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(255, 255, 255, 0.04)',
    }}
    styles={{ body: { padding: 24 } }}
  >
    <Skeleton active paragraph={{ rows: 6 }} />
  </Card>
);

/* ─── Main ────────────────────────────────────────────────────────── */
const KnowledgeBases: React.FC = () => {
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();

  const fetchKbs = async () => {
    setLoading(true);
    try {
      const resp = await api.get<{ items: KnowledgeBase[]; total: number }>('/knowledge-bases/');
      setKbs(resp.data?.items || []);
    } finally { setLoading(false); }
  };

  const fetchDocs = async (kbId: string) => {
    setDocsLoading(true);
    try {
      const resp = await api.get<Document[]>(`/knowledge-bases/${kbId}/documents`);
      setDocs(resp.data || []);
    } finally { setDocsLoading(false); }
  };

  useEffect(() => { fetchKbs(); }, []);

  const handleCreate = async (values: { name: string; description?: string }) => {
    try {
      await api.post('/knowledge-bases/', { ...values, embedding_model: 'text-embedding-3-small' });
      message.success('知识库创建成功');
      setCreateOpen(false);
      form.resetFields();
      fetchKbs();
    } catch { /* handled */ }
  };

  const handleUpload = async (file: File) => {
    if (!selectedKb) return false;
    try {
      await api.upload(`/knowledge-bases/${selectedKb.id}/documents`, file);
      message.success(`${file.name} 上传成功，正在处理...`);
      fetchDocs(selectedKb.id);
      fetchKbs();
    } catch { /* handled */ }
    return false;
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: '删除知识库',
      content: '删除后不可恢复，相关文档也会被清除。确认继续？',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        await api.delete(`/knowledge-bases/${id}`);
        message.success('已删除');
        if (selectedKb?.id === id) setSelectedKb(null);
        fetchKbs();
      },
    });
  };

  const kbColumns = [
    { title: '名称', dataIndex: 'name', render: (name: string, record: KnowledgeBase) => (
      <a
        onClick={() => { setSelectedKb(record); fetchDocs(record.id); }}
        style={{ color: '#2997ff', fontWeight: 500 }}
      >
        <Space><BookOutlined />{name}</Space>
      </a>
    )},
    { title: '模型', dataIndex: 'embedding_model', render: (v: string) => (
      <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', fontSize: 12, color: '#a1a1a6' }}>{v}</span>
    )},
    { title: '文档', dataIndex: 'doc_count', render: (v: number) => <span style={{ color: '#a1a1a6' }}>{v}</span> },
    { title: '分块', dataIndex: 'chunk_count', render: (v: number) => <span style={{ color: '#a1a1a6' }}>{v}</span> },
    { title: '创建时间', dataIndex: 'created_at', render: (v: string) => <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{new Date(v).toLocaleString()}</span> },
    { title: '', width: 60, render: (_: unknown, record: KnowledgeBase) => (
      <div
        onClick={() => handleDelete(record.id)}
        style={{ cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.2)', padding: 4, borderRadius: 6, transition: 'all 0.2s' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#ff453a'; e.currentTarget.style.background = 'rgba(255,69,58,0.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent'; }}
      >
        <DeleteOutlined />
      </div>
    )},
  ];

  const docColumns = [
    { title: '文件名', dataIndex: 'filename', render: (v: string) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f5f5f7', fontWeight: 500 }}>
        <FileTextOutlined style={{ color: '#0a84ff' }} />{v}
      </span>
    )},
    { title: '类型', dataIndex: 'mime_type', render: (v: string) => <span style={{ fontSize: 12, color: '#a1a1a6' }}>{v || 'text'}</span> },
    { title: '大小', dataIndex: 'file_size', render: (v: number) => <span style={{ color: '#a1a1a6' }}>{v ? `${(v / 1024).toFixed(1)} KB` : '-'}</span> },
    { title: '分块', dataIndex: 'chunk_count', render: (v: number) => <span style={{ color: '#a1a1a6' }}>{v}</span> },
    { title: '状态', dataIndex: 'status', render: (s: string) => <StatusPill status={s} /> },
    { title: '上传时间', dataIndex: 'created_at', render: (v: string) => <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{new Date(v).toLocaleString()}</span> },
  ];

  return (
    <div>
      {/* Page title */}
      <div className="animate-fade-in-up" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, fontSize: 34, letterSpacing: '-0.04em', color: '#f5f5f7' }}>
            知识库
          </Title>
          <Text style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)', marginTop: 6, display: 'block' }}>
            管理文档与向量索引
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
          style={{ height: 44, paddingInline: 20, borderRadius: 12, fontWeight: 500 }}
        >
          创建知识库
        </Button>
      </div>

      {/* Table */}
      {loading ? <TableSkeleton /> : (
        <Card
          className="animate-fade-in-up"
          style={{
            borderRadius: 16,
            border: '0.5px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          styles={{ body: { padding: 0 } }}
        >
          {kbs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div
                style={{
                  width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
                  background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, color: 'rgba(255,255,255,0.15)',
                }}
              >
                <BookOutlined />
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginBottom: 8 }}>
                还没有知识库
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.15)', marginBottom: 24 }}>
                创建知识库后，可上传文档用于 RAG 检索
              </div>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                创建第一个知识库
              </Button>
            </div>
          ) : (
            <Table
              dataSource={kbs}
              columns={kbColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              style={{ borderRadius: 0 }}
            />
          )}
        </Card>
      )}

      {/* Document panel */}
      {selectedKb && (
        <Card
          className="animate-fade-in-up"
          style={{
            marginTop: 20,
            borderRadius: 16,
            border: '0.5px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          styles={{
            header: { borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '16px 24px', minHeight: 'auto' },
            body: { padding: docsLoading ? 24 : 0 },
          }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 17, fontWeight: 600, color: '#f5f5f7' }}>{selectedKb.name}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>文档列表</span>
            </div>
          }
          extra={
            <Upload beforeUpload={handleUpload} showUploadList={false}>
              <Button icon={<UploadOutlined />} style={{ borderRadius: 10 }}>上传文档</Button>
            </Upload>
          }
        >
          <div style={{ padding: '16px 24px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', gap: 24 }}>
            {[
              { label: '文档数', value: selectedKb.doc_count },
              { label: '分块数', value: selectedKb.chunk_count },
              { label: 'Embedding', value: selectedKb.embedding_model },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.02em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: '#f5f5f7', fontWeight: 500 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {docsLoading ? <Skeleton active paragraph={{ rows: 4 }} style={{ padding: 24 }} /> : (
            docs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                <InboxOutlined style={{ fontSize: 36, color: 'rgba(255,255,255,0.1)', marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>暂无文档，点击上方按钮上传</div>
              </div>
            ) : (
              <Table dataSource={docs} columns={docColumns} rowKey="id" size="small" pagination={false} />
            )
          )}
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        title="创建知识库"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="如：公司产品文档" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="简要描述知识库用途..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeBases;
