/**
 * EditKBModal — form for editing an existing knowledge base.
 *
 * Editable fields: name, description, group_id
 * Read-only: embedding_model, chunk_size, chunk_overlap (cannot change after creation)
 *
 * Calls `PUT /knowledge-bases/{id}` via useApiMutation.
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, App } from 'antd';
import { useApiMutation } from '@/hooks';
import type { KnowledgeBase, KnowledgeGroup } from '@/types';

export interface EditKBModalProps {
  open: boolean;
  kb: KnowledgeBase | null;
  groups: KnowledgeGroup[];
  onCancel: () => void;
  onUpdated: () => void;
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

interface KBUpdateValues {
  name: string;
  description?: string;
  group_id?: string | null;
}

const EditKBModal: React.FC<EditKBModalProps> = ({ open, kb, groups, onCancel, onUpdated }) => {
  const [form] = Form.useForm<KBUpdateValues>();
  const { message } = App.useApp();

  const mutation = useApiMutation<KnowledgeBase, KBUpdateValues>({
    method: 'put',
    endpoint: () => `/knowledge-bases/${kb?.id}`,
    invalidateKeys: [['knowledge-bases']],
  });

  useEffect(() => {
    if (kb && open) {
      form.setFieldsValue({
        name: kb.name,
        description: kb.description,
        group_id: kb.group_id,
      });
    }
  }, [kb, open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      mutation.mutate(values, {
        onSuccess: () => {
          message.success('知识库已更新');
          form.resetFields();
          onUpdated();
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
      title="编辑知识库"
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      okText="保存"
      cancelText="取消"
      confirmLoading={mutation.isPending}
      destroyOnClose
      width={520}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
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
      </Form>
    </Modal>
  );
};

export default EditKBModal;
