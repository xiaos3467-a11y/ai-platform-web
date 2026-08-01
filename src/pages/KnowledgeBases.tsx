/** Knowledge Bases management */

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Upload, Tag, Space, Card, Typography,
  Popconfirm, App, Progress, Descriptions, Badge,
} from 'antd';
import {
  PlusOutlined, UploadOutlined, DeleteOutlined, FileTextOutlined,
  CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { api } from '@/api/client';
import type { KnowledgeBase, Document } from '@/types';

const { Title } = Typography;

const statusMap: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
  ready: { color: 'success', icon: <CheckCircleOutlined />, text: '就绪' },
  processing: { color: 'processing', icon: <SyncOutlined spin />, text: '处理中' },
  pending: { color: 'default', icon: <ClockCircleOutlined />, text: '等待中' },
  failed: { color: 'error', icon: <CloseCircleOutlined />, text: '失败' },
};

const KnowledgeBases: React.FC = () => {
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

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
    await api.post('/knowledge-bases/', {
      ...values,
      embedding_model: 'text-embedding-3-small',
    });
    message.success('知识库创建成功');
    setCreateOpen(false);
    form.resetFields();
    fetchKbs();
  };

  const handleUpload = async (file: File) => {
    if (!selectedKb) return false;
    await api.upload(`/knowledge-bases/${selectedKb.id}/documents`, file);
    message.success(`${file.name} 上传成功，正在处理...`);
    fetchDocs(selectedKb.id);
    fetchKbs();
    return false;
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/knowledge-bases/${id}`);
    message.success('已删除');
    if (selectedKb?.id === id) setSelectedKb(null);
    fetchKbs();
  };

  const kbColumns = [
    { title: '名称', dataIndex: 'name', render: (name: string, record: KnowledgeBase) => (
      <a onClick={() => { setSelectedKb(record); fetchDocs(record.id); }}>{name}</a>
    )},
    { title: 'Embedding 模型', dataIndex: 'embedding_model', render: (v: string) => <Tag>{v}</Tag> },
    { title: '文档数', dataIndex: 'doc_count' },
    { title: '分块数', dataIndex: 'chunk_count' },
    { title: '创建时间', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleString() },
    { title: '操作', width: 80, render: (_: unknown, record: KnowledgeBase) => (
      <Popconfirm title="确认删除知识库？" onConfirm={() => handleDelete(record.id)}>
        <Button type="text" danger icon={<DeleteOutlined />} size="small" />
      </Popconfirm>
    )},
  ];

  const docColumns = [
    { title: '文件名', dataIndex: 'filename', render: (v: string) => (
      <Space><FileTextOutlined />{v}</Space>
    )},
    { title: '类型', dataIndex: 'mime_type', render: (v: string) => <Tag>{v || 'text'}</Tag> },
    { title: '大小', dataIndex: 'file_size', render: (v: number) => v ? `${(v / 1024).toFixed(1)} KB` : '-' },
    { title: '分块数', dataIndex: 'chunk_count' },
    { title: '状态', dataIndex: 'status', render: (s: string) => {
      const cfg = statusMap[s] || statusMap.pending;
      return <Badge status={cfg.color as 'success'} text={cfg.text} />;
    }},
    { title: '上传时间', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleString() },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>知识库管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          创建知识库
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Table dataSource={kbs} columns={kbColumns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      {selectedKb && (
        <Card
          title={`${selectedKb.name} — 文档管理`}
          extra={
            <Upload beforeUpload={handleUpload} showUploadList={false}>
              <Button icon={<UploadOutlined />}>上传文档</Button>
            </Upload>
          }
        >
          <Descriptions size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="文档数">{selectedKb.doc_count}</Descriptions.Item>
            <Descriptions.Item label="分块数">{selectedKb.chunk_count}</Descriptions.Item>
            <Descriptions.Item label="Embedding 模型">{selectedKb.embedding_model}</Descriptions.Item>
          </Descriptions>
          <Table dataSource={docs} columns={docColumns} rowKey="id" loading={docsLoading} size="small" />
        </Card>
      )}

      <Modal title="创建知识库" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="如：公司产品文档" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeBases;
