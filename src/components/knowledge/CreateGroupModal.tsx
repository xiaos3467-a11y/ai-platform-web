/**
 * CreateGroupModal — modal form for creating a knowledge group.
 *
 * Fields:
 *  - name (required)
 *  - description (optional)
 *  - parent_id (optional Select — populated from the existing groups list)
 *
 * Calls `POST /knowledge-groups` via useApiMutation and invalidates the
 * `knowledge-groups` query on success so the tree refreshes.
 */

import React from 'react';
import { Modal, Form, Input, Select, App } from 'antd';
import { useApiMutation } from '@/hooks';
import type { KnowledgeGroup, KnowledgeGroupCreateRequest } from '@/types';

export interface CreateGroupModalProps {
  open: boolean;
  onCancel: () => void;
  /** Existing groups flattened — used to populate the parent Select. */
  groups: KnowledgeGroup[];
  /** Optional callback after successful creation. */
  onSuccess?: () => void;
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

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  open,
  onCancel,
  groups,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const mutation = useApiMutation<KnowledgeGroupCreateRequest>({
    method: 'post',
    endpoint: '/knowledge-groups/',
    invalidateKeys: [['knowledge-groups']],
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      mutation.mutate(values, {
        onSuccess: () => {
          message.success('分组创建成功');
          form.resetFields();
          onSuccess?.();
          onCancel();
        },
      });
    } catch {
      /* validation / API error — handled by interceptors */
    }
  };

  const flat = flattenGroups(groups);

  return (
    <Modal
      title="新建分组"
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
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="分组名称"
          rules={[{ required: true, message: '请输入分组名称' }]}
        >
          <Input placeholder="如：产品文档" maxLength={60} />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="简要描述分组用途..." maxLength={200} />
        </Form.Item>
        <Form.Item name="parent_id" label="上级分组">
          <Select
            placeholder="无（作为顶级分组）"
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

export default CreateGroupModal;
