/**
 * CreateKBModal — form for creating a new knowledge base.
 *
 * Fields:
 *  - name (required)
 *  - description
 *  - group_id (Select — populated from the groups list)
 *  - embedding_model (Select)
 *  - chunk_size (InputNumber, default 512, range 100-2000)
 *  - chunk_overlap (InputNumber, default 64, range 0-500)
 *
 * Calls `POST /knowledge-bases/` via useApiMutation.
 */

import React from 'react';
import { Modal, Form, Input, InputNumber, Select, App } from 'antd';
import { useApiMutation } from '@/hooks';
import type { KnowledgeBase, KnowledgeGroup } from '@/types';

export interface CreateKBModalProps {
  open: boolean;
  onCancel: () => void;
  groups: KnowledgeGroup[];
  /** Optional pre-selected group ID (populates the form default). */
  defaultGroupId?: string | null;
}

/** Flatten a nested group tree into a list of {id, name, depth}. */
function flattenGroups(
  groups: KnowledgeGroup[],
  depth = 0,
): { id: string; name: string; depth: number }[] {
  const out: { id: string; name: string; depth: number }[] = [];
  for (const g of groups) {
    out.push({ id: g.id, name: g.name, depth });
    if (g.children?.length) out.push(...flattenGroups(g.children, depth + 1));
  }
  return out;
}

const EMBEDDING_MODELS = [
  { value: 'text-embedding-3-small', label: 'text-embedding-3-small（推荐）' },
  { value: 'text-embedding-ada-002', label: 'text-embedding-ada-002' },
];

interface KBCreateValues {
  name: string;
  description?: string;
  group_id?: string | null;
  embedding_model: string;
  chunk_size: number;
  chunk_overlap: number;
}

const CreateKBModal: React.FC<CreateKBModalProps> = ({
  open,
  onCancel,
  groups,
  defaultGroupId,
}) => {
  const [form] = Form.useForm<KBCreateValues>();
  const { message } = App.useApp();

  const mutation = useApiMutation<KnowledgeBase, KBCreateValues>({
    method: 'post',
    endpoint: '/knowledge-bases/',
    invalidateKeys: [['knowledge-bases']],
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      mutation.mutate(values, {
        onSuccess: () => {
          message.success('知识库创建成功');
          form.resetFields();
          onCancel();
        },
      });
    } catch {
      /* validation / API error */
    }
  };

  const flat = flattenGroups(groups);

  return (
    <Modal
      title="创建知识库"
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      okText="创建"
      cancelText="取消"
      confirmLoading={mutation.isPending}
      destroyOnClose
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
        initialValues={{
          embedding_model: 'text-embedding-3-small',
          chunk_size: 512,
          chunk_overlap: 64,
          group_id: defaultGroupId && defaultGroupId !== 'ungrouped' ? defaultGroupId : null,
        }}
      >
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入知识库名称' }]}
        >
          <Input placeholder="如：公司产品文档" maxLength={100} />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="简要描述知识库用途..." maxLength={500} />
        </Form.Item>
        <Form.Item name="group_id" label="所属分组">
          <Select
            placeholder="未分组"
            allowClear
            options={flat.map((g) => ({
              value: g.id,
              label: g.depth > 0 ? `${' '.repeat(g.depth)}${g.name}` : g.name,
            }))}
          />
        </Form.Item>
        <Form.Item name="embedding_model" label="Embedding 模型" rules={[{ required: true }]}>
          <Select options={EMBEDDING_MODELS} />
        </Form.Item>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            name="chunk_size"
            label="分块大小"
            rules={[{ required: true, message: '请输入分块大小' }]}
          >
            <InputNumber min={100} max={2000} step={32} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="chunk_overlap"
            label="分块重叠"
            rules={[{ required: true, message: '请输入分块重叠' }]}
          >
            <InputNumber min={0} max={500} step={8} style={{ width: '100%' }} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateKBModal;
