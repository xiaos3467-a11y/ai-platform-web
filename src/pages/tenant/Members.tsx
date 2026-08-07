/** Tenant member management */

import React, { useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Select, Typography, App, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useApiListQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks/useApiMutation';
import { GlassCard, TableSkeleton } from '@/components';
import { useAuthStore } from '@/contexts/auth';
import type { TenantMember, TenantMemberRole } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ROLE_OPTIONS: { value: TenantMemberRole; label: string; color: string }[] = [
  { value: 'tenant_admin', label: '管理员', color: 'gold' },
  { value: 'tenant_developer', label: '开发者', color: 'blue' },
  { value: 'tenant_viewer', label: '只读', color: 'default' },
];

const TenantMembers: React.FC = () => {
  const { message, modal } = App.useApp();
  const [inviteForm] = Form.useForm();
  const [inviteOpen, setInviteOpen] = useState(false);
  const hasRole = useAuthStore((s) => s.hasRole);
  const isAdmin = hasRole('tenant_admin') || hasRole('super_admin') || hasRole('platform_ops');

  const { data: membersData, isLoading } = useApiListQuery<TenantMember>({
    queryKey: ['tenant', 'members'],
    endpoint: '/tenant/self/members/list',
  });

  const inviteMutation = useApiMutation<TenantMember, Record<string, unknown>>({
    endpoint: '/tenant/self/members/invite',
    invalidateKeys: [['tenant', 'members']],
    onSuccess: () => {
      message.success('邀请已发送');
      setInviteOpen(false);
      inviteForm.resetFields();
    },
  });

  const removeMutation = useApiMutation<void, { userId: string }>({
    endpoint: '/tenant/self/members/remove',
    invalidateKeys: [['tenant', 'members']],
    onSuccess: () => {
      message.success('成员已移除');
    },
  });

  const updateRoleMutation = useApiMutation<
    TenantMember,
    { userId: string; role: TenantMemberRole }
  >({
    endpoint: '/tenant/self/members/update-role',
    invalidateKeys: [['tenant', 'members']],
    onSuccess: () => {
      message.success('角色已更新');
    },
  });

  const handleInvite = useCallback(() => {
    inviteForm.validateFields().then((values) => {
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        display_name: values.display_name ?? undefined,
        role_ids: values.role ? [values.role] : [],
      };
      inviteMutation.mutate(payload);
    });
  }, [inviteForm, inviteMutation]);

  const handleRemove = useCallback(
    (member: TenantMember) => {
      modal.confirm({
        title: '确认移除成员',
        content: `确定要将「${member.username}」从租户中移除吗？`,
        okText: '确认',
        cancelText: '取消',
        okButtonProps: { danger: true },
        onOk: () => removeMutation.mutate({ userId: member.user_id }),
      });
    },
    [modal, removeMutation],
  );

  const columns: ColumnsType<TenantMember> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 160,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 220,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role: TenantMemberRole, record) => {
        if (!isAdmin) {
          const opt = ROLE_OPTIONS.find((r) => r.value === role);
          return <Tag color={opt?.color}>{opt?.label}</Tag>;
        }
        return (
          <Select
            size="small"
            value={role}
            style={{ width: 110 }}
            options={ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))}
            onChange={(newRole) =>
              updateRoleMutation.mutate({ userId: record.user_id, role: newRole })
            }
          />
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: 'green',
          invited: 'orange',
          disabled: 'default',
        };
        const labelMap: Record<string, string> = {
          active: '已激活',
          invited: '待接受',
          disabled: '已禁用',
        };
        return <Tag color={colorMap[status] || 'default'}>{labelMap[status] || status}</Tag>;
      },
    },
    {
      title: '加入时间',
      dataIndex: 'joined_at',
      key: 'joined_at',
      width: 170,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) =>
        isAdmin ? (
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemove(record)}
          >
            移除
          </Button>
        ) : null,
    },
  ];

  if (isLoading) {
    return (
      <GlassCard>
        <TableSkeleton />
      </GlassCard>
    );
  }

  return (
    <>
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            成员管理
          </Title>
          <Text type="secondary">管理租户成员和角色</Text>
        </div>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setInviteOpen(true)}>
            邀请成员
          </Button>
        )}
      </div>

      <GlassCard>
        <Table<TenantMember>
          columns={columns}
          dataSource={membersData?.items || []}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          size="middle"
          locale={{
            emptyText: <span style={{ color: 'var(--text-faint)', padding: 24 }}>暂无成员</span>,
          }}
        />
      </GlassCard>

      <Modal
        title="邀请成员"
        open={inviteOpen}
        onCancel={() => setInviteOpen(false)}
        onOk={handleInvite}
        confirmLoading={inviteMutation.isPending}
        okText="邀请"
        cancelText="取消"
      >
        <Form form={inviteForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少 2 个字符' },
              { max: 64, message: '用户名最多 64 个字符' },
            ]}
          >
            <Input placeholder="如：zhang_san" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效邮箱' },
              { max: 128, message: '邮箱最多 128 个字符' },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="初始密码"
            rules={[
              { required: true, message: '请输入初始密码' },
              { min: 6, message: '密码至少 6 个字符' },
            ]}
          >
            <Input.Password placeholder="至少 6 个字符" />
          </Form.Item>
          <Form.Item name="display_name" label="显示名称">
            <Input placeholder="可选，如：张三" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            initialValue="tenant_developer"
            rules={[{ required: true }]}
          >
            <Select options={ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TenantMembers;
